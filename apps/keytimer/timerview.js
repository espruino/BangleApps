const heatshrink = require("heatshrink");
const BUTTON_ICONS = {
    play: heatshrink.decompress(atob("jEYwMAkAGBnACBnwCBn+AAQPgAQPwAQP8AQP/AQXAAQPwAQP8AQP+AQgICBwQUCEAn4FggyBHAQ+CIgQ")),
    pause: heatshrink.decompress(atob("jEYwMA/4BBAX4CEA")),
    reset: heatshrink.decompress(atob("jEYwMA/4BB/+BAQPDAQPnAQIAKv///0///8j///EP//wAQQICBwQUCEhgyCHAQ+CIgI="))
};

let common;

let s = require("Storage").readJSON("setting.json");

function drawButtons() {
    //Draw the backdrop
    const BAR_TOP = g.getHeight() - 24;
    g.setBgColor(s.theme.bg2).setColor(s.theme.fg2).setFontAlign(0, -1)
        .clearRect(0, BAR_TOP, g.getWidth(), g.getHeight())
        .setColor(s.theme.fg2)
        .drawLine(g.getWidth() / 2, BAR_TOP, g.getWidth() / 2, g.getHeight())

        //Draw the buttons
        .setColor(s.theme.fg2)
        .drawImage(BUTTON_ICONS.reset, g.getWidth() / 4, BAR_TOP + 12, {rotate:0}); // rotate option centers the image
    if (common.running()) {
        g.setColor(s.theme.fg2)
        .drawImage(BUTTON_ICONS.pause, g.getWidth() * 3 / 4, BAR_TOP + 12, {rotate:0});
    } else {
        g.setColor(s.theme.fg2)
        .drawImage(BUTTON_ICONS.play, g.getWidth() * 3 / 4, BAR_TOP + 12, {rotate:0});
    }
}

function drawTimer() {
    let timeLeft = common.getTimeLeft();
    g.reset()
        .setFontAlign(0, 0)
        .setFont("Vector", 36)
        .clearRect(0, 24, 176, 152)

        //Draw the timer
        .drawString((() => {
            let hours = timeLeft / 3600000;
            let minutes = (timeLeft % 3600000) / 60000;
            let seconds = (timeLeft % 60000) / 1000;

            function pad(number) {
                return ('00' + parseInt(number)).slice(-2);
            }

            if (hours >= 1) return `${parseInt(hours)}:${pad(minutes)}:${pad(seconds)}`;
            else return `${parseInt(minutes)}:${pad(seconds)}`;
        })(), g.getWidth() / 2, g.getHeight() / 2)
}

let timerInterval;

function setupTimerInterval() {
    if (timerInterval !== undefined) {
        clearInterval(timerInterval);
    }
    setTimeout(() => {
        timerInterval = setInterval(drawTimer, 1000);
        drawTimer();
    }, common.getTimeLeft() % 1000);
}

exports.show = function (callerCommon) {
    common = callerCommon;
    drawButtons();
    drawTimer();
    if (common.running()) {
        setupTimerInterval();
    }
}

function clearTimerInterval() {
    if (timerInterval !== undefined) {
        clearInterval(timerInterval);
        timerInterval = undefined;
    }
}

exports.touch = (button, xy) => {
    if (xy !== undefined && xy.y < 152) return;

    if (button == 1) {
        //Reset the timer
        common.deleteTimer();
        clearTimerInterval();
        require('keytimer-keys.js').show(common);
    } else {
        if (common.running()) {
            common.pauseTimer();
            clearTimerInterval();
        } else {
            common.startTimer(common.getTimeLeft());
            setupTimerInterval();
        }
        drawTimer();
        drawButtons();
    }
};