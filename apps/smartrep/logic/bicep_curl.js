// === Bicep Curl Rep Counter for Bangle.js 1 ===

// ==== Configuration ====
const POLLING_INTERVAL = 40;     // ~25Hz sampling
const THRESHOLD_UP = 0.85;       // Detected upward motion (from dataset)
const THRESHOLD_DOWN = 0.35;     // Detected downward motion (from dataset)
const MIN_REP_INTERVAL = 500;    // Minimum 0.5 sec between reps

// ==== State Variables ====
let repCount = 0;
let inCurl = false;
let lastRepTime = 0;
let tracking = false;

// ==== UI Functions ====
function drawStatus() {
  g.clearRect(0, 40, 240, 120);
  g.setFont("6x8", 3);
  g.drawString("Reps: " + repCount, 20, 60);
  g.setFont("6x8", 2);
  g.drawString(inCurl ? "Up" : "Down", 100, 100);
}

function showStartScreen() {
  g.clear();
  g.setFont("6x8", 2);
  g.drawString("Bicep Curl Tracker", 10, 10);
  drawStatus();
}

function showStopScreen() {
  g.clear();
  g.setFont("6x8", 2);
  g.drawString("Tracking Stopped", 20, 60);
}

// ==== Accelerometer Handler ====
function onAccel(data) {
  let z = data.z;
  let now = getTime() * 1000;

  if (!inCurl && z > THRESHOLD_UP) {
    inCurl = true;
  }

  if (inCurl && z < THRESHOLD_DOWN && (now - lastRepTime > MIN_REP_INTERVAL)) {
    repCount++;
    lastRepTime = now;
    inCurl = false;
    drawStatus();
  }
}

// ==== Control Functions ====
function startTracking() {
  if (tracking) return;
  tracking = true;
  repCount = 0;
  inCurl = false;
  showStartScreen();
  Bangle.setPollInterval(POLLING_INTERVAL);
  Bangle.on('accel', onAccel);
  Bangle.setLCDPower(1);
}

function stopTracking() {
  if (!tracking) return;
  tracking = false;
  Bangle.removeListener('accel', onAccel);
  showStopScreen();
}

function resetReps() {
  repCount = 0;
  drawStatus();
}

// ==== Button Bindings ====
setWatch(startTracking, BTN1, { repeat: true, edge: "rising" });
setWatch(stopTracking,  BTN2, { repeat: true, edge: "rising" });
setWatch(resetReps,      BTN3, { repeat: true, edge: "rising" });

// ==== Init Display ====
g.clear();
g.setFont("6x8", 2);
g.drawString("Press BTN1 to Start", 10, 50);
