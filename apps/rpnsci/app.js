const MEMORY_FILE = "rpnsci.mem.json";
const storage = require("Storage");

class NumberButton {
    constructor(number) {
        this.label = '' + number;
    }

    onclick() {
        if (entryTerminated) {
            if (liftOnNumberPress) liftStack();
            x = this.label;
            entryTerminated = false;
            liftOnNumberPress = false;
        } else {
            if (x == '0') x = this.label;
            else x += this.label;
        }
        feedback(true);
        updateDisplay();
    }
}

let DecimalPointButton = {
    label: '.',
    onclick: () => {
        if (entryTerminated) {
            if (liftOnNumberPress) liftStack();
            x = '0.';
            entryTerminated = false;
            liftOnNumberPress = false;
            feedback(true);
            updateDisplay();
        } else if (!x.includes('.')) {
            x += '.';
            feedback(true);
            updateDisplay();
        } else {
            feedback(false);
        }
    }
};

class ModeButton {
    constructor(currentMode) {
        if (currentMode == 'memstore' || currentMode == 'memrec') {
            this.label = 'Exit';
        } else if (currentMode == 'operation') {
            this.label = 'Num';
        } else {
            this.label = 'Op';
        }
    }

    onclick() {
        if (mode == 'memstore' || mode == 'memrec') {
            mode = 'operation';
        } else if (mode == 'operation') {
            mode = 'number';
        } else {
            mode = 'operation';
        }
        feedback(true);
        drawButtons();
    }
}

class OperationButton {
    constructor(label) {
        this.label = label;
    }

    onclick() {
        if (this.label == '/' && parseFloat(x) == 0) {
            feedback(false);
            return;
        }
        let result = this.getResult();
        x = '' + result;
        y = z;
        z = t;
        entryTerminated = true;
        liftOnNumberPress = true;
        feedback(true);
        updateDisplay();
    }

    getResult() {
        let numX = parseFloat(x);
        return {
            '+': y + numX,
            '-': y - numX,
            '/': y / numX,
            '*': y * numX,
            '^': Math.pow(y, numX)
        }[this.label];
    }
}

class OneNumOpButton {
    constructor(label) {
        this.label = label;
    }

    onclick() {
        result = {
            '+-': '' + -parseFloat(x),
            'Sin': '' + Math.sin(parseFloat(x)),
            'Cos': '' + Math.cos(parseFloat(x)),
            'Tan': '' + Math.tan(parseFloat(x)),
            'Asin': '' + Math.asin(parseFloat(x)),
            'Acos': '' + Math.acos(parseFloat(x)),
            'Atan': '' + Math.atan(parseFloat(x)),
            'Log': '' + (Math.log(parseFloat(x)) / Math.log(10))
        }[this.label];
        if (isNaN(result) || result == 'NaN') feedback(false);
        else {
            x = result;
            entryTerminated = true;
            liftOnNumberPress = true;
            feedback(true);
            updateDisplay();
        }
    }
}

let ClearButton = {
    label: 'Clr',
    onclick: () => {
        if (x != '0') {
            x = '0';
            updateDisplay();
        } else if (y != 0 || z != 0 || t != 0) {
            y = 0;
            z = 0;
            t = 0;
            E.showMessage('Registers cleared!');
            setTimeout(() => {
                drawButtons();
                updateDisplay();
            }, 250);
        } else {
            memory = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            storage.writeJSON(MEMORY_FILE, memory);
            E.showMessage('Memory cleared!');
            setTimeout(() => {
                drawButtons();
                updateDisplay();
            }, 250);
        }
        entryTerminated = false;
        liftOnNumberPress = false;
        feedback(true);
    }
};

let SwapButton = {
    label: 'Swp',
    onclick: () => {
        oldX = x;
        x = '' + y;
        y = parseFloat(oldX);
        entryTerminated = true;
        liftOnNumberPress = true;
        feedback(true);
        updateDisplay();
    }
};

let RotateButton = {
    label: 'Rot',
    onclick: () => {
        oldX = x;
        x = '' + y;
        y = z;
        z = t;
        t = parseFloat(oldX);
        entryTerminated = true;
        liftOnNumberPress = true;
        feedback(true);
        updateDisplay();
    }
};

let EnterButton = {
    label: 'Ent',
    onclick: () => {
        liftStack();
        entryTerminated = true;
        liftOnNumberPress = false;
        feedback(true);
        updateDisplay();
    }
};

let ScientificButton = {
    label: 'Sci',
    onclick: () => {
        mode = 'scientific';
        feedback(true);
        drawButtons();
    }
};

class ConstantButton {
    constructor(label, value) {
        this.label = label;
        this.value = value;
    }

    onclick() {
        if (entryTerminated && liftOnNumberPress) liftStack();
        x = '' + this.value;
        entryTerminated = true;
        liftOnNumberPress = true;
        feedback(true);
        updateDisplay();
    }
}

let MemStoreButton = {
    label: 'Sto',
    onclick: () => {
        mode = 'memstore';
        feedback(true);
        drawButtons();
    }
};

let MemRecallButton = {
    label: 'Rec',
    onclick: () => {
        mode = 'memrec';
        feedback(true);
        drawButtons();
    }
};

class MemStoreIn {
    constructor(register) {
        this.register = register;
        this.label = '' + register;
    }

    onclick() {
        memory[this.register] = parseFloat(x);
        storage.writeJSON(MEMORY_FILE, memory);
        mode = 'scientific';
        entryTerminated = true;
        liftOnNumberPress = true;
        feedback(true);
        drawButtons();
    }
}

class MemRecFrom {
    constructor(register) {
        this.register = register;
        this.label = '' + register;
    }

    onclick() {
        x = '' + memory[this.register];
        mode = 'scientific';
        entryTerminated = true;
        liftOnNumberPress = true;
        feedback(true);
        updateDisplay();
        drawButtons();
    }
}

const BUTTONS = {
    'number': [
        [new NumberButton(7), new NumberButton(8), new NumberButton(9), new ModeButton('number')],
        [new NumberButton(4), new NumberButton(5), new NumberButton(6), new NumberButton(0)],
        [new NumberButton(1), new NumberButton(2), new NumberButton(3), DecimalPointButton]
    ],
    'operation': [
        [new OperationButton('+'), new OperationButton('-'), ClearButton, new ModeButton('operation')],
        [new OperationButton('*'), new OperationButton('/'), SwapButton, EnterButton],
        [new OperationButton('^'), new OneNumOpButton('+-'), RotateButton, ScientificButton]
    ],
    'scientific': [
        [new OneNumOpButton('Sin'), new OneNumOpButton('Cos'), new OneNumOpButton('Tan'), new ModeButton('scientific')],
        [new OneNumOpButton('Asin'), new OneNumOpButton('Acos'), new OneNumOpButton('Atan'), MemStoreButton],
        [new OneNumOpButton('Log'), new ConstantButton('e', Math.E), new ConstantButton('pi', Math.PI), MemRecallButton]
    ],
    'memstore': [
        [new MemStoreIn(7), new MemStoreIn(8), new MemStoreIn(9), new ModeButton('memstore')],
        [new MemStoreIn(4), new MemStoreIn(5), new MemStoreIn(6), new MemStoreIn(0)],
        [new MemStoreIn(1), new MemStoreIn(2), new MemStoreIn(3), new ModeButton('memstore')]
    ],
    'memrec': [
        [new MemRecFrom(7), new MemRecFrom(8), new MemRecFrom(9), new ModeButton('memrec')],
        [new MemRecFrom(4), new MemRecFrom(5), new MemRecFrom(6), new MemRecFrom(0)],
        [new MemRecFrom(1), new MemRecFrom(2), new MemRecFrom(3), new ModeButton('memrec')]
    ],
};

let x = '0';
let y = 0;
let z = 0;
let t = 0;
let memJSON = storage.readJSON(MEMORY_FILE);
if (memJSON) { // TODO: `memory` should probably be declared outside the if blocks?
    let memory = memJSON;
} else {
    let memory = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
}
let mode = 'number';
let entryTerminated = false;
let liftOnNumberPress = false;

function liftStack() {
    t = z;
    z = y;
    y = parseFloat(x);
}

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
            g.drawString(BUTTONS[mode][row][col].label, 22 + 44 * col, 66 + 44 * row);
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
    g.clearRect(0, 24, 175, 43).setColor(storage.readJSON('setting.json').theme.fg2).setFontAlign(1, -1).setFont("Vector", getFontSize(x.length)).drawString(x, 176, 24);
}

Bangle.on("touch", (button, xy) => {
    let row = Math.floor((xy.y - 44) / 44);
    let col = Math.floor(xy.x / 44);
    if (row < 0) {  // Tap number to show registers
        g.clearRect(0, 24, 175, 43).setColor(storage.readJSON('setting.json').theme.fg2).setFontAlign(1, -1)
            .setFont("Vector", getFontSize(x.length)).drawString('' + t, 176, 24);

        g.clearRect(0, 44, 175, 63).setColor(storage.readJSON('setting.json').theme.fg2).setFontAlign(1, -1)
            .setFont("Vector", getFontSize(x.length)).drawString('' + z, 176, 44);

        g.clearRect(0, 64, 175, 83).setColor(storage.readJSON('setting.json').theme.fg2).setFontAlign(1, -1)
            .setFont("Vector", getFontSize(x.length)).drawString('' + y, 176, 64);

        g.clearRect(0, 84, 175, 103).setColor(storage.readJSON('setting.json').theme.fg2).setFontAlign(1, -1)
            .setFont("Vector", getFontSize(x.length)).drawString(x, 176, 84);

        setTimeout(() => {
            drawButtons();
            updateDisplay();
        }, 500);
    } else {
        if (row > 2) row = 2;
        if (col < 0) col = 0;
        if (col > 3) col = 3;

        BUTTONS[mode][row][col].onclick();
    }
});

Bangle.on("swipe", dir => {
    if (dir == -1) {
        if (entryTerminated) ClearButton.onclick();
        else if (x.length == 1) x = '0';
        else x = x.substring(0, x.length - 1);

        feedback(true);
        updateDisplay();
    } else if (dir == 0) {
        EnterButton.onclick();
    }
});

g.clear().reset();

drawButtons();
updateDisplay();

Bangle.loadWidgets();
Bangle.drawWidgets();