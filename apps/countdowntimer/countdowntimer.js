const heatshrinkDecompress = require("heatshrink").decompress;

const playIcon = heatshrinkDecompress(atob("jEYwhC/gFwBZV3BhV3u4LLBhILCEpALCBhALDu9gBaojKHZZrVQZSbLAG4A="));
const pauseIcon = heatshrinkDecompress(atob("jEYwhC/xGIAYoL/Bf4LfAHA="));
const resetIcon = heatshrinkDecompress(atob("jEYwg30h3u93gAgIKHBgXuBYgIBoEEBoQWFAgQMCBYgrBE4giEBYYjGAgY+DBY4AHBZlABZQ7DLIpTFAo5ZJLYYDFTZKzLAGQA=="));
const closeIcon = heatshrinkDecompress(atob("jEYwhC/4AEDhgKEhnMAofMCIgGECAoHFCwwIDCw4YDCxAYCCxALMEZY7KKZZrKQZibKAHIA="));

const timerState = {
    IDLE: 0,
    RUNNING: 1
};

let currentState = timerState.IDLE;
let remainingSeconds = 0;
let countdownInterval = null;
let increasingInterval = null;
let decreasingInterval = null;
let isDecreasingRemainingSeconds = false;
let isIncreasingRemainingSeconds = false;

function main() {
    g.clear();
    g.setFont("Vector", 40);
    g.setFontAlign(0, 0);

    registerInputHandlers();

    draw();
}

function registerInputHandlers() {
    setWatch(onPrimaryButtonPressed, BTN1, { repeat: true });
    setWatch(onResetButtonPressed, BTN2, { repeat: true });
    setWatch(onExitButtonPressed, BTN3, { repeat: true });
    setWatch(onDecreaseRemainingSecondsPressed, BTN4, { repeat: true, edge: "rising" });
    setWatch(onIncreaseRemainingSecondsPressed, BTN5, { repeat: true, edge: "rising" });
    setWatch(onDecreaseRemainingSecondsReleased, BTN4, { repeat: true, edge: "falling" });
    setWatch(onIncreaseRemainingSecondsReleased, BTN5, { repeat: true, edge: "falling" });
}

function draw() {
    g.clearRect(200, 0, 240, 240);
    g.clearRect(0, 0, 240, 80);

    drawRemainingSecondsPanel();

    g.drawImage(resetIcon, 216, 108);
    g.drawImage(closeIcon, 216, 188);

    if (currentState == timerState.IDLE) {
        g.drawImage(playIcon, 216, 28);
    } else {
        g.drawImage(pauseIcon, 216, 28);
    }

    g.flip();
}

function drawRemainingSecondsPanel() {
    g.clearRect(0, 100, 200, 140);
    g.drawString(formatRemainingSeconds(), 105, 120);

    if (currentState == timerState.IDLE) {
        drawSubtractRemainingSeconds();
        drawIncreaseRemainingSeconds();
    } else {
        g.setColor(0.4, 0.4, 0.4);
        drawSubtractRemainingSeconds();
        drawIncreaseRemainingSeconds();
        g.setColor(-1);
    }
}

function drawSubtractRemainingSeconds() {
    if (isDecreasingRemainingSeconds) {
        drawFilledCircle(22, 117, 15);
    }

    g.drawString("-", 25, 120);
}

function drawIncreaseRemainingSeconds() {
    if (isIncreasingRemainingSeconds) {
        drawFilledCircle(182, 117, 15);
    }

    g.drawString("+", 185, 120);
}

function drawFilledCircle(x, y, radians) {
    g.setColor(0.1, 0.37, 0.87);
    g.fillCircle(x, y, radians);
    g.setColor(-1);
}

function formatRemainingSeconds() {
    const minutes = Math.floor(remainingSeconds / 60);
    const minutesTens = Math.floor(minutes / 10);
    const minutesUnits = minutes % 10;

    const seconds = remainingSeconds % 60;
    const secondsTens = Math.floor(seconds / 10);
    const secondsUnits = seconds % 10;

    return `${minutesTens}${minutesUnits}:${secondsTens}${secondsUnits}`;
}

function onPrimaryButtonPressed() {
    if (isIncreasingRemainingSeconds || isDecreasingRemainingSeconds) return;

    if (currentState == timerState.IDLE) {
        if (remainingSeconds == 0) return;
        currentState = timerState.RUNNING;
        beginCountdown();
        draw();
    } else {
        currentState = timerState.IDLE;
        stopCountdown();
        draw();
    }
}

function beginCountdown() {
    countdownInterval = setInterval(countdown, 1000);
}

function countdown() {
    --remainingSeconds;

    if (remainingSeconds <= 0) {
        remainingSeconds = 0;
        stopCountdown();
    }

    drawRemainingSecondsPanel();

    if (remainingSeconds <= 0) {
        drawStopMessage();
    }
}

function drawStopMessage() {
    draw();
    Bangle.buzz(800);
    g.setFont("Vector", 30);
    g.setColor(1.0, 0.91, 0);
    g.drawString("Time's Up!", 105, 40);
    g.setColor(-1);
    g.setFont("Vector", 40);
}

function stopCountdown() {
    clearInterval(countdownInterval);
    countdownInterval = null;
    currentState = timerState.IDLE;
}

function onResetButtonPressed() {
    currentState = timerState.IDLE;
    remainingSeconds = 0;
    draw();
}

function onExitButtonPressed() {
    Bangle.showLauncher();
}

function onIncreaseRemainingSecondsPressed() {
    if (currentState == timerState.RUNNING) return;
    incremementRemainingSeconds();

    increasingInterval = setInterval(() => {
        remainingSeconds += 60;

        if (remainingSeconds >= 5999) {
            remainingSeconds = 5999;
        }

        drawRemainingSecondsPanel();
    }, 250);

    isIncreasingRemainingSeconds = true;

    drawRemainingSecondsPanel();
}

function incremementRemainingSeconds() {
    if (remainingSeconds >= 5999) return;
    ++remainingSeconds;
}

function onIncreaseRemainingSecondsReleased() {
    if (currentState == timerState.RUNNING) return;
    clearInterval(increasingInterval);
    isIncreasingRemainingSeconds = false;
    drawRemainingSecondsPanel();
}

function onDecreaseRemainingSecondsPressed() {
    if (currentState == timerState.RUNNING) return;
    decreaseRemainingSeconds();

    decreasingInterval = setInterval(() => {
        remainingSeconds -= 60;
        
        if (remainingSeconds < 0) {
            remainingSeconds = 0;
        }

        drawRemainingSecondsPanel();
    }, 250);

    isDecreasingRemainingSeconds = true;

    drawRemainingSecondsPanel();
}

function decreaseRemainingSeconds() {
    if (remainingSeconds <= 0) return;
    --remainingSeconds;
}

function onDecreaseRemainingSecondsReleased() {
    if (currentState == timerState.RUNNING) return;

    clearInterval(decreasingInterval);

    isDecreasingRemainingSeconds = false;
    draw();
}

main();