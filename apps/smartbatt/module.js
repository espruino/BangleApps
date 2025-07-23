{
  var filename = "smartbattdata.json";
  var interval;
  var storage=require("Storage");

  var logFile = "smartbattlog.json";
  var doLogging=true;
  function logBatterySample(entry) {
    let log = storage.readJSON(logFile, 1) || [];

    // Keep it from growing forever (optional: only keep last 100 entries)
    if (log.length > 100) log.shift();

    log.push(entry);
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
      if(Math.abs(battChange)<5){
        //less than 6% difference, average percents
        var newBatt=(batt+data.battLastRecorded)/2;
        data.battLastRecorded = newBatt;
      }else{
        //probably charged, ignore average
        data.battLastRecorded = batt;
      }
      
      storage.writeJSON(filename, data);
    } else if (deltaHours <= 0 || !isFinite(deltaHours)) {
      reason = "Skipped: invalid time delta";
      data.timeLastRecorded = now;
      data.battLastRecorded = batt;
      storage.writeJSON(filename, data);
    } else {

      let currentDrainage = battChange / deltaHours;
      // Calculate new average
      let alpha = 0.3; // how "fast" to react (0.1 = slow, 0.5 = fast)

      // Weight alpha by how much time the new reading represents
      let weight = deltaHours / (deltaHours + 1);
      let effectiveAlpha = alpha * weight;
      data.avgBattDrainage = (effectiveAlpha * currentDrainage) + (1 - effectiveAlpha) * data.avgBattDrainage;
      data.timeLastRecorded = now;
      data.totalCycles += 1;
      data.totalHours+=deltaHours;
      data.battLastRecorded = batt;
      storage.writeJSON(filename, data);

      reason = "Drainage recorded: " + currentDrainage.toFixed(3) + "%/hr";
    }
    if(doLogging){
      // Always log the sample
      logBatterySample({
        time: now,
        battNow: batt,
        battLast: data.battLastRecorded,
        battChange: battChange,
        deltaHours: deltaHours,
        avgDrainage: data.avgBattDrainage,
        reason: reason
      });
    }
  }



  function getData() {
    return storage.readJSON(filename, 1) || {
      avgBattDrainage: 0,
      battLastRecorded: E.getBattery(),
      timeLastRecorded: Date.now(),
      totalCycles: 0,
      totalHours:0
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
    };
  }
  
  function deleteData(){
    storage.erase(filename);
  };
  // Expose public API
  exports.record = recordBattery;
  exports.deleteData = deleteData;
  exports.get = estimateBatteryLife;
  exports.changeInterval = function(newInterval) {
    clearInterval(interval);
    interval=setInterval(recordBattery, newInterval);
  };
  // Start recording every 5 minutes
  interval=setInterval(recordBattery, 600000);
  recordBattery(); // Log immediately
}
