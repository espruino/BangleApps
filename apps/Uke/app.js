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
  "22",
  "23",
  "24",
  "x"
];

var ee = [
  "E",
  "33",
  "32",
  "34",
  "11"
];

const ff = [
  "F",
  "22",
  "x",
  "11",
  "x"
];

const gg = [
  "G",
  "x",
  "21",
  "33",
  "22",
];

const aa = [
  "A",
  "22",
  "11",
  "x",
  "x"
];

const bb = [
  "B",
  "42",
  "43",
  "44",
  "21"
];

const cm = [
  "Cm",
  "11",
  "x",
  "12",
  "34"
];

const dm = [
  "Dm",
  "x",
  "22",
  "33",
  "11"
];

const em = [
  "Em",
  "x",
  "43",
  "32",
  "21"
];

const fm = [
  "Fm",
  "33",
  "11",
  "11",
  "11"
];

const gm = [
  "Gm",
  "x",
  "22",
  "33",
  "11"
];

const am = [
  "Am",
  "22",
  "23",
  "11",
  "x"
];

const bm = [
  "Bm",
  "x",
  "43",
  "32",
  "21"
];

const c7 = [
  "C7",
  "22",
  "33",
  "11",
  "x"
];

const d7 = [
  "D7",
  "x",
  "22",
  "11",
  "23"
];

const e7 = [
  "E7",
  "x",
  "11",
  "x",
  "x"
];

const f7 = [
  "F7",
  "11",
  "22",
  "11",
  "11"
];

const g7 = [
  "G7",
  "x",
  "x",
  "x",
  "11"
];

const a7 = [
  "A7",
  "21",
  "21",
  "21",
  "32"
];

const b7 = [
  "B7",
  "11",
  "22",
  "x",
  "23"
];



var menu = {
  "" : { "title" : "Uke Chords" },
  "C" : function() { draw(cc); },
  "D" : function() { draw(dd); },
  "E" : function() { draw(ee); },
  "F" : function() { draw(ff); },
  "G" : function() { draw(gg); },
  "A" : function() { draw(aa); },
  "B" : function() { draw(bb); },
  "C7" : function() { draw(c7); },
  "D7" : function() { draw(d7); },
  "E7" : function() { draw(e7); },
  "F7" : function() { draw(f7); },
  "G7" : function() { draw(g7); },
  "A7" : function() { draw(a7); },
  "B7" : function() { draw(b7); },
  "Cm" : function() { draw(cm); },
  "Dm" : function() { draw(dm); },
  "Em" : function() { draw(em); },
  "Fm" : function() { draw(fm); },
  "Gm" : function() { draw(gm); },
  "Am" : function() { draw(am); },
  "Bm" : function() { draw(bm); },
  "About" : function() {
      E.showMessage(
          "Created By:\nNovaDawn999", {
            title:"About"
          }
      );
  }
};



function drawBase() {
  for (let i = 0; i < 4; i++) {
    g.drawLine(x + i * stringInterval, y, x + i * stringInterval, y + stringLength);
    g.fillRect(x- 1, y + i * fretHeight - 1, x + stringInterval * 3 + 1, y + i * fretHeight + 1);
  }
}

function drawChord(chord) {
  g.drawString(chord[0], g.getWidth() * 0.5 - (chord[0].length * 5), 16);
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
