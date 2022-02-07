#!/usr/bin/nodejs
/*
Mashes together a bunch of different apps into a big binary blob.
We then store this *inside* the Bangle.js firmware and can use it
to populate Storage initially.

Bangle.js 1 doesn't really have anough flash space for this,
but we have enough on v2.
*/
var SETTINGS = {
  pretokenise : true
};

var DEVICE = process.argv[2];

var path = require('path');
var ROOTDIR = path.join(__dirname, '..');
var APPDIR = ROOTDIR+'/apps';
var MINIFY = true;
var OUTFILE, APPS;

if (DEVICE=="BANGLEJS") {
  var OUTFILE = path.join(ROOTDIR, '../Espruino/libs/banglejs/banglejs1_storage_default.c');
  var APPS = [ // IDs of apps to install
    "boot","launch","mclock","setting",
    "about","alarm","widbat","widbt","welcome"
  ];
} else if (DEVICE=="BANGLEJS2") {
  var OUTFILE = path.join(ROOTDIR, '../Espruino/libs/banglejs/banglejs2_storage_default.c');
  var APPS = [ // IDs of apps to install
    "boot","launch","antonclk","setting",
    "about","alarm","health","widlock","widbat","widbt","widid","welcome"
  ];
} else {
  console.log("USAGE:");
  console.log("  bin/firmwaremaker_c.js BANGLEJS");
  console.log("  bin/firmwaremaker_c.js BANGLEJS2");
  process.exit(1);
}
console.log("Device = ",DEVICE);


var fs = require("fs");
global.Const = {
  /* Are we only putting a single app on a device? If so
  apps should all be saved as .bootcde and we write info
  about the current app into app.info */
  SINGLE_APP_ONLY : false,
};


function atob(input) {
    // Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149
    // This code was written by Tyler Akins and has been placed in the
    // public domain.  It would be nice if you left this header intact.
    // Base64 code from Tyler Akins -- http://rumkin.com
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    var output = [];
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    do {
      enc1 = keyStr.indexOf(input.charAt(i++));
      enc2 = keyStr.indexOf(input.charAt(i++));
      enc3 = keyStr.indexOf(input.charAt(i++));
      enc4 = keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output.push(chr1);

      if (enc3 !== 64) {
        output.push(chr2);
      }
      if (enc4 !== 64) {
        output.push(chr3);
      }
    } while (i < input.length);
    return new Uint8Array(output);
  }

var AppInfo = require(ROOTDIR+"/core/js/appinfo.js");
var appfiles = [];

function fileGetter(url) {
  console.log("Loading "+url)
  if (MINIFY) {
    if (url.endsWith(".json")) {
      var f = url.slice(0,-5);
      console.log("MINIFYING JSON "+f);
      var j = eval("("+fs.readFileSync(url).toString("binary")+")");
      var code = JSON.stringify(j);
      //console.log(code);
      url = f+".min.json";
      fs.writeFileSync(url, code);
    }
  }
  var blob = fs.readFileSync(url);
  var data;
  if (url.endsWith(".js") || url.endsWith(".json"))
    data = blob.toString(); // allow JS/etc to be written in UTF-8
  else
    data = blob.toString("binary")
  return Promise.resolve(data);
}

// If file should be evaluated, try and do it...
function evaluateFile(file) {
  var hsStart = 'require("heatshrink").decompress(atob("';
  var hsEnd = '"))';
  if (file.content.startsWith(hsStart) && file.content.endsWith(hsEnd)) {
    var heatshrink = require(ROOTDIR+"/core/lib/heatshrink.js");
    var b64 = file.content.slice(hsStart.length, -hsEnd.length);
    var decompressed = heatshrink.decompress(atob(b64));
    file.content = "";
    for (var i=0;i<decompressed.length;i++)
      file.content += String.fromCharCode(decompressed[i]);
    return;
  }
  // if JSON just pass through. We could try and minify.
  if (file.name.endsWith(".json")) {
    return;
  }
  // else... uh-oh
  console.log(file);
  throw new Error("Unable to evaluate "+file.name);
}

Promise.all(APPS.map(appid => {
  try {
    var app = JSON.parse(fs.readFileSync(APPDIR + "/" + appid + "/metadata.json").toString());
  } catch (e) {
    throw new Error(`App ${appid} not found`);
  }
  return AppInfo.getFiles(app, {
    fileGetter : fileGetter,
    settings : SETTINGS,
    device : { id : DEVICE }
  }).then(files => {
    appfiles = appfiles.concat(files);
  });
})).then(() => {
  // work out what goes in storage
  var storageContent = "";
  appfiles.forEach((file) => {
    //console.log(file);
    if (file.evaluate) evaluateFile(file);
    var fileLength = file.content.length;
    console.log(file.name+" -> "+fileLength+"b");
    // set up header
    var header = new Uint8Array(32);
    header.fill(0);
    header.set([fileLength,fileLength>>8,fileLength>>16,fileLength>>24],0); // length
    for (var i=0;i<file.name.length;i++)
      header[4+i] = file.name.charCodeAt(i);
    // add header and file content
    storageContent += String.fromCharCode.apply(String, header);
    storageContent += file.content;
    // pad length
    while (fileLength&3) {
      storageContent += "\xff";
      fileLength++;
    }
  });
  // work out file contents
  var cfile = `// Initial storage contents for Bangle.js 2.0
// Generated by BangleApps/bin/build_bangles_c.js

const int jsfStorageInitialContentLength = ${storageContent.length};
const char jsfStorageInitialContents[] = {
`;
for (var i=0;i<storageContent.length;i+=32) {
  var chunk = storageContent.substr(i,32);
  cfile += chunk.split("").map(c=>c.charCodeAt()).join(",")+",\n";
}
cfile += `};
`;
  fs.writeFileSync(OUTFILE, cfile);
  console.log("Output written to "+OUTFILE);
});
