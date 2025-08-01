const DB_RECORDS_PER_HR = 6;
const DB_RECORDS_PER_DAY = DB_RECORDS_PER_HR*24 + 1/*summary*/;
//const DB_RECORDS_PER_MONTH = DB_RECORDS_PER_DAY*31;
const DB_HEADER_LEN = 8;
//const DB_FILE_LEN = DB_HEADER_LEN + DB_RECORDS_PER_MONTH*DB_RECORD_LEN;

/*
HEALTH1 (4 bytes):

uint16_t steps;
uint8_t bpm;
uint8_t movement;

HEALTH2: (10 bytes):

uint16_t steps;
uint8_t bpmMin;
uint8_t bpmMax;
uint8_t movement;
uint8_t battery; // %, +charging in top bit
uint8_t temperature; // in 0.5 degree increments
uint16_t altitude; // in metres, stored unsigned 0..8191, top 3 bits = activity type
uint8_t to_be_decided;

*/

exports.ACTIVITY = ["UNKNOWN","NOT_WORN","WALKING","EXERCISE","LIGHT_SLEEP","DEEP_SLEEP"]; // activity type, stored in 3 bits

function getRecordFN(d) {
  return "health-"+d.getFullYear()+"-"+(d.getMonth()+1)+".raw";
}
function getRecordIdx(d) {
  return (DB_RECORDS_PER_DAY*(d.getDate()-1)) +
         (DB_RECORDS_PER_HR*d.getHours()) +
         (0|(d.getMinutes()*DB_RECORDS_PER_HR/60));
}

exports.getDecoder = function(fileContents) {
  var header = fileContents.substr(0,7);
  if (header=="HEALTH2") {
    return {
      r : 10, // record length
      clr : "\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF\xFF",
      decode : h => { "ram"; var d = h.charCodeAt.bind(h), v = {
          steps : (d(0)<<8) | d(1),
          bpmMin : d(2),
          bpmMax : d(3),
          movement : d(4)*8,
          battery : d(5)&127,
          isCharging : !!(d(5)&128),
          temperature : d(6)/2, // signed?
          altitude : ((d(7)&31)<<8)|d(8), // signed?
          activity : exports.ACTIVITY[d(7)>>5]
        };
        if (v.temperature>80) v.temperature-=128;
        v.bpm = (v.bpmMin+v.bpmMax)/2;
        if (v.altitude > 7500) v.altitude-=8192;
        return v;
      },
      encode : health => { "ram"; var alt=health.altitude&8191;return String.fromCharCode(
        health.steps>>8,health.steps&255, // 16 bit steps
        health.bpmMin || health.bpm, // 8 bit bpm
        health.bpmMax || health.bpm, // 8 bit bpm
        Math.min(health.movement >> 3, 255),
        E.getBattery()|(Bangle.isCharging()&&128),
        0|Math.round(health.temperature*2),
        (alt>>8)|(Math.max(0,exports.ACTIVITY.indexOf(health.activity))<<5),alt&255,
        0 // tbd
      );}
    };
  } else { // HEALTH1
    return {
      r : 4, // record length
      clr : "\xFF\xFF\xFF\xFF",
      decode : h => { "ram"; return {
        steps : (h.charCodeAt(0)<<8) | h.charCodeAt(1),
        bpm : h.charCodeAt(2),
        bpmMin : h.charCodeAt(2),
        bpmMax : h.charCodeAt(2),
        movement : h.charCodeAt(3)*8
      };},
      encode : health => { "ram"; return String.fromCharCode(
        health.steps>>8,health.steps&255, // 16 bit steps
        health.bpm, // 8 bit bpm
        Math.min(health.movement >> 3, 255));
      }
    };
  }
};

// Read all records from the given month
exports.readAllRecords = function(d, cb) {
  var fn = getRecordFN(d);
  var f = require("Storage").read(fn);
  if (f===undefined) return;
  var inf = exports.getDecoder(f), date = {}, idx = DB_HEADER_LEN;
  for (var day=0;day<31;day++) {
    date.day=day+1;
    for (var hr=0;hr<24;hr++) { // actually 25, see below
      date.hr=hr;
      for (var m=0;m<DB_RECORDS_PER_HR;m++) {
        date.min=m*10;
        var h = f.substr(idx, inf.r);
        if (h!=inf.clr) cb(Object.assign(inf.decode(h), date));
        idx += inf.r;
      }
    }
    idx += inf.r; // +1 because we have an extra record with totals for the end of the day
  }
};

// Read the entire database. There is no guarantee that the months are read in order.
exports.readFullDatabase = function(cb) {
  require("Storage").list(/health-[0-9]+-[0-9]+.raw/).forEach(val => {
    var parts = val.split('-');
    var y = parseInt(parts[1],10);
    var mo = parseInt(parts[2].replace('.raw', ''),10) - 1;
    exports.readAllRecords(new Date(y, mo, 1), (r) => {"ram";
      r.date = new Date(y, mo, r.day, r.hr, r.min);
      cb(r);
    });
  });
};

// Read all records per day, until the current time.
// There may be some records for the day of the timestamp previous to the timestamp
exports.readAllRecordsSince = function(d, cb) {
  var currentDate = new Date().getTime();
  var di = new Date(d.toISOString().substr(0,10)); // copy date (ignore time)
  while (di.getTime() <= currentDate) {
    exports.readDay(di, (r) => {"ram";
      r.date = new Date(di.getFullYear(), di.getMonth(), di.getDate(), r.hr, r.min);
      cb(r);
    });
    di.setDate(di.getDate() + 1);
  }
};

// Read daily summaries from the given month
exports.readDailySummaries = function(d, cb) {
  /*var rec =*/ getRecordIdx(d);
  var fn = getRecordFN(d);
  var f = require("Storage").read(fn);
  if (f===undefined) return;
  var inf = exports.getDecoder(f), idx = DB_HEADER_LEN + (DB_RECORDS_PER_DAY-1)*inf.r; // summary is at the end of each day
  for (var day=0;day<31;day++) {
    var h = f.substr(idx, inf.r);
    if (h!=inf.clr) cb(Object.assign(inf.decode(h), {day:day+1}));
    idx += DB_RECORDS_PER_DAY*inf.r;
  }
};

// Read all records from the given day
exports.readDay = function(d, cb) {
  /*var rec =*/ getRecordIdx(d);
  var fn = getRecordFN(d);
  var f = require("Storage").read(fn);
  if (f===undefined) return;
  var inf = exports.getDecoder(f), date = {}, idx = DB_HEADER_LEN + (inf.r*DB_RECORDS_PER_DAY*(d.getDate()-1));
  for (var hr=0;hr<24;hr++) {
    date.hr = hr;
    for (var m=0;m<DB_RECORDS_PER_HR;m++) {
      date.min = m*10;
      var h = f.substr(idx, inf.r);
      if (h!=inf.clr) cb(Object.assign(inf.decode(h), date));
      idx += inf.r;
    }
  }
};
