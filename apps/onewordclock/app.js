// timeout used to update every minute
var drawTimeout;

// https://www.espruino.com/Bangle.js+Locale

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function () {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

function wordFromHour(h) {
  const HOUR_WORDS = [
    "Midnight", "Early", "Quiet", "Still", "Dawn", "Earlybird",
    "Sunrise", "Morning", "Bright", "Active", "Busy", "Pre-noon",
    "Noon", "Post-noon", "Afternoon", "Siesta", "Breezy", "Evening",
    "Twilight", "Dinner", "Cozy", "Relax", "Quietude", "Night"
  ];

  return HOUR_WORDS[h];
}

function wordsFromDayMonth(day) {
  const DAY_WORD_ARRAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return DAY_WORD_ARRAY[day];
}

function draw() {
  var x = g.getWidth() / 2;
  var y = g.getHeight() / 2;
  g.reset();

  var d = new Date();
  var h = d.getHours();
  var m = d.getMinutes();
  var date = d.getDate();
  var day = d.getDay();
  var month = d.getMonth();

  var timeStr = wordFromHour(h);
  var dateStr = wordsFromDayMonth(day);

  // draw time
  g.setBgColor(g.theme.bg);
  g.setColor(g.theme.fg);
  g.clear();
  g.setFontAlign(0, 0).setFont("Vector", 36);

  // Calculate how much of the word should be colored based on minutes
  var coloredChars = Math.floor((timeStr.length * m) / 60);

  // Draw the colored portion first
  if (coloredChars > 0) {
    g.setColor(g.theme.bg2);
    var coloredPart = timeStr.substring(0, coloredChars);
    var coloredWidth = g.stringWidth(coloredPart);
    g.drawString(coloredPart, x - (g.stringWidth(timeStr) / 2) + (coloredWidth / 2), y);
  }

  // Draw the remaining portion
  if (coloredChars < timeStr.length) {
    g.setColor(g.theme.fg2);
    var remainingPart = timeStr.substring(coloredChars);
    var remainingWidth = g.stringWidth(remainingPart);
    g.drawString(remainingPart, x + (g.stringWidth(timeStr) / 2) - (remainingWidth / 2), y);
  }

  // draw date at bottom of screen
  g.setColor(g.theme.fg2);
  g.setFontAlign(0, 0).setFont("Vector", 20);
  g.drawString(g.wrapString(dateStr, g.getWidth()).join("\n"), x, g.getHeight() - 30);

  // queue draw in one minute
  queueDraw();
}

// Clear the screen once/, at startup
g.clear();
// draw immediately at first, queue update
draw();
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower', on => {
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

// Show launcher when middle button pressed
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
