let common;

function inputStringToTime(inputString) {
    let number = parseInt(inputString);
    let hours = Math.floor(number / 10000);
    let minutes = Math.floor((number % 10000) / 100);
    let seconds = number % 100;

    return 3600000 * hours +
        60000 * minutes +
        1000 * seconds;
}

function pad(number) {
    return ('00' + parseInt(number)).slice(-2);
}

function inputStringToDisplayString(inputString) {
    let number = parseInt(inputString);
    let hours = Math.floor(number / 10000);
    let minutes = Math.floor((number % 10000) / 100);
    let seconds = number % 100;

    if (hours == 0 && minutes == 0) return '' + seconds;
    else if (hours == 0) return `${pad(minutes)}:${pad(seconds)}`;
    else return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}

class NumberButton {
    constructor(number) {
        this.label = '' + number;
    }

    onclick() {
        if (common.state.inputString == '0') common.state.inputString = this.label;
        else common.state.inputString += this.label;
        feedback(true);
        updateDisplay();
    }
}

let ClearButton = {
    label: 'Clr',
    onclick: () => {
        common.state.inputString = '0';
        updateDisplay();
        feedback(true);
    }
};

let StartButton = {
    label: 'Go',
    onclick: () => {
        common.startTimer(inputStringToTime(common.state.inputString));
        feedback(true);
        require('keytimer-tview.js').show(common);
    }
};

const BUTTONS = [
    [new NumberButton(7), new NumberButton(8), new NumberButton(9), ClearButton],
    [new NumberButton(4), new NumberButton(5), new NumberButton(6), new NumberButton(0)],
    [new NumberButton(1), new NumberButton(2), new NumberButton(3), StartButton]
];

function feedback(acceptable) {
    if (acceptable) Bangle.buzz(50, 0.5);
    else Bangle.buzz(200, 1);
}

function drawButtons() {
    g.reset().clearRect(0, 44, 175, 175).setFont("Vector", 15).setFontAlign(0, 0);
    //Draw lines
    for (let x = 44; x <= 176; x += 44) {
        g.drawLine(x, 44, x, 175);
    }
    for (let y = 44; y <= 176; y += 44) {
        g.drawLine(0, y, 175, y);
    }
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
            g.drawString(BUTTONS[row][col].label, 22 + 44 * col, 66 + 44 * row);
        }
    }
}

function getFontSize(length) {
    let size = Math.floor(176 / length);  //Characters of width needed per pixel
    size *= (20 / 12);  //Convert to height
    // Clamp to between 6 and 20
    if (size < 6) return 6;
    else if (size > 20) return 20;
    else return Math.floor(size);
}

function updateDisplay() {
    let displayString = inputStringToDisplayString(common.state.inputString);
    let t = storage.readJSON('setting.json').theme;
    g.setBgColor(t.bg2).clearRect(0, 24, 175, 43).setColor(t.fg2).setFontAlign(1, -1).setFont("Vector", getFontSize(displayString.length)).drawString(displayString, 176, 24);
}

exports.show = function (callerCommon) {
    common = callerCommon;
    g.reset();
    drawButtons();
    updateDisplay();
};

exports.touch = function (button, xy) {
    let row = Math.floor((xy.y - 44) / 44);
    let col = Math.floor(xy.x / 44);
    if (row < 0) return;
    if (row > 2) row = 2;
    if (col < 0) col = 0;
    if (col > 3) col = 3;

    BUTTONS[row][col].onclick();
};

exports.swipe = function (dir) {
    if (dir == -1) {
        if (common.state.inputString.length == 1) common.state.inputString = '0';
        else common.state.inputString = common.state.inputString.substring(0, common.state.inputString.length - 1);

        common.state.setTime = inputStringToTime(common.state.inputString);

        feedback(true);
        updateDisplay();
    } else if (dir == 0) {
        EnterButton.onclick();
    }
};