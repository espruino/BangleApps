var studyTasksJSON = "heatsuite.tasks.json";
let studyTasks = require('Storage').readJSON(studyTasksJSON, true) || {};

var Layout = require("Layout");
var modHS = require("HSModule");
var layout;
var NRFFindDeviceTimeout, TaskScreenTimeout;

var settings = modHS.getSettings();

var appCache = modHS.getCache();

function queueNRFFindDeviceTimeout() {
  if (NRFFindDeviceTimeout) clearTimeout(NRFFindDeviceTimeout);
  NRFFindDeviceTimeout = setTimeout(function () {
    NRFFindDeviceTimeout = undefined;
    findBtDevices();
  }, 3000);
}

function findBtDevices() {
  NRF.setScan(); //clear any scans running!
  NRF.findDevices(function (devices) {
    var found = false;
    if (devices.length !== 0) {
      devices.every((d) => {
        modHS.log("Found device", d);
        var services = d.services;
        modHS.log("Services: ", services);
        if (services !== undefined && services.includes('1810') && d.id === settings.bt_bloodPressure_id) {
          //Blood Pressure
          found = true;
          layout.msg.label = "BP Found";
          layout.render();
          if (NRFFindDeviceTimeout) clearTimeout(NRFFindDeviceTimeout);
          return Bangle.load('heatsuite.bp.js');
        } else if (services !== undefined && services.includes('181b') && Object.keys(studyTasks).includes("bodyMass")) {
          var data = d.serviceData[services];
          var ctlByte = data[1];
          var weightRemoved = ctlByte & (1 << 7);
          modHS.log(weightRemoved);
          if (weightRemoved === 0) {
            //Mass found
            found = true;
            layout.msg.label = "Scale Found";
            layout.render();
            if (NRFFindDeviceTimeout) clearTimeout(NRFFindDeviceTimeout);
            return Bangle.load('heatsuite.mass.js');
          }
          modHS.log("No weight on scale");
        } else if (services !== undefined && services.includes('1809') && d.id === settings.bt_coreTemperature_id) {
          //Core Temperature
          found = true;
          layout.msg.label = "Temp Found";
          layout.render();
          if (NRFFindDeviceTimeout) clearTimeout(NRFFindDeviceTimeout);
          return Bangle.load('heatsuite.bletemp.js');
        }
      });
    }
    if (!found) {
      modHS.log("Search Complete, No Devices Found");
      queueNRFFindDeviceTimeout();
    } else {
      if (TaskScreenTimeout) clearTimeout(TaskScreenTimeout);
      if (NRFFindDeviceTimeout) clearTimeout(NRFFindDeviceTimeout);
    }
  }, { timeout: 3000, active: true});
}

function taskButtonInterpretter(arg, string) {
  //turn off FindDeviceHandler whenever we navigate off task screen
  var command = 'if (NRFFindDeviceTimeout){clearTimeout(NRFFindDeviceTimeout);}' + string;
  let func = new Function(arg, command);
  func();
}

function queueTaskScreenTimeout() {
  if (TaskScreenTimeout) clearTimeout(TaskScreenTimeout);
  if (TaskScreenTimeout === undefined) {
    TaskScreenTimeout = setTimeout(function () {
      if (NRFFindDeviceTimeout) clearTimeout(NRFFindDeviceTimeout);
      Bangle.load();
    }, 180000);
  }
}

function draw() {
  g.clear();
  g.reset();
  if (Object.keys(studyTasks).length === 0) {
    if(require("Storage").list().includes("heatsuite.survey.json")){ //likely just using for EMA survey
      return Bangle.load('heatsuite.survey.js'); //go right to survey!
    }
    modHS.log('No Study Tasks loaded...');
    layout = new Layout({
      type: "v",
      c: [
        {
          type: "txt",
          font: "Vector:30",
          label: "No Study Tasks Loaded.",
          wrap: true,
          fillx: 1,
          filly: 1
        }
      ]
    });
    layout.render();
    return;
  }
  var taskArr = appCache.taskQueue;
  var taskID = [];
  if (taskArr !== undefined) {
    taskID = taskArr.filter(function (taskArr) {
      return taskArr.id;
    }).map(function (taskArr) {
      return taskArr.id;
    });
  }
  var layoutOut = { type: "v", c: [] };
  var row = { type: "h", c: [] };
  var rowCount = 2;
  if( Object.keys(studyTasks).length > 4){
    rowCount = 3; //so we can include up to 9 tasks on the screen at once
  }
  Object.keys(studyTasks).forEach(key => {
    var btn = { type: "btn", fillx: 1, filly: 1 };
    btn.id = key;
    btn.src = function () { return require("heatshrink").decompress(atob(settings.StudyTasks[key].icon)); };
    //callback on button press
    if (studyTasks[key].cbBtn) {
      btn.cb = l => taskButtonInterpretter("true", settings.StudyTasks[key].cbBtn);
    }
    //back color determination
    btn.btnFaceCol = "#90EE90";
    //a to do!!
    if (taskID.includes(key)) {
      btn.btnFaceCol = "#FFFF00";
    }
    //no bt paired
    if (studyTasks[key].btPair === true) {
      if (settings["bt_" + key + "_id"] === undefined || !settings["bt_" + key + "_id"]) {
        //make it clickable so we can go to settings and pair something
        btn.btnFaceCol = "#FF0000";
        btn.cb = l => taskButtonInterpretter('true', "Bangle.load('heatsuite.settings.js);");
      }
    }
    //builder for each icon in taskScreen
    if (row.c.length >= rowCount) {
      layoutOut.c.push(row);
      row = { type: "h", c: [] };
    }
    row.c.push(btn);
  });
  //push that last row in if needed
  if (row.c.length > 0) {
    layoutOut.c.push(row);
  }
  //Final 
  layoutOut.c.push({ type: "txt", font: "6x8:2", label: "Searching...", id: "msg", fillx: 1 });
  layout = new Layout(layoutOut, { lazy: true });
  layout.render();
  queueNRFFindDeviceTimeout();
  queueTaskScreenTimeout();
}
draw();