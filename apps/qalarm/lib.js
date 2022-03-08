Bangle.loadWidgets();

let alarms = require("Storage").readJSON("qalarm.json", 1) || [];

/**
 * LIBRARY
 */

function getCurrentTime() {
    let time = new Date();
    return (
        time.getHours() * 3600000 +
        time.getMinutes() * 60000 +
        time.getSeconds() * 1000
    );
}

function alarmExists(alarmIndex){
    var exists = alarmIndex >= 0 && alarmIndex < alarms.length;
    return exists;
}

function isAlarmStarted(alarmIndex){
    if(!alarmExists(alarmIndex)){
        return false;
    }

    let time = new Date();
    let t = getCurrentTime();
    a = alarms[alarmIndex];
    return a.on &&
        t <= a.t &&
        a.last != time.getDate() &&
        (a.timer || a.daysOfWeek[time.getDay()]);
}

function getTimerMin(alarmIndex){
    if(!isAlarmStarted(alarmIndex)){
        return 0;
    }

    let a = alarms[alarmIndex] ;
    let diff = a.t - getCurrentTime();
    // let hrs = Math.floor(t / 3600000);
    let mins = Math.round((diff / 60000) % 60);
    // return hrs + ":" + ("0" + mins).substr(-2);
    return mins;
}

function _reload(){
    require("Storage").write("qalarm.json", JSON.stringify(alarms));
    eval(require("Storage").read("qalarmcheck.js"));
    if (WIDGETS["qalarm"]) WIDGETS["qalarm"].reload();
}

function editTimer(alarmIndex, hrs, mins, secs){
    var a = {
      on: true,
      rp: false,
      as: false,
      hard: false,
    };
    a.timer = hrs * 3600 + mins * 60 + secs;
    a.t = (getCurrentTime() + a.timer * 1000) % 86400000;

    if(alarmExists(a)){
        alarms[alarmIndex] = a;
    } else {
        alarms.push(a)
        alarmIndex = alarms.length-1;
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
exports.deleteAlarm = deleteAlarm;

exports.timerExists = alarmExists;
exports.isTimerStarted = isAlarmStarted;
exports.getTimerMin = getTimerMin;
exports.editTimer = editTimer;
exports.deleteTimer = deleteAlarm;
