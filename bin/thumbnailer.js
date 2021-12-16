#!/usr/bin/node

/*
var EMULATOR = "banglejs2";
var DEVICEID = "BANGLEJS2";
*/
var EMULATOR = "banglejs1";
var DEVICEID = "BANGLEJS";

var singleAppId;

if (process.argv.length!=3 && process.argv.length!=2) {
  console.log("USAGE:");
  console.log("  bin/thumbnailer.js");
  console.log("    - all thumbnails");
  console.log("  bin/thumbnailer.js APP_ID");
  console.log("    - just one app");
  process.exit(1);
}
if (process.argv.length==3)
  singleAppId = process.argv[2];

if (!require("fs").existsSync(__dirname + "/../../EspruinoWebIDE")) {
  console.log("You need to:");
  console.log("  git clone https://github.com/espruino/EspruinoWebIDE");
  console.log("At the same level as this project");
  process.exit(1);
}

eval(require("fs").readFileSync(__dirname + "/../../EspruinoWebIDE/emu/emulator_"+EMULATOR+".js").toString());
eval(require("fs").readFileSync(__dirname + "/../../EspruinoWebIDE/emu/emu_"+EMULATOR+".js").toString());
eval(require("fs").readFileSync(__dirname + "/../../EspruinoWebIDE/emu/common.js").toString());

var SETTINGS = {
  pretokenise : true
};
var Const = {
};
module = undefined;
eval(require("fs").readFileSync(__dirname + "/../core/lib/espruinotools.js").toString());
eval(require("fs").readFileSync(__dirname + "/../core/js/utils.js").toString());
eval(require("fs").readFileSync(__dirname + "/../core/js/appinfo.js").toString());
var apps = JSON.parse(require("fs").readFileSync(__dirname+"/../apps.json"));

/* we factory reset ONCE, get this, then we can use it to reset
state quickly for each new app */
var factoryFlashMemory = new Uint8Array(FLASH_SIZE);
// Log of messages from app
var appLog = "";
// List of apps that errored
var erroredApps = [];

jsRXCallback = function() {};
jsUpdateGfx = function() {};

function ERROR(s) {
  console.error(s);
  process.exit(1);
}

function onConsoleOutput(txt) {
  appLog += txt + "\n";
}

function getThumbnail(appId, imageFn) {
  console.log("Thumbnail for "+appId);
  var app = apps.find(a=>a.id==appId);
  if (!app) ERROR(`App ${JSON.stringify(appId)} not found`);
  if (app.custom) ERROR(`App ${JSON.stringify(appId)} requires HTML customisation`);


  return new Promise(resolve => {
    AppInfo.getFiles(app, {
      fileGetter:function(url) {
        console.log(__dirname+"/"+url);
        return Promise.resolve(require("fs").readFileSync(__dirname+"/../"+url).toString("binary"));
      },
      settings : SETTINGS,
      device : { id : DEVICEID }
      }).then(files => {
        console.log("AppInfo returned");//, files);
        flashMemory.set(factoryFlashMemory);
        jsTransmitString("reset()\n");
        console.log("Uploading...");
        jsTransmitString("g.clear()\n");
        var command = files.map(f=>f.cmd).join("\n")+"\n";
        command += `load("${appId}.app.js")\n`;
        appLog = "";
        jsTransmitString(command);
        console.log("Done.");
        jsStopIdle();

        var rgba = new Uint8Array(GFX_WIDTH*GFX_HEIGHT*4);
        jsGetGfxContents(rgba);
        var rgba32 = new Uint32Array(rgba.buffer);
        var firstPixel = rgba32[0];
        var blankImage = rgba32.every(col=>col==firstPixel)

        if (appLog.indexOf("Uncaught")>=0)
          erroredApps.push( { id : app.id, log : appLog } );

        if (!blankImage) {
          var Jimp = require("jimp");
          let image = new Jimp(GFX_WIDTH, GFX_HEIGHT, function (err, image) {
            if (err) throw err;
            let buffer = image.bitmap.data;
            buffer.set(rgba);
            image.write(imageFn, (err) => {
              if (err) throw err;
              console.log("Image written as "+imageFn);
              resolve(true);
            });
          });
        } else {
          console.log("Image is empty");
          resolve(false);
        }

      });
    });
}

var screenshots = [];

// wait until loaded...
setTimeout(function() {
  console.log("Loaded...");
  jsInit();
  jsIdle();
  console.log("Factory reset");
  jsTransmitString("Bangle.factoryReset()\n");
  factoryFlashMemory.set(flashMemory);
  console.log("Ready!");

  if (singleAppId) {
    getThumbnail(singleAppId, "screenshots/"+singleAppId+"-"+EMULATOR+".png");
    return;
  }

  var appList = apps.filter(app => (!app.type || app.type=="clock") && !app.custom);
  appList = appList.filter(app => !app.screenshots && app.supports.includes(DEVICEID));

  var promise = Promise.resolve();
  appList.forEach(app => {
    promise = promise.then(() => {
      var imageFile = "screenshots/"+app.id+"-"+EMULATOR+".png";
      return getThumbnail(app.id, imageFile).then(ok => {
        screenshots.push({
          id : app.id,
          url : imageFile,
          version: app.version
        });
      });
    });
  });

  promise.then(function() {
    console.log("Complete!");
    require("fs").writeFileSync("screenshots.json", JSON.stringify(screenshots,null,2));
    console.log("Errored Apps", erroredApps);
  });


});
