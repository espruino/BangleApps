// === Lateral Arm Raise Rep Counter for Bangle.js 1 ===
// Tracks up-down motion using x-axis and gives feedback on each rep.

// === Display Title ===
g.clear();
g.setFont("6x8", 2);
g.drawString("Lateral Raise Tracker", 10, 10);

// === Configuration ===
let pollingInterval = 40;   // ~25Hz polling rate
let thresholdUp = 0.6;      // X-axis threshold for upward motion
let thresholdDown = 0.2;    // X-axis threshold for downward motion
let minInterval = 600;      // Minimum time between reps (ms)

// === State Variables ===
let repCount = 0;           // Number of reps counted
let inRaise = false;        // Whether arm is currently rising
let lastRepTime = 0;        // Last rep timestamp (ms)
let tracking = false;       // Whether tracking is active

// === Draw Rep Status ===
function drawStatus() {
  g.clearRect(0, 40, 240, 120);
  g.setFont("6x8", 3);
  g.drawString("Reps: " + repCount, 20, 60);
  g.setFont("6x8", 2);
  g.drawString(inRaise ? "Up" : "Down", 100, 100);
}

// === Feedback (Vibration + Optional Beep) ===
function giveFeedback() {
  Bangle.buzz(200);   // 200ms vibration
  Bangle.beep();      // Optional sound
}

// === Accelerometer Handler ===
function onAccel(a) {
  let x = a.x;
  let now = getTime() * 1000;  // Convert to ms

  // Detect upward motion
  if (!inRaise && x > thresholdUp) {
    inRaise = true;
  }

  // Detect downward motion + validate full rep
  if (inRaise && x < thresholdDown && (now - lastRepTime > minInterval)) {
    repCount++;
    lastRepTime = now;
    inRaise = false;
    drawStatus();
    giveFeedback();
  }
}

// === Start Tracking ===
function startTracking() {
  if (tracking) return;
  tracking = true;
  repCount = 0;
  inRaise = false;
  g.clear();
  g.setFont("6x8", 2);
  g.drawString("Lateral Raise Tracker", 10, 10);
  drawStatus();
  Bangle.setPollInterval(pollingInterval);
  Bangle.on('accel', onAccel);
  Bangle.setLCDPower(1);
}

// === Stop Tracking ===
function stopTracking() {
  if (!tracking) return;
  tracking = false;
  Bangle.removeListener('accel', onAccel);
  g.clear();
  g.setFont("6x8", 2);
  g.drawString("Tracking Stopped", 20, 60);
}

// === Button Bindings ===
setWatch(startTracking, BTN1, { repeat: true, edge: "rising" });
setWatch(stopTracking,  BTN2, { repeat: true, edge: "rising" });
setWatch(() => {
  repCount = 0;
  drawStatus();
}, BTN3, { repeat: true, edge: "rising" });
