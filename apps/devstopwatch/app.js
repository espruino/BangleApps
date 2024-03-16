const EMPTY_LAP = '--:--:---';
const EMPTY_H = '00:00:000';
const MAX_LAPS = 6;
const XY_CENTER = g.getWidth() / 2;
const big = g.getWidth()>200;
const Y_CHRONO = big?40:30;
const Y_HEADER = big?95:65;
const Y_LAPS = big?125:80;
const H_LAPS = big?15:8;
const Y_HELP = big?225:135;
const FONT = '6x8';
const CHRONO = '/* C H R O N O */';


//var reset = false;
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

// Show launcher when button pressed
Bangle.setUI("clockupdown", btn=>{
  switch (btn) {
    case -1:
      if (state.started) {
        changeLap();
      } else {
        chronoInterval = setInterval(chronometer, 10);
      }
      break;
    case 1: resetChrono(); break;
    default: Bangle.showLauncher(); break; //launcher handeled by ROM
  }
});

function resetChrono() {
  state.laps = [EMPTY_H, EMPTY_H, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP, EMPTY_LAP];
  state.started = false;
  //reset = true;
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
    //reset = false;
  }

  currentLap = calculateLap(state.whenStarted);
  const total = calculateLap(state.whenStartedTotal);

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

  g.setColor(g.theme.fg);
  g.setFont(FONT, big?2:1);
  print = CHRONO;
  g.drawString(print, XY_CENTER, Y_CHRONO, true);

  g.setColor("#0e0");
  g.setFont(FONT, big?3:2);
  print = ` T ${state.laps[0]}\n`;
  print += ` C ${state.laps[1]}\n`;
  g.drawString(print, XY_CENTER, Y_HEADER, true);

  g.setColor(g.theme.fg);
  g.setFont(FONT, big?2:1);

  for (var i = 2; i < MAX_LAPS + 1; i++) {

    g.setColor(g.theme.fg);
    let suffix = ' ';
    if (state.currentLapIndex === i) {
      let suffix = '*'; //TODO: Should `let` be removed here?
      if (process.env.HWVERSION==2) g.setColor("#0ee");
      else g.setColor("#f70");
    }

    const lapLine = `L${i - 1} ${state.laps[i]} ${suffix}\n`;
    g.drawString(lapLine, XY_CENTER, Y_LAPS + (H_LAPS * (i - 1)), true);
  }

  g.setColor(g.theme.fg);
  g.setFont(FONT, 1);
  //help for model 2 or 1
  if (process.env.HWVERSION==2) {
    print = /*LANG*/'TAP right top/bottom';
    g.drawString(print, XY_CENTER, Y_HELP, true);
    print = /*LANG*/'start&lap/reset, BTN1: EXIT';
    g.drawString(print, XY_CENTER, Y_HELP+10, true);
  }
  else {
    print = /*LANG*/'BTNs 1:startlap 2:exit 3:reset';
    g.drawString(print, XY_CENTER, Y_HELP, true);
  }

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
