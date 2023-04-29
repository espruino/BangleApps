const storage = require("Storage");
const heatshrink = require("heatshrink");

exports.STATE_PATH = "keytimer.state.json";

exports.BUTTON_ICONS = {
    play: heatshrink.decompress(atob("jEYwMAkAGBnACBnwCBn+AAQPgAQPwAQP8AQP/AQXAAQPwAQP8AQP+AQgICBwQUCEAn4FggyBHAQ+CIgQ")),
    pause: heatshrink.decompress(atob("jEYwMA/4BBAX4CEA")),
    reset: heatshrink.decompress(atob("jEYwMA/4BB/+BAQPDAQPnAQIAKv///0///8j///EP//wAQQICBwQUCEhgyCHAQ+CIgI="))
};

//Store the minimal amount of information to be able to reconstruct the state of the timer at any given time.
//This is necessary because it is necessary to write to flash to let the timer run in the background, so minimizing the writes is necessary.
exports.STATE_DEFAULT = {
    wasRunning: false,              //If the timer ever was running. Used to determine whether to display a reset button
    running: false,                 //Whether the timer is currently running
    startTime: 0,                   //When the timer was last started. Difference between this and now is how long timer has run continuously.
    pausedTime: 0,                  //When the timer was last paused. Used for expiration and displaying timer while paused.
    elapsedTime: 0,                 //How much time the timer had spent running before the current start time. Update on pause or user skipping stages.
    setTime: 0,                     //How long the user wants the timer to run for
    inputString: '0'                //The string of numbers the user typed in.
};
exports.state = storage.readJSON(exports.STATE_PATH);
if (!exports.state) {
    exports.state = exports.STATE_DEFAULT;
}

//Get the number of milliseconds until the timer expires
exports.getTimeLeft = function () {
    if (!exports.state.wasRunning) {
        //If the timer never ran, the time left is just the set time
        return exports.setTime
    } else if (exports.state.running) {
        //If the timer is running, the time left is current time - start time + preexisting time
        var runningTime = (new Date()).getTime() - exports.state.startTime + exports.state.elapsedTime;
    } else {
        //If the timer is not running, the same as above but use when the timer was paused instead of now.
        var runningTime = exports.state.pausedTime - exports.state.startTime + exports.state.elapsedTime;
    }

    return exports.state.setTime - runningTime;
}