var Layout = require("Layout");

// Beep Test Data
const BEET_TEST_DATA = [
  { shuttles: 7, timePerShuttle: 9.0, totalTime: 63.0, distancePerLevel: 140 },
  { shuttles: 8, timePerShuttle: 8.0, totalTime: 64.0, distancePerLevel: 160 },
  { shuttles: 8, timePerShuttle: 7.58, totalTime: 60.6, distancePerLevel: 160 },
  { shuttles: 9, timePerShuttle: 7.2, totalTime: 64.8, distancePerLevel: 180 },
  { shuttles: 9, timePerShuttle: 6.86, totalTime: 61.7, distancePerLevel: 180 },
  {
    shuttles: 10,
    timePerShuttle: 6.55,
    totalTime: 65.5,
    distancePerLevel: 200,
  },
  {
    shuttles: 10,
    timePerShuttle: 6.26,
    totalTime: 62.6,
    distancePerLevel: 200,
  },
  { shuttles: 11, timePerShuttle: 6.0, totalTime: 66.0, distancePerLevel: 220 },
  {
    shuttles: 11,
    timePerShuttle: 5.76,
    totalTime: 63.4,
    distancePerLevel: 220,
  },
  {
    shuttles: 11,
    timePerShuttle: 5.54,
    totalTime: 60.9,
    distancePerLevel: 220,
  },
  {
    shuttles: 12,
    timePerShuttle: 5.33,
    totalTime: 64.0,
    distancePerLevel: 240,
  },
  {
    shuttles: 12,
    timePerShuttle: 5.14,
    totalTime: 61.7,
    distancePerLevel: 240,
  },
  {
    shuttles: 13,
    timePerShuttle: 4.97,
    totalTime: 64.6,
    distancePerLevel: 260,
  },
  { shuttles: 13, timePerShuttle: 4.8, totalTime: 62.4, distancePerLevel: 260 },
  {
    shuttles: 13,
    timePerShuttle: 4.65,
    totalTime: 60.4,
    distancePerLevel: 260,
  },
  { shuttles: 14, timePerShuttle: 4.5, totalTime: 63.0, distancePerLevel: 280 },
  {
    shuttles: 14,
    timePerShuttle: 4.36,
    totalTime: 61.1,
    distancePerLevel: 280,
  },
  {
    shuttles: 15,
    timePerShuttle: 4.24,
    totalTime: 63.5,
    distancePerLevel: 300,
  },
  {
    shuttles: 15,
    timePerShuttle: 4.11,
    totalTime: 61.7,
    distancePerLevel: 300,
  },
  { shuttles: 16, timePerShuttle: 4.0, totalTime: 64.0, distancePerLevel: 320 },
  {
    shuttles: 16,
    timePerShuttle: 3.89,
    totalTime: 62.3,
    distancePerLevel: 320,
  },
];

// VO2max Data
const VO2MAX_DATA = [
  { level: 1, vo2max: 16.7 },
  { level: 2, vo2max: 23.0 },
  { level: 3, vo2max: 26.2 },
  { level: 4, vo2max: 29.3 },
  { level: 5, vo2max: 32.5 },
  { level: 6, vo2max: 35.7 },
  { level: 7, vo2max: 38.8 },
  { level: 8, vo2max: 42.0 },
  { level: 9, vo2max: 45.1 },
  { level: 10, vo2max: 48.3 },
  { level: 11, vo2max: 51.5 },
  { level: 12, vo2max: 54.6 },
  { level: 13, vo2max: 57.8 },
  { level: 14, vo2max: 60.9 },
  { level: 15, vo2max: 64.1 },
  { level: 16, vo2max: 67.3 },
  { level: 17, vo2max: 70.4 },
  { level: 18, vo2max: 73.6 },
  { level: 19, vo2max: 76.7 },
  { level: 20, vo2max: 79.9 },
  { level: 21, vo2max: 83.0 },
];

let currentLevel = 0;
let currentShuttle = 0;
let timeRemaining = 0;
let intervalId;
let beepTestLayout;
let testState = "start"; // 'start' | 'running' | 'result'

function initBeepTestLayout() {
  beepTestLayout = new Layout(
    {
      type: "v",
      c: [
        { type: "txt", font: "30%", pad: 0, label: "Start Test", id: "status" },
        { type: "txt", font: "15%", pad: 0, label: "", id: "level" },
        { type: "txt", font: "10%", pad: 0, label: "", id: "vo2max" }, // Smaller font for VO2max
        { type: "txt", font: "10%", pad: 0, label: "", id: "distance" }, // Smaller font for Distance
      ],
    },
    {
      btns: [
        {
          label: "Start/Stop",
          cb: (l) => {
            if (testState === "start") {
              startTest();
            } else if (testState === "running") {
              stopTest();
            } else {
              showStartScreen();
            }
          },
        },
      ],
    },
  );
}

function showStartScreen() {
  testState = "start";
  g.clear();
  beepTestLayout.clear(beepTestLayout.status);
  beepTestLayout.status.label = "Start\nTest";
  beepTestLayout.clear(beepTestLayout.level);
  beepTestLayout.level.label = "";
  beepTestLayout.clear(beepTestLayout.vo2max); // Clear VO2max text
  beepTestLayout.vo2max.label = "";
  beepTestLayout.clear(beepTestLayout.distance); // Clear Distance text
  beepTestLayout.distance.label = "";
  beepTestLayout.render();
}

function startTest() {
  testState = "running";
  currentLevel = 0;
  currentShuttle = 0;
  Bangle.buzz(2000); // Buzz for 2 seconds at the start of the test
  runLevel();
}

function runLevel() {
  if (currentLevel >= BEET_TEST_DATA.length) {
    stopTest();
    return;
  }

  const levelData = BEET_TEST_DATA[currentLevel];
  timeRemaining = levelData.timePerShuttle * 1000; // Convert to milliseconds
  updateDisplay();

  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => {
    if (timeRemaining <= 0) {
      currentShuttle++;
      Bangle.buzz(100); // Short buzz after each shuttle

      if (currentShuttle >= levelData.shuttles) {
        // Buzz longer or twice at the end of each level
        Bangle.buzz(1000); // Buzz for 1 second at level end
        setTimeout(() => Bangle.buzz(1000), 500); // Buzz again after 0.5 seconds
        currentLevel++;
        currentShuttle = 0;
        runLevel();
        return;
      }

      timeRemaining = levelData.timePerShuttle * 1000; // Reset to original time for the next shuttle
    }

    updateDisplay();
    timeRemaining -= 100; // Decrement time by 100 milliseconds
  }, 100); // Update every 100 milliseconds
}

function updateDisplay() {
  g.clear(); // Clear the entire screen
  beepTestLayout.status.label = formatTime(timeRemaining);
  beepTestLayout.level.label = `Level: ${currentLevel + 1}.${currentShuttle + 1}`;
  beepTestLayout.render();
}

function stopTest() {
  g.clear(); // Clear the entire screen
  testState = "result";
  clearInterval(intervalId);

  // Determine previous level and shuttle
  let prevLevel = currentLevel;
  let prevShuttle = currentShuttle;

  if (prevShuttle === 0) {
    if (prevLevel > 0) {
      prevLevel--;
      prevShuttle = BEET_TEST_DATA[prevLevel].shuttles - 1;
    } else {
      prevShuttle = 0;
    }
  } else {
    prevShuttle--;
  }

  // Determine VO2max and total distance
  const vo2max = getVO2max(prevLevel + 1);
  const totalDistance = calculateTotalDistance(prevLevel + 1);

  beepTestLayout.clear(beepTestLayout.status);
  beepTestLayout.status.label = "Result";
  beepTestLayout.clear(beepTestLayout.level);
  beepTestLayout.level.label = `Level: ${prevLevel + 1}.${prevShuttle + 1}`;
  beepTestLayout.clear(beepTestLayout.vo2max);
  beepTestLayout.vo2max.label = `VO2max: ${vo2max}`;
  beepTestLayout.clear(beepTestLayout.distance);
  beepTestLayout.distance.label = `Distance: ${totalDistance} m`;
  beepTestLayout.render();
}

function getVO2max(level) {
  const result = VO2MAX_DATA.find((item) => item.level === level);
  return result ? result.vo2max : "N/A";
}

function calculateTotalDistance(level) {
  // Calculate the total number of shuttles completed
  let totalShuttles = 0;
  for (let i = 0; i < level - 1; i++) {
    totalShuttles += BEET_TEST_DATA[i].shuttles;
  }
  const levelData = BEET_TEST_DATA[level - 1];
  totalShuttles += levelData.shuttles; // Add the shuttles completed in the current level
  const distancePerShuttle = 20; // Distance per shuttle in meters
  return totalShuttles * distancePerShuttle; // Total distance
}

function formatTime(milliseconds) {
  let seconds = Math.floor(milliseconds / 1000);
  let tenths = Math.floor((milliseconds % 1000) / 100); // Get tenths of a second
  return (seconds < 10 ? "" : "") + seconds + "." + tenths; // Display only the tenths digit
}

// Initialize the app
Bangle.setLCDPower(1); // Keep the watch LCD lit up
initBeepTestLayout();
showStartScreen();
