// Tea Timer Application for Bangle.js 2 using sched library

let timerDuration = (() => {
  let file = require("Storage").open("ateatimer.data", "r");
  let data = file.read(4); // Assuming 4 bytes for storage
  return data ? parseInt(data, 10) : 4 * 60; // Default to 4 minutes
})();
let timeRemaining = timerDuration;
let timerRunning = false;

function saveDefaultDuration() {
  let file = require("Storage").open("ateatimer.data", "w");
  file.write(timerDuration.toString());
}

function drawTime() {
  g.clear();
  g.setFont("Vector", 40);
  g.setFontAlign(0, 0); // Center align

  const minutes = Math.floor(Math.abs(timeRemaining) / 60);
  const seconds = Math.abs(timeRemaining) % 60;
  const sign = timeRemaining < 0 ? "-" : "";
  const timeStr = `${sign}${minutes}:${seconds.toString().padStart(2, '0')}`;

  g.drawString(timeStr, g.getWidth() / 2, g.getHeight() / 2);

  // Draw Increase button (triangle pointing up)
  g.fillPoly([
    g.getWidth() / 2, g.getHeight() / 2 - 80, // Top vertex
    g.getWidth() / 2 - 20, g.getHeight() / 2 - 60, // Bottom-left vertex
    g.getWidth() / 2 + 20, g.getHeight() / 2 - 60  // Bottom-right vertex
  ]);

  // Draw Decrease button (triangle pointing down)
  g.fillPoly([
    g.getWidth() / 2, g.getHeight() / 2 + 80, // Bottom vertex
    g.getWidth() / 2 - 20, g.getHeight() / 2 + 60, // Top-left vertex
    g.getWidth() / 2 + 20, g.getHeight() / 2 + 60  // Top-right vertex
  ]);

  g.flip();
}

function startTimer() {
  if (timerRunning) return;
  if (timeRemaining == 0) return;
  timerRunning = true;

  // Save the default duration on timer start
  timerDuration = timeRemaining;
  saveDefaultDuration();
  scheduleTimer();

  // Start the secondary timer to update the display
  setInterval(updateDisplay, 1000);
}

function scheduleTimer() {
  // Schedule a new timer using the sched library
  require("sched").setAlarm("ateatimer", {
    msg: "Tea is ready!",
    timer: timeRemaining * 1000, // Convert to milliseconds
    vibrate: ".." // Default vibration pattern
  });

  // Ensure the scheduler updates
  require("sched").reload();
}

function resetTimer() {
  // Cancel the existing timer
  require("sched").setAlarm("ateatimer", undefined);
  require("sched").reload();

  timerRunning = false;
  timeRemaining = timerDuration;
  drawTime();
}

function adjustTime(amount) {
  if (-amount > timeRemaining) {
    // Return if result will be negative
    return;
  }
  timeRemaining += amount;
  timeRemaining = Math.max(0, timeRemaining); // Ensure time doesn't go negative
  if (timerRunning) {
    // Update the existing timer with the new remaining time
    let alarm = require("sched").getAlarm("ateatimer");
    if (alarm) {
      // Cancel the current alarm
      require("sched").setAlarm("ateatimer", undefined);
      
      // Set a new alarm with the updated time
      scheduleTimer();
    }
  }

  drawTime();
}

function handleTouch(x, y) {
  const centerY = g.getHeight() / 2;

  if (y < centerY - 40) {
    // Increase button area
    adjustTime(60);
  } else if (y > centerY + 40) {
    // Decrease button area
    adjustTime(-60);
  } else {
    // Center area
    if (!timerRunning) {
      startTimer();
    }
  }
}

// Function to update the display every second
function updateDisplay() {
  if (timerRunning) {
    let alarm = require("sched").getAlarm("ateatimer");
    timeRemaining = Math.floor(require("sched").getTimeToAlarm(alarm) / 1000);
    drawTime();
    if (timeRemaining <= 0) {
      timeRemaining = 0;
      clearInterval(updateDisplay);
      timerRunning = false;
    }
  }
}

// Handle physical button press for resetting timer
setWatch(() => {
  if (timerRunning) {
    resetTimer();
  } else {
    startTimer();
  }
}, BTN1, { repeat: true, edge: "falling" });

// Handle touch
Bangle.on("touch", (zone, xy) => {
  handleTouch(xy.x, xy.y, false);
});

let isRunning = require("sched").getAlarm("ateatimer");
if (isRunning) {
  timerRunning = true;
  // Start the timer to update the display
  setInterval(updateDisplay, 1000);
} else {
  // Draw the initial timer display
  drawTime();
}