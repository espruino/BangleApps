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

function wordsFromDayMonth(day, date, month) {
  const DAY_WORD_ARRAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const DATE_WORD_ARRAY = ["zero", "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth", "twentieth", "twenty-first", "twenty-second", "twenty-third", "twenty-fourth", "twenty-fifth", "twenty-sixth", "twenty-seventh", "twenty-eighth", "twenty-ninth", "thirtieth", "thirty-first"];
  const MONTH_WORD_ARRAY = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var words = " ";
  words = DAY_WORD_ARRAY[day] + ", " + DATE_WORD_ARRAY[date] + " of " + MONTH_WORD_ARRAY[month];
  if ((date == 1) && (month == 0)) {
    words = "New Year's Day";
  } else if ((date == 15) && (month == 2)) {
    words = DAY_WORD_ARRAY[day] + " on the Ides of March";
  } else if ((date == 1) && (month == 3)) {
    words = DAY_WORD_ARRAY[day] + ", ERROR C Nonsense in BASIC";
  } else if ((date == 1) && (month == 6)) {
    words = DAY_WORD_ARRAY[day] + "  - O'Canada";
  } else if ((date == 31) && (month == 9)) {
    words = DAY_WORD_ARRAY[day] + " - on Halloween";
  } else if ((date == 24) && (month == 11)) {
    words = "Christmas Eve";
  } else if ((date == 25) && (month == 11)) {
    words = "Christmas Day";
  } else if ((date == 26) && (month == 11)) {
    words = "Boxing Day";
  } else if ((date == 31) && (month == 11)) {
    words = "New Year's eve";
  }
  return words;
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
  var dateStr = wordsFromDayMonth(day, date, month);

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
    g.setColor(g.theme.fg);
    var remainingPart = timeStr.substring(coloredChars);
    var remainingWidth = g.stringWidth(remainingPart);
    g.drawString(remainingPart, x + (g.stringWidth(timeStr) / 2) - (remainingWidth / 2), y);
  }

  // draw date at bottom of screen
  g.setColor(g.theme.fg);
  g.setFontAlign(0, 0).setFont("Vector", 12);
  g.drawString(g.wrapString(dateStr, g.getWidth()).join("\n"), x, g.getHeight() - 24);

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
