let common;

function drawButtons() {
    //Draw the backdrop
    const BAR_TOP = g.getHeight() - 24;
    g.setColor(0, 0, 1).setFontAlign(0, -1)
        .clearRect(0, BAR_TOP, g.getWidth(), g.getHeight())
        .fillRect(0, BAR_TOP, g.getWidth(), g.getHeight())
        .setColor(1, 1, 1)
        .drawLine(g.getWidth() / 2, BAR_TOP, g.getWidth() / 2, g.getHeight())

        //Draw the buttons
        .drawImage(common.BUTTON_ICONS.reset, g.getWidth() / 4, BAR_TOP);
    if (common.state.running) {
        g.drawImage(common.BUTTON_ICONS.pause, g.getWidth() * 3 / 4, BAR_TOP);
    } else {
        g.drawImage(common.BUTTON_ICONS.play, g.getWidth() * 3 / 4, BAR_TOP);
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

    if (timeLeft <= 0) load('keytimer-ring.js');
}

let timerInterval;

function setupTimerInterval() {
    if (timerInterval !== undefined) {
        clearInterval(timerInterval);
    }
    setTimeout(() => {
        timerInterval = setInterval(drawTimer, 1000);
        drawTimer();
    }, common.timeLeft % 1000);
}

exports.show = function (callerCommon) {
    common = callerCommon;
    drawButtons();
    drawTimer();
    if (common.state.running) {
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
    if (xy.y < 152) return;

    if (button == 1) {
        //Reset the timer
        let setTime = common.state.setTime;
        let inputString = common.state.inputString;
        common.state = common.STATE_DEFAULT;
        common.state.setTime = setTime;
        common.state.inputString = inputString;
        clearTimerInterval();
        require('keytimer-keys.js').show(common);
    } else {
        if (common.state.running) {
            //Record the exact moment that we paused
            let now = (new Date()).getTime();
            common.state.pausedTime = now;

            //Stop the timer
            common.state.running = false;
            clearTimerInterval();
            drawTimer();
            drawButtons();
        } else {
            //Start the timer and record when we started
            let now = (new Date()).getTime();
            common.state.elapsedTime += common.state.pausedTime - common.state.startTime;
            common.state.startTime = now;
            common.state.running = true;
            drawTimer();
            setupTimerInterval();
            drawButtons();
        }
    }
};