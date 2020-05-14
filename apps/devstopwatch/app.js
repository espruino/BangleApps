const EMPTY_LAP = '--:--:---';
const EMPTY_H = '00:00:000';
const MAX_LAPS = 6;
const XY_CENTER = g.getWidth() / 2;
const Y_CHRONO = 40;
const Y_HEADER = 80;
const Y_LAPS = 125;
const Y_BTN3 = 225;
const FONT = '6x8';
const CHRONO = '/* C H R O N O */';

var laps = [EMPTY_LAP, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP];
var started = false;
var reset = false;
var whenStarted;
var whenStartedTotal;
var currentLapIndex = 1;
var currentLap = '';
var chronoInterval;

// Set laps.
setWatch(() => {

  reset = false;
  
  if (started) {
    changeLap();
  } else {
    if (!reset) {
      chronoInterval = setInterval(chronometer, 10);
    }
  }
}, BTN1, { repeat: true, edge: 'rising' });

// Reset chronometre.
setWatch(() => { resetChrono(); }, BTN3, { repeat: true, edge: 'rising' });

// Show launcher when middle button pressed.
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: 'falling' });

function resetChrono() {
  laps = [EMPTY_H, EMPTY_H, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP];
  started = false;
  reset = true;
  currentLapIndex = 1;
  currentLap = '';

  if (chronoInterval !== undefined) {
    clearInterval(chronoInterval);
  }

  printChrono();
}

function chronometer() {

  if (!started) {
    var rightNow = Date.now();
    whenStarted = rightNow;
    whenStartedTotal = rightNow;
    started = true;
    reset = false;
  }

  currentLap = calculateLap(whenStarted);
  total = calculateLap(whenStartedTotal);

  laps[0] = total;
  laps[1] = currentLap;
  printChrono();
}

function changeLap() {

  currentLapIndex++;

  if ((currentLapIndex) > MAX_LAPS) {
    currentLapIndex = 2;
  }

  laps[currentLapIndex] = currentLap;
  whenStarted = Date.now();
}

function calculateLap(whenStarted) {

  var now = Date.now();
  var diffTime = now - whenStarted;
  var dateDiffTime = new Date(diffTime);

  var millis = padStart(dateDiffTime.getMilliseconds().toString(), 3);
  var seconds = padStart(dateDiffTime.getSeconds().toString(), 2);
  var minutes = padStart(dateDiffTime.getMinutes().toString(), 2);

  return `${minutes}:${seconds}:${millis}`;
}

function printChrono() {

  g.reset();
  g.setFontAlign(0, 0);

  var print = '';

  g.setFont(FONT, 2);
  print = CHRONO;
  g.drawString(print, XY_CENTER, Y_CHRONO, true);

  g.setColor(0, 220, 0);
  g.setFont(FONT, 3);
  print = ` T ${laps[0]}\n`;
  print += ` C ${laps[1]}\n`;
  g.drawString(print, XY_CENTER, Y_HEADER, true);

  g.setColor(255, 255, 255);
  g.setFont(FONT, 2);

  for (var i = 2; i < MAX_LAPS + 1; i++) {

    g.setColor(255, 255, 255);
    let suffix = ' ';
    if (currentLapIndex === i) {
      let suffix = '*';
      g.setColor(255, 200, 0);
    }

    const lapLine = `L${i - 1} ${laps[i]} ${suffix}\n`;
    g.drawString(lapLine, XY_CENTER, Y_LAPS + (15 * (i - 1)), true);
  }

  g.setColor(255, 255, 255);
  g.setFont(FONT, 1);
  print = 'Press 3 to reset';
  g.drawString(print, XY_CENTER, Y_BTN3, true);

  g.flip();
}

function padStart(value, size) {

  var result = '';
  var pads = size - value.length;

  if (pads > 0) {
    for (var i = 0; i < pads; i++) {
      result += '0';
    }
  }

  result += value;
  return result;
}

// Clean app screen.
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

resetChrono();
