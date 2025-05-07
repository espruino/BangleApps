{
let studyTasksJSON = "heatsuite.tasks.json";
let studyTasks = require('Storage').readJSON(studyTasksJSON, true) || {};

let Layout = require("Layout");
let modHS = require("HSModule");
let layout;
let NRFFindDeviceTimeout, TaskScreenTimeout;

let settings = modHS.getSettings();

let appCache = modHS.getCache();

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
    let found = false;
    if (devices.length !== 0) {
      devices.every((d) => {
        modHS.log("Found device", d);
        let services = d.services;
        modHS.log("Services: ", services);
        if (services !== undefined && services.includes('1810') && d.id === settings.bt_bloodPressure_id) {
          //Blood Pressure
          found = true;
          layout.msg.label = "BP Found";
          layout.render();
          if (NRFFindDeviceTimeout) clearTimeout(NRFFindDeviceTimeout);
          return Bangle.load('heatsuite.bp.js');
        } else if (services !== undefined && services.includes('181b') && studyTasks.filter(task => task.id === "bodyMass")) {
          let data = d.serviceData[services];
          let ctlByte = data[1];
          let weightRemoved = ctlByte & (1 << 7);
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

function taskButtonInterpretter(string) {
  //turn off FindDeviceHandler whenever we navigate off task screen
  let command = 'if (NRFFindDeviceTimeout){clearTimeout(NRFFindDeviceTimeout);}' + string;
  return eval(command);
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
  let btRequired = false;
  g.clear();
  g.reset();
  if (studyTasks.length === 0) {
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
  let taskArr = appCache.taskQueue;
  let taskID = [];
  if (taskArr !== undefined) {
    taskID = taskArr.filter(function (taskArr) {
      return taskArr.id;
    }).map(function (taskArr) {
      return taskArr.id;
    });
  }
  let layoutOut = { type: "v", c: [] };
  let row = { type: "h", c: [] };
  let rowCount = 2;
  if( studyTasks.length > 4){
    rowCount = 3; //so we can include up to 9 tasks on the screen at once
  }
  studyTasks.forEach(task => {
    let btn = { type: "btn", fillx: 1, filly: 1 };
    btn.id = task.id;
    btn.src = eval(task.icon);
    //callback on button press
    if (task.cbBtn) {
      btn.cb = l => taskButtonInterpretter(task.cbBtn);
    }
    //back color determination
    btn.btnFaceCol = "#90EE90";
    //a to do!!
    if (taskID.includes(task.id)) {
      btn.btnFaceCol = "#FFFF00";
    }
    //no bt paired
    if (task.btPair === true) {
      if (settings["bt_" + task.id + "_id"] === undefined || !settings["bt_" + task.id + "_id"]) {
        //make it clickable so we can go to settings and pair something
        btn.btnFaceCol = "#FF0000";
        btn.cb = l => eval(require("Storage").read("heatsuite.settings.js"))(()=>load("heatsuite.app.js"));
      }
    }
    if(task.btInfo !== undefined){
      btRequired = true;//we will be scanning for bluetooth devices
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
  if(btRequired) layoutOut.c.push({ type: "txt", font: "6x8:2", label: "Searching...", id: "msg", fillx: 1 });
  let options = { 
    lazy: true,
    btns:[{label:"Exit", cb: l=>Bangle.showClock() }],
    remove: () => {
      NRF.setScan(); //clear scan
      if (TaskScreenTimeout) clearTimeout(TaskScreenTimeout);
      if (NRFFindDeviceTimeout) clearTimeout(NRFFindDeviceTimeout);
      NRFFindDeviceTimeout = undefined;
      TaskScreenTimeout = undefined;
      require("widget_utils").show();
    }
  };
  layout = new Layout(layoutOut, options);
  layout.render();
  if(btRequired) queueNRFFindDeviceTimeout();
  queueTaskScreenTimeout();
}

Bangle.setLocked(false); //unlock screen!
Bangle.loadWidgets();
Bangle.drawWidgets();
require("widget_utils").hide();
draw();
}