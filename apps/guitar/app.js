const stringInterval = 24;
const stringLength = 138;
const fretHeight = 35;
const fingerOffset = 17;
const x = 30;
const y = 32;

//chords
const cc = [
  "C",
  "0X",
  "33",
  "22",
  "x",
  "11",
  "x"
];

const dd = [
  "D",
  "0X",
  "0X",
  "x",
  "21",
  "33",
  "22"
];

const gg = [
  "G",
  "32",
  "21",
  "x",
  "x",
  "x",
  "33"
];

const am = [
  "Am",
  "0x",
  "x",
  "22",
  "23",
  "11"
];

const em = [
  "Em",
  "x",
  "22",
  "23",
  "x",
  "x",
  "x"
];

const aa = [
  "A",
  "0X",
  "x",
  "21",
  "22",
  "23",
  "x"
];

const ff = [
  "F",
  "0X",
  "33",
  "34",
  "22",
  "11",
  "11"
];

var ee = [
  "E",
  "x",
  "22",
  "23",
  "11",
  "x",
  "x"
];

var index = 0;
var chords = [];
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
    g.drawLine(x + i * stringInterval, y, x + i * stringInterval, y + stringLength);
    g.fillRect(x- 1, y + i * fretHeight - 1, x + stringInterval * 5 + 1, y + i * fretHeight + 1);
  }
}

function drawChord(chord) {
    g.drawString(chord[0], g.getWidth() * 0.5 - 3, 18);
    for (let i = 0; i < chord.length; i++) {
        if (i === 0 || chord[i][0] === "x") {
            continue;
        }
        if (chord[i][0] === "0") {
            g.drawString(chord[i][1], x + (i - 1) * stringInterval - 5, y + fretHeight * chord[i][0] + 2, true);
            g.drawCircle(x + (i - 1) * stringInterval -1, y + fretHeight * chord[i][0], 10);
        }
        else {
            g.drawString(chord[i][1], x + (i - 1) * stringInterval -5, y -fingerOffset + fretHeight * chord[i][0] + 2, true);
            g.drawCircle(x + (i - 1) * stringInterval -1, y -fingerOffset + fretHeight * chord[i][0], 10);
        }
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
