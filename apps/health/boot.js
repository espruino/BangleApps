{ // Handle turning HRM on/off at the right times
  let settings = require("Storage").readJSON("health.json", 1) || {};
  let hrm = 0|settings.hrm;
  if (hrm == 1 || hrm == 2) { // 1=every 3 minutes, 2=every 10 minutes
    let onHealth = function(h) {
      function startMeasurement() {
        // if is charging, or hardly moved and face up/down, don't start HRM
        if (Bangle.isCharging() ||
            (Bangle.getHealthStatus("last").movement<100 && Math.abs(Bangle.getAccel().z)>0.99)) return;
        // otherwise turn HRM on
        Bangle.setHRMPower(1, "health");
        setTimeout(() => {
          Bangle.setHRMPower(0, "health");
        }, hrm * 60000); // give it 1 minute detection time for 3 min setting and 2 minutes for 10 min setting
      }
      startMeasurement();
      if (hrm == 1) { // 3 minutes
        setTimeout(startMeasurement, 200000);
        setTimeout(startMeasurement, 400000);
      }
    }
    Bangle.on("health", onHealth);
    Bangle.on("HRM", (h) => {
      // as soon as we have a decent HRM reading, turn it off
      if (h.confidence > 90 && Math.abs(Bangle.getHealthStatus().bpm - h.bpm) < 1) Bangle.setHRMPower(0, "health");
    });
    if (Bangle.getHealthStatus().bpmConfidence < 90) onHealth(); // if we didn't have a good HRM confidence already, start HRM now
  } else Bangle.setHRMPower(!!hrm, "health"); // if HRM>2, keep it on permanently
}
Bangle.on("health", health => {
  (Bangle.getPressure?Bangle.getPressure():Promise.resolve({})).then(pressure => {
  Object.assign(health, pressure); // add temperature/pressure/altitude
  // ensure we write health info for *last* block
  var d = new Date(Date.now() - 590000);

  const DB_RECORDS_PER_HR = 6;
  const DB_RECORDS_PER_DAY = DB_RECORDS_PER_HR*24 + 1/*summary*/;
  const DB_RECORDS_PER_MONTH = DB_RECORDS_PER_DAY*31;
  const DB_HEADER_LEN = 8;

  if (health && health.steps > 0) { // Show step goal notification
    var settings = require("Storage").readJSON("health.json",1)||{};
    const steps = Bangle.getHealthStatus("day").steps;
    if (settings.stepGoalNotification && settings.stepGoal > 0 && steps >= settings.stepGoal) {
      const now = new Date(Date.now()).toISOString().split('T')[0]; // yyyy-mm-dd
      if (!settings.stepGoalNotificationDate || settings.stepGoalNotificationDate < now) { // notification not yet shown today?
        Bangle.buzz(200, 0.5);
        require("notify").show({
            title : settings.stepGoal + /*LANG*/ " steps",
            body : /*LANG*/ "You reached your step goal!",
            icon : atob("DAyBABmD6BaBMAsA8BCBCBCBCA8AAA==")
        });
        settings.stepGoalNotificationDate = now;
        require("Storage").writeJSON("health.json", settings);
      }
    }
  }

  function getRecordFN(d) {
    return "health-"+d.getFullYear()+"-"+(d.getMonth()+1)+".raw";
  }
  function getRecordIdx(d) {
    return (DB_RECORDS_PER_DAY*(d.getDate()-1)) +
           (DB_RECORDS_PER_HR*d.getHours()) +
           (0|(d.getMinutes()*DB_RECORDS_PER_HR/60));
  }

  var rec = getRecordIdx(d);
  var fn = getRecordFN(d);
  var inf, f = require("Storage").read(fn);

  if (f!==undefined) {
    inf = require("health").getDecoder(f);
    var dt = f.substr(DB_HEADER_LEN+(rec*inf.r), inf.r);
    if (dt!=inf.clr) {
      print("HEALTH ERR: Already written!");
      return;
    }
  } else {
    inf = require("health").getDecoder("HEALTH2");
    require("Storage").write(fn, "HEALTH2\0", 0, DB_HEADER_LEN + DB_RECORDS_PER_MONTH*inf.r); // header (and allocate full new file)
  }
  var recordPos = DB_HEADER_LEN+(rec*inf.r);
  require("Storage").write(fn, inf.encode(health), recordPos);
  if (rec%DB_RECORDS_PER_DAY != DB_RECORDS_PER_DAY-2) return;
  // we're at the end of the day. Read in all of the data for the day and sum it up
  var sumPos = recordPos + inf.r; // record after the current one is the sum
  if (f.substr(sumPos, inf.r)!=inf.clr) {
    print("HEALTH ERR: Daily summary already written!");
    return;
  }
  health = { steps:0, bpm:0, movement:0, movCnt:0, bpmCnt:0};
  var records = DB_RECORDS_PER_HR*24;
  for (var i=0;i<records;i++) {
    var dt = f.substr(recordPos, inf.r);
    if (dt!=inf.clr) {
      var h = inf.decode(dt);
      health.steps += h.steps
      health.bpm += h.bpm;
      health.movement += h.movement;
      health.movCnt++;
      if (h.bpm) health.bpmCnt++;
    }
    recordPos -= inf.r;
  }
  if (health.bpmCnt)
    health.bpm /= health.bpmCnt;
  if (health.movCnt)
    health.movement /= health.movCnt;
  require("Storage").write(fn, inf.encode(health), sumPos);
})});
