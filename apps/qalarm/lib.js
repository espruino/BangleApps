Bangle.loadWidgets();

let alarms = require("Storage").readJSON("qalarm.json", 1) || [];

/**
 * LIBRARY
 */
function alarmExists(alarmIndex){
    return alarmIndex > 0 && alarmIndex < alarms.length;
}

function isAlarmStarted(alarmIndex){
    if(!alarmExists(alarmIndex)){
        return false;
    }

    let time = new Date();
    let t = getCurrentTime();
    a = alarms[alarmIndex];
    return a.on &&
        a.t <= t &&
        a.last != time.getDate() &&
        (a.timer || a.daysOfWeek[time.getDay()]);
}

function getAlarmMin(alarmIndex){
    if(!isAlarmStarted(alarmIndex)){
        return 0;
    }

    let t = getCurrentTime();
    let a = alarms[alarmIndex] ;
    return a.t - t * 60;
  }

function _reload(){
    require("Storage").write("qalarm.json", JSON.stringify(alarms));
    eval(require("Storage").read("qalarmcheck.js"));
    if (WIDGETS["qalarm"]) WIDGETS["qalarm"].reload();
}

function editTimer(alarmIndex, hrs, mins, secs){
    var a = {
      timer: 300,
      on: true,
      rp: false,
      as: false,
      hard: false,
    };
    a.timer = hrs * 3600 + mins * 60 + secs;
    a.t = (getCurrentTime() + alarm.timer * 1000) % 86400000;

    if(alarmExists(a)){
        alarms[alarmIndex] = a;
    } else {
        alarmIndex = alarms.length;
        alarms.push(a)
    }

    _reload();
    return alarmIndex;
}


function deleteAlarm(alarmIndex){
    if(!alarmExists(alarmIndex)){
        return;
    }

    alarms.splice(alarmIndex, 1);

    _reload();
}


// Export functions
exports.alarmExists = alarmExists;
exports.isAlarmStarted = isAlarmStarted;
exports.getAlarmMin = getAlarmMin;
exports.editTimer = editTimer;
exports.deleteAlarm = deleteAlarm;