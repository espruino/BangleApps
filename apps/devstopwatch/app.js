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

var reset = false;
var currentLap = '';
var chronoInterval;

// Read state from storage or create default state if it doesn't exist
var state = require("Storage").readJSON("devstopwatch.state.json",1) || {
  started: false,
  whenStarted: null,
  whenStartedTotal: null,
  currentLapIndex: 1,
  laps: [EMPTY_LAP, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP],
};

// Set laps.
setWatch(() => {

  reset = false;
  
  if (state.started) {
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
  state.laps = [EMPTY_H, EMPTY_H, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP];
  state.started = false;
  reset = true;
  state.currentLapIndex = 1;
  currentLap = '';

  if (chronoInterval !== undefined) {
    clearInterval(chronoInterval);
  }

  printChrono();
}

function chronometer() {

  if (!state.started) {
    var rightNow = Date.now();
    state.whenStarted = rightNow;
    state.whenStartedTotal = rightNow;
    state.started = true;
    reset = false;
  }

  currentLap = calculateLap(state.whenStarted);
  total = calculateLap(state.whenStartedTotal);

  state.laps[0] = total;
  state.laps[1] = currentLap;
  printChrono();
}

function changeLap() {

  state.currentLapIndex++;

  if ((state.currentLapIndex) > MAX_LAPS) {
    state.currentLapIndex = 2;
  }

  state.laps[state.currentLapIndex] = currentLap;
  state.whenStarted = Date.now();
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
  print = ` T ${state.laps[0]}\n`;
  print += ` C ${state.laps[1]}\n`;
  g.drawString(print, XY_CENTER, Y_HEADER, true);

  g.setColor(255, 255, 255);
  g.setFont(FONT, 2);

  for (var i = 2; i < MAX_LAPS + 1; i++) {

    g.setColor(255, 255, 255);
    let suffix = ' ';
    if (state.currentLapIndex === i) {
      let suffix = '*';
      g.setColor(255, 200, 0);
    }

    const lapLine = `L${i - 1} ${state.laps[i]} ${suffix}\n`;
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

// Write the current state to storage
E.on('kill', function(){
  require("Storage").writeJSON("devstopwatch.state.json", state);
});

if(state.started){
  chronoInterval = setInterval(chronometer, 10); 
} else {
  resetChrono();  
}
