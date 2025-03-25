(() => {
  //Add CORE in future
  const modHS = require('HSModule');
  var settings = modHS.getSettings();
  var cache = modHS.getCache();
  var hrmInterval = 0;
  var appName = "heatsuite";
  var bleAdvertGen = 0xE9D0;
  var bleAdvertHealth = 0xFA11;
  var lastBLEAdvert = [];
  var recorders;
  var activeRecorders = [];
  var dataLog = [];
  var lastGPSFix = 0;
  var gpsLog = [];
  var connectionLock = false;
  var processQueue = [];
  var processQueueTimeout = null;
  let initHandlerTimeout = null;
  let BTHRM_ConnectCheck = null;
  //Fall Detection
  var fallTimeout = 0;
  var fallDetected = false;

  Bangle.setOptions({ 
    "hrmSportMode": -1,
    //manualWatchdog:true
  });

  function queueProcess(func, arg) {
    processQueue.push((next) => func(next, arg));
    if (!connectionLock) {
      processNextInQueue(); 
    }else{
      if (!processQueueTimeout) {
        processQueueTimeout = setTimeout(processNextInQueue, 1000);
      }
    }
  }
  function processNextInQueue() {
    clearTimeout(processQueueTimeout); // Clear the timeout when processing starts
    processQueueTimeout = null;
    if (processQueue.length === 0) {
      return;
    }
    if (!connectionLock && processQueue.length > 0) {
      const task = processQueue.shift();
      task(() => {
        modHS.log("[ProcessQueue] Processing queued Task");
        processNextInQueue();
      });
    }else{
      if (!processQueueTimeout) {
        processQueueTimeout = setTimeout(processNextInQueue, 1000);
      }
    }
  }
  function stringToBytes(str) {
    const byteArray = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        byteArray[i] = str.charCodeAt(i);
    }
    return byteArray;
  }
  function xorEncryptWithSalt(payload, key, salt) {
      const encrypted = [];
      const keyLen = key.length;
      const saltLen = salt.length;

      for (let i = 0; i < payload.length; i++) {
          encrypted[i] = payload[i] ^ key.charCodeAt(i % keyLen) ^ salt.charCodeAt(i % saltLen);
      }
      return encrypted;
  }
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
      return array;
  }
  function flattenArray(array) {
      let flattened = [];
      for (let i = 0; i < array.length; i++) {
          if (Array.isArray(array[i])) {
              // If the element is an array, concatenate it recursively
              flattened = flattened.concat(flattenArray(array[i]));
          } else {
              // If it's not an array, add the element to the result
              flattened.push(array[i]);
          }
      }
      return flattened;
  }
  function createRandomizedPayload(studyid, battery, temperature, heartRate, hr_loc, movement, pingFlag) {
      let textBytes = stringToBytes(studyid);
          if (textBytes.length < 4) {
        const paddedArray = new Uint8Array(4);  // Create a new Uint8Array with 4 bytes (default 0x00)
        paddedArray.set(textBytes);  // Copy the textBytes into the paddedArray
        textBytes = paddedArray;  // Replace textBytes with the padded version
    }
      const dataBlocks = [];
      dataBlocks.push([0x00, textBytes[0], textBytes[1], textBytes[2], textBytes[3]]); // Study Code
      if(studyid !== "####"){
        dataBlocks.push([0x01, battery]); // Battery level
        dataBlocks.push([0x02, temperature & 255, (temperature >> 8) & 255]); // Temperature (2 bytes)

        // Validate heartRate: ensure it's a number and not NaN, else default to 0
        let heartRateValue = parseInt(heartRate);
        if (isNaN(heartRateValue)) {
            heartRateValue = 0;  // Default to 0 if heartRate is not valid
        }
        dataBlocks.push([0x03, heartRateValue]);
        dataBlocks.push([0x04, hr_loc]); // Heart rate location
        dataBlocks.push([0x05,movement & 255, (movement >> 8) & 255, (movement >> 16) & 255,(movement >> 24) & 255 ]);
        let statusByte = (+Bangle.isCharging() << 1) | pingFlag;
        dataBlocks.push([0x06, statusByte]);
        //dataBlocks.push([0x07, pingFlag]);
      }
      const randomizedDataBlocks = shuffleArray(dataBlocks);
      const payload = flattenArray(randomizedDataBlocks);
      return studyid !== "####" ? xorEncryptWithSalt(payload, "heatsuite", studyid) : payload;
  }
  //from: https://github.com/espruino/BangleApps/tree/master/apps/recorder
  //adapted to minute average data
  let getRecorders = function () {
    var recorders = {
      hrm: function () {
        var bpm = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null }, bpmConfidence = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null }, src = "";
        function onHRM(h) {
          if (h.confidence !== 0) bpmConfidence = newValueHandler(bpmConfidence, h.confidence);
          if (h.bpm !== 0) bpm = newValueHandler(bpm, h.bpm);
          src = h.src;
        }
        return {
          name: "HR",
          fields: ["hr", "hr_conf", "hr_src"],
          getValues: () => {
            var r = [bpm.avg === null ? null : bpm.avg.toFixed(0), bpmConfidence.avg === null ? null : bpmConfidence.avg.toFixed(0), src];
            bpm = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
            bpmConfidence = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
            src = "";
            return r;
          },
          start: () => {
            Bangle.on('HRM', onHRM);
            Bangle.setHRMPower(1, appName);
          },
          stop: () => {
            Bangle.removeListener('HRM', onHRM);
            Bangle.setHRMPower(0, appName);
          },
          draw: (x, y) => g.setColor(Bangle.isHRMOn() ? "#f00" : "#f88").drawImage(atob("DAwBAAAAMMeef+f+f+P8H4DwBgAA"), x, y)
        };
      },
      bthrm: function () {
        var bt_bpm = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
        var bt_bat = "";
        var bt_energy = "";
        var bt_contact = "";
        var bt_rr = [];
        function onBTHRM(h) {
          //modHS.log(JSON.stringify(h));
          if (h.bpm === 0) return;
          bt_bpm = newValueHandler(bt_bpm, h.bpm);
          bt_bat = h.bat;
          bt_energy = h.energy;
          bt_contact = h.contact;
          if (h.rr) bt_rr.push(h.rr);
        }
        return {
          name: "BT HR",
          fields: ["bt_bpm", "bt_bat", "bt_energy", "bt_contact", "bt_rr"],
          getValues: () => {
            const result = [bt_bpm.avg === null ? null : bt_bpm.avg.toFixed(0), bt_bat, bt_energy, bt_contact, bt_rr.join(";")];
            bt_bpm = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
            bt_rr = [];
            bt_bat = "";
            bt_energy = "";
            bt_contact = "";
            return result;
          },
          start: () => {
            Bangle.on('BTHRM', onBTHRM);
            if (Bangle.setBTHRMPower) Bangle.setBTHRMPower(1, appName);
          },
          stop: () => {
            Bangle.removeListener('BTHRM', onBTHRM);
            if (Bangle.setBTHRMPower) Bangle.setBTHRMPower(0, appName);
          }
        }
      },
      CORESensor: function () {
        var core = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
        var skin = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
        var core_hr = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
        var hsi = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
        var core_bat = null;
        var unit = null;
        function onCORE(h) {
          core = newValueHandler(core, h.core);
          skin = newValueHandler(skin, h.skin);
          if(core_hr > 0){
            core_hr = newValueHandler(core_hr, h.hr);
          }
          hsi = newValueHandler(hsi, h.hsi);
          core_bat = h.battery;
          unit = h.unit;
        }
        return {
          name: "CORESensor",
          fields: ["core", "skin", "unit","core_hr", "hsi", "core_bat"],
          getValues: () => {
            const result = [core.avg === null ? null : core.avg.toFixed(2), skin.avg === null ? null : skin.avg.toFixed(2),unit,core_hr.avg === null ? null : core_hr.avg.toFixed(0),hsi.avg === null ? null : hsi.avg.toFixed(1),core_bat];
            core = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
            skin = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
            core_hr = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
            hsi = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
            core_bat = null;
            unit = null;
            return result;
          },
          start: () => {
            Bangle.on('CORESensor', onCORE);
            if (Bangle.setCORESensorPower) Bangle.setCORESensorPower(1, appName);
          },
          stop: () => {
            Bangle.removeListener('CORESensor', onCORE);
            if (Bangle.setCORESensorPower) Bangle.setCORESensorPower(0, appName);
          }
        }
      },
      bat: function () {
        return {
          name: "BAT",
          fields: ["batt_p", "batt_v", "charging"],
          getValues: () => {
            return [E.getBattery(), NRF.getBattery().toFixed(2), Bangle.isCharging()];
          },
          start: () => {
          },
          stop: () => {
          },
          draw: (x, y) => g.setColor(Bangle.isCharging() ? "#0f0" : "#ff0").drawImage(atob("DAwBAABgH4G4EYG4H4H4H4GIH4AA"), x, y)
        };
      },
      steps: function () {
        var lastSteps = 0;
        return {
          name: "steps",
          fields: ["steps"],
          getValues: () => {
            var c = Bangle.getStepCount(), r = [c - lastSteps];
            lastSteps = c;
            return r;
          },
          start: () => { lastSteps = Bangle.getStepCount(); },
          stop: () => { },
          draw: (x, y) => g.reset().drawImage(atob("DAwBAAMMeeeeeeeecOMMAAMMMMAA"), x, y)
        };
      },
      movement: function () {
        return {
          name: "movement",
          fields: ["movement"],
          getValues: () => {
            return Bangle.getHealthStatus().movement;
          },
          start: () => { },
          stop: () => { },
          draw: (x, y) => g.reset().drawImage(atob("DAwBAAMMeeeeeeeecOMMAAMMMMAA"), x, y)
        };
      },
      acc: function () {
        var accDiffarray = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
        function accelHandler(accel) {
          accDiffarray = newValueHandler(accDiffarray, accel.diff);
        }
        return {
          name: "Accelerometer",
          fields: ["acc_min", "acc_max", "acc_avg", "acc_sum"],
          getValues: () => {
            var r = [accDiffarray.min === null ? null : accDiffarray.min.toFixed(4), accDiffarray.max === null ? null : accDiffarray.max.toFixed(4), accDiffarray.avg === null ? null : accDiffarray.avg.toFixed(4), accDiffarray.sum === null ? null : accDiffarray.sum.toFixed(4)];
            accDiffarray = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
            return r;
          },
          start: () => {
            //Bangle.setPollInterval(80); // This will allow it to be dynamic and save battery
            Bangle.on('accel', accelHandler);
          },
          stop: () => {
            Bangle.removeListener('accel', accelHandler);
          },
          draw: (x, y) => g.setColor(Bangle.isHRMOn() ? "#f00" : "#f88").drawImage(atob("DAwBAAAAMMeef+f+f+P8H4DwBgAA"), x, y)
        };
      },
    };
    if (Bangle.getPressure) {
      recorders['baro'] = function () {
        var temp = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
        var press = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
        var alt = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
        function onPress(c) {
          if (c.temperature !== 0) temp = newValueHandler(temp, c.temperature);
          if (c.pressure !== 0) press = newValueHandler(press, c.pressure);
          if (c.altitude !== 0) alt = newValueHandler(alt, c.altitude);
        }
        return {
          name: "Baro",
          fields: ["baro_temp", "baro_press", "baro_alt"],
          getValues: () => {
            var r = [temp.avg === null ? null : temp.avg.toFixed(2), press.avg === null ? null : press.avg.toFixed(2), alt.avg === null ? null : alt.avg.toFixed(2)];
            var temp = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
            var press = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
            var alt = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
            return r;
          },
          start: () => {
            Bangle.setBarometerPower(1, appName);
            Bangle.on('pressure', onPress);
          },
          stop: () => {
            Bangle.setBarometerPower(0, appName);
            Bangle.removeListener('pressure', onPress);
          },
          draw: (x, y) => g.setColor("#0f0").drawImage(atob("DAwBAAH4EIHIEIHIEIHIEIEIH4AA"), x, y)
        };
      }
    }
    return recorders;
  }
  function newValueHandler(arr, value) {//a way to keep resource use down for each sensor since this could grow large!
    arr.count = (arr.count === null) ? 1 : arr.count + 1;
    if (arr.count === 1) arr.min = value;
    arr.last = value;
    arr.avg = (value + (arr.avg * (arr.count - 1))) / arr.count;
    arr.sum = arr.sum + value;
    arr.min = (value < arr.min) ? value : arr.min;
    arr.max = (value > arr.max) ? value : arr.max;
    return arr;
  }

  function updateBLEAdvert(data){
    var headers = ['unix','tz'];
    activeRecorders.forEach(recorder => headers.push.apply(headers, recorder.fields));
    var unix = data[0]; //Unix is always first
    var batt  = data[headers.indexOf('batt_p')];
    var temperature = Math.round(data[headers.indexOf('baro_temp')]*100);
    var heartRate = data[headers.indexOf('hr')];
    var hr_loc = 1;
    if(headers.includes('bt_hrm')){
      hr_loc = 2;
      heartRate = data[headers.indexOf('bt_hrm')]; 
    }
    var movement = Math.round(data[headers.indexOf('acc_sum')] * 10000);
    var studyid = settings.studyID || "####";
        if (studyid.length > 4) {
          studyid = studyid.substring(0, 4);
        }
    var lastNodePing = cache.lastNodePing || 0;
    var nodePing = (Math.abs(unix - lastNodePing) > 360) ? 1 : 0; //only allow for a BLE connection every 5 minutes
    let advert = createRandomizedPayload(studyid, batt, temperature, heartRate, hr_loc, movement, nodePing);
    require("ble_advert").set(bleAdvertGen, advert);
  }
  //function for broadcasting emergent health events
  function healthEventBLEAdvert(type, data){
    var HEALTH_EVENTS = {
      fall: 0x01,
      custom: 0xFF
    };
    var eventType = HEALTH_EVENTS[type] || HEALTH_EVENTS.custom;
    let payload = [eventType];
    switch (eventType) {
      case (HEALTH_EVENTS.fall):{
        let timestamp = data.time || Math.floor(Date.now() / 1000); // default to current time
        payload.push((timestamp >> 24) & 0xFF);
        payload.push((timestamp >> 16) & 0xFF);
        payload.push((timestamp >> 8) & 0xFF);
        payload.push(timestamp & 0xFF);
        break;
      }
      default:{
        if(data && data.length > 0){
          for (var i = 0; i < data.length; i++) {
            payload.push(data[i]);
          }
        }
        break;
      }
    }
    //broadcast event (unencrypted)
    require("ble_advert").set(bleAdvertHealth, payload);
  }
  function fallDetectFunc(e){
      if(!fallDetected){
        let d = new Date.getTime();
        if(fallTimeout != 0 && fallTimeout - d > 200){
          fallTimeout = 0; fallDetected = false;
        }else if (accel.mag < 0.2 && fallDetect === 0){
          fallDetect = d;
        }else if(accel.mag > 2.1 && fallDetect - d < 200){ // impact
          //IMPACT
          E.showPrompt("Did you fall?",{title: "FALL DETECTION",img:atob("FBQBAfgAf+Af/4P//D+fx/n+f5/v+f//n//5//+f//n////3//5/n+P//D//wf/4B/4AH4A=")}).then((r) => {
            if (r) {
                fallDetected = true;
                modHS.saveDataToFile('fall', 'fall', {'fall':1});
                healthEventBLEAdvert('fall', {'time':parseInt((d / 1000).toFixed(0)) });
            }else{
              Bangle.load(); //no fall, so just return to clock
            }
        });
        }
      }
  }

  function storeTempLog(unix){
    var fields = [unix, ((new Date()).getTimezoneOffset() * -60)];
    activeRecorders.forEach(recorder => fields.push.apply(fields, recorder.getValues()));
    dataLog.push(fields);
    lastBLEAdvert = fields;
    updateBLEAdvert(lastBLEAdvert);
  }

  function writeLog() {
    var headers = ["unix", "tz"];
    activeRecorders.forEach(recorder => headers.push.apply(headers, recorder.fields));
    var storageFile = modHS.getRecordFile('minData', headers);
    try {
      if (storageFile) {
        while (dataLog.length > 0) {
          let item = dataLog.shift(); 
          storageFile.write(item.join(',') + '\n');
        }
      }
    } catch (e) {
      modHS.log(e);
    }
    modHS.checkStorageFree('minData');
    return true;
  }

  function toggleHRM() {
    var recHRM = recorders['hrm'];
    var hrm = recHRM();
    if (Bangle.isHRMOn()) {
      hrm.stop();
    } else {
      hrm.start();
    }
  }

  function writeGPS() {
      var storageFile = modHS.getRecordFile('gps',["unix", "tz",'lat',"lon","alt","speed","course","fix","satellites"]);
      if (storageFile) {
        while (gpsLog.length > 0) { //store it
          let item = gpsLog.shift(); 
          storageFile.write(item.join(',') + '\n');
          cache["lastGPSSignal"] = item[0];
          queueProcess((next,cache) => {
            modHS.writeCache(cache);
            next();
          },cache);
        }
    }
  }
  function gpsHandler() {
    if(settings.GPS){
      function logGPS(f){
        if (!isNaN(f.lat)) {
          const unix = parseInt((new Date().getTime() / 1000).toFixed(0));
          if(unix > lastGPSFix + 60){
            var fields = [unix, ((new Date()).getTimezoneOffset() * -60),f.lat,f.lon,f.alt,f.speed,f.course,f.fix,f.satellites];
            gpsLog.push(fields);
            lastGPSFix = unix;
          }
        }
      }
      Bangle.on('GPS', logGPS);
      Bangle.setGPSPower(1,appName);
      var updateTime = settings.GPSInterval !== undefined ? settings.GPSInterval * 60 : 600;
      var searchTime = settings.GPSScanTime !== undefined ? settings.GPSScanTime * 60 : 60;
      var adaptiveTime = settings.GPSAdaptiveTime !== undefined ? settings.GPSAdaptiveTime * 60 : 120;
      require("gpssetup").setPowerMode({ power_mode:"PSMOO", update: updateTime, search:searchTime, adaptive: adaptiveTime,appName: appName});
    }else{
      Bangle.setGPSPower(0,appName); //just make sure its off
    }
  }

function studyTaskCheck(timenow) {
  modHS.log("[StudyTask] Func init at " + timenow);
  let notifications = false;
  const tasks = settings.StudyTasks;
  for (const key in tasks) {
    const task = tasks[key];
    modHS.log(`[StudyTask] Processing task: ${JSON.stringify(task)}`);
    if (!cache[key]) {
      cache[key] = {}; 
    }
    const d = new Date(timenow * 1000);
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const tod = parseInt(`${hours}${minutes}`);
    const lastTaskTime = cache[key].unix || 0;
    const debounceTime = (timenow - lastTaskTime) >= task.debounce;
    if (Array.isArray(task.tod) && task.tod.includes(tod) && debounceTime) {
      modHS.log(`[StudyTask] Time to notify: ${task}`);
      const taskID = { id: key, time: timenow };
      cache.taskQueue = cache.taskQueue || []; // Ensure taskQueue exists
      cache.taskQueue.push(taskID);
      var seen = {};
      var newTaskQueue = [];
      for (var i = 0; i < cache.taskQueue.length; i++) {
        var obj = cache.taskQueue[i];
        if (!seen[obj.id]) {
          seen[obj.id] = true;
          newTaskQueue.push(obj);
        }
      }
      cache.taskQueue = newTaskQueue;
      modHS.log(`[StudyTask] ${JSON.stringify(cache)}`);
      if (task.notify) {
        notifications = true;
      }
      modHS.writeCache(cache);
      WIDGETS["heatsuite"].draw();
    }
  }
  if (notifications) {
    Bangle.buzz(200);
    setTimeout(() => Bangle.buzz(200), 300);
  }
  if (notifications && Bangle.CLOCK && settings.notifications) {
    const desc = `Tasks: ${cache.taskQueue.length}`;
    E.showPrompt(desc, {
      title: "NOTIFICATION",
      img: atob("FBQBAfgAf+Af/4P//D+fx/n+f5/v+f//n//5//+f//n////3//5/n+P//D//wf/4B/4AH4A="),
      buttons: {
        " X ": false,
        " >> ": true
      }
    }).then(v => {
      if (v) {
        Bangle.load("heatsuite.app.js");
      } else {
        Bangle.load();
      }
    });
  }
  modHS.log("[StudyTask] Func end");
}

  //heart beat of the backend
  function init() {
    cache = modHS.getCache(); //update cache each minute
    var unix = parseInt((new Date().getTime() / 1000).toFixed(0));
    if (storeTempLog(unix)) {
      modHS.log("Data Logged to RAM");
    }
    queueProcess((next, unix) => {
      modHS.log("[HRM + StudyTask]");
      try {
          // HRM interval check
          if (settings.HRMInterval > 0) {
              if (hrmInterval >= settings.HRMInterval) {
                  toggleHRM();
                  hrmInterval = 0;
              }
              hrmInterval++;
          }
          if (Object.keys(settings.StudyTasks).length > 0) {
              studyTaskCheck(unix); // This might also need to be queued if async
          }
      } catch (error) {
          modHS.log("Error in StudyTaskCheck:", error);
      } finally {
          next(); // Ensure next() is called even if an error occurs
      }
    }, unix);
  }

  function initHandler(){
    var date = new Date();
    var millisLeft = 60000 - ((date.getSeconds() * 1000) + date.getMilliseconds());
    initHandlerTimeout = setTimeout(() => {init();initHandler();}, millisLeft);
  }

  function startRecorder(){
    settings = modHS.getSettings(); 
    if(initHandlerTimeout) clearTimeout(initHandlerTimeout);
    if(BTHRM_ConnectCheck) clearInterval(BTHRM_ConnectCheck);
    activeRecorders = []; //clear active recorders
    recorders = getRecorders();
    settings.record.forEach(r => {
      var recorder = recorders[r];
      if (!recorder) {
        return;
      }
      var activeRecorder = recorder();
      activeRecorder.start();
      activeRecorders.push(activeRecorder);
    });
    if(settings.fallDetect){
      Bangle.on('accel', fallDetectFunc);
    }else{
      Bangle.removeListener('accel', fallDetectFunc);
    }
    //BTHRM Additions
    if (settings.record.includes('bthrm') && Bangle.hasOwnProperty("isBTHRMConnected") ) {
      var BTHRMStatus = 0;
      BTHRM_ConnectCheck = setInterval(function () {
        if (Bangle.isBTHRMConnected() != BTHRMStatus) {
          BTHRMStatus = Bangle.isBTHRMConnected();
          WIDGETS["heatsuite"].draw();
        }
      }, 10000); //runs every 10 seconds
    }
    initHandler();
  }

  startRecorder();
  
  gpsHandler();

  function writeSetTimeout(){
    if(!connectionLock){
      if(dataLog.length>0){
        writeLog();
      }
      if(gpsLog.length>0){
        writeGPS();
      }
    }
    setTimeout(writeSetTimeout, 5000);
  }

  //log writer/checker
  writeSetTimeout();

  //widget stuff
  var iconWidth = 44 + (Bangle.hasOwnProperty("isCORESensorConnected") ? 23 : 0);
  function draw() {
    g.reset();
    if (cache.taskQueue !== undefined) (cache.taskQueue.length > 0 ? g.setColor("#f00") : g.setColor("#0f0"));
    g.setFontAlign(0, 0);
    g.fillRect({ x: this.x, y: this.y, w: this.x + iconWidth - 1, h: this.y + 23 , r: 8 });
    g.setColor(-1);
    g.setFont("Vector", 12);
    g.drawString("HS", this.x + 12, this.y + 12);
    g.setColor((Bangle.hasOwnProperty("isBTHRMConnected") && Bangle.isBTHRMConnected()) ? "#00F" : "#0f0");
    g.drawImage(atob("EhCCAAKoAqgCqqiqqCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqiqqqqqAqqqqoAKqqqgACqqqAAAqqoAAAKqgAAACqAAAAAoAAAAAoAAA=="), this.x + 21, this.y + 3);
    if(Bangle.hasOwnProperty("isCORESensorConnected")){
      g.setColor((Bangle.isCORESensorConnected()) ? "#0f0" : "#CCC"); g.drawImage(atob("FBSCAAAAADwAAAPw/8AAP/PD8AP/wwDwD//PAPAP/APA8D/AA//wP8AA/8A/AAAAPP8AAAD8/wAAAPz/AAAA/D8AAAAAP8AAA/A/8AAP8A/8AD/wD///z8AD///PAAA///AAAAP/wAA="), this.x + 42, this.y + 1);
    }
  }
  WIDGETS.heatsuite = {
    area: 'tr',
    width: iconWidth,
    draw: draw,
    changed: function () {
      startRecorder();
      WIDGETS["heatsuite"].draw();
    }
  };
  Bangle.on('swipe', function (dLR, dUD) {
    if (dLR === 1 && dUD === 0) {
      Bangle.load('heatsuite.app.js');
    }
  });


  //Diagnosing BLUETOOTH Connection Issues
  if(NRF.getSecurityStatus().connected){ //if widget starts while a bluetooth connection exits, need to force connection flag
    connectionLock = true;
  }
  NRF.on('error', function(msg) {
    modHS.log("[NRF][ERROR] "+msg);
   });
  NRF.on('connect', function(addr) {
    connectionLock = true;
    modHS.log("[NRF][CONNECTED] "+JSON.stringify(addr));
  });
  NRF.on('disconnect', function(reason) {
    connectionLock = false;
    cache = modHS.getCache(); //update cache each disconnect
    if(lastBLEAdvert){
      updateBLEAdvert(lastBLEAdvert); //update this if its changed with cache update
    }
    processNextInQueue();
    modHS.log("[NRF][DISCONNECT] "+JSON.stringify(reason));
  });
})();