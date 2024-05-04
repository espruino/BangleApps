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

var AppInfo = require(BASE_DIR+"/core/js/appinfo.js");
var apploader = require(BASE_DIR+"/core/lib/apploader.js");
apploader.init({
  DEVICEID : DEVICEID
});
var emu = require(BASE_DIR+"/core/lib/emulator.js");

// Last set of text received
var lastTxt;

function ERROR(s) {
  console.error(s);
  process.exit(1);
}

function getValue(js){
  //console.log(`> Getting value for "${js}"`);
  emu.tx(`\x10print(JSON.stringify(${js}))\n`);
  var result = emu.getLastLine();
  try {
    return JSON.parse(result);
  } catch (e) {
    console.log("Error during getValue", e);
  }
}

function assertFail(text){
  console.log("> FAIL: " + text);
  ok = false;
}

function assertCondition(condition, text) {
  if (!condition) {
    assertFail(text);
  } else console.log("OK: " + text);
}

function assertArray(step){
  let array = step.value;
  if (step.value === undefined)
    array = getValue(step.js);
  switch (step.is){
    case "notempty": assertCondition(array && array.length > 0, step.text); break;
    case "undefinedorempty": assertCondition(array && array.length == 0, step.text); break;
  }
}

function assertValue(step){
  console.debug("assertValue", step);
  let value = step.js;
  if (value === undefined)
    value = step.value;
  switch (step.is){
    case "truthy": assertCondition(getValue(`!!${value}`), step.text); break;
    case "falsy": assertCondition(getValue(`!${value}`), step.text); break;
    case "true": assertCondition(getValue(`${value} === true`), step.text); break;
    case "false": assertCondition(getValue(`${value} === false`), step.text); break;
    case "equal": assertCondition(getValue(`${value} == ${step.to}`), step.text); break;
  }
}

function wrap(func, id){
  console.log(`> Wrapping "${func}"`);

  let wrappingCode = `
  if(!global.APPTESTS) global.APPTESTS={};
  if(!global.APPTESTS.funcCalls) global.APPTESTS.funcCalls={};
  if(!global.APPTESTS.funcArgs) global.APPTESTS.funcArgs={};
  global.APPTESTS.funcCalls.${id}=0;
  (function(o) {
    ${func} = function() {
      global.APPTESTS.funcCalls.${id}++;
      global.APPTESTS.funcArgs.${id}=arguments;
      return o.apply(this, arguments);
    };
  }(${func}));`;

  emu.tx(wrappingCode);
}

function assertCall(step){
  let id = step.id;
  let args = step.argAsserts;
  let calls = getValue(`global.APPTESTS.funcCalls.${id}`);
  if ((args.count && args.count == calls) || (!args.count && calls > 0)){
    if (args) {
      let callArgs = getValue(`global.APPTESTS.funcArgs.${id}`);
      for (let a of args){
        let current = {
          value: callArgs[a.arg],
          is: a.is,
          to: a.to,
          text: step.text
        };
        switch(a.t){
          case "assertArray":
            assertArray(current);
            break;
          case "assert":
            assertValue(current);
            break;
        }
      }
    } else {
      console.log("OK", step.text);
    }
  } else
  assertFail(step.text)
}

function runStep(step, subtest, test, state){
  let p = Promise.resolve();
  if (state.ok) switch(step.t) {
    case "setup" :
      test.setup.filter(e=>e.id==step.id)[0].steps.forEach(setupStep=>{
        p = p.then(runStep(setupStep, subtest, test, state));
      });
      break;
    case "load" :
      p = p.then(() => {
        console.log(`> Loading file "${step.fn}"`);
        emu.tx(`load(${JSON.stringify(step.fn)})\n`);
      });
      break;
    case "cmd" :
      p = p.then(() => {
        console.log(`> Sending JS "${step.js}"`);
        emu.tx(`${step.js}\n`);
      });
      break;
    case "wrap" :
      p = p.then(() => {
        wrap(step.fn, step.id);
      });
      break;
    case "gb" : 
      p = p.then(() => {
        emu.tx(`GB(${JSON.stringify(step.obj)})\n`);
      });
      break;
    case "tap" :
      p = p.then(() => {
        emu.tx(`Bangle.emit(...)\n`);
      });
      break;
    case "eval" :
      p = p.then(() => {
        console.log(`> Evaluate "${step.js}"`);
        emu.tx(`\x10print(JSON.stringify(${step.js}))\n`);
        var result = emu.getLastLine();
        var expected = JSON.stringify(step.eq);
        console.log("> GOT "+result);
        if (result!=expected) {
          console.log("> FAIL: EXPECTED "+expected);
          state.ok = false;
        }
      });
      break;
      // tap/touch/drag/button press
      // delay X milliseconds?
    case "assertArray":
      p = p.then(() => {
        assertArray(step);
      });
      break;
    case "assertCall":
      p = p.then(() => {
        assertCall(step);
      });
      break;
    case "assert":
      p = p.then(() => {
        assertValue(step);
      });
      break;
    case "screenshot" :
      p = p.then(() => {
        console.log(`> Compare screenshots - UNIMPLEMENTED`);
      });
      break;
    case "saveMemoryUsage" :
      p = p.then(() => {
        emu.tx(`\x10print(process.memory().usage)\n`);
        subtest.memUsage = parseInt( emu.getLastLine());
        console.log("> CURRENT MEMORY USAGE", subtest.memUsage);
      });
      break;
    case "checkMemoryUsage" :
      p = p.then(() => {
      emu.tx(`\x10print(process.memory().usage)\n`);
      var memUsage =  emu.getLastLine();
      console.log("> CURRENT MEMORY USAGE", memUsage);
      if (subtest.memUsage != memUsage ) {
        console.log("> FAIL: EXPECTED MEMORY USAGE OF "+subtest.memUsage);
        state.ok = false;
      }
      });
      break;
    case "sleep" :
      p = p.then(new Promise(resolve => {
        console.log("Start waiting for", step.ms);
        setTimeout(resolve, step.ms);
      }));
      break;
    case "upload" :
      p = p.then(new Promise(() => {
        console.log("Uploading", step.file);
        emu.tx(AppInfo.getFileUploadCommands(step.as, require("fs").readFileSync(BASE_DIR + "/" + step.file).toString()));
      }));
      break;
    default: ERROR("Unknown step type "+step.t);
  }
  emu.idle();
}

function runTest(test, testState) {
  var app = apploader.apps.find(a=>a.id==test.app);
  if (!app) ERROR(`App ${JSON.stringify(test.app)} not found`);
  if (app.custom) ERROR(`App ${JSON.stringify(appId)} requires HTML customisation`);
  
  return apploader.getAppFilesString(app).then(command => {
    console.log("Handling command", command);
  
    // What about dependencies??
    let p = Promise.resolve();
    test.tests.forEach((subtest,subtestIdx) => {
      let state = { ok: true};
      p = p.then(()=>{
        console.log(`==============================`);
        console.log(`"${test.app}" Test ${subtestIdx}`);
        if (test.description)
          console.log(`"${test.description}`);
        console.log(`==============================`);
        emu.factoryReset();
        console.log("> Sending app "+test.app);
        emu.tx(command);
        console.log("> Sent app");
        emu.tx("reset()\n");
        console.log("> Reset");

      });

      subtest.steps.forEach(step => {
        p = p.then(runStep(step, subtest, test, state));
      });

      p = p.then(() => {
        console.log("RESULT for", test.app + (subtest.description ? (": " + subtest.description) : ""), "test", subtestIdx, "\n"+state.ok ? "OK": "FAIL");
        testState.push({
          app: test.app,
          number: subtestIdx,
          result: state.ok ? "SUCCESS": "FAILURE",
          description: subtest.description
        });
      });
    });
    p = p.then(()=>{
      emu.stopIdle();
    });
    return p;
  });
}

let testState = [];

emu.init({
  EMULATOR : EMULATOR,
  DEVICEID : DEVICEID
}).then(function() {
  // Emulator is now loaded
  console.log("Loading tests");
  let p = Promise.resolve();
  apploader.apps.forEach(app => {
    var testFile = APP_DIR+"/"+app.id+"/test.json";
    if (!require("fs").existsSync(testFile)) return;
    var test = JSON.parse(require("fs").readFileSync(testFile).toString());
    test.app = app.id;
    p = p.then(() => runTest(test, testState));
  });
  p.finally(()=>{
    console.log("\n\n");
    console.log("Overall results:");
    console.table(testState);
  });
  return p;
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
