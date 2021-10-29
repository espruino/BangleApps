Bangle.on("health", health => {
  // ensure we write health info for *last* block
  var d = new Date(Date.now() - 590000);

  const DB_RECORD_LEN = 4;
  const DB_RECORDS_PER_HR = 6;
  const DB_RECORDS_PER_DAY = DB_RECORDS_PER_HR*24 + 1/*summary*/;
  const DB_RECORDS_PER_MONTH = DB_RECORDS_PER_DAY*31;
  const DB_HEADER_LEN = 8;
  const DB_FILE_LEN = DB_HEADER_LEN + DB_RECORDS_PER_MONTH*DB_RECORD_LEN;

  function getRecordFN(d) {
    return "health-"+d.getFullYear()+"-"+d.getMonth()+".raw";
  }
  function getRecordIdx(d) {
    return (DB_RECORDS_PER_DAY*(d.getDate()-1)) +
           (DB_RECORDS_PER_HR*d.getHours()) +
           (0|(d.getMinutes()*DB_RECORDS_PER_HR/60));
  }
  function getRecordData(health) {
    return String.fromCharCode(
      health.steps>>8,health.steps&255, // 16 bit steps
      health.bpm, // 8 bit bpm
      Math.min(health.movement / 8, 255)); // movement
  }

  var rec = getRecordIdx(d);
  var fn = getRecordFN(d);
  var f = require("Storage").read(fn);
  if (f) {
    var dt = f.substr(DB_HEADER_LEN+(rec*DB_RECORD_LEN), DB_RECORD_LEN);
    if (dt!="\xFF\xFF\xFF\xFF") {
      print("HEALTH ERR: Already written!");
      return;
    }
  } else {
    require("Storage").write(fn, "HEALTH1\0", 0, DB_FILE_LEN); // header
  }
  var recordPos = DB_HEADER_LEN+(rec*DB_RECORD_LEN);
  require("Storage").write(fn, getRecordData(health), recordPos, DB_FILE_LEN);
  if (rec%DB_RECORDS_PER_DAY != DB_RECORDS_PER_DAY-1) return;
  // we're at the end of the day. Read in all of the data for the day and sum it up
  var sumPos = recordPos + DB_RECORD_LEN; // record after the current one is the sum
  if (f.substr(sumPos, DB_RECORD_LEN)!="\xFF\xFF\xFF\xFF") {
    print("HEALTH ERR: Daily summary already written!");
    return;
  }
  health = { steps:0, bpm:0, movement:0, records:0};
  var records = DB_RECORDS_PER_HR*24;
  for (var i=0;i<records;i++) {
    var dt = f.substr(recordPos, DB_RECORD_LEN);
    if (dt!="\xFF\xFF\xFF\xFF") {
      health.records++;
      health.steps += (dt.charCodeAt(1)<<8)+dt.charCodeAt(1);
      health.bpm += dt.charCodeAt(2);
      health.movement += dt.charCodeAt(2);
    }
    recordPos -= DB_RECORD_LEN;
  }
  if (health.records) {
    health.bpm /= health.records;
    health.movement /= health.records;
  }
  require("Storage").write(fn, getRecordData(health), sumPos, DB_FILE_LEN);
});
