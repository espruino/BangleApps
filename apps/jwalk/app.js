// === Utility Functions ===
function formatTime(seconds) {
  let mins = Math.floor(seconds / 60);
  let secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

function getTimeStr() {
  let d = new Date();
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function updateCachedLeftTime() {
  cachedLeftTime = "Left: " + formatTime(state.remainingTotal);
}

// === Constants ===
const FILE = "jwalk.json";
const DEFAULTS = {
  totalDuration: 30,
  intervalDuration: 3,
  startMode: 0,
  modeBuzzerDuration: 1000,
  finishBuzzerDuration: 1500,
  showClock: 1,
  updateWhileLocked: 0
};

// === Settings and State ===
let settings = require("Storage").readJSON(FILE, 1) || DEFAULTS;

let state = {
  remainingTotal: settings.totalDuration * 60,
  intervalDuration: settings.intervalDuration * 60,
  remainingInterval: 0,
  intervalEnd: 0,
  paused: false,
  currentMode: settings.startMode === 1 ? "Intense" : "Relax",
  finished: false,
  forceDraw: false,
};

let cachedLeftTime = "";
let lastMinuteStr = getTimeStr();
let drawTimerInterval;

// === UI Rendering ===
function drawUI() {
  let y = Bangle.appRect.y + 8;
  g.reset().setBgColor(g.theme.bg).clearRect(Bangle.appRect);
  g.setColor(g.theme.fg);

  let displayInterval = state.paused
    ? state.remainingInterval
    : Math.max(0, Math.floor((state.intervalEnd - Date.now()) / 1000));

  g.setFont("Vector", 40);
  g.setFontAlign(0, 0);
  g.drawString(formatTime(displayInterval), g.getWidth() / 2, y + 70);

  let cy = y + 100;
  if (state.paused) {
    g.setFont("Vector", 15);
    g.drawString("PAUSED", g.getWidth() / 2, cy);
  } else {
    let cx = g.getWidth() / 2;
    g.setColor(g.theme.accent || g.theme.fg2 || g.theme.fg);
    if (state.currentMode === "Relax") {
      g.fillCircle(cx, cy, 5);
    } else {
      g.fillPoly([
        cx, cy - 6,
        cx - 6, cy + 6,
        cx + 6, cy + 6
      ]);
    }
    g.setColor(g.theme.fg);
  }

  g.setFont("6x8", 2);
  g.setFontAlign(0, -1);
  g.drawString(state.currentMode, g.getWidth() / 2, y + 15);
  g.drawString(cachedLeftTime, g.getWidth() / 2, cy + 15);

  if (settings.showClock) {
    g.setFontAlign(1, 0);
    g.drawString(lastMinuteStr, g.getWidth() - 4, y);
  }
  g.flip();
}

// === Workout Logic ===
function toggleMode() {
  state.currentMode = state.currentMode === "Relax" ? "Intense" : "Relax";
  Bangle.buzz(settings.modeBuzzerDuration);
  state.forceDraw = true;
}

function startNextInterval() {
  if (state.remainingTotal <= 0) {
    finishWorkout();
    return;
  }

  state.remainingInterval = Math.min(state.intervalDuration, state.remainingTotal);
  state.remainingTotal -= state.remainingInterval;
  updateCachedLeftTime();
  state.intervalEnd = Date.now() + state.remainingInterval * 1000;
  state.forceDraw = true;
}

function togglePause() {
  if (state.finished) return;

  if (!state.paused) {
    state.remainingInterval = Math.max(0, Math.floor((state.intervalEnd - Date.now()) / 1000));
    state.paused = true;
  } else {
    state.intervalEnd = Date.now() + state.remainingInterval * 1000;
    state.paused = false;
  }
  drawUI();
}

function finishWorkout() {
  clearInterval(drawTimerInterval);
  Bangle.buzz(settings.finishBuzzerDuration);
  state.finished = true;

  setTimeout(() => {
    g.clear();
    g.setFont("Vector", 30);
    g.setFontAlign(0, 0);
    g.drawString("Well done!", g.getWidth() / 2, g.getHeight() / 2);
    g.flip();

    const exitHandler = () => {
      Bangle.removeListener("touch", exitHandler);
      Bangle.removeListener("btn1", exitHandler);
      load(); // Exit app
    };

    Bangle.on("touch", exitHandler);
    setWatch(exitHandler, BTN1, { repeat: false });
  }, 500);
}

// === Timer Tick ===
function tick() {
  if (state.finished) return;

  const currentMinuteStr = getTimeStr();
  if (currentMinuteStr !== lastMinuteStr) {
    lastMinuteStr = currentMinuteStr;
    state.forceDraw = true;
  }

  if (!state.paused && (state.intervalEnd - Date.now()) / 1000 <= 0) {
    toggleMode();
    startNextInterval();
    return;
  }

  if (state.forceDraw || settings.updateWhileLocked || !Bangle.isLocked()) {
    drawUI();
    state.forceDraw = false;
  }
}

// === Initialization ===
Bangle.on("touch", togglePause);
Bangle.loadWidgets();
Bangle.drawWidgets();

updateCachedLeftTime();
startNextInterval();
drawUI();
drawTimerInterval = setInterval(tick, 1000);