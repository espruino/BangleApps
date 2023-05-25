const stringInterval = 30;
const stringLength = 131;
const fretHeight = 35;
const fingerOffset = 17;
const x = 44;
const y = 32;

//chords
const cc = [
  "C",
  "x",
  "x",
  "x",
  "33"
];

const dd = [
  "D",
  "23",
  "22",
  "24",
  "x"
];

const gg = [
  "G",
  "x",
  "21",
  "33",
  "22",
];

const am = [
  "Am",
  "22",
  "x",
  "x",
  "x"
];

const em = [
  "Em",
  "x",
  "43",
  "32",
  "21"
];

const aa = [
  "A",
  "22",
  "11",
  "x",
  "x"
];

const ff = [
  "F",
  "22",
  "x",
  "11",
  "x"
];

var ee = [
  "E",
  "33",
  "32",
  "34",
  "11"
];

var index = 0;
var chords = [];

function init() {
  g.setFontAlign(0,0); // center font
  g.setFont("6x8",2); // bitmap font, 8x magnified
  chords.push(cc, dd, gg, am, em, aa, ff, ee);
}

function drawBase() {
  for (let i = 0; i < 4; i++) {
    g.drawLine(x + i * stringInterval, y, x + i * stringInterval, y + stringLength);
    g.fillRect(x- 1, y + i * fretHeight - 1, x + stringInterval * 3 + 1, y + i * fretHeight + 1);
  }
}

function drawChord(chord) {
    g.drawString(chord[0], g.getWidth() * 0.5 + 2, 18);
    for (let i = 0; i < chord.length; i++) {
        if (i === 0 || chord[i][0] === "x") {
            continue;
        }
        if (chord[i][0] === "0") {
            g.drawString(chord[i][1], x + (i - 1) * stringInterval + 1, y + fretHeight * chord[i][0], true);
            g.drawCircle(x + (i - 1) * stringInterval -1, y + fretHeight * chord[i][0], 8);
        }
        else {
            g.drawString(chord[i][1], x + (i - 1) * stringInterval + 1, y -fingerOffset + fretHeight * chord[i][0], true);
            g.drawCircle(x + (i - 1) * stringInterval -1, y -fingerOffset + fretHeight * chord[i][0], 8);
        }
    }
}

function buttonPress() {
  setWatch(() => {
    buttonPress();
    }, BTN);
  index++;
  if (index >= chords.length) { index = 0; }
  draw();
}

function draw() {
  g.clear();
  drawBase();
  drawChord(chords[index]);
}



function main() {
  init();
  draw();
  setWatch(() => {
    buttonPress();
    }, BTN);
}

main();
