const FILE = "teatimer.json";
const DEFAULTS = {
  timerDuration: 150,
  bigJump: 60,
  smallJump: 15,
  finishBuzzDuration: 1500,
  overtimeBuzzDuration: 100,
  overtimeBuzzLimit: 60,
  overtimeBuzzSeconds: 15
};

// Enum for states
const STATES = {
  INIT:     "init",
  RUNNING:  "running",
  PAUSED:   "paused",
  FINISHED: "finished",
  OVERTIME: "overtime"
};

let savedSettings = require("Storage").readJSON(FILE, 1) || {};
let settings = Object.assign({}, DEFAULTS, savedSettings);

let state = STATES.INIT;
let showHelp = false;

let startTime = 0;
let remaining = settings.timerDuration;
let target = 0;

let drag = null;
let dragAdjusted = false;
let lastTapTime = 0;

// === Helpers ===
function formatTime(s) {
  let m = Math.floor(s / 60);
  let sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function getTimeStr() {
  let d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function isState(s) {
  return state === s;
}

function setState(s) {
  state = s;
}

// === UI Drawing ===
function drawUI() {
  g.reset();
  g.setBgColor(g.theme.bg).clear();
  g.setColor(g.theme.fg);
  let cx = g.getWidth() / 2;

  // Time (top right)
  g.setFont("6x8", 2);
  g.setFontAlign(1, 0);
  g.drawString(getTimeStr(), g.getWidth() - 4, 10);

  // Help text
  if (showHelp) {
    g.setFontAlign(0, 0);
    g.setFont("Vector", 15);
    g.drawString(
        `Swipe up/down: ±${settings.bigJump}s\nSwipe left/right: ±${settings.smallJump}s\n\nBTN1: Start/Pause\nDouble Tap: Hide Help`,
        cx, 80
    );
    return;
  }

  // Title
  g.setFont("Vector", 20);
  g.setFontAlign(0, 0);
  let label = (isState(STATES.OVERTIME)) ? "Time's Up!" : "Tea Timer";
  g.drawString(label, cx, 40);

  // Time remaining / overtime
  g.setFont("Vector", 60);
  g.setColor(isState(STATES.OVERTIME) ? "#f00" : g.theme.fg);
  g.drawString(formatTime(remaining), cx, 100);

  // Bottom state text
  g.setFontAlign(0, 0);
  if (isState(STATES.PAUSED)) {
    g.setFont("6x8", 2);
    g.drawString("paused", cx, g.getHeight() - 20);
  } else if (!isState(STATES.RUNNING) && !isState(STATES.OVERTIME)) {
    g.setFont("Vector", 13);
    g.drawString("double tap for help", cx, g.getHeight() - 20);
  }
}

// === Timer Logic ===
function startTimer() {
  setState(STATES.RUNNING);
  startTime = Date.now();
  target = startTime + remaining * 1000;
}

function pauseTimer() {
  if (isState(STATES.RUNNING)) {
    remaining = Math.max(0, Math.ceil((target - Date.now()) / 1000));
    setState(STATES.PAUSED);
  }
}

function resumeTimer() {
  if (isState(STATES.PAUSED)) {
    startTime = Date.now();
    target = startTime + remaining * 1000;
    setState(STATES.RUNNING);
  }
}

function resetTimer() {
  setState(STATES.INIT);
  remaining = settings.timerDuration;
}

function tick() {
  if (isState(STATES.RUNNING)) {
    remaining -= 1;
    if (remaining <= 0) {
      remaining = 0;
      setState(STATES.OVERTIME);
      startTime = Date.now();
      remaining = 0; // Start overtime count-up from 0
      Bangle.buzz(settings.finishBuzzDuration);
    }
  } else if (isState(STATES.OVERTIME)) {
    remaining += 1;
    if (remaining <= settings.overtimeBuzzSeconds) {
      Bangle.buzz(settings.overtimeBuzzDuration, 0.3);
    }
    if (remaining >= settings.overtimeBuzzLimit) {
      resetTimer(); // Stop overtime after max duration
    }
  }
  drawUI();
}

// === UI Controls ===
function toggleTimer() {
  if (showHelp) {
    showHelp = false;
  } else if (isState(STATES.OVERTIME)) {
    resetTimer();
  } else if (isState(STATES.INIT)) {
    startTimer();
  } else if (isState(STATES.PAUSED)) {
    resumeTimer();
  } else if (isState(STATES.RUNNING)) {
    pauseTimer();
  }

  drawUI();
}

function handleDoubleTap() {
  if (isState(STATES.INIT)) {
    let now = Date.now();
    if (now - lastTapTime < 400) {
      showHelp = !showHelp;
      drawUI();
    }
    lastTapTime = now;
  }
}

function adjustTimer(diff) {
  if (isState(STATES.INIT)) {
    remaining = Math.max(5, remaining + diff);
    settings.timerDuration = remaining;
    drawUI();
  }
}

function handleDrag(e) {
  if (isState(STATES.INIT) && !showHelp) {
    if (e.b) {
      if (!drag) {
        drag = { x: e.x, y: e.y };
        dragAdjusted = false;
      } else if (!dragAdjusted) {
        let dx = e.x - drag.x;
        let dy = e.y - drag.y;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > settings.smallJump) {
          adjustTimer(dx > 0 ? settings.smallJump : -settings.smallJump);
          dragAdjusted = true;
        } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > settings.bigJump) {
          adjustTimer(dy > 0 ? -settings.bigJump : settings.bigJump);
          dragAdjusted = true;
        }
      }
    } else {
      drag = null;
      dragAdjusted = false;
    }
  }
}

// === Init App ===
setWatch(toggleTimer, BTN1, { repeat: true });
Bangle.on("drag", handleDrag);
Bangle.on("touch", handleDoubleTap);

resetTimer();
drawUI();
setInterval(tick, 1000);
