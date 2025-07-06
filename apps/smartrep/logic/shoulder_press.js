// === Shoulder Press Rep Counter for Bangle.js 1 ===

// === Configurable Parameters ===
var alpha = 0.2;             // Smoothing factor for EMA (Exponential Moving Average)
var windowSize = 20;         // Number of recent EMA values to track (sliding window)
var minRepTime = 300;        // Minimum time (ms) between rep phases
var minAmplitude = 15;       // Minimum angle swing (degrees) to count a valid rep

// === State Variables ===
var ema = null;              // Current smoothed angle
var win = [];                // Sliding window of recent EMA values
var repCount = 0;            // Number of reps counted
var state = "down";          // Current movement state
var lastPeakT = 0, lastValleyT = 0;   // Timestamps of last peak/valley
var lastPeakV = 0, lastValleyV = 0;   // EMA values at last peak/valley
var accelListener = null;            // Handle to accelerometer listener

// === UI Display ===
function showMessage(msg, big) {
  big = !!big;
  g.clear();
  g.setFont(big ? "Vector" : "6x8", big ? 40 : 1);
  g.setFontAlign(0, 0);
  var lines = msg.split("\n");
  var y = (g.getHeight() / 2) - (lines.length * 10 / 2);
  lines.forEach(function(line, i) {
    g.drawString(line, g.getWidth() / 2, y + i * 10);
  });
}

function showCount() {
  showMessage("Reps: " + repCount, false);
}

// === Start Tracking ===
function startSession() {
  repCount = 0;
  ema = null;
  state = "down";
  lastPeakT = lastValleyT = (getTime() * 1000) | 0;
  lastPeakV = lastValleyV = 0;
  win = [];

  showMessage("Get Ready", true);
  setTimeout(() => showMessage("Go!", true), 500);

  accelListener = Bangle.on("accel", function(a) {
    var angle = Math.atan2(a.x, a.z) * 180 / Math.PI;
    if (ema === null) ema = angle;
    ema = alpha * angle + (1 - alpha) * ema;

    win.push(ema);
    if (win.length > windowSize) win.shift();

    var mx = win[0], mn = win[0], sum = 0;
    win.forEach(function(v) {
      if (v > mx) mx = v;
      if (v < mn) mn = v;
      sum += v;
    });

    var mean = sum / win.length;
    var upTh = mean + 0.3 * (mx - mn);
    var downTh = mean - 0.3 * (mx - mn);

    var now = (getTime() * 1000) | 0;
    if (state === "down" && ema > upTh && now - lastValleyT > minRepTime) {
      state = "up";
      lastPeakT = now; lastPeakV = ema;
    } else if (state === "up" && ema < downTh && now - lastPeakT > minRepTime) {
      state = "down";
      lastValleyT = now; lastValleyV = ema;
      var amp = Math.abs(lastPeakV - lastValleyV);
      if (amp >= minAmplitude) {
        repCount++;
        showCount();
      }
    }
  });
}

// === Stop Tracking ===
function stopSession() {
  if (accelListener) {
    Bangle.removeListener("accel", accelListener);
    accelListener = null;
  }
  showMessage("Stopped\nReps: " + repCount, true);
}

// === Setup Buttons and Initial UI ===
Bangle.loadWidgets();
Bangle.drawWidgets();
setWatch(startSession, BTN1, { repeat: false, edge: "rising" });
setWatch(stopSession, BTN2, { repeat: false, edge: "rising" });
showMessage("BTN1=Start\nBTN2=Stop", false);
