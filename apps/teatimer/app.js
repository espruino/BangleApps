// Tea Timer 
// Button press stops timer, next press restarts timer
let drag;
var counter = 0;
var counterStart = 150; // 150 seconds
var counterInterval;
const states = {
  init: 1, // unused
  help: 2, // show help text
  start: 4, // show/change initial counter
  count: 8, // count down
  countUp: 16, // count up after timer finished
  stop: 32 // timer stopped
};
var state = states.start;
let setting = require("Storage").readJSON("setting.json",1);
E.setTimeZone(setting.timezone);

// Title showing current time
function appTitle() {
  return "Tea Timer\n" + currentTime();
}

function currentTime() {
  let min = Date().getMinutes();
  if (min < 10) min = "0" + min;
  return Date().getHours() + ":" + min;
}

function timeFormated(sec) {
  let min = Math.floor(sec / 60);
  sec = sec % 60;
  if (sec < 10) sec = "0" + sec;
  return min + ":" + sec;
}

// initialize timer and show timer value => state: start
function initTimer() {
  counter = counterStart;
  setState(states.start);
  showCounter(true);
}

// timer value (counter) can be changed in state start
function changeCounter(diff) {
  if (state == states.start) {
    if (counter + diff > 0) {
      counter = counter + diff;
      showCounter(true);
    }
  }
}

// start or restart timer => state: count
function startTimer() {
  counterStart = counter;
  setState(states.count);
  countDown();
  if (!counterInterval)
    counterInterval = setInterval(countDown, 1000);
}

/* show current counter value at start and while count down
  Show
  - Title with current time
  - initial timer value
  - remaining time
  - hint for help in state start
*/ 
function showCounter(withHint) {
  g.reset(); // workaround for E.showMessage bg color in 2v14 and earlier
  E.showMessage("", appTitle());
  g.reset().setFontAlign(0,0); // center font
  // draw the current counter value
  g.setBgColor(-1).setColor(0,0,1); // blue
  g.setFont("Vector",20); // vector font, 20px  
  g.drawString("Timer: " + timeFormated(counterStart),80,55);
  g.setFont("Vector",60); // vector font, 60px  
  g.drawString(timeFormated(counter),83,100);
  if (withHint) {
    g.setFont("Vector",20); // vector font, 80px
    g.drawString("Tap for help",80,150);
  }
}

// count down and update every second
// when time is up, start counting up
function countDown() {
  counter--;
  // Out of time
  if (counter<=0) {
    outOfTime();
    countUp();
    counterInterval = setInterval(countUp, 1000);
    return;
  }
  showCounter(false);
}

// 
function outOfTime() {
  E.showMessage("Time is up!",appTitle());
  setState(states.countUp);
  resetTimer();
  Bangle.buzz();
  Bangle.buzz();
}

/* this counts up (one minute), after time is up
  Show
  - Title with current time
  - initial timer value
  - "Time is up!"
  - time since timer finished
*/
function countUp() {
  // buzz for 15 seconds
  counter++;
  if (counter <=15) {
    Bangle.buzz();
  }
  // stop counting up after 60 seconds
  if (counter > 60) {
    outOfTime();
    return;
  }
  g.reset(); // workaround for E.showMessage bg color in 2v14 and earlier
  E.showMessage("", appTitle());
  g.reset().setFontAlign(0,0); // center font
  g.setBgColor(-1).setColor(0,0,1); // blue
  g.setFont("Vector",20); // vector font, 20px
  g.drawString("Timer: " + timeFormated(counterStart),80,55);
  g.setFont("Vector",30); // vector font, 80px  
  g.setBgColor(-1).setColor(1,0,0); // red
  g.drawString("Time is up!",85,85);
  g.setFont("Vector",40); // vector font, 80px
  // draw the current counter value
  g.drawString(timeFormated(counter),80,130);
}

// reset when interupted by user oder 60 seconds after timer finished
function resetTimer() {
  clearInterval();
  counterInterval = undefined;
}

// timer is stopped by user => state: stop
function stopTimer() {
  resetTimer();
  E.showMessage("Timer stopped!", appTitle());
  setState(states.stop);
}

// timer is stopped by user while counting up => state: start
function stopTimer2() {
  resetTimer();
  initTimer();
}


function setState(st) {
  state = st;
}

function buttonPressed() {
  switch(state) {
    case states.init:
      initTimer();
      break;
    case states.help:
      initTimer();
      break;
    case states.start:
      startTimer();
      break;
    case states.count:
      stopTimer();
      break;
    case states.countUp:
      stopTimer2();
      break;
    case states.stop:
      initTimer();
      break;
    default:
      initTimer();
      break;
  }
}

/* Change initial counter value by swiping
    swipe up: +1 minute
    swipe down: -1 minute
    swipe right: +15 seconds
    swipe left: -15 seconds */
function initDragEvents() {
  Bangle.on("drag", e => {
  if (state == states.start) {
    if (!drag) { // start dragging
      drag = {x: e.x, y: e.y};
    } else if (!e.b) { // released
      const dx = e.x-drag.x, dy = e.y-drag.y;
      drag = null;
      if (Math.abs(dx)>Math.abs(dy)+10) {
        // horizontal
        changeCounter(dx>0 ? 15 : -15);
      } else if (Math.abs(dy)>Math.abs(dx)+10) {
        // vertical
        changeCounter(dy>0 ? -60 : 60);
      }
    }
  }
});
}

// show help text while in start state (see initDragEvents())
function showHelp() {
  if (state == states.start) {
    state = states.help;
	g.setBgColor(g.theme.bg);
	g.setColor(g.theme.fg);
    E.showMessage("Swipe up/down\n+/- one minute\n\nSwipe left/right\n+/- 15 seconds\n\nPress Btn1 to start","Tea timer help");
  }
  // return to start
  else if (state == states.help) {
    counterStart = counter;
    initTimer();
  }
}

// drag events in start state (to change counter value)
initDragEvents();
// Show help test in start state
Bangle.on('touch', function(button, xy) { showHelp(); });
// event handling for button1
setWatch(buttonPressed, BTN1, {repeat: true});
initTimer();