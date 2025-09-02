(() => {
  const modHS = require('HSModule');
  var settings = modHS.getSettings();
  var cache = modHS.getCache();
  var hrmInterval = 0;
  var appName = "heatsuite";
  var bleAdvertGen = 0xE9D0;
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
  //high Accelerometry data
  var perSecAccHandler = null;
  var highAccTimeout = null;
  var highAccWriteTimeout = null;
  //Fall Detection
  var fallTime = 0;
  var fallDetected = false;

  Bangle.setOptions({
    "hrmSportMode": -1,
  });
  //function for setting timeouts to the nearest second or minute
  function timeoutAligned(periodMs, callback) {
    var now = new Date();
    var millisPassed = (now.getSeconds() * 1000) + now.getMilliseconds();
    if (periodMs < 1000) periodMs = 1000; //nothing less than a second is allowed
    var millisLeft = periodMs - (millisPassed % periodMs);
    return setTimeout(() => { callback(); }, millisLeft);
  }
  function secondsSinceMidnight() {//valuable for compact storage of time
    let d = new Date();
    return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
  }
  function queueProcess(func, arg) {
    processQueue.push((next) => func(next, arg));
    if (!connectionLock) {
      processNextInQueue();
    } else {
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
    } else {
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
    var alert = false;
    if (cache.hasOwnProperty('alert') && Object.keys(cache.alert).length > 0) {
      var HEALTH_EVENTS = {
        fall: 1,
        custom: 99
      };
      var HEALTH_EVENT_TYPE = HEALTH_EVENTS[cache.alert.type] || HEALTH_EVENTS.custom;
      dataBlocks.push([0x07, HEALTH_EVENT_TYPE]);
    }
    if (studyid !== "####") {
      if (battery != null) {
        dataBlocks.push([0x01, battery]); // Battery level
      }
      if (temperature != null && !isNaN(temperature)) {
        dataBlocks.push([0x02, temperature & 255, (temperature >> 8) & 255]); // Temperature
      }
      if (heartRate != null && !isNaN(heartRate)) {
        dataBlocks.push([0x03, heartRate]);
      }
      if (hr_loc != null && !isNaN(hr_loc) && !alert) { //sub this for an alert flag if needed!
        dataBlocks.push([0x04, hr_loc]);
      }

      if (movement != null && !isNaN(movement)) {
        dataBlocks.push([
          0x05,
          movement & 255,
          (movement >> 8) & 255,
          (movement >> 16) & 255,
          (movement >> 24) & 255
        ]);
      }
    }
    if (!isNaN(pingFlag)) {
      let statusByte = (+Bangle.isCharging() << 1) | pingFlag;
      dataBlocks.push([0x06, statusByte]);
    }
    modHS.log(JSON.stringify(dataBlocks));
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
          if (h.rr) {
            h.rr.forEach(val => bt_rr.push(val));
          }
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
        var heatflux = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
        var hsi = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
        var core_bat = null;
        var unit = null;
        function onCORE(h) {
          core = newValueHandler(core, h.core);
          skin = newValueHandler(skin, h.skin);
          if (core_hr > 0) {
            core_hr = newValueHandler(core_hr, h.hr);
          }
          heatflux = newValueHandler(heatflux, h.heatflux);
          hsi = newValueHandler(hsi, h.hsi);
          core_bat = h.battery;
          unit = h.unit;
        }
        return {
          name: "CORESensor",
          fields: ["core", "skin", "unit", "core_hr", "hf","hsi", "core_bat"],
          getValues: () => {
            const result = [core.avg === null ? null : core.avg.toFixed(2), skin.avg === null ? null : skin.avg.toFixed(2), unit, core_hr.avg === null ? null : core_hr.avg.toFixed(0), heatflux.avg === null ? null : heatflux.avg.toFixed(2),hsi.avg === null ? null : hsi.avg.toFixed(1), core_bat];
            core = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
            skin = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
            core_hr = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
            heatflux = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
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
            return [Bangle.getHealthStatus().movement];
          },
          start: () => { },
          stop: () => { },
          draw: (x, y) => g.reset().drawImage(atob("DAwBAAMMeeeeeeeecOMMAAMMMMAA"), x, y)
        };
      },
      acc: function () {
        var accMagArray = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
        function accelHandler(accel) {
          // magnitude is computed as: sqrt(x*x + y*y + z*z)
          // to compute Elucidean Norm Minus One, simply run: mag - 1
          // (https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0061691) 
          accMagArray = newValueHandler(accMagArray, accel.mag);
        }
        return {
          name: "Accelerometer",
          fields: ["acc_min", "acc_max", "acc_avg", "acc_sum"],
          getValues: () => {
            var r = [accMagArray.min === null ? null : accMagArray.min.toFixed(4), accMagArray.max === null ? null : accMagArray.max.toFixed(4), accMagArray.avg === null ? null : accMagArray.avg.toFixed(4), accMagArray.sum === null ? null : accMagArray.sum.toFixed(4)];
            accMagArray = { "count": null, "avg": null, "min": null, "max": null, "sum": null, "last": null };
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
  //increased accelerometer data storage for higher resolution activity tracking 
  function perSecAcc(status) {
    if(!status){
      if (perSecAccHandler) Bangle.removeListener('accel', perSecAccHandler);
      if (highAccTimeout) clearTimeout(highAccTimeout);
      if (highAccWriteTimeout) clearTimeout(highAccWriteTimeout);
      return;
    }
    function arrayAcc() {
      return { count: 0, sum: 0 };
    }
    function updateArray(acc, value) {
      acc.sum += value;
      acc.count++;
    }
    function getAvg(acc) {
      return acc.count ? acc.sum / acc.count : 0;
    }
    let mag = arrayAcc();
    let accTemp = [];
    perSecAccHandler = function(accel){
      updateArray(mag, accel.mag);
    };
    Bangle.on('accel', perSecAccHandler);

    function writeAccLog(buf) {
      if (!buf || !buf.length) return;
      let f = modHS.getRecordFile("accel", []);
      if (!f) return;
      let line = "";
      function processArrayChunk() {
        let chunkSize = 10; 
        for (let i = 0; i < chunkSize && buf.length; i++) {
          let data = buf.shift();
          if (!data || data.length !== 8) continue;
          let dv = new DataView(data.buffer);
          let t = dv.getUint32(0, true);
          let mag = dv.getUint16(4, true);
          let sum = dv.getUint16(6, true);
          line += t + "," + mag + "," + sum + "\n";
        }
        if (buf.length) {
          setTimeout(processArrayChunk, 10); 
        } else {
          f.write(line);
          f = null;
        }
      }
      processArrayChunk();
    }
    
    function writeHSAccelSetTimeout() {
      if (accTemp.length > 0) {
        queueProcess((next, buf) => {
          writeAccLog(buf);
          next();
        },accTemp);
        accTemp = [];
      }
      highAccWriteTimeout = timeoutAligned(10000, writeHSAccelSetTimeout); //check every 10 seconds
    }
    function tempAccLog() {
      let secondsSM = secondsSinceMidnight();
      let scaledMagAvg = Math.round(getAvg(mag) * 8192);
      let scaledMagSum = Math.round(mag.sum * 1024);
      let b = new Uint8Array(8);
      let dv = new DataView(b.buffer);
      dv.setUint32(0, secondsSM, true);  
      dv.setUint16(4, scaledMagAvg, true);
      dv.setUint16(6, scaledMagSum, true);
      accTemp.push(b);  // Push Uint8Array
      mag = arrayAcc();
      highAccTimeout = timeoutAligned(1000, tempAccLog);
    }
    let rawAccLogInt = (settings.AccLogInt ? settings.AccLogInt * 1000 : 1000);
    let accLogInt = Math.max(1000, Math.round(rawAccLogInt / 1000) * 1000);
    highAccTimeout = timeoutAligned(accLogInt, tempAccLog);
    highAccWriteTimeout = timeoutAligned(30000, writeHSAccelSetTimeout);
  }
  
  function updateBLEAdvert(data) {
    var unix = parseInt((new Date().getTime() / 1000).toFixed(0));
    var batt = null,
      rawTemp = null,
      temperature = null,
      heartRate = null,
      hr_loc = null,
      rawMovement = null,
      movement = null;
    if (data.length > 0) {
      var headers = ['unix', 'tz'];
      activeRecorders.forEach(recorder => headers.push.apply(headers, recorder.fields));
      const safeGet = (field) => {
        const index = headers.indexOf(field);
        return index !== -1 ? data[index] : null;
      };
      unix = data[0]; // Unix timestamp is always first
      batt = safeGet('batt_p', data, headers);
      rawTemp = safeGet('baro_temp', data, headers);
      temperature = (rawTemp != null) ? Math.round(rawTemp * 100) : null;
      heartRate = safeGet('hr', data, headers);
      hr_loc = 1;
      if (headers.includes('bt_hrm')) {
        hr_loc = 2;
        heartRate = safeGet('bt_hrm', data, headers);
      }
      rawMovement = safeGet('acc_sum', data, headers);
      movement = (rawMovement != null) ? Math.round(rawMovement * 10000) : null;
    }
    var studyid = settings.studyID || "####";
    if (studyid.length > 4) {
      studyid = studyid.substring(0, 4);
    }
    var lastNodePing = cache.lastNodePing || 0;
    var nodePing = (Math.abs(unix - lastNodePing) > 360) ? 1 : 0;
    let advert = createRandomizedPayload(studyid, batt, temperature, heartRate, hr_loc, movement, nodePing);
    modHS.log(advert);
    require("ble_advert").set(bleAdvertGen, advert);
  }

  function fallDetectFunc(acc) {
    if (!fallDetected) {
      let d = new Date().getTime();
      if (fallTime != 0) {
        modHS.log("acc", acc.mag);
      }
      if (fallTime != 0 && d - fallTime > 200) {
        fallTime = 0; fallDetected = false;
      } else if (acc.mag < 0.3 && fallTime === 0) {
        fallTime = d;
        modHS.log("FALLING", fallTime);
      } else if (acc.mag > 2.1 && d - fallTime < 200) {
        //IMPACT
        Bangle.buzz(400);
        E.showPrompt("Did you fall?", { title: "FALL DETECTION", img: atob("FBQBAfgAf+Af/4P//D+fx/n+f5/v+f//n//5//+f//n////3//5/n+P//D//wf/4B/4AH4A=") }).then((r) => {
          if (r) {
            fallDetected = true;
            modHS.saveDataToFile('alert', 'marker', { 'event': 'fall' });
            Bangle.showClock();
          } else {
            Bangle.showClock(); //no fall, so just return to clock
          }
        });
      }
    }
  }

  function storeTempLog(unix) {
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
    var storageFile = modHS.getRecordFile('gps', ["unix", "tz", 'lat', "lon", "alt", "speed", "course", "fix", "satellites"]);
    if (storageFile) {
      while (gpsLog.length > 0) { //store it
        let item = gpsLog.shift();
        storageFile.write(item.join(',') + '\n');
        cache["lastGPSSignal"] = item[0];
        queueProcess((next, cache) => {
          modHS.writeCache(cache);
          next();
        }, cache);
      }
    }
  }
  function gpsHandler() {
    if (settings.GPS) {
      function logGPS(f) {
        if (!isNaN(f.lat)) {
          const unix = parseInt((new Date().getTime() / 1000).toFixed(0));
          if (unix > lastGPSFix + 60) {
            var fields = [unix, ((new Date()).getTimezoneOffset() * -60), f.lat, f.lon, f.alt, f.speed, f.course, f.fix, f.satellites];
            gpsLog.push(fields);
            lastGPSFix = unix;
          }
        }
      }
      Bangle.on('GPS', logGPS);
      Bangle.setGPSPower(1, appName);
      var updateTime = settings.GPSInterval !== undefined ? settings.GPSInterval * 60 : 600;
      var searchTime = settings.GPSScanTime !== undefined ? settings.GPSScanTime * 60 : 60;
      var adaptiveTime = settings.GPSAdaptiveTime !== undefined ? settings.GPSAdaptiveTime * 60 : 120;
      require("gpssetup").setPowerMode({ power_mode: "PSMOO", update: updateTime, search: searchTime, adaptive: adaptiveTime, appName: appName });
    } else {
      Bangle.setGPSPower(0, appName); //just make sure its off
    }
  }

  function studyTaskCheck(timenow) {
    modHS.log("[StudyTask] Func init at " + timenow);
    let notifications = false;
    const tasks = settings.StudyTasks;
    tasks.forEach(task => {
      let key = task.id;
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
      if (task.tod !== undefined && Array.isArray(task.tod) && task.tod.includes(tod) && debounceTime) {
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
    });
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
        if (settings.StudyTasks.length > 0) {
          studyTaskCheck(unix); // This might also need to be queued if async
        }
      } catch (error) {
        modHS.log("Error in StudyTaskCheck:", error);
      } finally {
        next(); // Ensure next() is called even if an error occurs
      }
    }, unix);
  }
  function initHandler() {
    function callback() {
      init(); initHandler();
    }
    initHandlerTimeout = timeoutAligned(60000, callback);
  }

  function startRecorder() {
    settings = modHS.getSettings();
    if (initHandlerTimeout) clearTimeout(initHandlerTimeout);
    if (BTHRM_ConnectCheck) clearInterval(BTHRM_ConnectCheck);
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
    if (settings.hasOwnProperty('fallDetect') && settings.fallDetect) {
      Bangle.on('accel', fallDetectFunc);
    } else {
      Bangle.removeListener('accel', fallDetectFunc);
    }
    //BTHRM Additions
    if (settings.record.includes('bthrm') && Bangle.hasOwnProperty("isBTHRMConnected")) {
      var BTHRMStatus = 0;
      BTHRM_ConnectCheck = setInterval(function () {
        if (Bangle.isBTHRMConnected() != BTHRMStatus) {
          BTHRMStatus = Bangle.isBTHRMConnected();
          WIDGETS["heatsuite"].draw();
        }
      }, 10000); //runs every 10 seconds
    }
    updateBLEAdvert(lastBLEAdvert);
    initHandler();
    if (settings.highAcc !== undefined && settings.highAcc) {
      perSecAcc(settings.highAcc);
    }
    if(settings.swipeOpen !== undefined && settings.swipeOpen){
      Bangle.on('swipe', function(dir) {
        if (dir === 1) { // 1 = right swipe
          Bangle.buzz();
          require("widget_utils").hide();
          Bangle.load('heatsuite.app.js');
        }
      });
    }
  }

  startRecorder();

  gpsHandler();

  function writeSetTimeout() {
      if (dataLog.length > 0) {
        queueProcess((next, unix) => {
          writeLog();
          next();
        },0);
      }
      if (gpsLog.length > 0) {
        //writeGPS();
        queueProcess((next, unix) => {
          writeGPS();
          next();
        },0);
      }
    setTimeout(writeSetTimeout, 5000);
  }

  //log writer/checker
  writeSetTimeout();

  //widget stuff
  var iconWidth = 44;
  function draw() {
    g.reset();
    g.setColor(cache.taskQueue === undefined ? "#fff" : cache.taskQueue.length > 0 ? "#f00" : "#0f0");
    g.setFontAlign(0, 0);
    g.fillRect({ x: this.x, y: this.y, w: this.x + iconWidth - 1, h: this.y + 23, r: 8 });
    g.setColor(-1);
    g.setFont("Vector", 12);
    g.drawImage(atob("FBfCAP//AADk+kPKAAAoAAAAAKoAAAAAKAAAAFQoFQAAVTxVAFQVVVQVRABVABFVEBQEVQBUABUAAFUAVQCoFVVUKogAVQAiqBVVVCoAVQBVAABUABUAVRAUBFVEAFUAEVQVVVQVAFU8VQAAVCgVAAAAKAAAAACqAAAAACgAAA=="), this.x + 1, this.y + 1);
    g.setColor((Bangle.hasOwnProperty("isBTHRMConnected") && Bangle.isBTHRMConnected()) ? "#00F" : "#0f0");
    g.drawImage(atob("EhCCAAKoAqgCqqiqqCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqiqqqqqAqqqqoAKqqqgACqqqAAAqqoAAAKqgAAACqAAAAAoAAAAAoAAA=="), this.x + 22, this.y + 3);
  
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

  //Diagnosing BLUETOOTH Connection Issues
  //for managing memory issues - keeping code here for testing purposes in the future
  if (NRF.getSecurityStatus().connected) { //if widget starts while a bluetooth connection exits, force connection flag - but this is 
    //connectionLock = true;
  }
  NRF.on('error', function (msg) {
    modHS.log("[NRF][ERROR] " + msg);
  });
  NRF.on('connect', function (addr) {
    //connectionLock = true;
    modHS.log("[NRF][CONNECTED] " + JSON.stringify(addr));
  });
  NRF.on('disconnect', function (reason) {
    connectionLock = false;
    cache = modHS.getCache(); //update cache each disconnect
    if (lastBLEAdvert) {
      updateBLEAdvert(lastBLEAdvert); //update this if its changed with cache update
    }
    processNextInQueue();
    modHS.log("[NRF][DISCONNECT] " + JSON.stringify(reason));
  });
})();