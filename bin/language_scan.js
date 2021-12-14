#!/usr/bin/nodejs
/* Scans for strings that may be in English in each app, and
outputs a list of strings that have been found.

Early work towards internationalisation.
See https://github.com/espruino/BangleApps/issues/136
*/

var BASEDIR = __dirname+"/../";
Espruino = require(BASEDIR+"core/lib/espruinotools.js");
var fs = require("fs");

var APPSDIR = BASEDIR+"apps/";
function ERROR(s) {
  console.error("ERROR: "+s);
  process.exit(1);
}
function WARN(s) {
  console.log("Warning: "+s);
}

var appsFile, apps;
try {
  appsFile = fs.readFileSync(BASEDIR+"apps.json").toString();
} catch (e) {
  ERROR("apps.json not found");
}
try{
  apps = JSON.parse(appsFile);
} catch (e) {
  ERROR("apps.json not valid JSON");
}

// Given a string value, work out if it's obviously not a text string
function isNotString(s) {
  if (s.length<2) return true; // too short
  if (s.length>40) return true; // too long
  if (s[0]=="#") return true; // a color
  if (s.endsWith(".json") || s.endsWith(".img")) return true; // a filename
  if (s.endsWith("=")) return true; // probably base64
  if (s.startsWith("BTN")) return true; // button name
  return false;
}

var textStrings = [];

console.log("Scanning...");
apps.forEach((app,appIdx) => {
  var appDir = APPSDIR+app.id+"/";
  app.storage.forEach((file) => {
    if (!file.url || !file.name.endsWith(".js")) return;
    var fileContents = fs.readFileSync(appDir+file.url).toString();
    var lex = Espruino.Core.Utils.getLexer(fileContents);
    var tok = lex.next();
    while (tok!==undefined) {
      if (tok.type=="STRING") {
        if (!isNotString(tok.value)) {
          //console.log(tok.str);
          if (!textStrings.includes(tok.value))
            textStrings.push(tok.value);
        }
      }
      tok = lex.next();
    }
  });
});
console.log("Done");
textStrings.sort();
console.log(textStrings.join("\n"));
