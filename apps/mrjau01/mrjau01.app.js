// place your const, vars, functions or classes here
const version = "0.07";
var menueMode = false;
var myBTN1;
var myBTN2;
var myBTN3;

function clearDevice() {
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}
function clearApp() {
  g.clearRect(3, 29, 237, 215); // Outer Rect
  clearWatch(myBTN2);
  myBTN2 = setWatch(function (e) { startAppMenue(); }, BTN2, { repeat: false, edge: "rising" });
}

/* Heart Rate */
function startMyHeartApp() {
  clearApp();
  E.showMessage("Heart App");
}
/* end of Heart Rate */

/* GPS */
function GPSstopped(title) {
  console.log("GPSstopped");
  Bangle.setGPSPower(0);
  E.showMessage(title);
}
function onGPS(fix) {
  console.log("onGPS");
  console.log(fix);
  if (isNaN(fix.lat)) GPSstopped('No GPS Signal');
}
function startMyGPXApp() {
  clearApp();
  Bangle.on('GPS', onGPS);
  Bangle.setGPSPower(1);
  E.showMessage("GPS Mode"); // avoid showing rubbish on screen
}
/* End of GPS */

/* Timer Section */
var counterInterval;
var timerCounter = 5;
var timerRunning = false;
function outOfTime() {
  E.showMessage("Out of Time", "My Timer");
  Bangle.buzz();
}
function countDown() {
  counter--;
  // Out of time
  if (counter <= 0) {
    clearInterval(counterInterval);
    counterInterval = undefined;
    outOfTime();
    return;
  }
  if ((timerRunning) && !(menueMode)) {
    g.clearRect(53, 58, 181, 186);
    g.setFontAlign(0, 0); // center font
    g.setFont("Vector", 40); // vector font, 80px  
    // draw the current counter value
    g.drawString(counter, 120, 120);
    // optional - this keeps the watch LCD lit up
    g.flip();
  }
}
function startTimer(e) {
  // console.log(e.time - e.lastTime); // e enth�lt die Dauer des Drucks auf den Knopf

  // 240 x 240 x 16 bits
  // 48 Pixel for Widgets
  // 192 Pixel for the Rest
  // 96 Pixel seems to be the center
  g.clear();
  g.drawRect(3, 29, 237, 215); // Outer Rect
  g.drawCircle(117, 122, 93);  // Inner Circle
  g.drawRect(52, 57, 182, 187); // Inner Rect

  counter = timerCounter;
  timerRunning = true;
  countDown();
  if (!counterInterval)
    counterInterval = setInterval(countDown, 1000);
}
function stopTimer() {
  if (counterInterval != undefined) {
    clearInterval(counterInterval);
    counterInterval = undefined;
  }
}
function startMyTimerApp() {
  g.clearRect(3, 29, 237, 215); // Outer Rect
  clearWatch(myBTN1);
  clearWatch(myBTN2);
  clearWatch(myBTN3);
  myBTN2 = setWatch(function (e) { stopMyTimerApp(); }, BTN2, { repeat: true, edge: "falling" });
  myBTN1 = setWatch(function (e) { startTimer(e); }, BTN1, { repeat: true, edge: "falling" });
  myBTN3 = setWatch(function (e) { stopTimer(e); }, BTN3, { repeat: true, edge: "falling" });
  E.showMessage("Start Timer");
}
function stopMyTimerApp() {
  console.log(stopMyTimerApp);
  stopTimer();
  clearWatch(myBTN1);
  clearWatch(myBTN3);
  startAppMenue();
}
/* End of Timer Section */

/* Draw World Clock */
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
const passivColor = 0x3186 /*grey*/;
const activeColor = 0xF800 /*red*/;
const whiteColor = 0xFFFF /*Wite*/;
// draw the Word Clock
function drawWordClock() {
  clearDevice();
  myBTN2 = setWatch(startAppMenue, BTN2, { repeat: false, edge: "falling" });
  // get time
  var t = new Date();
  var h = t.getHours();
  var m = t.getMinutes();
  var time = ("0" + h).substr(-2) + ":" + ("0" + m).substr(-2);

  var hidx;
  var midx;
  var midxA = [];

  g.setFont("6x8", fontSize);
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
  g.setColor(whiteColor);
  g.clearRect(0, 215, 240, 240);
  g.drawString(time, 120, 215);
}
/* End of Draw World Clock */

/* Main Section */
var menueIndex = 0;
var menueValues = ['GPX App', 'Heart Rate', 'Timer App', 'Watch', 'Stop App'];
const menueIndexMax = menueValues.length - 1;
function startMenueItem() {
  console.log("Start Menue Item (" + menueIndex + ")");
  switch (menueIndex) {
    case 0:
      break;
    case 1:
      break;
    case 2:
      startMyTimerApp();
      break;
    case 3:
      drawWordClock();
      break;
    case 4:
      Bangle.showLauncher();
      break;
    default:
  }
}
function menueUp() {
  console.log("menueUp");
  oldMenueIndex = menueIndex;
  if (menueIndex == 0) { menueIndex = menueIndexMax; }
  else { menueIndex = menueIndex - 1; }
  drawMenueItem(oldMenueIndex);
  drawMenueItem(menueIndex);
  clearWatch(myBTN1);
  myBTN1 = setWatch(function (e) { menueUp(); }, BTN1, { repeat: false, edge: "falling" });
}
function menueDown() {
  console.log("menueDown");
  oldMenueIndex = menueIndex;
  if (menueIndex == menueIndexMax) { menueIndex = 0; }
  else { menueIndex = menueIndex + 1; }
  drawMenueItem(oldMenueIndex);
  drawMenueItem(menueIndex);
  clearWatch(myBTN3);
  myBTN3 = setWatch(function (e) { menueDown(); }, BTN3, { repeat: false, edge: "falling" });
}
function drawMenueItem(index) {
  if (index == menueIndex) g.setColor(whiteColor);
  else g.setColor(passivColor);
  x = 15;
  y = 30 + (30 * index);
  g.clearRect(x, y, x, x + 30);
  g.setFont("6x8", fontSize);
  g.setFontAlign(-1, -1);
  g.drawString(menueValues[index], x, y);
}
function startAppMenue() {
  g.clearRect(3, 29, 237, 215); // Outer Rect
  clearWatch(myBTN2);
  myBTN1 = setWatch(function (e) { menueUp(); }, BTN1, { repeat: false, edge: "falling" });
  myBTN3 = setWatch(function (e) { menueDown(); }, BTN3, { repeat: false, edge: "falling" });
  myBTN2 = setWatch(startMenueItem, BTN2, { repeat: false, edge: "falling" });
  for (i = 0; i <= menueIndexMax; i++) {
    drawMenueItem(i);
  }
}
/* End of Menue Section */

/* Main Section */
Bangle.on('lcdPower', (on) => {
  if (on) {
    drawWordClock();
  }
});
drawWordClock();
/* End of Main Section */
