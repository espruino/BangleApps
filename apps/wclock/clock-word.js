/* jshint esversion: 6 */
const allWords = [
  "ATWENTYD",
  "QUARTERY",
  "FIVEHALF",
  "DPASTORO",
  "FIVEIGHT",
  "SIXTHREE",
  "TWELEVEN",
  "FOURNINE"
];
const hours = {
  0: ["", 0, 0],
  1: ["ONE", 17, 47, 77],
  2: ["TWO", 06, 16, 17],
  3: ["THREE", 35, 45, 55, 65, 75],
  4: ["FOUR", 07, 17, 27, 37],
  5: ["FIVE", 04, 14, 24, 34],
  6: ["SIX", 05, 15, 25],
  7: ["SEVEN", 05, 46, 56, 66, 67],
  8: ["EIGHT", 34, 44, 54, 64, 74],
  9: ["NINE", 47, 57, 67, 77],
  10: ["TEN", 74, 75, 76],
  11: ["ELEVEN", 26, 36, 46, 56, 66, 76],
  12: ["TWELVE", 06, 16, 26, 36, 56, 66]
};

const mins = {
  0: ["A", 0, 0],
  1: ["FIVE", 02, 12, 22, 32],
  2: ["TEN", 10, 30, 40],
  3: ["QUARTER", 01, 11, 21, 31, 41, 51, 61],
  4: ["TWENTY", 10, 20, 30, 40, 50, 60],
  5: ["HALF", 42, 52, 62, 72],
  6: ["PAST", 13, 23, 33, 43],
  7: ["TO", 43, 53]
};

// offsets and incerments
const xs = 35;
const ys = 31;
const dy = 22;
const dx = 25;

// font size and color
const fontSize = 3;  // "6x8"
const passivColor = 0x3186 /*grey*/ ;
const activeColor = 0xF800 /*red*/ ;

function drawWordClock() {

  // get time
  var t = new Date();
  var h = t.getHours();
  var m = t.getMinutes();
  var time = ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2);

  var hidx;
  var midx;
  var midxA = [];

  g.setFont("6x8",fontSize);
  g.setColor(passivColor);
  g.setFontAlign(0, -1, 0);

  // draw allWords
  var c;
  var y = ys;
  var x = xs;
  allWords.forEach((line) => {
    x = xs;
    for (c in line) {
      g.drawString(line[c], x, y);
      x += dx;
    }
    y += dy;
  });

  // calc indexes
  midx = Math.round(m / 5);
  hidx = h % 12;
  if (hidx === 0) { hidx = 12; }
  if (midx > 6) {
    if (midx == 12) { midx = 0; }
    hidx++;
  }
  if (midx !== 0) {
    if (midx <= 6) {
      midxA = [midx, 6];
    } else {
      midxA = [12 - midx, 7];
    }
  }

  // write hour in active color
  g.setColor(activeColor);
  hours[hidx][0].split('').forEach((c, pos) => {
    x = xs + (hours[hidx][pos + 1] / 10 | 0) * dx;
    y = ys + (hours[hidx][pos + 1] % 10) * dy;

    g.drawString(c, x, y);
  });

  // write min words in active color
  midxA.forEach(idx => {
    mins[idx][0].split('').forEach((c, pos) => {
      x = xs + (mins[idx][pos + 1] / 10 | 0) * dx;
      y = ys + (mins[idx][pos + 1] % 10) * dy;
      g.drawString(c, x, y);
    });
  });

  // display digital time
  g.setColor(activeColor);
  g.clearRect(0, 215, 240, 240);
  g.drawString(time, 120, 215);
}

Bangle.on('lcdPower', function(on) {
  if (on) drawWordClock();
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
setInterval(drawWordClock, 1E4);
drawWordClock();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
