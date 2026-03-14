// === SR Squat Tracker for Bangle.js 1 ===
// Uses real-time Z-axis acceleration to detect squats based on downward and upward motion.

// === State Variables ===
let reps = 0;           // Total reps counted
let running = false;    // Whether tracking is active
let inDown = false;     // Whether user is currently in downward squat motion

// === Show Initial Splash Screen ===
function showSplash() {
  g.clear();
  g.setFont("6x8", 2);
  g.drawString("SR Fitness", 60, 30);
  g.setFont("Vector", 20);
  g.drawString("Squats", 75, 60);
  g.setFont("6x8", 1);
  g.drawString("BTN2: Start", 65, 110);
  drawButtons();
}

// === Assign Buttons ===
function drawButtons() {
  setWatch(startSquatTracking, BTN2, { repeat: false, edge: "rising" });
  setWatch(stopTracking,       BTN1, { repeat: false, edge: "rising" });
}

// === Start Tracking Squats ===
function startSquatTracking() {
  reps = 0;
  inDown = false;
  running = true;
  Bangle.setPollInterval(40); // ~25Hz
  Bangle.on('accel', onSquat);
  showStatus();
}

// === Stop Tracking Squats ===
function stopTracking() {
  running = false;
  Bangle.removeAllListeners('accel');
  g.clear();
  g.setFont("6x8", 2);
  g.drawString("Tracking Stopped", 20, 60);
  g.drawString("BTN2: Restart", 30, 90);
  drawButtons();
}

// === Accelerometer Handler ===
function onSquat(a) {
  if (!running) return;
  let z = a.z;

  // Detect transition: down → up = one rep
  if (z < -1.2) {
    inDown = true;
  } else if (z > -0.8 && inDown) {
    reps++;
    inDown = false;
    showStatus();
  }
}

// === Display Rep Count ===
function showStatus() {
  g.clear();
  g.setFont("6x8", 2);
  g.drawString("Squats Tracker", 20, 10);
  g.drawString("Reps: " + reps, 20, 40);
  g.drawString("BTN1: Stop", 20, 100);
}

// === Initialize App ===
showSplash();
