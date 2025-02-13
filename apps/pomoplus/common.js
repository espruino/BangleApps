const storage = require("Storage");
const heatshrink = require("heatshrink");

exports.STATE_PATH = "pomoplus.state.json";
exports.SETTINGS_PATH = "pomoplus.json";

exports.PHASE_WORKING = 0;
exports.PHASE_SHORT_BREAK = 1;
exports.PHASE_LONG_BREAK = 2;

exports.BUTTON_ICONS = {
    play: heatshrink.decompress(atob("jEYwMAkAGBnACBnwCBn+AAQPgAQPwAQP8AQP/AQXAAQPwAQP8AQP+AQgICBwQUCEAn4FggyBHAQ+CIgQ")),
    pause: heatshrink.decompress(atob("jEYwMA/4BBAX4CEA")),
    reset: heatshrink.decompress(atob("jEYwMA/4BB/+BAQPDAQPnAQIAKv///0///8j///EP//wAQQICBwQUCEhgyCHAQ+CIgI=")),
    skip: heatshrink.decompress(atob("jEYwMAwEIgHAhkA8EOgHwh8A/EPwH8h/A/0P8H/h/w/+P/H/5/8//v/3/AAoICBwQUCDQIgCEwQsCGQQ4CHwRECA"))
};

exports.settings = storage.readJSON(exports.SETTINGS_PATH);
if (!exports.settings) {
    exports.settings = {
        workTime: 1500000,                  //Work for 25 minutes
        shortBreak: 300000,                 //5 minute short break
        longBreak: 900000,                  //15 minute long break
        numShortBreaks: 3,                  //3 short breaks for every long break
        pausedTimerExpireTime: 21600000,    //If the timer was left paused for >6 hours, reset it on next launch
        widget: false                       //If a widget is added in the future, whether the user wants it
    };
}

//Store the minimal amount of information to be able to reconstruct the state of the timer at any given time.
//This is necessary because it is necessary to write to flash to let the timer run in the background, so minimizing the writes is necessary.
exports.STATE_DEFAULT = {
    wasRunning: false,              //If the timer ever was running. Used to determine whether to display a reset button
    running: false,                 //Whether the timer is currently running
    startTime: 0,                   //When the timer was last started. Difference between this and now is how long timer has run continuously.
    pausedTime: 0,                  //When the timer was last paused. Used for expiration and displaying timer while paused.
    elapsedTime: 0,                 //How much time the timer had spent running before the current start time. Update on pause or user skipping stages.
    phase: exports.PHASE_WORKING,   //What phase the timer is currently in
    numShortBreaks: 0               //Number of short breaks that have occured so far
};
exports.state = storage.readJSON(exports.STATE_PATH);
if (!exports.state) {
    exports.state = exports.STATE_DEFAULT;
}

//Get the number of milliseconds until the next phase change
exports.getTimeLeft = function () {
    if (!exports.state.wasRunning) {
        //If the timer never ran, the time left is just the amount of work time.
        return exports.settings.workTime;
    } else if (exports.state.running) {
        //If the timer is running, the time left is current time - start time + preexisting time
        var runningTime = (new Date()).getTime() - exports.state.startTime + exports.state.elapsedTime;
    } else {
        //If the timer is not running, the same as above but use when the timer was paused instead of now.
        var runningTime = exports.state.pausedTime - exports.state.startTime + exports.state.elapsedTime;
    }

    if (exports.state.phase == exports.PHASE_WORKING) {
        return exports.settings.workTime - runningTime;
    } else if (exports.state.phase == exports.PHASE_SHORT_BREAK) {
        return exports.settings.shortBreak - runningTime;
    } else {
        return exports.settings.longBreak - runningTime;
    }
}

//Get the next phase to change to
exports.getNextPhase = function () {
    if (exports.state.phase == exports.PHASE_WORKING) {
        if (exports.state.numShortBreaks < exports.settings.numShortBreaks) {
            return exports.PHASE_SHORT_BREAK;
        } else {
            return exports.PHASE_LONG_BREAK;
        }
    } else {
        return exports.PHASE_WORKING;
    }
}

//Change to the next phase and update numShortBreaks, and optionally vibrate. DOES NOT WRITE STATE CHANGE TO STORAGE!
exports.nextPhase = function (vibrate) {
    a = {
        startTime: 0,                   //When the timer was last started. Difference between this and now is how long timer has run continuously.
        pausedTime: 0,                  //When the timer was last paused. Used for expiration and displaying timer while paused.
        elapsedTime: 0,                 //How much time the timer had spent running before the current start time. Update on pause or user skipping stages.
        phase: exports.PHASE_WORKING,   //What phase the timer is currently in
        numShortBreaks: 0               //Number of short breaks that have occured so far
    }
    let now = (new Date()).getTime();
    exports.state.startTime = now;  //The timer is being reset, so say it starts now.
    exports.state.pausedTime = now; //This prevents a paused timer from having the start time moved to the future and therefore having been run for negative time.
    exports.state.elapsedTime = 0;  //Because we are resetting the timer, we no longer need to care about whether it was paused previously.

    let oldPhase = exports.state.phase; //Cache the old phase because we need to remember it when counting the number of short breaks
    exports.state.phase = exports.getNextPhase();

    if (oldPhase == exports.PHASE_SHORT_BREAK) {
        //If we just left a short break, increase the number of short breaks
        exports.state.numShortBreaks++;
    } else if (oldPhase == exports.PHASE_LONG_BREAK) {
        //If we just left a long break, set the number of short breaks to zero
        exports.state.numShortBreaks = 0;
    }

    if (vibrate) {
        if (exports.state.phase == exports.PHASE_WORKING) {
            Bangle.buzz(800, 1);
        } else if (exports.state.phase == exports.PHASE_SHORT_BREAK) {
            Bangle.buzz();
            setTimeout(Bangle.buzz, 400);
        } else {
            Bangle.buzz();
            setTimeout(Bangle.buzz, 400, 400);
        }
    }
}
