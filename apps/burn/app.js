/*
 * Burn: Calories Counter for Bangle.js (Espruino). Based on the original Counter app.
 * Features:
 * - Persistent counter: saved to a file.
 * - Daily reset: counter resets each day.
 * - Adjustable increment value.
 *
 * Bangle.js 1 Controls:
 * - BTN1: Increase (or tap right)
 * - BTN3: Decrease (or tap left)
 * - Press BTN2: Change increment
 *
 * Bangle.js 2 Controls:
 * - Swipe up: Increase
 * - Swipe down: Decrease
 * - Press BTN: Change increment
 */

// File variable to handle file operations
let file;

// Check if the hardware version is Bangle.js 2
const BANGLEJS2 = process.env.HWVERSION == 2;

// Importing the Storage module for file operations
const Storage = require("Storage");

// File path for the counter data
const PATH = "kcal.txt";

// Function to get the current date as a string
function dayString() {
  const date = new Date();
  // Month is 0-indexed, so we add 1 to get the correct month number
  return `${date.getMonth() + 1}-${date.getDate()}-${date.getFullYear()}`;
}

// Counter object to keep track of the count and the date
let counter = { count: 0, date: dayString() };

// Function to read the counter from the file
function readCounterFromFile() {
  try {
    // Open the file in read mode
    file = Storage.open(PATH, "r");
    let line = file.readLine();

    // If the file has content, parse it and update the counter
    if (line) {
      let splitLine = line.trim().split(",");
      counter = { count: parseInt(splitLine[0]), date: splitLine[1] };
    }
  } catch (err) {
    // If the file does not exist, the counter will remain 0
  }
}

// Function to write the counter to the file
function writeCounterToFile() {
  // Open the file in write mode
  file = Storage.open(PATH, "w");
  // Write the counter and date to the file
  file.write(counter.count.toString() + "," + counter.date + "\n");
}

// Function to reset the counter
function resetCounter() {
  // Reset the counter to 0 and update the date
  counter = { count: 0, date: dayString() };
}

// Function to update the counter value
function updateCounterValue(value) {
  // Update the counter with the new value, ensuring it's not less than 0
  counter = { count: Math.max(0, value), date: dayString() };
}

// Function to update the counter
function updateCounter(value) {
  // If the date has changed, reset the counter
  if (counter.date != dayString()) {
    resetCounter();
  } else {
    // Otherwise, update the counter value
    updateCounterValue(value);
  }

  // Write the updated counter to the file
  writeCounterToFile();
  // Update the screen with the new counter value
  updateScreen();
}

// Function to set a watch on a button to update the counter when pressed
function counterButtonWatch(button, increment) {
  setWatch(
    () => {
      // If the button is for incrementing, or the counter is greater than 0, update the counter
      if (increment || counter.count > 0) {
        updateCounter(
          counter.count + (increment ? getInterval() : -getInterval())
        );
        // Update the screen with the new counter value
        updateScreen();
      }
    },
    button,
    { repeat: true }
  );
}

// Function to create interval functions
const createIntervalFunctions = function () {
  // Array of intervals
  const intervals = [50, 100, 200, 10];
  // Current location in the intervals array
  let location = 0;

  // Function to get the current interval
  const getInterval = function () {
    return intervals[location];
  };

  // Function to rotate the increment
  const rotateIncrement = function () {
    // Update the location to the next index in the intervals array, wrapping around if necessary
    location = (location + 1) % intervals.length;
    // Update the screen with the new increment
    updateScreen();
  };

  // Return the getInterval and rotateIncrement functions
  return { getInterval, rotateIncrement };
};

// Create the interval functions
const intervalFunctions = createIntervalFunctions();
const getInterval = intervalFunctions.getInterval;
const rotateIncrement = intervalFunctions.rotateIncrement;

// Function to update the screen
function updateScreen() {
  // Clear the screen area for the counter
  g.clearRect(0, 50, 250, BANGLEJS2 ? 130 : 150)
    .setBgColor(g.theme.bg)
    .setColor(g.theme.fg)
    .setFont("Vector", 40)
    .setFontAlign(0, 0)
    // Draw the counter value
    .drawString(Math.floor(counter.count), g.getWidth() / 2, 100)
    .setFont("6x8")
    // Clear the screen area for the increment
    .clearRect(g.getWidth() / 2 - 50, 140, g.getWidth() / 2 + 50, 160)
    // Draw the increment value
    .drawString("Increment: " + getInterval(), g.getWidth() / 2, 150);

  // If the hardware version is Bangle.js 1, draw the increment and decrement buttons
  if (!BANGLEJS2) {
    g.drawString("-", 45, 100).drawString("+", 185, 100);
  }
}

// If the hardware version is Bangle.js 2, set up the drag handling and button watch

let drag;

if (BANGLEJS2) {
  // Set up drag handling
  Bangle.on("drag", (e) => {
    // If this is the start of a drag, record the initial coordinates
    if (!drag) {
      drag = { x: e.x, y: e.y };
      return;
    }

    // If the button is still being pressed, ignore this event
    if (e.b) return;

    // Calculate the change in x and y from the start of the drag
    const dx = e.x - drag.x;
    const dy = e.y - drag.y;
    // Reset the drag start coordinates
    drag = null;

    // Determine if the drag is primarily horizontal or vertical
    const isHorizontalDrag = Math.abs(dx) > Math.abs(dy) + 10;
    const isVerticalDrag = Math.abs(dy) > Math.abs(dx) + 10;

    // If the drag is primarily horizontal, ignore it
    if (isHorizontalDrag) {
      return;
    }

    // If the drag is primarily vertical, update the counter
    if (isVerticalDrag) {
      // If the drag is downwards and the counter is greater than 0, decrease the counter
      if (dy > 0 && counter.count > 0) {
        updateCounter(counter.count - getInterval());
      } else if (dy < 0) {
        // If the drag is upwards, increase the counter
        updateCounter(counter.count + getInterval());
      }
      // Update the screen with the new counter value
      updateScreen();
    }
  });

  // Set a watch on the button to rotate the increment when pressed
  setWatch(rotateIncrement, BTN1, { repeat: true });
} else {
  // If the hardware version is Bangle.js 1, set up the button watches

  // Set watch on button to increase the counter
  counterButtonWatch(BTN1, true);
  counterButtonWatch(BTN5, true); // screen tap
  // Set watch on button to decrease the counter
  counterButtonWatch(BTN3, false);
  counterButtonWatch(BTN4, false); // screen tap

  // Set a watch on button to rotate the increment when pressed
  setWatch(
    () => {
      rotateIncrement();
    },
    BTN2,
    { repeat: true }
  );
}

// clear the screen
g.clear();

// Set the background and foreground colors
g.setBgColor(g.theme.bg).setColor(g.theme.fg);

// Load and draw the widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

// Read the counter from the file
readCounterFromFile();
// Update the screen with the counter value
updateScreen();
