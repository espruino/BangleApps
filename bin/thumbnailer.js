#!/usr/bin/env node

/*
var EMULATOR = "banglejs2";
var DEVICEID = "BANGLEJS2";
*/
var EMULATOR = "banglejs1";
var DEVICEID = "BANGLEJS";
var SCREENSHOT_DIR = __dirname+"/../screenshots/";

var emu = require("../core/lib/emulator.js");
var apploader = require("../core/lib/apploader.js");

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

// List of apps that errored
var erroredApps = [];

function ERROR(s) {
  console.error(s);
  process.exit(1);
}

function getThumbnail(appId, imageFn) {
  console.log("Thumbnail for "+appId);
  var app = apploader.apps.find(a=>a.id==appId);
  if (!app) ERROR(`App ${JSON.stringify(appId)} not found`);
  if (app.custom) ERROR(`App ${JSON.stringify(appId)} requires HTML customisation`);


  return apploader.getAppFilesString(app).then(command => {
      console.log(`AppInfo returned for ${appId}`);//, files);
      emu.factoryReset();
      console.log("Uploading...");
      emu.tx("g.clear()\n");
      command += `load("${appId}.app.js")\n`;
      appLog = "";
      emu.tx(command);
      console.log("Done.");
      emu.tx("Bangle.setLCDMode();clearInterval();clearTimeout();\n");
      emu.stopIdle();

      return emu.writeScreenshot(imageFn, { errorIfBlank : true }).then(() => console.log("X")).catch( err => {
        console.log("Error", err);
      });
    });
}

var screenshots = [];

apploader.init({
  EMULATOR : EMULATOR,
  DEVICEID : DEVICEID
});
// wait until loaded...
emu.init({
  EMULATOR : EMULATOR,
  DEVICEID : DEVICEID
}).then(function() {
  if (singleAppId) {
    console.log("Single Screenshot");
    getThumbnail(singleAppId, SCREENSHOT_DIR+singleAppId+"-"+EMULATOR+".png");
    return;
  }

  console.log("Screenshot ALL");
  var appList = apploader.apps.filter(app => (!app.type || app.type=="clock") && !app.custom);
  appList = appList.filter(app => !app.screenshots && app.supports.includes(DEVICEID));

  var promise = Promise.resolve();
  appList.forEach(app => {
    if (!app.supports.includes(DEVICEID)) {
      console.log(`App ${app.id} isn't designed for ${DEVICEID}`);
      return;
    }
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
