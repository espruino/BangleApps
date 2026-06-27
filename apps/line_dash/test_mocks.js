// =========================================================================
// LINE DASH UI TESTER
// =========================================================================
// How to use:
// 1. Send the Line Dash app to your watch or emulator.
// 2. Copy the entire code below.
// 3. Paste it into the LEFT SIDE (Console) of the Espruino Web IDE.
// 4. Press Enter! The UI will instantly update to reflect these fake values.
// =========================================================================

// 1. Mock Health Status (Steps, Heart Rate)
Bangle.getHealthStatus = function(type) {
  return {
    steps: 14500, // Set fake steps (e.g. 14,500 tests the rollover math)
    bpm: 175      // Set fake heart rate (e.g. 175 tests the Zone colors)
  };
};

// 2. Mock Battery Level
E.getBattery = function() {
  return 15; // Test low battery (below 20 triggers the red gauge warning)
};

// 3. Mock the System Time (Optional - uncomment to test specific times)
/*
Date = class extends Date {
  constructor() {
    super();
    // Example: Force the time to 14:30 (2:30 PM) to test the 24-hour labels
    this.setHours(14);
    this.setMinutes(30);
  }
};
*/

// Force the app to redraw the screen immediately using our fake data!
if (typeof draw === "function") draw();
