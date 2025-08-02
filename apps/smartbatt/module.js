{
  var dataFile = "smartbattdata.json";
  var interval;
  var storage = require("Storage");


  var logFile = "smartbattlog.json";

  function getSettings() {
    return Object.assign({
      //Record Interval stored in ms
      doLogging: false
    }, require('Storage').readJSON("smartbatt.settings.json", true) || {});
  }

  function logBatterySample(entry) {
    let log = storage.readJSON(logFile, 1) || [];
    //get human-readable time
    let d = new Date();
    entry.time = d.getFullYear() + "-" +
      ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
      ("0" + d.getDate()).slice(-2) + " " +
      ("0" + d.getHours()).slice(-2) + ":" +
      ("0" + d.getMinutes()).slice(-2) + ":" +
      ("0" + d.getSeconds()).slice(-2);

    log.push(entry);
    if (log.length > 100) log = log.slice(-100);

    storage.writeJSON(logFile, log);
  }


  // Record current battery reading into current average
  function recordBattery() {
    let now = Date.now();
    let data = getData();
    let batt = E.getBattery();
    let battChange = data.battLastRecorded - batt;
    let deltaHours = (now - data.timeLastRecorded) / (1000 * 60 * 60);
    // Default reason (in case we skip)
    let reason = "Recorded";


    if (battChange <= 0) {
      reason = "Skipped: battery fluctuated or no change";
      if (Math.abs(battChange) < 5) {
        //less than 6% difference, average percents
        var newBatt = (batt + data.battLastRecorded) / 2;
        data.battLastRecorded = newBatt;
      } else {
        //probably charged, ignore average
        data.battLastRecorded = batt;
      }

      storage.writeJSON(dataFile, data);
    } else if (deltaHours <= 0 || !isFinite(deltaHours)) {
      reason = "Skipped: invalid time delta";
      data.timeLastRecorded = now;
      data.battLastRecorded = batt;
      storage.writeJSON(dataFile, data);
    } else {
      let weightCoefficient = 1;
      let currentDrainage = battChange / deltaHours;
      let newAvg = weightedAverage(data.avgBattDrainage, data.totalHours, currentDrainage, deltaHours * weightCoefficient);
      data.avgBattDrainage = newAvg;
      data.timeLastRecorded = now;
      data.totalCycles += 1;
      data.totalHours += deltaHours;
      data.battLastRecorded = batt;
      storage.writeJSON(dataFile, data);

      reason = "Drainage recorded: " + currentDrainage.toFixed(3) + "%/hr";
    }
    if (getSettings().doLogging) {
      // Always log the sample
      logBatterySample({
        battNow: batt,
        battLast: data.battLastRecorded,
        battChange: battChange,
        deltaHours: deltaHours,
        timeLastRecorded: data.timeLastRecorded,
        avgDrainage: data.avgBattDrainage,
        reason: reason
      });
    }
  }

  function weightedAverage(oldValue, oldWeight, newValue, newWeight) {
    return (oldValue * oldWeight + newValue * newWeight) / (oldWeight + newWeight);
  }



  function getData() {
    return storage.readJSON(dataFile, 1) || {
      avgBattDrainage: 0,
      battLastRecorded: E.getBattery(),
      timeLastRecorded: Date.now(),
      totalCycles: 0,
      totalHours: 0,
    };
  }



  // Estimate hours remaining
  function estimateBatteryLife() {
    let data = getData();
    var batt = E.getBattery();
    var hrsLeft = Math.abs(batt / data.avgBattDrainage);
    return {
      batt: batt,
      hrsLeft: hrsLeft,
      avgDrainage:data.avgBattDrainage,
      totalHours:data.totalHours,
      cycles:data.totalCycles
    };
  }

  function deleteData() {
    storage.erase(dataFile);
    storage.erase(logFile);
  }
  // Expose public API
  exports.record = recordBattery;
  exports.deleteData = deleteData;
  exports.get = estimateBatteryLife;
  exports.changeInterval = function (newInterval) {
    clearInterval(interval);
    interval = setInterval(recordBattery, newInterval);
  };
  // Start recording every 5 minutes
  interval = setInterval(recordBattery, 600000);
  recordBattery(); // Log immediately
}
