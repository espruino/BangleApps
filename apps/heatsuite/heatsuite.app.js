var studyTasksJSON = "heatsuite.tasks.json";
var Layout = require("Layout");
var modHS = require("HSModule");
var layout;
var NRFFindDeviceTimeout, TaskScreenTimeout;

function log(msg) {
  if (!settings.DEBUG) {
    return;
  } else {
    console.log(msg);
  }
}

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
  var filters = [];
  if (settings.bt_bloodPressure_id !== undefined) {
    filters.push({ id: settings.bt_bloodPressure_id });
  }
  if (settings.bt_coreTemperature_id !== undefined) {
    filters.push({ id: settings.bt_coreTemperature_id });
  }
  if (settings.StudyTasks.bodyMass !== undefined) {
    filters.push({ services: ['181b'] });
  }
  var macID;
  NRF.findDevices(function (devices) {
    var found = false;
    if (devices.length !== 0) {
      devices.every((d) => {
        log("Found device", d);
        var services = d.services;
        log("Services: ", services);
        if (services !== undefined && services.includes('1810') && d.id === settings.bt_bloodPressure_id) {
          //Blood Pressure
          found = true;
          layout.msg.label = "BP Found";
          layout.render();
          //macID = settings.bt_bloodPressure_id.split(" ");
          //setTimeout(getBP(macID[0]), 2000);
          if (NRFFindDeviceTimeout) clearTimeout(NRFFindDeviceTimeout);
          return Bangle.load('heatsuite.bp.js');
        } else if (services !== undefined && services.includes('181b')) {
          var data = d.serviceData[services];
          var ctlByte = data[1];
          var weightRemoved = ctlByte & (1 << 7);
          log(weightRemoved);
          if (weightRemoved === 0) {
            //Mass found
            found = true;
            layout.msg.label = "Scale Found";
            layout.render();
            setTimeout(getMass('181b'), 2000);
            if (NRFFindDeviceTimeout) clearTimeout(NRFFindDeviceTimeout);
            return false;
          }
          log("No weight on scale");
        } else if (services !== undefined && services.includes('1809') && d.id === settings.bt_coreTemperature_id) {
          //Core Temperature
          found = true;
          layout.msg.label = "Temp Found";
          layout.render();
          //macID = settings.bt_coreTemperature_id.split(" ");
          //setTimeout(getTcore(macID[0]), 2000);
          if (NRFFindDeviceTimeout) clearTimeout(NRFFindDeviceTimeout);
          return Bangle.load('heatsuite.bletemp.js');
        }
      });
    }
    if (!found) {
      log("Search Complete, No Devices Found");
      queueNRFFindDeviceTimeout();
    } else {
      if (TaskScreenTimeout) clearTimeout(TaskScreenTimeout);
      if (NRFFindDeviceTimeout) clearTimeout(NRFFindDeviceTimeout);
    }
  }, { timeout: 3000, active: true, filters: filters });
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
      Bangle.load();
    }, 180000);
  }
}
/** --------- MI SCALE --------------------------- */
function getMass(service) {
  var datareceived = [];
  layout = new Layout({
    type: "v", c: [
      {
        type: "h", c: [
          { type: "txt", font: "12x20:2", label: "Body Mass", fillx: 1 },
        ]
      },
      {
        type: "h", c: [
          { type: "txt", font: "12x20:2", label: "Waiting...", fillx: 1 },
        ]
      }
    ]
  });
  g.clear();
  layout.render();

  NRF.setScan(function (devices) {
    var data = devices.serviceData[service];
    datareceived.push(data);
    var ctlByte = data[1];
    var stabilized = ctlByte & (1 << 5);
    var weight = ((data[12] << 8) + data[11]) / 200;
    var impedance = (data[10] << 8) + data[9];
    if (stabilized && datareceived.length > 1 && impedance > 0 && impedance < 65534) {
      NRF.setScan();
      datareceived = [];
      var dataOut ={
        'mass' : weight, 
        'impedance' : impedance
      };
      modHS.saveDataToFile('mass', 'bodyMass', dataOut);
      layout = new Layout({
        type: "v", c: [
          {
            type: "h", c: [
              { type: "txt", font: "12x20:2", label: weight, fillx: 1 },
              { type: "txt", font: "12x20:2", label: "kg", fillx: 1 }
            ]
          },
          {
            type: "h", c: [
              { type: "txt", font: "6x8:2", label: impedance, fillx: 1 },
            ]
          },
          {
            type: "h", c: [
              { type: "txt", font: "12x20:2", label: "Saved!", fillx: 1 }
            ]
          },
        ]
      });
      g.clear();
      layout.render();
      setTimeout(function () { Bangle.load(); }, 3000);
    }
  }, { timeout: 2000, filters: [{ services: [service] }] });
}

function draw() {
  queueNRFFindDeviceTimeout();
  queueTaskScreenTimeout();
  
  g.clear();
  g.reset();
  studyTasks = require('Storage').readJSON(studyTasksJSON, true);
  if (studyTasks === undefined) {
    log('No Study Tasks loaded...');
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
    //if the row is bigger than 2 icons, skip to next one
    if (row.c.length >= 2) {
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
}
draw();