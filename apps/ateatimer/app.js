// Tea Timer Application for Bangle.js 2
let timerDuration = (() => {
  let file = require("Storage").open("ateatimer.data", "r");
  let data = file.read(4); // Assuming 4 bytes for storage
  return data ? parseInt(data, 10) : 4 * 60; // Default to 4 minutes
})(); 
let timeRemaining = timerDuration;
let timerRunning = false;
let buzzInterval = null; // Interval for buzzing when timer reaches 0
let timerInterval = null; // Interval for timer countdown

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
  timerRunning = true;

  // Save the default duration on timer start
  timerDuration = timeRemaining;
  saveDefaultDuration();

  timerInterval = setInterval(() => {
    timeRemaining--;
    drawTime();

    if (timeRemaining === 0 && !buzzInterval) {
      // Start continuous vibration when timer reaches 0
      buzzInterval = setInterval(() => Bangle.buzz(500), 1000);
    }
  }, 1000);
}

function resetTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerRunning = false;
  timeRemaining = timerDuration;
  stopBuzzing();
  drawTime();
}

function stopBuzzing() {
  if (buzzInterval) {
    clearInterval(buzzInterval);
    buzzInterval = null;
  }
}

function adjustTime(amount) {
  if (!timerRunning) {
    timeRemaining += amount;
    timeRemaining = Math.floor(timeRemaining / 60) * 60; // Round to full minutes
  } else {
    timeRemaining += amount; // Allow adjustments during running
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

// Handle physical button press for resetting timer
setWatch(() => {
  resetTimer();
}, BTN1, { repeat: true, edge: "falling" });

// Handle touch
Bangle.on("touch", (zone, xy) => {
  handleTouch(xy.x, xy.y, false);
});

// Draw the initial timer display
drawTime();

