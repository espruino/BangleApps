// === Push-Up Detector for Bangle.js 1 ===

// === Configuration ===
const POLLING_INTERVAL = 40;     // Check accelerometer every 40ms (~25Hz)
const WINDOW_DURATION = 2000;    // Analyze 2 seconds of motion data

// === Variables ===
let samples = []; // Stores recent accelerometer data

// === Show title ===
function showHeader() {
  g.clear();
  g.setFont("6x8", 2);
  g.drawString("Push-Up Detector", 10, 10);
}

// === Show current state (push-up or rest) ===
function showPrediction(text) {
  g.clearRect(0, 40, 240, 100);
  g.setFont("6x8", 3);
  g.drawString(text, 20, 50);
}

// === Extract average Z-axis acceleration ===
function computeFeatures(samples) {
  let sumZ = samples.reduce((sum, s) => sum + s.z, 0);
  let az_mean = sumZ / samples.length;
  return { az_mean };
}

// === Classify motion as push-up or rest based on Z-axis average ===
function classify(features) {
  return features.az_mean <= -0.34885 ? 1 : 0;  // 1 = push-up, 0 = rest
}

// === Handle new accelerometer data ===
function onAccel(data) {
  let t = getTime();
  samples.push({ t: t, z: data.z });

  // Keep only the last 2 seconds of samples
  samples = samples.filter(s => t - s.t <= WINDOW_DURATION / 1000);

  // Classify if enough data is collected
  if (samples.length >= 10) {
    let features = computeFeatures(samples);
    let result = classify(features);
    showPrediction(result === 1 ? "Push-Up!" : "Resting");
  }
}

// === Start Tracking ===
showHeader();
Bangle.setPollInterval(POLLING_INTERVAL);
Bangle.on('accel', onAccel);

// === Stop Tracking on BTN1 ===
setWatch(() => {
  Bangle.removeListener('accel', onAccel);
  g.clear();
  g.setFont("6x8", 2);
  g.drawString("Stopped", 30, 60);
}, BTN1, { repeat: false, edge: "rising" });
