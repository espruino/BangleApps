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

function getAlarmIndex(idx){
    for(var i=0; i<alarms.length; i++){
        if(alarms[i].idx == idx){
            return i;
        }
    }
    return -1;
}

function alarmExists(idx){
    var alarmIndex = getAlarmIndex(idx);
    var exists = alarmIndex >= 0 && alarmIndex < alarms.length;
    return exists;
}

function isAlarmStarted(idx){
    if(!alarmExists(idx)){
        return false;
    }

    var alarmIndex = getAlarmIndex(idx);
    var time = new Date();
    var t = getCurrentTime();
    a = alarms[alarmIndex];
    return a.on &&
        t <= a.t &&
        a.last != time.getDate() &&
        (a.timer || a.daysOfWeek[time.getDay()]);
}

function getTimerMin(idx){
    if(!isAlarmStarted(idx)){
        return 0;
    }

    var alarmIndex = getAlarmIndex(idx);
    var a = alarms[alarmIndex] ;
    var diff = a.t - getCurrentTime();
    // let hrs = Math.floor(t / 3600000);
    var mins = Math.round((diff / 60000) % 60);
    // return hrs + ":" + ("0" + mins).substr(-2);
    return mins;
}

function reloadQalarm(){
    require("Storage").write("qalarm.json", JSON.stringify(alarms));
    eval(require("Storage").read("qalarmcheck.js"));
    if (WIDGETS["qalarm"]) WIDGETS["qalarm"].reload();
}

function editTimer(idx, hrs, mins, secs){
    var alarmIndex = getAlarmIndex(idx);
    var a = {
        idx: idx,
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

    reloadQalarm();
}

function deleteAlarm(idx){
    var alarmIndex = getAlarmIndex(idx);
    if(!alarmExists(idx)){
        return;
    }

    alarms.splice(alarmIndex, 1);
    reloadQalarm();
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
