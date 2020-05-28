let counter = 0;
let setValue = 0;
let counterInterval;
let state;
let saved = require("Storage").readJSON("simpletimer.json",true) || {};

const DEBOUNCE = 50;

function buzzAndBeep() {
  return Bangle.buzz(1000, 1)
    .then(() => Bangle.beep(200, 3000))
    .then(() => setTimeout(buzzAndBeep, 5000));
}

function outOfTime() {
  g.clearRect(0, 0, 220, 70);
  g.setFontAlign(0, 0);
  g.setFont("6x8", 3);
  g.drawString("Time UP!", 120, 50);
  counter = setValue;
  buzzAndBeep();
  setInterval(() => {
    g.clearRect(0, 70, 220, 160);
    setTimeout(draw, 200);
  }, 400);
  state = "stopped";
}

function draw() {
  const minutes = Math.floor(counter / 60);
  const seconds = Math.floor(counter % 60);
  const seconds2Digits = seconds < 10 ? `0${seconds}` : seconds.toString();
  g.clearRect(0, 70, 220, 160);
  g.setFontAlign(0, 0);
  g.setFont("6x8", 7);
  g.drawString(
    `${minutes < 10 ? "0" : ""}${minutes}:${seconds2Digits}`,
    120,
    120
  );
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

function clearIntervals() {
  clearInterval();
  counterInterval = undefined;
}

function set(delta) {
  if (state === "started") return;
  counter += delta;
  saved.counter = counter;
  require("Storage").write("simpletimer.json", saved);
  if (state === "unset") {
    state = "set";
  }
  draw();
  g.flip();
}

function startTimer() {
  setValue = counter;
  countDown();
  counterInterval = setInterval(countDown, 1000);
}

// unset -> set -> started -> -> stopped -> set
const stateMap = {
  set: () => {
    state = "started";
    startTimer();
  },
  started: () => {
    reset(setValue);
  },
  stopped: () => {
    reset(setValue);
  }
};

function changeState() {
  if (stateMap[state]) stateMap[state]();
}

function drawLabels() {
  g.clear();
  g.setFontAlign(-1, 0);
  g.setFont("6x8", 7);
  g.drawString(`+  +`, 35, 180);
  g.setFontAlign(0, 0, 3);
  g.setFont("6x8", 1);
  g.drawString(`reset                   (re)start`, 230, 120);
}

function reset(value) {
  clearIntervals();
  counter = value;
  setValue = value;
  drawLabels();
  draw();
  state = value === 0 ? "unset" : "set";
}

function addWatch() {
  clearWatch();
  setWatch(changeState, BTN1, {
    debounce: DEBOUNCE,
    repeat: true,
    edge: "falling"
  });
  setWatch(() => {
    if (state !== "started") {
      Bangle.showLauncher();
    }},
  BTN2,
  {
    repeat: false,
    edge: "falling",
  },
  );
  setWatch(
    () => {
      reset(0);
    },
    BTN3,
    {
      debounce: DEBOUNCE,
      repeat: true,
      edge: "falling"
    }
  );
  setWatch(
    () => {
      set(60);
    },
    BTN4,
    {
      debounce: DEBOUNCE,
      repeat: true,
      edge: "falling"
    }
  );
  setWatch(() => set(1), BTN5, {
    debounce: DEBOUNCE,
    repeat: true,
    edge: "falling"
  });
}
Bangle.on("aiGesture", gesture => {
  if (gesture === "swipeleft" && state === "stopped") reset(0);
});

reset(saved.counter || 0);
addWatch();
