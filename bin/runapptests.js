#!/usr/bin/node
/*

This allows us to test apps using the Bangle.js emulator

IT IS UNFINISHED

It searches for `test.json` in each app's directory and will
run them in sequence.

TODO:

* more code to test with
* run tests that we have found and loaded (currently we just use TEST)
* documentation
* actual tests
* detecting 'Uncaught Error'
* logging of success/fail
* ...

*/

// A simpletest
/*var TEST = {
  app : "android",
  tests : [ {
    steps : [
      {t:"load", fn:"messagesgui.app.js"},
      {t:"gb", "obj":{"t":"notify","id":1234,"src":"Twitter","title":"A Name","body":"message contents"}},
      {t:"cmd", "js":"X='hello';"},
      {t:"eval", "js":"X", eq:"hello"}
    ]
  }]
};*/
var TEST = {
  app : "antonclk",
  tests : [ {
    steps : [
      {t:"cmd", "js": "Bangle.loadWidgets()"},
      {t:"cmd", "js": "eval(require('Storage').read('antonclk.app.js'))"},
      {t:"cmd", "js":"Bangle.setUI()"}, // load and free
      {t:"saveMemoryUsage"},
      {t:"cmd", "js": "eval(require('Storage').read('antonclk.app.js'))"},
      {t:"cmd", "js":"Bangle.setUI()"}, // load and free
      {t:"checkMemoryUsage"}, // check memory usage is the same
    ]
  }]
};

var EMULATOR = "banglejs2";
var DEVICEID = "BANGLEJS2";

var BASE_DIR = __dirname + "/..";
var APP_DIR = BASE_DIR + "/apps";
var DIR_IDE =  BASE_DIR + "/../EspruinoWebIDE";


if (!require("fs").existsSync(DIR_IDE)) {
  console.log("You need to:");
  console.log("  git clone https://github.com/espruino/EspruinoWebIDE");
  console.log("At the same level as this project");
  process.exit(1);
}

var apploader = require(BASE_DIR+"/bin/lib/apploader.js");
apploader.init({
  DEVICEID : DEVICEID
});
var emu = require(BASE_DIR+"/bin/lib/emulator.js");

// Last set of text received
var lastTxt;

function ERROR(s) {
  console.error(s);
  process.exit(1);
}

function runTest(test) {
  var app = apploader.apps.find(a=>a.id==test.app);
  if (!app) ERROR(`App ${JSON.stringify(test.app)} not found`);
  if (app.custom) ERROR(`App ${JSON.stringify(appId)} requires HTML customisation`);
  return apploader.getAppFilesString(app).then(command => {
    // What about dependencies??
    test.tests.forEach((subtest,subtestIdx) => {
      console.log(`==============================`);
      console.log(`"${test.app}" Test ${subtestIdx}`);
      console.log(`==============================`);
      emu.factoryReset();
      console.log("> Sending app "+test.app);
      emu.tx(command);
      console.log("> Sent app");
      emu.tx("reset()\n");
      console.log("> Reset.");
      var ok = true;
      subtest.steps.forEach(step => {
        if (ok) switch(step.t) {
          case "load" :
            console.log(`> Loading file "${step.fn}"`);
            emu.tx(`load(${JSON.stringify(step.fn)})\n`);
            break;
          case "cmd" :
            console.log(`> Sending JS "${step.js}"`);
            emu.tx(`${step.js}\n`);
            break;
          case "gb" : emu.tx(`GB(${JSON.stringify(step.obj)})\n`); break;
          case "tap" : emu.tx(`Bangle.emit(...)\n`); break;
          case "eval" :
            console.log(`> Evaluate "${step.js}"`);
            emu.tx(`\x10print(JSON.stringify(${step.js}))\n`);
            var result = emu.getLastLine();
            var expected = JSON.stringify(step.eq);
            console.log("> GOT "+result);
            if (result!=expected) {
              console.log("> FAIL: EXPECTED "+expected);
              ok = false;
            }
            break;
            // tap/touch/drag/button press
            // delay X milliseconds?
          case "screenshot" :
            console.log(`> Compare screenshots - UNIMPLEMENTED`);
            break;
          case "saveMemoryUsage" :
            emu.tx(`\x10print(process.memory().usage)\n`);
            subtest.memUsage = parseInt( emu.getLastLine());
            console.log("> CURRENT MEMORY USAGE", subtest.memUsage);
            break;
          case "checkMemoryUsage" :
            emu.tx(`\x10print(process.memory().usage)\n`);
            var memUsage =  emu.getLastLine();
            console.log("> CURRENT MEMORY USAGE", memUsage);
            if (subtest.memUsage != memUsage ) {
              console.log("> FAIL: EXPECTED MEMORY USAGE OF "+subtest.memUsage);
              ok = false;
            }
            break;
          default: ERROR("Unknown step type "+step.t);
        }
        emu.idle();
      });
    });
    emu.stopIdle();
  });
}


emu.init({
  EMULATOR : EMULATOR,
  DEVICEID : DEVICEID
}).then(function() {
  // Emulator is now loaded
  console.log("Loading tests");
  var tests = [];
  apploader.apps.forEach(app => {
    var testFile = APP_DIR+"/"+app.id+"/test.json";
    if (!require("fs").existsSync(testFile)) return;
    var test = JSON.parse(require("fs").readFileSync(testFile).toString());
    test.app = app.id;
    tests.push(test);
  });
  // Running tests
  runTest(TEST);
});
/*
  if (erroredApps.length) {
    erroredApps.forEach(app => {
      console.log(`::error file=${app.id}::${app.id}`);
      console.log("::group::Log");
      app.log.split("\n").forEach(line => console.log(`\u001b[38;2;255;0;0m${line}`));
      console.log("::endgroup::");
    });
    process.exit(1);
  }
*/
