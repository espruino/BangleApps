#!/usr/bin/node

var EMULATOR = "banglejs1";

var appId;

if (process.argv.length!=3) {
  console.log("USAGE:");
  console.log("  bin/thumbnailer.jd APP_ID");
  process.exit(1);
}
appId = process.argv[2];
imageFn = "out.png";

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
var app = apps.find(a=>a.id==appId);
if (!app) ERROR(`App ${JSON.stringify(appId)} not found`);
if (app.custom) ERROR(`App ${JSON.stringify(appId)} requires HTML customisation`);


jsRXCallback = function() {};
jsUpdateGfx = function() {};

// wait until loaded...
setTimeout(function() {
  console.log("Loaded...");
  jsInit();
  jsIdle(true); // not automatic
  
  AppInfo.getFiles(app, {
    fileGetter:function(url) {
      console.log(__dirname+"/"+url);
      return Promise.resolve(require("fs").readFileSync(__dirname+"/../"+url).toString("binary"));
    }, settings : SETTINGS}).then(files => {
      //console.log(files);
      var command = "Bangle.factoryReset()\n";
      command += files.map(f=>f.cmd).join("\n")+"\n";
      command += `load("${appId}.app.js")\n`;
      //console.log(command);
      console.log("Uploading...");
      jsTransmitString(command);
      console.log("Done.");
      jsIdle();
      jsIdle();
      jsIdle();
      jsStopIdle();
      
      var rgba = new Uint8Array(GFX_WIDTH*GFX_HEIGHT*4);
      jsGetGfxContents(rgba);
      
      var Jimp = require("jimp");
      let image = new Jimp(GFX_WIDTH, GFX_HEIGHT, function (err, image) {
        if (err) throw err;
        let buffer = image.bitmap.data;
        buffer.set(rgba);
        image.write(imageFn, (err) => {
          if (err) throw err;
          console.log("Image written as "+imageFn);
        });
      });
});
  
  
});
