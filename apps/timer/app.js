let state = "unset"; // -> set -> started -> set
let counter = 0;
let setValue = 0;
let counterInterval;
let buzzInterval;
let btn4WatchId;
let btn5WatchId;

const APP_TITLE = "TIMER";
const DEBOUNCE = 50;

function buzzAndBeep() {
  Bangle.buzz(1e3, 1).then(() => {
    Bangle.beep(200, 4000);
  });
}

function outOfTime() {
  if (counterInterval) return;
  E.showMessage("Time's up\n\nBTN2 to reset", APP_TITLE);
  buzzAndBeep();
  buzzInterval = setInterval(buzzAndBeep, 5000);
}

function draw() {
  const minutes = Math.floor(counter / 60);
  const seconds = counter - minutes * 60;
  const seconds2Digits = seconds < 10 ? `0${seconds}` : seconds.toString();
  g.clear();
  g.setFontAlign(0, 0); // center font
  g.setFont("6x8", 8); // vector font, 80px
  // draw the current counter value
  g.drawString(`${minutes}:${seconds2Digits}`, 120, 120);
  // optional - this keeps the watch LCD lit up
  g.flip();
}

function countDown() {
  if (counter <= 0) {
    if (counterInterval) {
      clearInterval(counterInterval);
      counterInterval = undefined;
    }
    outOfTime();
    return;
  }

  counter--;

  draw();
}

function startTimer() {
  if (!counterInterval) {
    stopTouchWatch();
    countDown();
    counterInterval = setInterval(countDown, 1000);
  }
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

function getDelta() {
  if (counter < 30) {
    return 1;
  } else if (counter < 60) {
    return 5;
  } else {
    return 10;
  }
}

function increaseTimer(d) {
  const delta = typeof d === "number" ? d : getDelta();
  counter += delta;
  setValue = counter;
  if (state === "unset") {
    state = "set";
  }
  draw();
  setTimeout(() => {
    if (BTN5.read()) {
      increaseTimer();
    }
  }, DEBOUNCE);
}

function decreaseTimer(d) {
  const delta = typeof d === "number" ? d : getDelta();
  counter = Math.max(0, counter - delta);
  setValue = counter;
  draw();
  setTimeout(() => {
    if (BTN4.read()) {
      decreaseTimer();
    }
  }, DEBOUNCE);
}

function reset(value) {
  counter = value;
  setTouchWatch();
  clearIntervals();
  draw();
}

function handleBtn2() {
  if (state === "unset") {
    return;
  } else if (state === "set") {
    state = "started";
    startTimer();
  } else if (state === "started") {
    state = "set";
    reset(setValue);
  }
}

function setTouchWatch() {
  btn4WatchId = setWatch(decreaseTimer, BTN4, { debounce: DEBOUNCE, repeat: true });
  btn5WatchId = setWatch(increaseTimer, BTN5, { debounce: DEBOUNCE, repeat: true });
}

function stopTouchWatch() {
  if (btn4WatchId) {
    clearWatch(btn4WatchId);
    btn4WatchId = undefined;
  }
  if (btn5WatchId) {
    clearWatch(btn5WatchId);
    btn5WatchId = undefined;
  }
}


setWatch(handleBtn2, BTN2, { debounce: 500, repeat: true, edge: "falling" });

setWatch(() => decreaseTimer(1), BTN1, { debounce: DEBOUNCE, repeat: true });

setWatch(() => increaseTimer(1), BTN3, { debounce: DEBOUNCE, repeat: true });

reset(0);

E.showMessage("Tap right, time UP\n\nleft time DOWN", APP_TITLE);
