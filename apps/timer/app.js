let counter = 0;
let setValue = 0;
let counterInterval;
let buzzInterval;
let resetLastReleaseTimeTimeout;
const DEBUG = true;

const APP_TITLE = "TIMER";
const DEBOUNCE = 100;

function buzzAndBeep() {
  Bangle.buzz(1e3, 1).then(() => {
    Bangle.beep(200, 4000);
  });
}

function outOfTime() {
  E.showMessage("Time's up\n\nBTN1 to restart", APP_TITLE);
  buzzAndBeep();
  buzzInterval = setInterval(buzzAndBeep, 5000);
}

function draw() {
  const minutes = Math.floor(counter / 60);
  const seconds = counter - minutes * 60;
  const seconds2Digits = seconds < 10 ? `0${seconds}` : seconds.toString();
  g.clear();
  g.setFontAlign(0, 0);
  g.setFont("6x8", 7);
  g.drawString(`${minutes}:${seconds2Digits}`, 120, 120);
}

function countDown() {
  if (DEBUG) console.log("countDown");
  if (counter <= 0) {
    if (counterInterval) {
      clearInterval(counterInterval);
      counterInterval = undefined;
    }
    outOfTime();
    return;
  }

  counter--;
  if (DEBUG) console.log("counter", counter);
  draw();
}

function clearIntervals() {
  if (counterInterval) {
    clearInterval(counterInterval);
    counterInterval = undefined;
  }
  if (buzzInterval) {
    clearInterval(buzzInterval);
    buzzInterval = undefined;
  }
}

let lastReleaseTime = 0;
const THRESHOLD1 = 3000;
const THRESHOLD2 = 5000;
function getDelta() {
  const now = Date.now();
  if (lastReleaseTime === 0) lastReleaseTime = Date.now();
  const keyDownDuration = now - lastReleaseTime;
  if (DEBUG) console.log("keyDownDuration", keyDownDuration);
  if (keyDownDuration < THRESHOLD1) {
    return 1;
  } else if (keyDownDuration < THRESHOLD2) {
    return 10;
  } else {
    return 30;
  }
}

function handleBtnPress(btn, cb) {
  setTimeout(() => {
    if (btn.read()) {
      if (resetLastReleaseTimeTimeout)
        clearTimeout(resetLastReleaseTimeTimeout);
      cb();
    } else {
      resetLastReleaseTimeTimeout = setTimeout(() => {
        lastReleaseTime = Date.now();
      }, 1000);
    }
  }, DEBOUNCE);
}

function increaseTimer() {
  if (state === "started") return;
  if (DEBUG) console.log("increase");
  const delta = getDelta();
  counter += delta;
  if (state === "unset") {
    state = "set";
  }
  draw();
  g.flip();
  handleBtnPress(BTN5, increaseTimer);
}

function decreaseTimer() {
  if (state === "started") return;
  if (DEBUG) console.log("decrease");
  const delta = getDelta();
  counter = Math.max(0, counter - delta);
  draw();
  g.flip();
  handleBtnPress(BTN4, decreaseTimer);
}

function startTimer() {
  setValue = counter;
  countDown();
  counterInterval = setInterval(countDown, 1000);
}

let state = "unset"; // -> set -> started -> set
const stateMap = {
  unset: () => {},
  set: () => {
    state = "started";
    startTimer();
  },
  started: () => {
    state = "set";
    reset(setValue);
  }
};

function changeState() {
  if (DEBUG) console.log("changeState", state);
  stateMap[state]();
}

function reset(value) {
  if (DEBUG) console.log("reset");
  counter = value;
  clearIntervals();
  draw();
}

reset(0);

clearWatch();
setWatch(changeState, BTN1, { debounce: 1000, repeat: true, edge: "falling" });
setWatch(decreaseTimer, BTN4, {
  debounce: DEBOUNCE,
  repeat: true
});
setWatch(increaseTimer, BTN5, {
  debounce: DEBOUNCE,
  repeat: true
});

E.showMessage(
  "Tap right, time UP\n\nleft time DOWN,\n\n BTN1 to start/stop",
  APP_TITLE
);
