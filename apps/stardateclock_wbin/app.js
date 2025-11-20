// Stardate clock face, by L.Storm, 2025

let redrawClock = true;

// note: Bangle.js 1 has 240x240x16, 2 has 176x176x3 screen
const bpp = g.getBPP ? g.getBPP() : 16;

// --- Quiet Mode State ---
let quietModeActive = false;
let initialSettings = {}; // For LCD brightness, timeout, wake settings from Bangle.getOptions()
let originalQuietModeValue; // To store the very first quiet mode value from setting.json

// (Phone weather removed; we'll use onboard sensors only)

// --- Power/Charging State ---
let isCharging = (typeof Bangle !== "undefined" && typeof Bangle.isCharging === "function") ? Bangle.isCharging() : false;
if (typeof Bangle !== "undefined" && typeof Bangle.on === "function") {
  Bangle.on('charging', function(on) {
    isCharging = !!on;
    // Start/stop flashing and redraw bar immediately on charge state change
    if (isCharging) startChargingFlash(); else stopChargingFlash();
  });
}
// --- End Power/Charging State ---

// --- Charging Flash Effect ---
let chargingFlashIntervalId;
let chargingFlashBright = false;
const chargingBlueBright = "#66CCFF";
const chargingBlueDim = "#0044FF";

function startChargingFlash() {
  if (chargingFlashIntervalId) return;
  chargingFlashBright = true;
  chargingFlashIntervalId = setInterval(function() {
    chargingFlashBright = !chargingFlashBright;
    drawBatteryBar(E.getBattery());
  }, 600);
  drawBatteryBar(E.getBattery());
}

function stopChargingFlash() {
  if (chargingFlashIntervalId) {
    clearInterval(chargingFlashIntervalId);
    chargingFlashIntervalId = undefined;
  }
  chargingFlashBright = false;
  drawBatteryBar(E.getBattery());
}
// --- End Charging Flash Effect ---

// (Phone message listener removed)

function ensureInitialSettingsCaptured() {
  if (Object.keys(initialSettings).length === 0) {
    initialSettings = Bangle.getOptions(); 
    // console.log("Initial Bangle.getOptions() captured: " + JSON.stringify(initialSettings));
  }
}

function toggleQuietMode() {
  ensureInitialSettingsCaptured(); // For LCD, timeout, wake settings
  
  let appSettings = require("Storage").readJSON("setting.json", 1) || {};

  // Capture the very original system quiet mode state ONCE
  if (originalQuietModeValue === undefined) {
    originalQuietModeValue = appSettings.quiet !== undefined ? appSettings.quiet : 0;
    // console.log("Original setting.json quiet value captured: " + originalQuietModeValue);
  }

  quietModeActive = !quietModeActive; // This remains our app-level toggle state for UI

  if (quietModeActive) {
    appSettings.quiet = 1; // Set system quiet mode to: notifications silent
    console.log("ACTIVATING quiet mode. setting.json.quiet will be: 1");
    
    Bangle.setLCDBrightness(0.1); 
    Bangle.setLCDTimeout(10); 
    Bangle.setOptions({ wakeOnTwist: false, wakeOnTouch: false}); 
    Bangle.buzz(100, 0.5); 
  } else {
    appSettings.quiet = originalQuietModeValue; // Restore to the initially captured system value
    console.log("DEACTIVATING quiet mode. setting.json.quiet will be: " + appSettings.quiet);
    
    Bangle.setLCDBrightness(initialSettings.lcdBrightness); 
    Bangle.setLCDTimeout(initialSettings.lcdTimeout);
    Bangle.setOptions({ wakeOnTwist: initialSettings.wakeOnTwist, wakeOnTouch: initialSettings.wakeOnTouch}); 
    Bangle.buzz(200, 0.7); 
  }

  require("Storage").writeJSON("setting.json", appSettings);
  // load(); // Removing load() to prevent emulator freeze. Settings will apply as OS reads setting.json.

  redrawClock = true;
  // Ensure immediate UI update for the Q button color etc.
  if (typeof drawClockInterface === "function") drawClockInterface();
  if (typeof updateStardate === "function") updateStardate(); // Keep other updates if they don't cause issues
  if (typeof updateConventionalTime === "function") updateConventionalTime(); 
  drawStepCounter(); // Draw initial step counter
  drawWeatherInfo(); // Draw initial weather info
}

// Load fonts
Graphics.prototype.setFontAntonio27 = function(scale) {
  // Actual height 23 (23 - 1)
  g.setFontCustom(atob("AAAAAAGAAAAwAAAGAAAAwAAAGAAAAwAAAAAAAAAAAAAAAAAADAAAA4AAAHAAAAAAAAAAAAAAAAAAAAAA4AAB/AAD/4AH/4AP/wAf/gAD/AAAeAAAAAAAAAAAAA///AP//+D///4eAAPDgAA4cAAHD///4P//+A///gAAAAAAAAAAAAAAYAAAHAAAA4AAAOAAAD///4f///D///4AAAAAAAAAAAAAAAAAAAAAAA/gD4P8B/D/g/4cAfzDgP4Yf/8DD/+AYP/ADAGAAAAAAAAAAAAHwD8B+AfwfwD/DgMA4cDgHDgeA4f///B/3/wH8P8AAAAAAAAAAAAOAAAPwAAP+AAP/wAf8OAf4BwD///4f///D///4AABwAAAGAAAAAAAAAAAAAAD/4Pwf/h/D/4P4cMAHDjgA4cf//Dh//4cH/8AAAAAAAAAAAAAAH//8B///wf///Dg4A4cHAHDg4A4f3//B+f/wHh/8AAAAAAAAAAAAAAcAAADgAA4cAD/DgH/4cH//Dv/4Af/gAD/gAAfAAADgAAAAAAAAAAAAH4f8B///wf///Dg8A4cDAHDg8A4f///B///wH8/8AAAAAAAAAAAAAAH/h4B/+Pwf/5/DgHA4cA4HDgHA4f///B///wH//8AAAAAAAAAAAAAAAAAAAHgeAA8DwAHgeAAAAAAAAAA"), 45, atob("CQcKDAsMDAwMDAwMDAc="), 27+(scale<<8)+(1<<16));
};
Graphics.prototype.setFontAntonio42 = function(scale) {
  // Actual height 36 (36 - 1)
  g.setFontCustom(atob("AAAAAAAAAAAAAAAAAcAAAAAAcAAAAAAcAAAAAAcAAAAAAcAAAAAAcAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgAAAAAHgAAAAAHgAAAAAHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABgAAAAAfgAAAAH/gAAAB//gAAAf//gAAH//4AAB//+AAAf//gAAH//4AAAf/+AAAAf/gAAAAf4AAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAA////gAH////+AP/////Af/////gf/////gfAAAAPgeAAAAHgeAAAAHgfAAAAPgf/////gf/////gP/////AH////+AB////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAB4AAAAAB4AAAAAB4AAAAADwAAAAAHwAAAAAP/////gf/////gf/////gf/////gf/////gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/8AAPgH/8AD/gP/8AP/gP/8A//gf/8B//gfAAH/ngeAAf+HgeAB/4HgfAH/gHgf//+AHgP//4AHgH//wAHgD/+AAHgAPgAAAAAAAAAAAAAAAAAAAAAAAAAA+AAfwAH+AAf+AP+AAf/AP+AAf/Af+AAf/gfADwAPgeADwAHgeADwAHgfAH4APgf///h/gf/////AP/+///AH/+f/+AB/4H/4AAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAA/gAAAAH/gAAAB//gAAAP//gAAB//HgAAf/wHgAD/8AHgAf/AAHgAf/////gf/////gf/////gf/////gf/////gAAAAHgAAAAAHgAAAAAHAAAAAAAAAAAAAAAAAAAAAAAf//gP8Af//gP+Af//gP/Af//gP/gf/+AAfgeB8AAHgeB4AAHgeB8AAHgeB////geB////geA////AeAf//+AAAD//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf///gAD////8AH/////AP/////Af/////gfAPgAfgeAPAAHgeAPAAHgeAPAAHgf+PgAPgf+P///gP+H///AH+H//+AB+B//8AAAAD8AAAAAAAAAAAAAAAAAAAAAAAeAAAAAAeAAAAAAeAAAAPgeAAAP/geAAD//geAA///geAH///geB///+AeP//4AAe//8AAAf//AAAAf/wAAAAf+AAAAAfwAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAAAB/wH/4AH/8f/+AP/////Af/////gf/////geAH4APgeADgAHgeADgAHgeAHwAHgf/////gf/////gP/////AH/8//+AB/wH/4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAB//gPgAH//4P+AP//8P/Af//+P/AfwB+P/geAAeAPgeAAeAHgeAAeAHgfAAeAPgf/////gP/////AP/////AH////8AA////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD4APgAAH4AfgAAH4AfgAAH4AfgAAH4AfgAAD4APgAAAAAAAAAAAAAAA="), 45, atob("DgsPEhESEhISEhISEgo="), 42+(scale<<8)+(1<<16));
};
const fontName = "Antonio27";
const fontNameLarge = "Antonio42";
const fontSize = 1;
const fontSizeLarge = 1;
const fontHeightLarge = 42 * fontSizeLarge;
const vectorFontStardateSizeB2 = 16; // For Bangle.js 2 stardate display

// LCARS dimensions
let baseUnit1 = 5;
let baseUnit2 = 3;
let baseUnit3 = 10;
if (g.getWidth() < 200) { // Bangle.js 2
  baseUnit1 = 3;
  baseUnit2 = 2;
  baseUnit3 = 7;
}

//const widgetsHeight = 24;
const sbarWid = baseUnit3 * 5;
const hbarHt = baseUnit1;
const outRad = baseUnit1 * 5;
const inRad = outRad - hbarHt;
const gap = baseUnit2;
const divisionPos = baseUnit3 * 8;
const sbarGapPos = baseUnit3 * 15;
const lowerTop = divisionPos+gap+1;

// Star Trek famously premiered on Thursday, September 8, 1966, at 8:30 p.m.
// See http://www.startrek.com/article/what-if-the-original-star-trek-had-debuted-on-friday-nights
const gSDBase = new Date("September 8, 1966 20:30:00 EST");
const sdatePosBottom = divisionPos - hbarHt - 1;
let sdatePosRight = g.getWidth() - baseUnit2 - 10; // Default, will be adjusted
const sdateDecimals = 1;
const secondsPerYear = 86400 * 365.2425;
const sdateDecFactor = Math.pow(10, sdateDecimals);

const clockAreaLeft = sbarWid + inRad / 2;
const clockAreaTop = lowerTop + hbarHt + inRad / 2;
const clockWid = g.getWidth() - clockAreaLeft;
const clockHt = g.getHeight() - clockAreaTop;

const ctimePosTop = clockAreaTop + baseUnit1 * 5;
const ctimePosCenter = clockAreaLeft + clockWid / 2;
const cdatePosTop = ctimePosTop + fontHeightLarge;
const cdatePosCenter = clockAreaLeft + clockWid / 2;

const clockCtrX = Math.floor(clockAreaLeft + clockWid / 2);
const clockCtrY = Math.floor(clockAreaTop + clockHt / 2);
const analogRad = Math.floor(Math.min(clockWid, clockHt) / 2);

const analogMainLineLength = baseUnit1 * 2;
const analogSubLineLength = baseUnit1;

const analogHourHandLength = analogRad / 2;
const analogMinuteHandLength = analogRad - analogMainLineLength / 2;

const colorBg = "#000000";
const colorTime = "#9C9CFF";
const colorDate = "#A09090";
const colorStardate = "#FFCF00";
// On low-bpp devices (Bangle.js 2), use basic colors for analog clock.
const colorHours = bpp > 3 ? "#9C9CFF" : "#00FF00";
const colorSeconds = bpp > 3 ? "#E7ADE7" : "#FFFF00";
const colorHands = bpp > 3 ? "#A09090" : "#00FFFF";
const colorLCARSGray = "#A09090";
const colorLCARSOrange = "#FF9F00";
const colorLCARSPink = "#E7ADE7";
const colorLCARSPurple = "#A06060";
const colorLCARSBrown = "#C09070";
// More colors: teal #008484, yellow FFCF00, purple #6050B0
const colorLCARSDaySegment = "#00A0FF"; // Blue for day segments
const colorLCARSDayHighlight = "#FFFF00"; // Yellow for day segment highlight

// --- Separator Bar Config (between sensor panel and binary buttons) ---
// Minimal knobs: set height and move it up/down. That's it.
const separatorBarConfig = {
  color: colorLCARSOrange,            // Fill color (same LCARS orange)
  cornerRadius: 4,                    // Rounded corner radius
  height: (g.getWidth() < 200) ? 16 : 8, // Bar thickness
  gapToButtons: 2,                    // Gap between bar and TOP of the hour buttons
  verticalOffset: -5,                  // Additional Y shift: negative = move up, positive = move down
  leftInsetFromSensorLeft: 55,        // Left inset from content-left edge
  rightInsetFromRightEdge: 2          // Right inset from content-right edge
};

// Global variables for storing dimensions of the last drawn stardate for accurate clearing
let lastSDateStringWidth = 0;
let lastSDateStringHeight = 0;
let lastSDateActualPosX = 0;
let lastSDateFinalPosY = 0;

// Global for day of week display
let highlightedDayIndex = -1; // 0=Sun, 6=Sat
// Bounds for the quiet-mode grid area (2x2 buttons) to detect touch
let quietToggleAreaBounds = null; // {x1,y1,x2,y2}
let timerToggleAreaBounds = null; // bounds for timer button
let backButtonBounds = null; // bounds for timer back button
let showTimer = false;
let timerStartMs = 0;
let timerIntervalId;
let timerMode = "setup"; // 'setup' | 'running' | 'paused' | 'finished'
let timerSetMs = 5 * 60 * 1000; // default 5 minutes
let timerRemainingMs = timerSetMs;
let timerEndTimeMs = 0;
let startPauseButtonBounds = null;
let resetButtonBounds = null;
let zeroButtonBounds = null;
let minPlusBounds = null, minMinusBounds = null, secPlusBounds = null, secMinusBounds = null;

// --- Barometer (Internal Pressure) - Periodic Sampling ---
let internalPressureHpa = null;
let barometerSampleInterval = null;
let lastBarometerUpdate = 0;

// --- Temperature Sensor - Periodic Sampling ---
let internalTemperatureC = null;
let temperatureSampleInterval = null;
let lastTemperatureUpdate = 0;

function enableBarometerPower(on) {
  if (typeof Bangle !== "undefined" && typeof Bangle.setBarometerPower === "function") {
    Bangle.setBarometerPower(on ? 1 : 0, "stardateclock");
  }
}

function sampleBarometer() {
  if (typeof Bangle !== "undefined" && typeof Bangle.setBarometerPower === "function") {
    enableBarometerPower(true);
    // Sample for 2 seconds then turn off
    setTimeout(function() {
      enableBarometerPower(false);
    }, 2000);
  }
}

// Sample barometer every 5 minutes instead of continuous
function startBarometerSampling() {
  if (barometerSampleInterval) return;
  sampleBarometer(); // Initial sample
  barometerSampleInterval = setInterval(sampleBarometer, 300000); // 5 minutes
}

function stopBarometerSampling() {
  if (barometerSampleInterval) {
    clearInterval(barometerSampleInterval);
    barometerSampleInterval = null;
  }
  enableBarometerPower(false);
}

function enableTemperaturePower(on) {
  if (typeof Bangle !== "undefined" && typeof Bangle.setBarometerPower === "function") {
    Bangle.setBarometerPower(on ? 1 : 0, "stardateclock");
  }
}

function sampleTemperature() {
  if (typeof Bangle !== "undefined" && typeof Bangle.setBarometerPower === "function") {
    enableTemperaturePower(true);
    // Sample for 2 seconds then turn off
    setTimeout(function() {
      enableTemperaturePower(false);
    }, 2000);
  }
}

// Sample temperature every 5 minutes instead of continuous
function startTemperatureSampling() {
  if (temperatureSampleInterval) return;
  sampleTemperature(); // Initial sample
  temperatureSampleInterval = setInterval(sampleTemperature, 300000); // 5 minutes
}

function stopTemperatureSampling() {
  if (temperatureSampleInterval) {
    clearInterval(temperatureSampleInterval);
    temperatureSampleInterval = null;
  }
  enableTemperaturePower(false);
}

if (typeof Bangle !== "undefined" && typeof Bangle.on === "function") {
  if (typeof Bangle.setBarometerPower === "function") {
    Bangle.on('pressure', function(e) {
      if (!e) return;
      let p = e.pressure;
      // If units are Pa (e.g. ~101325), convert to hPa; if already hPa (~1013), keep
      if (p > 2000) p = p / 100;
      internalPressureHpa = p;
      lastBarometerUpdate = Date.now();
      drawWeatherInfo();
    });
  }
  
  // Temperature sensor listener
  Bangle.on('temperature', function(e) {
    if (!e) return;
    internalTemperatureC = e.temperature;
    lastTemperatureUpdate = Date.now();
    drawWeatherInfo();
  });
}
// --- End Barometer ---

// --- GPS Time Sync ---
let gpsTimeSyncInProgress = false;
let gpsTimeSyncTimeoutId;
function startGPSTimeSync() {
  if (gpsTimeSyncInProgress) return;
  if (!(typeof Bangle !== "undefined" && typeof Bangle.setGPSPower === "function")) return;
  gpsTimeSyncInProgress = true;
  function onGPSFix(fix) {
    if (fix && fix.time !== undefined) {
      setTime(fix.time.getTime()/1000);
      // Stop listening and power down GPS after sync
      Bangle.removeListener('GPS', onGPSFix);
      Bangle.setGPSPower(0, "stardateclock");
      gpsTimeSyncInProgress = false;
      if (gpsTimeSyncTimeoutId) { clearTimeout(gpsTimeSyncTimeoutId); gpsTimeSyncTimeoutId = undefined; }
    }
  }
  Bangle.on('GPS', onGPSFix);
  Bangle.setGPSPower(1, "stardateclock");
  // Fallback timeout to turn GPS off if no fix/time comes through
  gpsTimeSyncTimeoutId = setTimeout(function() {
    if (gpsTimeSyncInProgress) {
      Bangle.removeListener('GPS', onGPSFix);
      Bangle.setGPSPower(0, "stardateclock");
      gpsTimeSyncInProgress = false;
    }
  }, 120000); // 2 minutes
}
// --- End GPS Time Sync ---

// Global variables to track what needs updating
let lastStardateString = "";
let lastBinaryHours = -1;
let lastBinaryMinutes = -1;
let lastDay = -1;
let lastBatteryLevel = -1;
let lastSteps = -1;

function updateStardate() {
  const curDate = new Date();
  const year = curDate.getFullYear();
  const month = (curDate.getMonth() + 1).toString().padStart(2, '0');
  const dayOfMonth = curDate.getDate().toString().padStart(2, '0');
  const hours = curDate.getHours().toString().padStart(2, '0');
  const minutes = curDate.getMinutes().toString().padStart(2, '0');
  const sdatestring = `${year}${month}${dayOfMonth}.${hours}${minutes}`;
  
  // Only redraw stardate if it actually changed
  if (sdatestring !== lastStardateString || redrawClock) {
    let currentFontIsVector = false;
    let currentSDatePosRight = sdatePosRight;
    let currentSDatePosBottomAdjust;

    // Clear previous stardate area using stored dimensions
    if (lastSDateStringWidth > 0) {
      g.setColor(colorBg);
      g.fillRect(
        lastSDateActualPosX - 1,
        lastSDateFinalPosY - lastSDateStringHeight - 1,
        lastSDateActualPosX + lastSDateStringWidth + 1,
        lastSDateFinalPosY + 1
      );
    }

    // Set font and determine positioning for the current draw
    if (g.getWidth() < 200) {
      g.setFont("Vector", vectorFontStardateSizeB2);
      currentFontIsVector = true;
      currentSDatePosRight = g.getWidth() - 3;
      currentSDatePosBottomAdjust = Math.round(vectorFontStardateSizeB2 / 4);
    } else {
      g.setFont(fontName, fontSize);
      currentSDatePosBottomAdjust = 0;
    }
    
    // Calculate and store dimensions for the *current* stardate
    lastSDateStringWidth = g.stringWidth(sdatestring);
    lastSDateStringHeight = g.getFontHeight();
    lastSDateActualPosX = currentSDatePosRight - lastSDateStringWidth;
    lastSDateFinalPosY = sdatePosBottom - currentSDatePosBottomAdjust;
    
    // Draw the current stardate
    g.setColor(colorStardate);
    if (currentFontIsVector) {
      g.setFontAlign(-1, -1, 0); 
      g.drawString(sdatestring, lastSDateActualPosX, lastSDateFinalPosY - lastSDateStringHeight); 
    } else {
      g.setFontAlign(-1, 1, 0); 
      g.drawString(sdatestring, lastSDateActualPosX, lastSDateFinalPosY);
    }
    
    lastStardateString = sdatestring;
  }
}

function updateConventionalTime() {
  const curDate = new Date();
  const day = curDate.getDay();
  const currentBattery = E.getBattery();
  const steps = Bangle.getHealthStatus("day").steps;

  // Only update day segments if day changed
  if (redrawClock || day !== lastDay) {
    drawDaySegmentsBar(day);
    lastDay = day;
  }

  // Only update battery bar if battery level changed
  if (redrawClock || currentBattery !== lastBatteryLevel) {
    drawBatteryBar(currentBattery);
    lastBatteryLevel = currentBattery;
  }

  // Only update binary time if hours/minutes changed
  let hoursForBinary = curDate.getHours();
  if (hoursForBinary === 0) {
    hoursForBinary = 12;
  } else if (hoursForBinary > 12) {
    hoursForBinary -= 12;
  }
  const minutes = curDate.getMinutes();
  
  if (redrawClock || hoursForBinary !== lastBinaryHours || minutes !== lastBinaryMinutes) {
    drawBinaryTimeButtons(hoursForBinary, minutes);
    lastBinaryHours = hoursForBinary;
    lastBinaryMinutes = minutes;
  }

  // Steps now drawn inside drawWeatherInfo panel
  if (redrawClock || steps !== lastSteps) {
    lastSteps = steps;
  }

  // Always draw sensor panel last so it stays on top
  drawWeatherInfo();
}

// Single consolidated update function - replaces dual timers
function updateClock() {
  updateStardate();
  updateConventionalTime();
  
  // Schedule next update
  if (redrawClock) {
    const curDate = new Date();
    const msToNextSecond = 1000 - curDate.getMilliseconds();
    setTimeout(updateClock, msToNextSecond);
  }
}

function drawBinaryTimeButtons(hours, minutes) {
  const r = Bangle.appRect;
  if (!r) { 
    console.log("drawBinaryTimeButtons: Bangle.appRect not ready yet.");
    return; 
  }

  const buttonCount = 4; 
  const buttonLabels = [8, 4, 2, 1];
  const buttonLabelsMinutes = [32, 16, 8, 4, 2, 1]; 
  const buttonCountMinutes = buttonLabelsMinutes.length; 

  const buttonGap = 4; // Default gap, might be overridden by dynamic calculation
  const buttonHeight = 28;
  const buttonHeightSmall = 22;
  const buttonWidth = 33;
  const buttonWidthSmall = 18; // B2 minute button width (was 18)
  const marginBottom = 4;

  let actualHourButtonWidth = buttonWidth;
  let actualHourButtonHeight = buttonHeight;
  let actualMinuteButtonWidth = buttonWidthSmall;
  let actualMinuteButtonHeight = buttonHeightSmall;
  let actualButtonGap = buttonGap;
  const cornerRadius = 8; 
  let contentAreaX_offset_b2 = 0; // Original B2 offset for LCARS alignment
  let buttonAreaStartShift = 0; // New: How much to shift the button area left

  if (g.getWidth() < 200) { // Bangle.js 2 specific dimensions
    actualHourButtonWidth = 28;      
    actualHourButtonHeight = 18;     
    actualMinuteButtonWidth = 21; // Keep at 18px for B2 minutes for now
    actualMinuteButtonHeight = 18;    
    actualButtonGap = 2; // Default gap for B2 if not enough space for dynamic
    contentAreaX_offset_b2 = 4;  // Original shift for LCARS alignment
    buttonAreaStartShift = -10; // <<<< REDUCED SHIFT to -15px for B2
  }

  const minuteButtonsTopY = r.y2 - marginBottom - actualMinuteButtonHeight + 1;
  const hourButtonsTopY = minuteButtonsTopY - actualButtonGap - actualHourButtonHeight;

  // Original contentAreaX based on LCARS geometry
  let baseContentAreaX = sbarWid + outRad + gap + 1;
  if (g.getWidth() < 200) { 
    baseContentAreaX -= contentAreaX_offset_b2;
  }

  // New effective start for buttons, incorporating the shift
  const effectiveButtonAreaStartX = baseContentAreaX + buttonAreaStartShift;

  // Right edge for button area
  const buttonAreaEndX = r.x2; // Use the full app rect right edge
  
  // Effective width for buttons to span and for gap calculation
  const effectiveButtonAreaWidth = buttonAreaEndX - effectiveButtonAreaStartX;

  // --- Hour Buttons --- 
  const totalFixedHourButtonWidth = buttonCount * actualHourButtonWidth;
  let hourGap = actualButtonGap; 
  if (buttonCount > 1) {
    const totalHourGapSpace = effectiveButtonAreaWidth - totalFixedHourButtonWidth;
    hourGap = Math.max(1, Math.floor(totalHourGapSpace / (buttonCount - 1)));
  }
  const currentEffectiveHourRowWidth = totalFixedHourButtonWidth + (hourGap * (buttonCount - 1));
  const xStartHours = effectiveButtonAreaStartX + Math.max(0, Math.floor((effectiveButtonAreaWidth - currentEffectiveHourRowWidth) / 2));

  // --- Minute Buttons ---
  const totalFixedMinuteButtonWidth = buttonCountMinutes * actualMinuteButtonWidth;
  let minuteGap = actualButtonGap; 
  if (buttonCountMinutes > 1) {
    const totalMinuteGapSpace = effectiveButtonAreaWidth - totalFixedMinuteButtonWidth;
    minuteGap = Math.max(1, Math.floor(totalMinuteGapSpace / (buttonCountMinutes - 1)));
  }
  const currentEffectiveMinuteRowWidth = totalFixedMinuteButtonWidth + (minuteGap * (buttonCountMinutes - 1));
  const xStartMinutes = effectiveButtonAreaStartX + Math.max(0, Math.floor((effectiveButtonAreaWidth - currentEffectiveMinuteRowWidth) / 2));

  // Draw the separator bar between sensor panel and the binary buttons
  drawSeparatorBar(hourButtonsTopY, buttonAreaEndX);

  // Clear the specific button area (now potentially wider and further left)
  g.setColor(colorBg);
  g.fillRect(effectiveButtonAreaStartX, hourButtonsTopY, buttonAreaEndX, r.y2); // Clear from new start to app edge right, full button height area

  const colorText = "#000000";
  const TEMP_DRAW_ALL_BUTTONS = false; // <<<< REVERTED: Was true for layout, now false for actual time

  // Draw hour buttons
  g.setFont("6x8", 2); 
  for (let i = 0; i < buttonCount; i++) {
    const bit = buttonLabels[i];
    const isSet = (hours & bit) !== 0;
    if (TEMP_DRAW_ALL_BUTTONS || isSet) { 
      const x = xStartHours + i * (actualHourButtonWidth + hourGap); // Use dynamic hourGap
      drawRoundedButton(x, hourButtonsTopY, actualHourButtonWidth, actualHourButtonHeight, cornerRadius, "#FFCF00");
    g.setColor(colorText);
      g.setFontAlign(0,0); 
      g.drawString(bit.toString(), x + actualHourButtonWidth / 2, hourButtonsTopY + actualHourButtonHeight / 2); 
    }
  }
  
  // Draw minute buttons
  g.setFont("6x8", 2); 
  for (let i = 0; i < buttonCountMinutes; i++) { 
    const bit = buttonLabelsMinutes[i]; 
    const isSet = (minutes & bit) !== 0;
    if (TEMP_DRAW_ALL_BUTTONS || isSet) { 
      const x = xStartMinutes + i * (actualMinuteButtonWidth + minuteGap); // Use dynamic minuteGap
      drawRoundedButton(x, minuteButtonsTopY, actualMinuteButtonWidth, actualMinuteButtonHeight, cornerRadius, "#2A4FFF");
    g.setColor(colorText);
      g.setFontAlign(0,0); 
      g.drawString(bit.toString(), x + actualMinuteButtonWidth / 2, minuteButtonsTopY + actualMinuteButtonHeight / 2); 
    } 
  }
}

// Draws the orange rounded rectangle separator between the sensor panel and binary buttons.
// The bar spans from the content's left (just right of LCARS border) to the app area right,
// with configurable insets and height controlled by separatorBarConfig above.
function drawSeparatorBar(hourButtonsTopY, areaRightX) {
  const appRect = Bangle.appRect;
  if (!appRect) return;
  const sensorLeftX = sbarWid + outRad + gap + 1;
  // Position the bar directly relative to the button row for clarity:
  // y = top of hour buttons - configurable gap - bar height + optional verticalOffset
  const x = sensorLeftX + separatorBarConfig.leftInsetFromSensorLeft;
  const y = (hourButtonsTopY - separatorBarConfig.gapToButtons - separatorBarConfig.height) + separatorBarConfig.verticalOffset;
  const rightInset = separatorBarConfig.rightInsetFromRightEdge;
  const w = Math.max(0, (areaRightX - rightInset) - x);
  const h = Math.max(1, separatorBarConfig.height);

  if (w <= 0 || h <= 0) return;
  drawRoundedButton(x, y, w, h, separatorBarConfig.cornerRadius, separatorBarConfig.color);
}

function drawDigitalClock(curDate) {
  // This function is now called from updateConventionalTime() with proper change detection
  // Just ensure background is set
  g.setBgColor(colorBg);
}

function drawLine(x1, y1, x2, y2, color) {
  g.setColor(color);
  // On high-bpp devices, use anti-aliasing. Low-bpp (Bangle.js 2) doesn't clear nicely with AA.
  if (bpp > 3 && g.drawLineAA) {
    g.drawLineAA(x1, y1, x2, y2);
  } else {
    g.drawLine(x1, y1, x2, y2);
  }
}

function clearLine(x1, y1, x2, y2) {
  drawLine(x1, y1, x2, y2, colorBg);
}

function drawDaySegmentsBar(currentDay) {
  const barX1 = sbarWid + outRad + gap + 1;
  const barY1 = divisionPos - hbarHt;
  // Respect the right-hand margin defined by baseUnit2 for consistency
  const barX2 = g.getWidth() - (g.getWidth() < 200 ? baseUnit2 + 1 : 0); // B2 has baseUnit2 margin, B1 might go to edge.
  const barY2 = divisionPos;
  const barHeight = hbarHt; //barY2 - barY1;

  // Clear the area for the day segments
  g.setColor(colorBg);
  g.fillRect(barX1, barY1, barX2, barY2);

  const numSegments = 7;
  const segmentGap = 1;
  const totalBarWidth = barX2 - barX1;
  const totalGapWidth = (numSegments - 1) * segmentGap;
  const segmentWidth = Math.floor((totalBarWidth - totalGapWidth) / numSegments);

  if (segmentWidth <=0) return; // Not enough space to draw

  for (let i = 0; i < numSegments; i++) {
    const segX = barX1 + i * (segmentWidth + segmentGap);
    const color = (i === currentDay) ? colorLCARSDayHighlight : colorLCARSDaySegment;
    g.setColor(color);
    g.fillRect(segX, barY1, segX + segmentWidth - 1, barY2); // Corrected for inclusive x2
  }
  highlightedDayIndex = currentDay;
}

// Helper function to draw the battery bar
function drawBatteryBar(batteryPercent) {
  const barX1 = sbarWid + outRad + gap + 1;
  const barY1 = lowerTop;
  const barX2 = g.getWidth() - (g.getWidth() < 200 ? baseUnit2 + 1 : 0); // Respect B2 right margin
  const barHeight = hbarHt;
  const totalBarWidth = barX2 - barX1;

  if (totalBarWidth <=0) return; // Not enough space

  // Draw red background bar (full width)
  g.setColor("#FF0000");
  g.fillRect(barX1, barY1, barX2, barY1 + barHeight - 1);

  // Calculate width of the yellow foreground bar
  const yellowWidth = Math.floor((batteryPercent / 100) * totalBarWidth);

  // Draw yellow foreground bar
  if (yellowWidth > 0) {
    // When charging, draw the foreground bar in blue instead of yellow/orange
    const charging = (typeof Bangle !== "undefined" && typeof Bangle.isCharging === "function") ? Bangle.isCharging() : isCharging;
    if (charging) {
      const useColor = chargingFlashBright ? chargingBlueBright : chargingBlueDim;
      g.setColor(useColor);
    } else {
      g.setColor(colorLCARSOrange);
    }
    g.fillRect(barX1, barY1, barX1 + yellowWidth - 1, barY1 + barHeight - 1);
  }
  // Draw a thin white vertical marker crossing the day-segment bar and battery bar.
  // Always render: if no pressure reading yet, pin at the leftmost edge.
  let arrowX;
  if (internalPressureHpa !== null && isFinite(internalPressureHpa)) {
    const p = Math.max(940, Math.min(1060, internalPressureHpa));
    const pMin = 980, pMax = 1040; // typical sea-level range
    let t = (p - pMin) / (pMax - pMin);
    if (!isFinite(t)) t = 0.5;
    t = Math.max(0, Math.min(1, t));
    arrowX = Math.round(barX1 + t * totalBarWidth);
  } else {
    arrowX = barX1; // fallback: keep arrow visible at the leftmost position
  }
  const lineYTop = divisionPos - hbarHt - 2; // extend 2px above day segments
  const lineYBottom = barY1 + barHeight - 1 + 2; // extend 2px below battery bar
  g.setColor("#FFFFFF");
  // Draw as 1px or 2px wide line for visibility on both devices
  g.drawLine(arrowX, lineYTop, arrowX, lineYBottom);
  if (bpp > 3) g.drawLine(arrowX+1, lineYTop, arrowX+1, lineYBottom);
  lastBatteryLevel = batteryPercent;
}

// Helper function to draw a filled rounded rectangle
function drawRoundedButton(x, y, w, h, r, color) {
  g.setColor(color);
  // Ensure radius is not too large for the dimensions
  r = Math.min(r, w/2, h/2);
  if (r < 0) r = 0;

  // Central cross shape (two overlapping rectangles)
  g.fillRect(x + r, y, x + w - 1 - r, y + h - 1); // Horizontal part
  g.fillRect(x, y + r, x + w - 1, y + h - 1 - r); // Vertical part

  // Corner circles (centers are r pixels from the true corners)
  g.fillCircle(x + r, y + r, r); // Top-left
  g.fillCircle(x + w - 1 - r, y + r, r); // Top-right
  g.fillCircle(x + r, y + h - 1 - r, r); // Bottom-left
  g.fillCircle(x + w - 1 - r, y + h - 1 - r, r); // Bottom-right
}

// Function to draw the step counter
function drawStepCounter() {
  const r = Bangle.appRect;
  if (!r) {
    console.log("drawStepCounter: Bangle.appRect not ready yet.");
    return;
  }

  const steps = Bangle.getHealthStatus("day").steps;
  
  // Position above the binary buttons, below the quiet mode button
  let buttonWidth = (g.getWidth() < 200) ? 28 : 34;
  let buttonHeight = (g.getWidth() < 200) ? 22 : 28;
  let buttonGap = (g.getWidth() < 200) ? 4 : 5;
  let weatherLineHeightEstimate = (g.getWidth() < 200) ? 15 : 17;
  const areaLeft = sbarWid + 5;
  const areaTop = (lowerTop + hbarHt + gap + 5) + weatherLineHeightEstimate + buttonGap;
  const quietModeHeight = 2*buttonHeight + buttonGap;
  
  // Calculate position above binary buttons
  let estTimeBtnAreaHeight = (g.getWidth() < 200) ? 45 : 55;
  const binaryButtonsTopY = r.y2 - estTimeBtnAreaHeight;
  const stepCounterY = binaryButtonsTopY - 15; // 15px above binary buttons
  
  const x = areaLeft; // Align with left edge
  const labelText = "Step";
  const valueText = steps + "" ;

  g.setFontAlign(-1, -1, 0); // Align top-left
  g.setColor("#FFFFFF"); // White text to match the color scheme

  let valueFontSize = (g.getWidth() < 200) ? 14 : 16; // Appropriate size for horizontal display
  let stepsLabelFontSize = (g.getWidth() < 200) ? 12 : 14; // Base size for "Steps" label

  g.setFont("4x6", 2); // Use 4x6 font with 2x scaling for compact display
  g.setColor("#000000"); // Black color for "Steps" label
  // Draw "Steps" label on the left border (positioned on the LCARS border)
  g.drawString(labelText, 3, stepCounterY + 2); // Move to left border (x=3)
  
  g.setFont("Vector", valueFontSize);
  g.setColor("#FFFFFF"); // White color for step numbers
  // Draw step count (value) to the right of "Steps", left-aligned
  g.drawString(valueText, x + g.stringWidth(labelText) + 5, stepCounterY);
}

// Function to draw a Do Not Disturb icon (circle with line through it)
function drawDoNotDisturbIcon(x, y, size) {
  g.setColor("#000000"); // Black color for the icon
  
  const radius = Math.floor(size / 2);
  
  // Draw circle outline
  g.drawCircle(x, y, radius);
  
  // Draw diagonal line through the circle
  const lineLength = Math.floor(radius * 1.2);
  const lineOffset = Math.floor(lineLength / 2);
  
  // Draw line from top-left to bottom-right
  g.drawLine(x - lineOffset, y - lineOffset, x + lineOffset, y + lineOffset);
}

// Function to draw a speaker icon
function drawSpeakerIcon(x, y, size, isMuted, iconColor) {
  g.setColor(iconColor);

  // Speaker base (rectangle)
  // Making base slightly indented and not full height of icon box
  const baseWidth = Math.max(2, Math.floor(size / 2.5));
  const baseHeight = Math.max(3, Math.floor(size / 1.8));
  const baseX = x + Math.floor(size * 0.1); // Indent base slightly
  const baseY = y + Math.floor((size - baseHeight) / 2);
  g.fillRect(baseX, baseY, baseX + baseWidth - 1, baseY + baseHeight - 1);

  // Speaker horn (triangle pointing right)
  const hornTipX = baseX + baseWidth; // Where base ends
  const hornRightExtent = x + size - 1 - Math.floor(size * 0.1); // Indent right tip
  const hornMidY = y + Math.floor(size / 2);
  g.fillPoly([
    hornTipX, baseY + Math.floor(baseHeight * 0.2), // Top-left of horn (connected to base)
    hornTipX, baseY + baseHeight - 1 - Math.floor(baseHeight * 0.2), // Bottom-left of horn (connected to base)
    hornRightExtent, hornMidY // Rightmost point of horn
  ]);

  if (isMuted) {
    // Draw a diagonal slash using a filled polygon for thickness
    const slashThicknessRatio = 0.18; // Relative thickness of the slash
    const slashIndentRatio = 0.05; // How much the slash is inset from edges

    // Points for the slash polygon (top-left to bottom-right orientation)
    const p1x = x + Math.floor(size * slashIndentRatio);
    const p1y = y + Math.floor(size * (slashIndentRatio + slashThicknessRatio));
    
    const p2x = x + Math.floor(size * (slashIndentRatio + slashThicknessRatio));
    const p2y = y + Math.floor(size * slashIndentRatio);
    
    const p3x = x + size - 1 - Math.floor(size * slashIndentRatio);
    const p3y = y + size - 1 - Math.floor(size * (slashIndentRatio + slashThicknessRatio));
    
    const p4x = x + size - 1 - Math.floor(size * (slashIndentRatio + slashThicknessRatio));
    const p4y = y + size - 1 - Math.floor(size * slashIndentRatio);

    g.fillPoly([p1x,p1y, p2x,p2y, p4x,p4y, p3x,p3y]); // Order for fillPoly needs to be sequential vertices
    // Corrected order for a diagonal band from top-left towards bottom-right:
    // Top-left inner, top-left outer, bottom-right outer, bottom-right inner
     g.fillPoly([
      x + Math.floor(size*0.15), y + Math.floor(size*0.05), // Top-left of band's "upper edge"
      x + Math.floor(size*0.05), y + Math.floor(size*0.15), // Top-left of band's "lower edge"
      x + size -1 - Math.floor(size*0.05), y + size -1 - Math.floor(size*0.15), // Bottom-right of band's "lower edge"
      x + size -1 - Math.floor(size*0.15), y + size -1 - Math.floor(size*0.05)  // Bottom-right of band's "upper edge"
    ]);
  }
}

// --- Function to draw Weather Information ---
function drawWeatherInfo() {
  const r = Bangle.appRect;
  if (!r) {
    // console.log("drawWeatherInfo: Bangle.appRect not ready yet.");
    return;
  }

  // If timer overlay is shown, draw it here and return
  if (showTimer) {
    drawTimerOverlay();
    return;
  }

  // Define the drawing area for sensor info (rendered after other elements)
  const weatherAreaX1 = sbarWid + outRad + gap + 10;
  const weatherAreaY1 = lowerTop + hbarHt + gap + 2; // start a bit higher to fit more lines
  const weatherAreaX2 = g.getWidth() - 3;
  // reserve safe space for binary buttons to avoid overlap
  let estimatedTimeButtonAreaHeight = (g.getWidth() < 200) ? 45 : 55;
  const weatherAreaY2 = r.y2 - estimatedTimeButtonAreaHeight - 10;

  // Font settings
  let weatherFontSize = (g.getWidth() < 200) ? 12 : 16; // smaller on B2 to fit 5 lines
  let weatherLineHeight = (g.getWidth() < 200) ? 13 : 17;

  // Compute quiet-mode button bounds and clamp panel to the right of it
  const qbWidth = (g.getWidth() < 200) ? 28 : 34;
  const qbXStart = sbarWid + 5;
  const qbRight = qbXStart + qbWidth + 1;
  const gapBetween = 6;
  const timerRight = qbXStart + qbWidth + gapBetween + qbWidth + 1;
  const panelX1 = Math.max(weatherAreaX1, Math.max(qbRight, timerRight) + 4);

  // Clear the sensor/timer panel area from the true content-left edge (just right of LCARS border)
  const sensorLeftX = sbarWid + outRad + gap + 1;
  g.setColor(colorBg);
  g.fillRect(sensorLeftX, weatherAreaY1, weatherAreaX2, weatherAreaY2);

  g.setFont("Vector", weatherFontSize);
  g.setColor("#FFFFFF");
  g.setFontAlign(1, -1, 0); // right-aligned columns for right side

  let currentY = weatherAreaY1;
  // Two-column layout: left column for Press/Alt~, right for Temp/HR/Steps
  const midX = Math.floor((sensorLeftX + weatherAreaX2) / 2);
  const leftColX = sensorLeftX; // left edge of left column (left-aligned)
  const rightColX = weatherAreaX2; // right edge of right column
  const lineMargin = 1; // tighter packing to fit all lines

  // Helper: barometric altitude estimate (ISA approximation)
  function pressureToAltitudeMeters(pHpa) {
    if (!pHpa || pHpa <= 0) return undefined;
    return 44330 * (1 - Math.pow(pHpa / 1013.25, 0.1903));
  }

  // Right-aligned list of onboard readings (always show with placeholders)
  // Temperature (right column)
  if ((currentY + weatherLineHeight) <= weatherAreaY2) {
    const tempStr = (internalTemperatureC !== null && isFinite(internalTemperatureC))
      ? `${Math.round(internalTemperatureC * 9/5 + 32)}°F (${Math.round(internalTemperatureC)}°C)`
      : "--";
    g.drawString(`Temp: ${tempStr}`, rightColX, currentY);
    currentY += weatherLineHeight + lineMargin;
  }
  // Heart Rate (right column)
  if ((currentY + weatherLineHeight) <= weatherAreaY2) {
    const hr = (Bangle.getHealthStatus && (Bangle.getHealthStatus().bpm || (Bangle.getHealthStatus("last")||{}).bpm)) || undefined;
    const hrStr = (hr && isFinite(hr)) ? `${Math.round(hr)} bpm` : "--";
    g.drawString(`HR: ${hrStr}`, rightColX, currentY);
    currentY += weatherLineHeight + lineMargin;
  }
  // Steps (right column)
  if ((currentY + weatherLineHeight) <= weatherAreaY2) {
    const steps = (Bangle.getHealthStatus && Bangle.getHealthStatus("day").steps);
    const stepsStr = (typeof steps === "number") ? `${steps}` : "--";
    g.drawString(`Steps: ${stepsStr}`, rightColX, currentY);
    currentY += weatherLineHeight + lineMargin;
  }
  // Left column: Press and Alt~ start at content left edge (right of LCARS border)
  // Draw text at a fixed left edge (sensorLeftX) and let feature buttons overdraw on top
  g.setFontAlign(-1, -1, 0);
  let leftY = weatherAreaY1;
  // Show Altimeter first, then Pressure (with tight label→value spacing)
  if ((leftY + weatherLineHeight) <= weatherAreaY2) {
    const altM = pressureToAltitudeMeters(internalPressureHpa);
    const altStr = (altM !== undefined && isFinite(altM)) ? `${Math.round(altM)} m` : "--";
    const label = "Alt~:";
    const gapPx = 1; // tighter than a normal space
    g.drawString(label, sensorLeftX, leftY);
    g.drawString(altStr, sensorLeftX + g.stringWidth(label) + gapPx, leftY);
    leftY += weatherLineHeight + lineMargin;
  }
  if ((leftY + weatherLineHeight) <= weatherAreaY2) {
    const pressStr = (internalPressureHpa !== null && isFinite(internalPressureHpa))
      ? `${Math.round(internalPressureHpa)} hPa`
      : "--";
    const label = "Press:";
    const gapPx = 1;
    g.drawString(label, sensorLeftX, leftY);
    g.drawString(pressStr, sensorLeftX + g.stringWidth(label) + gapPx, leftY);
    leftY += weatherLineHeight + lineMargin;
  }
  g.setFontAlign(-1, -1, 0);
  // Ensure feature buttons are on top
  drawFeatureButtons();

  // Finally, draw the separator on top of the sensor area
  // Recompute the hour button row top Y using the same sizing rules
  const marginBottom_sep = 4;
  const actualHourButtonHeight_sep = (g.getWidth() < 200) ? 18 : 28;
  const actualMinuteButtonHeight_sep = (g.getWidth() < 200) ? 21 : 22;
  const actualButtonGap_sep = (g.getWidth() < 200) ? 2 : 4;
  const minuteButtonsTopY_sep = r.y2 - marginBottom_sep - actualMinuteButtonHeight_sep + 1;
  const hourButtonsTopY_sep = minuteButtonsTopY_sep - actualButtonGap_sep - actualHourButtonHeight_sep;
  drawSeparatorBar(hourButtonsTopY_sep, r.x2);
}
// --- End Function to draw Weather Information ---

// --- Timer overlay ---
function toggleTimerOverlay() {
  showTimer = !showTimer;
  if (showTimer) {
    timerMode = "setup";
    timerRemainingMs = timerSetMs;
    if (timerIntervalId) clearInterval(timerIntervalId);
    timerIntervalId = setInterval(()=>{ drawTimerOverlay(); }, 200);
  } else {
    if (timerIntervalId) clearInterval(timerIntervalId);
    timerIntervalId = undefined;
    // Clear ALL timer UI bounds so nothing lingers
    backButtonBounds = null; 
    startPauseButtonBounds = null; 
    resetButtonBounds = null; 
    zeroButtonBounds = null;
    minPlusBounds = null; 
    minMinusBounds = null; 
    secPlusBounds = null; 
    secMinusBounds = null;
    // Fully redraw interface to clear any overlay artifacts (including back button)
    drawClockInterface();
  }
}

function drawTimerOverlay() {
  const r = Bangle.appRect;
  if (!r) return;
  const panelTop = lowerTop + hbarHt + gap + 2;
  // Make overlay reach down to just before the binary buttons
  const marginBottom_sep = 4;
  const actualHourButtonHeight_sep = (g.getWidth() < 200) ? 18 : 28;
  const actualMinuteButtonHeight_sep = (g.getWidth() < 200) ? 21 : 22;
  const actualButtonGap_sep = (g.getWidth() < 200) ? 2 : 4;
  const minuteButtonsTopY_sep = r.y2 - marginBottom_sep - actualMinuteButtonHeight_sep + 1;
  const hourButtonsTopY_sep = minuteButtonsTopY_sep - actualButtonGap_sep - actualHourButtonHeight_sep;
  const panelBottom = hourButtonsTopY_sep - 2;
  // Extend overlay left to cover the quiet/timer buttons and any sensor text
  // while keeping the back button (at x≈3) visible outside the overlay.
  const panelLeft = sbarWid + 1;
  const panelRight = g.getWidth() - 3;

  // Clear area
  g.setColor(colorBg);
  g.fillRect(panelLeft, panelTop, panelRight, panelBottom);

  // Back button on left border
  const backSize = (g.getWidth() < 200) ? 18 : 24;
  const backX1 = 3;
  const backY1 = panelTop + 4;
  g.setColor(colorLCARSGray);
  drawRoundedButton(backX1, backY1, backSize, backSize, 6, colorLCARSGray);
  g.setColor("#000000");
  g.setFont("6x8", 2);
  g.setFontAlign(0,0);
  g.drawString("<", backX1 + Math.floor(backSize/2), backY1 + Math.floor(backSize/2));
  backButtonBounds = { x1:backX1, y1:backY1, x2:backX1+backSize, y2:backY1+backSize };

  // Timer UI
  const cx = Math.floor((panelLeft + panelRight)/2);
  const cy = Math.floor((panelTop + panelBottom)/2);
  g.setFontAlign(0,0);
  g.setColor("#FFFFFF");
  const bigFont = (g.getWidth() < 200) ? 22 : 28;
  g.setFont("Vector", bigFont);

  // Update remaining time if running
  if (timerMode === "running") {
    const now = Date.now();
    timerRemainingMs = Math.max(0, timerEndTimeMs - now);
    if (timerRemainingMs <= 0) {
      timerMode = "finished";
      Bangle.buzz(500);
    }
  }

  // Format remaining or set time for display
  const dispMs = (timerMode === "setup") ? timerSetMs : timerRemainingMs;
  const totalSec = Math.floor(dispMs/1000);
  const ss = (totalSec % 60).toString().padStart(2,'0');
  const mm = (Math.floor(totalSec/60) % 60).toString().padStart(2,'0');
  const hh = Math.floor(totalSec/3600);
  const timeStr = (hh>0) ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
  const timeStrWidth = g.stringWidth(timeStr);
  const timeStrX1 = cx - Math.floor(timeStrWidth/2);
  g.drawString(timeStr, cx, cy);

  // Controls
  const btnW = (g.getWidth() < 200) ? 20 : 40;
  const btnH = (g.getWidth() < 200) ? 20 : 40;
  const gapY = 2;
  const smallGap = 2; // tighter spacing between Reset/Zero

  // Button layout: Start/Pause on left; Reset and Zero stacked closely on right
  const leftX = panelLeft + 6;
  const rightX = panelRight - 6 - btnW;
  const spBtnH = btnH + ((g.getWidth() < 200) ? 6 : 8); // make Start/Pause taller
  const spY = cy - Math.floor(spBtnH/2); // center aligned with time string
  // Right-side stack (Reset above Zero) placed close together and centered
  const rzTotalH = (spBtnH * 2) + smallGap;
  const rzTop = cy - Math.floor(rzTotalH/2);
  const rsY = rzTop;
  const zY  = rsY + spBtnH + smallGap;

  // Start/Pause/Done control (icon-only)
  const spX = leftX;
  drawRoundedButton(spX, spY, btnW, spBtnH, 6, colorLCARSGray);
  g.setColor("#000000");
  // Icons centered inside button
  const spCX = spX + Math.floor(btnW/2);
  const spCY = spY + Math.floor(spBtnH/2);
  if (timerMode === "running") {
    // Pause: two bars
    const barW = Math.max(2, Math.floor(btnW*0.15));
    const barH1 = Math.floor(spBtnH*0.6);
    const gapBars = Math.max(2, Math.floor(btnW*0.12));
    const y1 = spCY - Math.floor(barH1/2);
    g.fillRect(spCX - gapBars - barW, y1, spCX - gapBars - 1, y1 + barH1);
    g.fillRect(spCX + gapBars + 1, y1, spCX + gapBars + barW, y1 + barH1);
  } else if (timerMode === "paused" || timerMode === "setup") {
    // Play: right-pointing triangle
    const triW = Math.floor(btnW*0.45), triH = Math.floor(spBtnH*0.55);
    g.fillPoly([ spCX - Math.floor(triW/4), spCY - Math.floor(triH/2), spCX - Math.floor(triW/4), spCY + Math.floor(triH/2), spCX + Math.floor(triW/2), spCY ]);
  } else { // finished
    // Check mark
    const size = Math.floor(Math.min(btnW, spBtnH)*0.5);
    const x0 = spCX - Math.floor(size/2);
    const y0 = spCY - Math.floor(size/4);
    g.drawLine(x0, y0, x0 + Math.floor(size*0.3), y0 + Math.floor(size*0.3));
    g.drawLine(x0 + Math.floor(size*0.3), y0 + Math.floor(size*0.3), x0 + size, y0 - Math.floor(size*0.3));
  }
  startPauseButtonBounds = { x1:spX, y1:spY, x2:spX+btnW, y2:spY+spBtnH };

  // Reset button (restore to set time) - circular arrow icon
  const rsX = rightX;
  drawRoundedButton(rsX, rsY, btnW, spBtnH, 6, colorLCARSGray);
  g.setColor("#000000");
  const rcx = rsX + Math.floor(btnW/2);
  const rcy = rsY + Math.floor(spBtnH/2);
  const rr = Math.floor(Math.min(btnW, spBtnH)*0.35);
  g.drawCircle(rcx, rcy, rr);
  // Arrow head at top-right of circle
  const ahx = rcx + Math.floor(rr*0.7);
  const ahy = rcy - Math.floor(rr*0.7);
  g.fillPoly([ ahx, ahy, ahx + 5, ahy, ahx, ahy + 5 ]);
  resetButtonBounds = { x1:rsX, y1:rsY, x2:rsX+btnW, y2:rsY+spBtnH };

  // Zero button (set remaining and set time to 0:00) - zero icon
  const zX = rightX;
  drawRoundedButton(zX, zY, btnW, spBtnH, 6, colorLCARSGray);
  g.setColor("#000000");
  g.setFont("6x8", 2);
  g.setFontAlign(0,0);
  g.drawString("0", zX + Math.floor(btnW/2), zY + Math.floor(spBtnH/2));
  zeroButtonBounds = { x1:zX, y1:zY, x2:zX+btnW, y2:zY+spBtnH };

  // Setup mode increment/decrement controls
  if (timerMode === "setup") {
    // Triangle-only controls positioned directly above/below the digits
    const triW = Math.max(10, Math.floor(bigFont*0.8));
    const triH = Math.max(8, Math.floor(bigFont*0.65));
    const fontH = g.getFontHeight();
    const gapTri = Math.max(14, Math.floor(fontH*0.5)); // increase separation further
    const upY = cy - Math.floor(fontH/2) - gapTri;
    const dnY = cy + Math.floor(fontH/2) + gapTri;

    // Compute centers for MM and SS from actual rendered string widths
    const mmStr = mm, ssStr = ss;
    const mmW = g.stringWidth(mmStr);
    const colonW = g.stringWidth(":");
    const ssW = g.stringWidth(ssStr);
    const mmCX = timeStrX1 + Math.floor(mmW/2);
    const ssCX = timeStrX1 + mmW + colonW + Math.floor(ssW/2);

    g.setColor("#FFFFFF");
    // Minutes up/down triangles
    g.fillPoly([ mmCX, upY - Math.floor(triH/2), mmCX - Math.floor(triW/2), upY + Math.floor(triH/2), mmCX + Math.floor(triW/2), upY + Math.floor(triH/2) ]);
    minPlusBounds = { x1:mmCX - Math.floor(triW/2), y1:upY - Math.floor(triH/2), x2:mmCX + Math.floor(triW/2), y2:upY + Math.floor(triH/2) };
    g.fillPoly([ mmCX, dnY + Math.floor(triH/2), mmCX - Math.floor(triW/2), dnY - Math.floor(triH/2), mmCX + Math.floor(triW/2), dnY - Math.floor(triH/2) ]);
    minMinusBounds = { x1:mmCX - Math.floor(triW/2), y1:dnY - Math.floor(triH/2), x2:mmCX + Math.floor(triW/2), y2:dnY + Math.floor(triH/2) };

    // Seconds up/down triangles
    g.fillPoly([ ssCX, upY - Math.floor(triH/2), ssCX - Math.floor(triW/2), upY + Math.floor(triH/2), ssCX + Math.floor(triW/2), upY + Math.floor(triH/2) ]);
    secPlusBounds = { x1:ssCX - Math.floor(triW/2), y1:upY - Math.floor(triH/2), x2:ssCX + Math.floor(triW/2), y2:upY + Math.floor(triH/2) };
    g.fillPoly([ ssCX, dnY + Math.floor(triH/2), ssCX - Math.floor(triW/2), dnY - Math.floor(triH/2), ssCX + Math.floor(triW/2), dnY - Math.floor(triH/2) ]);
    secMinusBounds = { x1:ssCX - Math.floor(triW/2), y1:dnY - Math.floor(triH/2), x2:ssCX + Math.floor(triW/2), y2:dnY + Math.floor(triH/2) };
  }
}
// --- End Timer overlay ---

// --- Function to draw Feature Buttons ---
function drawFeatureButtons() {
  const r = Bangle.appRect;
  if (!r) return;

  // Single button for Quiet Mode toggle
  let buttonWidth = (g.getWidth() < 200) ? 28 : 34;
  let buttonHeight = (g.getWidth() < 200) ? 22 : 28;
  let buttonCornerRadius = 6;

  let weatherLineHeightEstimate = (g.getWidth() < 200) ? 15 : 17;
  const areaLeft = sbarWid + 5;
  const areaTop = (lowerTop + hbarHt + gap + 5) + weatherLineHeightEstimate + 18; // move down to free space for two columns

  let estTimeBtnAreaHeight = (g.getWidth() < 200) ? 45 : 55;
  const maxYForFeatureButtons = r.y2 - estTimeBtnAreaHeight - 5;

  // Ensure button fits in area
  if (areaTop + buttonHeight > maxYForFeatureButtons) {
    buttonHeight = maxYForFeatureButtons - areaTop;
  }

  const xStart = areaLeft;
  const yStart = areaTop;
  // Gray as main color, red when quiet mode is active
  const color = quietModeActive ? "#FF0000" : colorLCARSGray;

  // Clear the area before drawing
  g.setColor(colorBg);
  g.fillRect(xStart - 1, yStart - 1, xStart + buttonWidth + 1, yStart + buttonHeight + 1);

  // Draw single button
  drawRoundedButton(xStart, yStart, buttonWidth, buttonHeight, buttonCornerRadius, color);

  // Draw Do Not Disturb icon when quiet mode is active
  if (quietModeActive) {
    drawDoNotDisturbIcon(xStart + buttonWidth/2, yStart + buttonHeight/2, Math.min(buttonWidth, buttonHeight) * 0.6);
  }

  // Save touch bounds for quiet toggle
  quietToggleAreaBounds = { x1:xStart, y1:yStart, x2:xStart+buttonWidth, y2:yStart+buttonHeight };

  // Draw second button (Timer) to the right of quiet button
  const gapBetween = 6;
  const tX = xStart + buttonWidth + gapBetween;
  const tY = yStart;
  drawRoundedButton(tX, tY, buttonWidth, buttonHeight, buttonCornerRadius, colorLCARSGray);
  // Hourglass icon
  g.setColor("#000000");
  const hgSize = Math.floor(Math.min(buttonWidth, buttonHeight) * 0.6);
  const hgCx = tX + Math.floor(buttonWidth/2);
  const hgCy = tY + Math.floor(buttonHeight/2);
  const half = Math.floor(hgSize/2);
  const topY = hgCy - half + 1;
  const botY = hgCy + half - 1;
  // Draw top triangle (sand chamber)
  g.fillPoly([
    hgCx - half, topY,
    hgCx + half, topY,
    hgCx, hgCy
  ]);
  // Draw bottom triangle
  g.fillPoly([
    hgCx - half, botY,
    hgCx + half, botY,
    hgCx, hgCy
  ]);
  // Neck (thin band)
  g.fillRect(hgCx - 1, hgCy - 2, hgCx + 1, hgCy + 2);
  timerToggleAreaBounds = { x1:tX, y1:tY, x2:tX+buttonWidth, y2:tY+buttonHeight };
}
// --- End Function to draw Feature Buttons ---

function drawClockInterface() {
  ensureInitialSettingsCaptured(); 
g.setBgColor(colorBg);
g.clear();

  // Draw LCARS borders (this includes the quiet mode icon logic now)
  // ... (existing LCARS drawing code from drawClockInterface)
  let currentUpperLeftBorderColor = quietModeActive ? colorLCARSGray : colorLCARSOrange;
  g.setColor(currentUpperLeftBorderColor);
g.fillCircle(outRad, divisionPos - outRad, outRad);
g.fillRect(outRad, divisionPos - outRad, sbarWid + inRad, divisionPos);
  g.fillRect(outRad, divisionPos - hbarHt, sbarWid + outRad, divisionPos); 
  g.fillRect(0, 0, sbarWid, divisionPos - outRad); 
  g.setColor(colorBg); 
g.fillCircle(sbarWid + inRad + 1, divisionPos - hbarHt - inRad - 1, inRad);
g.fillRect(sbarWid + 1, divisionPos - outRad * 2, sbarWid + outRad, divisionPos - hbarHt - inRad);
g.setColor(colorLCARSPurple);
g.fillRect(sbarWid + outRad + gap + 1, divisionPos - hbarHt, g.getWidth(), divisionPos);
g.setColor(colorLCARSPink);
g.fillCircle(outRad, lowerTop + outRad, outRad);
g.fillRect(outRad, lowerTop, sbarWid + inRad, lowerTop + outRad);
  g.fillRect(outRad, lowerTop, sbarWid + outRad, lowerTop + hbarHt); 
  g.fillRect(0, lowerTop + outRad, sbarWid, sbarGapPos); 
  g.setColor(colorBg); 
g.fillCircle(sbarWid + inRad + 1, lowerTop + hbarHt + inRad + 1, inRad);
g.fillRect(sbarWid + 1, lowerTop + hbarHt + inRad, sbarWid + outRad, lowerTop + outRad * 2);
g.setColor(colorLCARSBrown);
g.fillRect(0, sbarGapPos + gap + 1, sbarWid, g.getHeight());

  // End LCARS borders draw (quiet icon removed; toggle moved to 2x2 grid)

  drawDaySegmentsBar(new Date().getDay()); 
  drawBatteryBar(E.getBattery()); 
  drawDigitalClock(new Date()); 
  // Steps now shown in the sensor panel
  drawWeatherInfo(); 
  drawFeatureButtons(); // Draw 2x2 quiet mode toggle grid

  redrawClock = true;
  updateClock(); // Use consolidated update function
  // Kick off GPS time sync opportunistically
  startGPSTimeSync();
  // Start periodic barometer and temperature sampling
  startBarometerSampling();
  startTemperatureSampling();
}

// Clear the screen once, at startup.
g.setBgColor(colorBg);
g.clear();

// Show launcher when middle button pressed
Bangle.setUI("clock");

// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

// clean app variables not defined with var/let/const
if (global.intervalRefSec) {
  clearInterval(intervalRefSec);
  delete global.intervalRefSec;
}

// Start the clock
drawClockInterface();

// If already charging at startup, begin flashing effect
if (isCharging) startChargingFlash();

// Setup touch listener for Quiet Mode toggle on new 2x2 grid
Bangle.on('touch', function(button, xy) {
  if (quietToggleAreaBounds) {
    if (xy.x >= quietToggleAreaBounds.x1 && xy.x <= quietToggleAreaBounds.x2 &&
        xy.y >= quietToggleAreaBounds.y1 && xy.y <= quietToggleAreaBounds.y2) {
      toggleQuietMode();
      // Redraw the 2x2 grid to reflect new state color
      drawFeatureButtons();
      return;
    }
  }
  if (timerToggleAreaBounds) {
    if (xy.x >= timerToggleAreaBounds.x1 && xy.x <= timerToggleAreaBounds.x2 &&
        xy.y >= timerToggleAreaBounds.y1 && xy.y <= timerToggleAreaBounds.y2) {
      toggleTimerOverlay();
      return;
    }
  }
  if (showTimer) {
    // Back
    if (backButtonBounds && xy.x >= backButtonBounds.x1 && xy.x <= backButtonBounds.x2 && xy.y >= backButtonBounds.y1 && xy.y <= backButtonBounds.y2) {
      toggleTimerOverlay();
      return;
    }
    // Start/Pause / Done
    if (startPauseButtonBounds && xy.x >= startPauseButtonBounds.x1 && xy.x <= startPauseButtonBounds.x2 && xy.y >= startPauseButtonBounds.y1 && xy.y <= startPauseButtonBounds.y2) {
      if (timerMode === "setup" || timerMode === "paused") {
        // Start
        timerRemainingMs = (timerMode === "setup") ? timerSetMs : timerRemainingMs;
        timerEndTimeMs = Date.now() + timerRemainingMs;
        timerMode = "running";
      } else if (timerMode === "running") {
        // Pause
        timerRemainingMs = Math.max(0, timerEndTimeMs - Date.now());
        timerMode = "paused";
      } else if (timerMode === "finished") {
        // Dismiss buzzed state; reset to setup
        timerMode = "setup";
        timerRemainingMs = timerSetMs;
      }
      return;
    }
    // Reset
    if (resetButtonBounds && xy.x >= resetButtonBounds.x1 && xy.x <= resetButtonBounds.x2 && xy.y >= resetButtonBounds.y1 && xy.y <= resetButtonBounds.y2) {
      timerRemainingMs = timerSetMs;
      if (timerMode === "running") timerEndTimeMs = Date.now() + timerRemainingMs;
      return;
    }
    // Zero
    if (zeroButtonBounds && xy.x >= zeroButtonBounds.x1 && xy.x <= zeroButtonBounds.x2 && xy.y >= zeroButtonBounds.y1 && xy.y <= zeroButtonBounds.y2) {
      timerSetMs = 0; timerRemainingMs = 0;
      if (timerMode === "running") timerEndTimeMs = Date.now();
      return;
    }
    // Setup increments
    if (timerMode === "setup") {
      if (minPlusBounds && xy.x >= minPlusBounds.x1 && xy.x <= minPlusBounds.x2 && xy.y >= minPlusBounds.y1 && xy.y <= minPlusBounds.y2) { timerSetMs += 60*1000; timerRemainingMs = timerSetMs; return; }
      if (minMinusBounds && xy.x >= minMinusBounds.x1 && xy.x <= minMinusBounds.x2 && xy.y >= minMinusBounds.y1 && xy.y <= minMinusBounds.y2) { timerSetMs = Math.max(0, timerSetMs - 60*1000); timerRemainingMs = timerSetMs; return; }
      if (secPlusBounds && xy.x >= secPlusBounds.x1 && xy.x <= secPlusBounds.x2 && xy.y >= secPlusBounds.y1 && xy.y <= secPlusBounds.y2) { timerSetMs = Math.min(99*60*1000+59*1000, timerSetMs + 1000); timerRemainingMs = timerSetMs; return; }
      if (secMinusBounds && xy.x >= secMinusBounds.x1 && xy.x <= secMinusBounds.x2 && xy.y >= secMinusBounds.y1 && xy.y <= secMinusBounds.y2) { timerSetMs = Math.max(0, timerSetMs - 1000); timerRemainingMs = timerSetMs; return; }
    }
  }
});

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower', on => {
  if (on) {
    redrawClock = true;
    // Draw immediately to kick things off.
    updateClock();
    // Bangle.drawWidgets(); // Widgets should redraw themselves if needed on lcdPower
    if (isCharging) startChargingFlash();
  } else {
    redrawClock = false;
    stopChargingFlash();
    stopBarometerSampling(); // Stop barometer when LCD off
    stopTemperatureSampling(); // Stop temperature sampling when LCD off
  }
});
