// Time Viz - Visual timer with radial countdown display
// Helps with time blindness, especially for people with ADHD

const SCREEN_WIDTH = g.getWidth();
const SCREEN_HEIGHT = g.getHeight();
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = SCREEN_HEIGHT / 2;
const RADIUS = 70;

// Load settings
let settings = require("Storage").readJSON("timeviz.settings.json", true) || {};
if (!settings.duration) settings.duration = 25; // Default 25 minutes (Pomodoro)

let timerDuration = settings.duration * 60; // Convert to seconds
let timeRemaining = timerDuration;
let timerRunning = false;
let timerInterval = null;

// Draw the radial timer visualization
function drawTimer() {
  // Clear the app area (preserve widgets at top)
  g.reset().clearRect(Bangle.appRect);

  // Calculate the angle for time remaining
  // Start at top (270 degrees / -90 in radians) and sweep clockwise
  const percentRemaining = timeRemaining / timerDuration;
  const sweepAngle = percentRemaining * 2 * Math.PI;

  // Draw outer circle (border)
  g.setColor("#FFFFFF");
  g.drawCircle(CENTER_X, CENTER_Y, RADIUS);

  // Draw the remaining time as a filled arc (red for high contrast)
  if (percentRemaining > 0) {
    g.setColor("#FF0000"); // Red for high contrast

    // Fill the arc from top going clockwise
    // We need to draw a filled pie slice
    // Start angle: -90 degrees (top of circle)
    // End angle: -90 + (percentRemaining * 360)

    const startAngle = -Math.PI / 2; // -90 degrees (top)
    const endAngle = startAngle + sweepAngle;

    // Draw filled arc using fillPoly
    const segments = Math.max(20, Math.floor(sweepAngle * 20)); // More segments for smoother arc
    const coords = [CENTER_X, CENTER_Y]; // Start at center

    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (i / segments) * sweepAngle;
      coords.push(CENTER_X + RADIUS * Math.cos(angle));
      coords.push(CENTER_Y + RADIUS * Math.sin(angle));
    }

    g.fillPoly(coords);
  }

  // Draw center text with time remaining
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const timeText = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

  g.setColor("#FFFFFF");
  g.setFont("Vector", 32);
  g.setFontAlign(0, 0);
  g.drawString(timeText, CENTER_X, CENTER_Y);

  // Draw status text at bottom
  g.setFont("Vector", 16);
  g.setFontAlign(0, 0);

  if (timerRunning) {
    g.drawString("Running", CENTER_X, CENTER_Y + 50);
    g.drawString("Tap to pause", CENTER_X, CENTER_Y + 70);
  } else if (timeRemaining === 0) {
    g.drawString("Time's up!", CENTER_X, CENTER_Y + 50);
    g.drawString("Tap to reset", CENTER_X, CENTER_Y + 70);
  } else if (timeRemaining === timerDuration) {
    g.drawString("Ready", CENTER_X, CENTER_Y + 50);
    g.drawString("Tap to start", CENTER_X, CENTER_Y + 70);
  } else {
    g.drawString("Paused", CENTER_X, CENTER_Y + 50);
    g.drawString("Tap to resume", CENTER_X, CENTER_Y + 70);
  }

  // Draw duration indicator at top
  g.setFont("Vector", 14);
  g.drawString(settings.duration + " min timer", CENTER_X, 30);
}

// Start the timer
function startTimer() {
  if (timeRemaining <= 0) return;

  timerRunning = true;

  timerInterval = setInterval(function() {
    if (timeRemaining > 0) {
      timeRemaining--;
      drawTimer();

      // Timer complete
      if (timeRemaining === 0) {
        stopTimer();
        // Vibrate to alert user
        Bangle.buzz(500).then(() => {
          return new Promise(resolve => setTimeout(resolve, 200));
        }).then(() => {
          return Bangle.buzz(500);
        });
      }
    }
  }, 1000);

  drawTimer();
}

// Stop the timer
function stopTimer() {
  timerRunning = false;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  drawTimer();
}

// Reset the timer
function resetTimer() {
  stopTimer();
  timeRemaining = timerDuration;
  drawTimer();
}

// Handle touch events
function handleTouch(button, xy) {
  if (timerRunning) {
    // Pause if running
    stopTimer();
  } else if (timeRemaining === 0) {
    // Reset if complete
    resetTimer();
  } else {
    // Start if paused or ready
    startTimer();
  }
}

// Handle button press - go back to launcher
function handleButton(n) {
  // Clean up
  stopTimer();
  // Return to launcher
  load();
}

// Set up UI
Bangle.setUI({
  mode: "custom",
  touch: handleTouch,
  btn: handleButton,
  remove: function() {
    // Clean up on exit
    if (timerInterval) {
      clearInterval(timerInterval);
    }
  }
});

// Load and draw widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

// Initial draw
drawTimer();
