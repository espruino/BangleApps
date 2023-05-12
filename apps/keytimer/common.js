const sched = require('sched');
const storage = require('Storage');

exports.running = function () {
    return sched.getAlarm('keytimer') != undefined;
};

exports.timerExists = function () {
    return exports.running() || (exports.state.timeLeft != 0);
}

//Get the number of milliseconds until the timer expires
exports.getTimeLeft = function () {
    if (exports.running()) {
        return sched.getTimeToAlarm(sched.getAlarm('keytimer'));
    } else {
        return exports.state.timeLeft;
    }
}

exports.state = storage.readJSON('keytimer.json') || {
    inputString: '0',
    timeLeft: 0
};

exports.startTimer = function (time) {
    let timer = sched.newDefaultTimer();

    timer.timer = time;
    common.state.timeLeft = time;
    timer.del = true;
    timer.appid = 'keytimer';
    timer.js = "load('keytimer-ring.js')";

    sched.setAlarm('keytimer', timer);
    sched.reload();
}

exports.pauseTimer = function () {
    exports.state.timeLeft = exports.getTimeLeft();
    sched.setAlarm('keytimer');
    sched.reload();
}

exports.deleteTimer = function () {
    sched.setAlarm('keytimer');
    exports.state.timeLeft = 0;
    sched.reload();
}