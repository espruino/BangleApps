/* Node.js library with utilities to handle using the emulator from node.js */

var EMULATOR = "banglejs2";
var DEVICEID = "BANGLEJS2";

var BASE_DIR = __dirname + "/../..";
var DIR_IDE =  BASE_DIR + "/../EspruinoWebIDE";

/* we factory reset ONCE, get this, then we can use it to reset
state quickly for each new app */
var factoryFlashMemory;

// Log of messages from app
var appLog = "";
var lastOutputLine = "";

function onConsoleOutput(txt) {
  appLog += txt + "\n";
  lastOutputLine = txt;
}

exports.init = function(options) {
  if (options.EMULATOR)
    EMULATOR = options.EMULATOR;
  if (options.DEVICEID)
    DEVICEID = options.DEVICEID;

  eval(require("fs").readFileSync(DIR_IDE + "/emu/emulator_"+EMULATOR+".js").toString());
  eval(require("fs").readFileSync(DIR_IDE + "/emu/emu_"+EMULATOR+".js").toString());
  eval(require("fs").readFileSync(DIR_IDE + "/emu/common.js").toString()/*.replace('console.log("EMSCRIPTEN:"', '//console.log("EMSCRIPTEN:"')*/);

  jsRXCallback = function() {};
  jsUpdateGfx = function() {};

  factoryFlashMemory = new Uint8Array(FLASH_SIZE);
  factoryFlashMemory.fill(255);

  exports.flashMemory = flashMemory;
  exports.GFX_WIDTH = GFX_WIDTH;
  exports.GFX_HEIGHT = GFX_HEIGHT;
  exports.tx = jsTransmitString;
  exports.idle = jsIdle;
  exports.stopIdle = jsStopIdle;
  exports.getGfxContents = jsGetGfxContents;

  return new Promise(resolve => {
    setTimeout(function() {
      console.log("Emulator Loaded...");
      jsInit();
      jsIdle();
      console.log("Emulator Factory reset");
      exports.tx("Bangle.factoryReset()\n");
      factoryFlashMemory.set(flashMemory);
      console.log("Emulator Ready!");

      resolve();
    },0);
  });
};

// Factory reset
exports.factoryReset = function() {
  exports.flashMemory.set(factoryFlashMemory);
  exports.tx("reset()\n");
  appLog="";
};

// Transmit a string
exports.tx = function() {}; // placeholder
exports.idle = function() {}; // placeholder
exports.stopIdle = function() {}; // placeholder
exports.getGfxContents = function() {}; // placeholder

exports.flashMemory = undefined; // placeholder
exports.GFX_WIDTH = undefined; // placeholder
exports.GFX_HEIGHT = undefined; // placeholder

// Get last line sent to console
exports.getLastLine = function() {
  return lastOutputLine;
};

// Gets the screenshot as RGBA Uint32Array
exports.getScreenshot = function() {
  var rgba = new Uint8Array(exports.GFX_WIDTH*exports.GFX_HEIGHT*4);
  exports.getGfxContents(rgba);
  var rgba32 = new Uint32Array(rgba.buffer);
  return rgba32;
}

// Write the screenshot to a file options={errorIfBlank}
exports.writeScreenshot = function(imageFn, options) {
  options = options||{};
  return new Promise((resolve,reject) => {
    var rgba32 = exports.getScreenshot();

    if (options.errorIfBlank) {
      var firstPixel = rgba32[0];
      var blankImage = rgba32.every(col=>col==firstPixel);
      if (blankImage) reject("Image is blank");
    }

    var Jimp = require("jimp");
    let image = new Jimp(exports.GFX_WIDTH, exports.GFX_HEIGHT, function (err, image) {
      if (err) throw err;
      let buffer = image.bitmap.data;
      buffer.set(new Uint8Array(rgba32.buffer));
      image.write(imageFn, (err) => {
        if (err) return reject(err);
        console.log("Image written as "+imageFn);
        resolve();
      });
    });
  });
}
