const stringInterval = 24;
const stringLength = 138;
const fretHeight = 35;
const fingerOffset = 17;
const xOffset = 26;
const yOffset = 34;

const cc = [
  "C",
  "0X",
  "33",
  "22",
  "x",
  "11",
  "x",
  "0"
];

const dd = [
  "D",
  "0X",
  "0X",
  "x",
  "21",
  "33",
  "22",
  "0"
];

const gg = [
  "G",
  "32",
  "21",
  "x",
  "x",
  "x",
  "33",
  "0"
];

const am = [
  "Am",
  "0x",
  "x",
  "23",
  "22",
  "11",
  "x",
  "0"
];

const em = [
  "Em",
  "x",
  "22",
  "23",
  "x",
  "x",
  "x",
  "0"
];

const aa = [
  "A",
  "0X",
  "x",
  "21",
  "22",
  "23",
  "x",
  "0"
];

var ee = [
  "E",
  "x",
  "22",
  "23",
  "11",
  "x",
  "x",
  "0"
];

var dm = [
  "Dm",
  "0x",
  "0x",
  "x",
  "22",
  "33",
  "11",
  "0"
];

var ff = [
  "F",
  "0x",
  "0x",
  "33",
  "22",
  "11",
  "11",
  "0"
];

var b7 = [
  "B7",
  "0x",
  "22",
  "11",
  "23",
  "x",
  "24",
  "0"
];

var cadd9 = [
  "Cadd9",
  "0x",
  "32",
  "21",
  "x",
  "33",
  "34",
  "0"
];

var dadd11 = [
  "Dadd11",
  "0x",
  "33",
  "22",
  "x",
  "11",
  "x",
  "3"
];

var csus2 = [
  "Csus2",
  "0x",
  "33",
  "x",
  "x",
  "11",
  "0x",
  "0"
];

var gadd9 = [
  "Gadd9",
  "32",
  "0x",
  "x",
  "21",
  "x",
  "33",
  "0"
];

var aadd9 = [
  "Aadd9",
  "11",
  "33",
  "34",
  "22",
  "x",
  "x",
  "5"
];

var fsharp7add11 = [
  "F#7add11",
  "21",
  "43",
  "44",
  "32",
  "x",
  "x",
  "0"
];

var d9 = [
  "D9",
  "0x",
  "22",
  "11",
  "23",
  "23",
  "0x",
  "4"
];

var g7 = [
  "G7",
  "33",
  "22",
  "x",
  "x",
  "34",
  "11",
  "0"
];

var bflatd = [
  "Bb/D",
  "0x",
  "33",
  "11",
  "11",
  "11",
  "0x",
  "3"
];

var e7sharp9 = [
  "E7#9",
  "0x",
  "22",
  "11",
  "23",
  "34",
  "0x",
  "6"
];

var a11 = [
  "A11 3rd fret",
  "33",
  "0x",
  "34",
  "22",
  "11",
  "0x",
  "0"
];

var a9 = [
  "A9",
  "32",
  "0x",
  "33",
  "21",
  "34",
  "0x",
  "3"
];



var menu = {
    "" : {
        "title" : "Guitar Chords"
    },
    "C" : function() { draw(cc); },
    "D" : function() { draw(dd); },
    "E" : function() { draw(ee); },
    "Em" : function() { draw(em); },
    "A" : function() { draw(aa); },
    "Am" : function() { draw(am); },
    "F" : function() { draw(ff); },
    "G" : function() { draw(gg); },
    "Dm" : function() { draw(dm); },
    "B7" : function () { draw(b7); },
    "Cadd9" : function () { draw(cadd9); },
    "Dadd11" : function () { draw(dadd11); },
    "Csus2" : function () { draw(csus2); },
    "Gadd9" : function () { draw(gadd9); },
    "Aadd9" : function () { draw(aadd9); },
    "F#7add11" : function () { draw(fsharp7add11); },
    "D9" : function () { draw(d9); },
    "G7" : function () { draw(g7); },
    "Bb/D" : function () { draw(bflatd); },
    "E7#9" : function () { draw(e7sharp9); },
    "A11" : function () { draw(a11); },
    "A9" : function () { draw(a9); },
    "About" : function() {
        E.showMessage(
            "Created By:\nNovaDawn999", {
              title:"About"
            }
        );
    }
};



function drawBase() {
  for (let i = 0; i < 6; i++) {
    g.drawLine(xOffset + i * stringInterval, yOffset, xOffset + i * stringInterval, yOffset + stringLength);
    g.fillRect(xOffset- 1, yOffset + i * fretHeight - 1, xOffset + stringInterval * 5 + 1, yOffset + i * fretHeight + 1);
  }
}

function drawChord(chord) {
    g.drawString(chord[0], g.getWidth() * 0.5 - (chord[0].length * 5), 16);
    for (let i = 0; i < chord.length - 1; i++) {
        if (i === 0 || chord[i][0] === "x") {
            continue;
        }
        if (chord[i][0] === "0") {
            g.drawString(chord[i][1], xOffset + (i - 1) * stringInterval - 5, yOffset + fretHeight * chord[i][0] + 2, true);
            g.drawCircle(xOffset + (i - 1) * stringInterval -1, yOffset + fretHeight * chord[i][0], 10);
        }
        else {
            g.drawString(chord[i][1], xOffset + (i - 1) * stringInterval -5, yOffset -fingerOffset + fretHeight * chord[i][0] + 2, true);
            g.drawCircle(xOffset + (i - 1) * stringInterval -1, yOffset -fingerOffset + fretHeight * chord[i][0], 10);
        }
    }
    if (chord[7] !== "0") {
      g.drawString(chord[7], 9, 50);
    }
}

function buttonPress() {
  setWatch(() => {
    buttonPress();
    }, BTN);
  E.showMenu(menu);
}

function draw(chord) {
  g.clear();
  drawBase();
  drawChord(chord);
}



function main() {
  E.showMenu(menu);
  setWatch(() => {
    buttonPress();
    }, BTN);
}

main();