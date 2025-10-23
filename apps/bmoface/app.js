const storage = require('Storage');

// Try to load fonts, but don't fail if they're not available (emulator compatibility)
try { require("Font6x12").add(Graphics); } catch(e) {}
try { require("Font8x12").add(Graphics); } catch(e) {}
try { require("Font7x11Numeric7Seg").add(Graphics); } catch(e) {}

function bigThenSmall(big, small, x, y) {
  g.setFont("6x8", 2);
  g.drawString(big, x, y);
  x += g.stringWidth(big);
  g.setFont("6x8", 2);
  g.drawString(small, x, y);
}

function getBackgroundImage() {
  // Cartoon face background - we'll create this
  return null; // Placeholder for now
}

function drawSmileShape(x, y, width, height, thickness) {
  // New approach: stamp small circles along an ellipse arc to get
  // naturally rounded ends (no polygons changed elsewhere)
  var startAngle = Math.PI / 5;
  var endAngle   = (4 * Math.PI) / 5;
  var step = Math.PI / 40; // small, keeps change minimal
  var rx = width/1.57;     // match previous horizontal scale
  var ry = height/2;
  var r  = Math.max(1, thickness/2);
  for (var a=startAngle; a<=endAngle; a+=step) {
    var px = x + rx * Math.cos(a);
    var py = y + ry * Math.sin(a);
    g.fillCircle(px, py, r);
  }
}

function drawLightningBolt(x, y, width, height) {
  // Draw lightning bolt using two opposing acute triangles
  // x, y = center point
  // width = how wide the bolt is
  // height = how tall the bolt is
  g.setColor(0x000000);
  
  var halfWidth = width / 2.5;
  var halfHeight = height / 1;
  
  // Upper triangle (pointing down-right)
  var upperTriangle = [
    x, y - halfHeight,           // Top center point
    x + halfWidth, y,            // Right middle point  
    x - halfWidth/2, y + halfHeight/2  // Left lower point
  ];
  g.fillPoly(upperTriangle);
  
  // Lower triangle (pointing up-left)  
  var lowerTriangle = [
    x, y + halfHeight,           // Bottom center point
    x - halfWidth, y,            // Left middle point
    x + halfWidth/2, y - halfHeight/2  // Right upper point
  ];
  g.fillPoly(lowerTriangle);
}

function drawFinnFace() {
  var isCharging = Bangle.isCharging();
 
  // White hood ears
  g.setColor(0xFFFFFF);
  g.fillCircle(30, 20, 22); // Left ear (x, y, radius)
  g.fillCircle(140, 20, 22); // Right ear (x, y, radius)
  
  // White hood behind face
  g.setColor(0xFFFFFF); // White
  g.fillCircle(85, 82, 85); // Hood circle (x, y, radius)
  
  // Finn's face (flesh colored circle)
  g.setColor(0.95, 0.8, 0.7); // Flesh color
  g.fillEllipse(150, 100, 20, 10); // Face circle (x, y, radius)
  
  // Outlines
  g.setColor(0x000000);
  g.drawEllipse(150, 100, 20, 10); // Face outline
  g.drawCircle(85, 85, 85); // Hood outline
  
  // White squared bottom for hood (behind everything)
  g.setColor(0xFFFFFF); // White
  g.fillRect(2, 102, 168, 180); // Squared hood bottom (x1, y1, x2, y2)
   
  if (isCharging) {
    // Lightning bolt eyes when charging
    drawLightningBolt(32, 55, 12, 20);  // Left lightning bolt
    drawLightningBolt(139, 55, 12, 20); // Right lightning bolt
  } else {
    // Normal circular eyes
    g.setColor(0x000000);
    g.fillCircle(35, 55, 10);  // Left eye (x, y, radius)
    g.fillCircle(135, 55, 10); // Right eye (x, y, radius)
  }
  
  // Curved smile using arc
  g.setColor(0x000000);
  // Draw curved smile: center at (85, 100), radius 20, from 0.2*PI to 0.8*PI
  var smilePoints = [];
  for (var angle = 0.2 * Math.PI; angle <= 0.8 * Math.PI; angle += 0.1) {
    var x = 85 + 20 * Math.cos(angle);
    var y = 60 + 20 * Math.sin(angle);
    smilePoints.push(x, y);
  }
  g.drawPoly(smilePoints);
}

function drawBMOFace() {
  var isCharging = Bangle.isCharging();
  
  if (isCharging) {
    // Lightning bolt eyes when charging
    drawLightningBolt(32, 55, 12, 20);  // Left lightning bolt (x, y, width, height)
    drawLightningBolt(139, 55, 12, 20); // Right lightning bolt (x, y, width, height)
  } else {
    // Normal circular eyes
    g.setColor(0x000000);
    g.fillCircle(32, 55, 10);  // Left eye - moved up and left
    g.fillCircle(139, 55, 10);  // Right eye - moved up and left
  }
  
  // BMO mouth structure - all elements follow the same calculated curve
  // Black mouth outline
  g.setColor(0x424242);
  drawSmileShape(85, 86, 40, 20, 29);  // Black smile outline
  
  // Inside of mouth (dark green)
  g.setColor(0x225c27); // Dark green
  drawSmileShape(85, 85, 43, 20, 20);  // Dark green inside smile
  
  // Tongue (medium green)
  g.setColor(0x474747); // Medium green
  drawSmileShape(85, 99, 40, 10, 6);  // Green tongue smile
  
  // Curved white tooth line (smile)
  g.setColor(0xFFFFFF);
  drawSmileShape(85, 80, 50, 12, 4);  // White tooth line smile
}

function drawJakeFace() {
  var isCharging = Bangle.isCharging();
  
  // Black circles behind Jake's eyes
  g.setColor(0x000000);
  g.fillCircle(45, 63, 30); // Left black eye background (x, y, radius)
  g.fillCircle(115, 63, 30); // Right black eye background (x, y, radius)
  
  // Jake's white eyes on top of black circles
  g.setColor(0xFFFFFF); // White
  g.fillCircle(50, 60, 25); // Left eye (x, y, radius)
  g.fillCircle(120, 60, 25); // Right eye (x, y, radius)
  
  // Eye outlines
  g.setColor(0x000000);
  g.drawCircle(50, 60, 25); // Left eye outline
  g.drawCircle(120, 60, 25); // Right eye outline
  
  if (isCharging) {
    // Lightning bolt eyes when charging (inside the white circles)
    drawLightningBolt(50, 60, 8, 15);  // Left lightning bolt (x, y, width, height)
    drawLightningBolt(120, 60, 8, 15); // Right lightning bolt (x, y, width, height)
  }
  
  // Jake's jowls - horizontal pointed oval (like an eye shape)
  g.setColor(0xFFFF00); // Yellow
  g.fillEllipse(130, 140, 45, 65); // Main jowl oval (center x, center y, width, height)
  
  // Jowl outline
  g.setColor(0x000000);
  g.drawEllipse(130, 120, 45, 65); // Main jowl outline (center x, center y, width, height)
  g.drawEllipse(45, 130, 70, 77); // Left droop outline
  g.drawEllipse(105, 130, 130, 77); // Right droop outline

  g.setColor(0xFFFF00);
  g.fillEllipse(47, 125, 68, 75); // Inner left droop oval (center x, center y, width, height)
  g.fillEllipse(107, 125, 128, 75); // Inner right droop oval (center x, center y, width, height)

  // Black horizontal oval nose
  g.setColor(0x000000);
  g.fillEllipse(107, 105, 68, 80); // Nose oval (center x, center y, width, height)
}
  // g.fillEllipse(105, 105, 68, 80); // Nose oval (center x, center y, width, height)

function drawCartoonFace() {
  var settings = require("Storage").readJSON("bmoface.settings.json", 1) || {};
  var character = settings.character || "BMO";
  
  if (character === "Finn") {
    drawFinnFace();
  } else if (character === "Jake") {
    drawJakeFace();
  } else {
    drawBMOFace(); // Default BMO face
  }
}

// Global variables for randomizer
var randomizerTimeout = null;
var currentCharacter = null;

// schedule a draw for the next minute
var drawTimeout;
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

function clearIntervals() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
  if (randomizerTimeout) {
    clearTimeout(randomizerTimeout);
    randomizerTimeout = null;
  }
}

// Start character randomizer
function startCharacterRandomizer() {
  clearIntervals();
  
  var settings = require("Storage").readJSON("bmoface.settings.json", 1) || {};
  var interval = settings.randomizerInterval || 0;
  
  if (interval === 0) return; // Off
  if (interval === 4) return; // On Wake - handled in lock event
  
  var intervals = [0, 5, 10, 30]; // minutes
  var intervalMs = intervals[interval] * 60 * 1000;
  
  if (intervalMs > 0) {
    randomizerTimeout = setTimeout(function() {
      cycleCharacter();
      startCharacterRandomizer(); // Restart timer
    }, intervalMs);
  }
}

// Cycle to next character
function cycleCharacter() {
  var characters = ["BMO", "Finn", "Jake"];
  var settings = require("Storage").readJSON("bmoface.settings.json", 1) || {};
  var currentIndex = characters.indexOf(currentCharacter || settings.character || "BMO");
  var nextIndex = (currentIndex + 1) % characters.length;
  currentCharacter = characters[nextIndex];
  
  // Update settings
  settings.character = currentCharacter;
  require("Storage").writeJSON("bmoface.settings.json", settings);
  
  // Redraw
  if (Bangle.isLocked()) {
    drawLockedScreen();
  } else {
    draw();
  }
}

function drawClock() {
  g.setFont("7x11Numeric7Seg", 3);
  g.setColor(0, 0, 0); // Black text directly on green background
  // Top-center time
  var t = require("locale").time(new Date(), 1);
  var tx = (g.getWidth() - g.stringWidth(t)) / 2;
  g.drawString(t, tx, 8);
  g.setFont("6x8", 2);
  g.drawString(require("locale").dow(new Date(), 2).toUpperCase(), 18, 140);
  g.setFont("6x8", 2);
  g.drawString(require("locale").month(new Date(), 2).toUpperCase(), 77, 126);
  g.setFont("6x8", 2);
  const time = new Date().getDate();
  g.drawString(time < 10 ? "0" + time : time, 78, 145);
}

function drawBattery() {
  bigThenSmall(E.getBattery(), "%", 146, 8);
}

function getTemperature(){
  try {
    var temperature = E.getTemperature();
    var settings = require("Storage").readJSON("bmoface.settings.json", 1) || {};
    var useFahrenheit = settings.tempUnit === "F";
    
    if (useFahrenheit) {
      temperature = (temperature * 9/5) + 32;
      return Math.round(temperature) + "F";
    } else {
      var formatted = require("locale").temp(temperature).replace(/[^\d-]/g, '');
      return formatted;
    }
  } catch(ex) {
    print(ex)
    return "--"
  }
}

function getSteps() {
  var steps = Bangle.getHealthStatus("day").steps;
  steps = Math.round(steps/1000);
  return steps + "k";
}

function drawBorders() {
  // Top border - thin dark teal/green line
  g.setColor(0.1, 0.4, 0.3); // Dark teal/green
  g.fillRect(0, 0, g.getWidth(), 6);
  
  // Bottom border - thicker bar (no progress indicator)
  g.fillRect(0, g.getHeight() - 8, g.getWidth(), g.getHeight());
}

function draw() {
  queueDraw();

  // Clear to character-appropriate background
  g.clear();
  var settings = require("Storage").readJSON("bmoface.settings.json", 1) || {};
  var character = settings.character || "BMO";
  
  if (character === "Finn") {
    g.setColor(0.1, 0.3, 1.0); // Light blue for Finn
  } else if (character === "Jake") {
    g.setColor(1.0, 1.0, 0.0); // Yellow for Jake
  } else {
    g.setColor(0.35, 0.78, 0.45); // Light green for BMO
  }
  g.fillRect(0, 0, g.getWidth(), g.getHeight());
  
  // Draw borders (only for BMO, not Finn or Jake)
  if (character === "BMO") {
    drawBorders();
  }
  
  // Draw cartoon face
  drawCartoonFace();
  
  // Draw AdvCasio information like the original
  g.setColor(0x000000); // Black text
  
  g.setFontAlign(-1,-1);
  g.setFont("6x8", 2);
  // Temperature - upper left
  g.drawString(getTemperature(), 6, 6);
  
  // Steps - bottom right
  var stepsStr = getSteps();
  var sx = g.getWidth() - g.stringWidth(stepsStr) - 6;
  var sy = g.getHeight() - g.getFontHeight() - 6;
  g.drawString(stepsStr, sx, sy);
  
  // Heart rate just above steps
  var hr = Bangle.getHealthStatus().bpm || Bangle.getHealthStatus("last").bpm;
  var hrStr = (hr && isFinite(hr)) ? String(Math.round(hr)) : "--";
  var hx = g.getWidth() - g.stringWidth(hrStr) - 6;
  var hy = sy - g.getFontHeight() - 2;
  g.drawString(hrStr, hx, hy);

  g.setFontAlign(-1,-1);
  drawClock();
  drawBattery();

  // Hide widgets
  for (let wd of WIDGETS) {wd.draw=()=>{};wd.area="";}
}

// Draw BMO's locked face
function drawBMOLockedFace() {
  // BMO horizontal mouth slit
  g.setColor(0x000000);
  g.fillRect(60, 90, 120, 83);
}

// Draw Finn's locked face
function drawFinnLockedFace() {
  // Black outlines on top
  g.setColor(0x000000);
  g.drawEllipse(150, 100, 20, 10); // Face outline
  g.drawCircle(85, 85, 85); // Hood outline

  // Gray hood bottom rectangle (same as white one but gray)
  g.setColor(0.8, 0.8, 0.8); // Same gray as lock screen background
  g.fillRect(2, 102, 168, 180); // Squared hood bottom (x1, y1, x2, y2)
    
  // Finn's shorter horizontal mouth slit
  g.setColor(0x000000);
  g.fillRect(70, 85, 105, 83);
}

// Draw Jake's locked face
function drawJakeLockedFace() {
  // Black jowl outlines on top
  g.setColor(0x000000);
  g.drawEllipse(130, 120, 45, 65); // Main jowl outline
  
  g.setColor(0.8, 0.8, 0.8); // Same gray as lock screen background  
  g.fillEllipse(130, 140, 45, 65); // Main jowl oval

  g.setColor(0x000000);
  g.drawEllipse(45, 130, 70, 77); // Left droop outline
  g.drawEllipse(105, 130, 130, 77); // Right droop outline
  g.setColor(0.8, 0.8, 0.8); // Same gray as lock screen background  
  g.fillEllipse(47, 125, 68, 75); // Inner left droop oval
  g.fillEllipse(107, 125, 128, 75); // Inner right droop oval

  // Jake's upside-down V mouth (^) - two intersecting lines, centered on nose
  g.setColor(0x000000);
  g.drawLine(65, 120, 85, 85); // Left line: bottom-left to apex
  g.drawLine(105, 120, 85, 85); // Right line: bottom-right to apex
  
  // Black horizontal oval nose
  g.setColor(0x000000);
  g.fillEllipse(95, 95, 75, 80); // Nose oval (center x, center y, width, height)
}

// Draw the sleeping overlay version when locked
function drawLockedScreen() {
  // Light gray background like LCD
  g.clear();
  g.setColor(0.8, 0.8, 0.8);
  g.fillRect(0, 0, g.getWidth(), g.getHeight());

  // Get character setting first
  var settings = require("Storage").readJSON("bmoface.settings.json", 1) || {};
  var character = settings.character || "BMO";

  // Draw borders only for BMO
  if (character === "BMO") {
    drawBorders();
  }
  
  // Schedule next update for time refresh
  queueDraw();

  var isCharging = Bangle.isCharging();
  
  if (isCharging) {
    // Lightning bolt eyes when charging (even when locked)
    if (character === "Jake") {
      // Jake's lightning bolts in white eye circles
      g.setColor(0xFFFFFF); // White eye background
      g.fillCircle(50, 60, 25); // Left eye
      g.fillCircle(120, 60, 25); // Right eye
      g.setColor(0x000000);
      g.drawCircle(50, 60, 25); // Left eye outline
      g.drawCircle(120, 60, 25); // Right eye outline
      drawLightningBolt(50, 60, 8, 15);  // Left lightning bolt
      drawLightningBolt(120, 60, 8, 15); // Right lightning bolt
    } else {
      // BMO/Finn lightning bolts
      drawLightningBolt(32, 55, 12, 20);  // Left lightning bolt (x, y, width, height)
      drawLightningBolt(139, 55, 12, 20); // Right lightning bolt (x, y, width, height)
    }
  } else {
    // Sleeping face: horizontal slits
    g.setColor(0x000000);
    if (character === "Jake") {
      // Jake's sleeping eyes in white circles
      g.setColor(0xFFFFFF); // White eye background
      g.fillCircle(50, 60, 25); // Left eye
      g.fillCircle(120, 60, 25); // Right eye
      g.setColor(0x000000);
      g.drawCircle(50, 60, 25); // Left eye outline
      g.drawCircle(120, 60, 25); // Right eye outline
      // Horizontal slits inside the white circles
      g.fillRect(30, 60, 70, 63); // left slit
      g.fillRect(100, 60, 140, 63); // right slit
  } else {
    // BMO/Finn sleeping eyes
    g.fillRect(22, 55, 42, 58); // left slit: y fixed by height of 3 px
    g.fillRect(129, 55, 149, 58); // right slit
  }
}
  
  // Draw character-specific locked faces
  if (character === "Finn") {
    drawFinnLockedFace();
  } else if (character === "Jake") {
    drawJakeLockedFace();
  } else {
    drawBMOLockedFace();
  }

  // Redraw information in black at same positions
  g.setColor(0x000000);
  g.setFontAlign(-1,-1);
  g.setFont("6x8", 2);
  g.drawString(getTemperature(), 6, 6);

  var stepsStr = getSteps();
  var sx = g.getWidth() - g.stringWidth(stepsStr) - 6;
  var sy = g.getHeight() - g.getFontHeight() - 6;
  g.drawString(stepsStr, sx, sy);

  var hr = Bangle.getHealthStatus().bpm || Bangle.getHealthStatus("last").bpm;
  var hrStr = (hr && isFinite(hr)) ? String(Math.round(hr)) : "--";
  var hx = g.getWidth() - g.stringWidth(hrStr) - 6;
  var hy = sy - g.getFontHeight() - 2;
  g.drawString(hrStr, hx, hy);

  g.setFontAlign(-1,-1);
  drawClock();
  drawBattery();

  // Keep widgets hidden
  for (let wd of WIDGETS) {wd.draw=()=>{};wd.area="";}
}

Bangle.on("lcdPower", (on) => {
  if (on) {
    draw();
  } else {
    clearIntervals();
  }
});

Bangle.on("lock", (locked) => {
  clearIntervals();
  if (locked) {
    drawLockedScreen();
  } else {
    // Check if "On Wake" randomizer is enabled
    var settings = require("Storage").readJSON("bmoface.settings.json", 1) || {};
    if (settings.randomizerInterval === 4) {
      cycleCharacter();
    }
    draw();
    startCharacterRandomizer();
  }
});

Bangle.setUI("clock");

// Load widgets, but don't show them
Bangle.loadWidgets();
require("widget_utils").swipeOn(); // hide widgets, make them visible with a swipe

// Initialize current character from settings
var settings = require("Storage").readJSON("bmoface.settings.json", 1) || {};
currentCharacter = settings.character || "BMO";

// Start character randomizer
startCharacterRandomizer();

g.clear();
draw();