// Approximate Clock +
// Bangle.js 2
// App ID: approxclockplus

require("FontSinclair").add(Graphics);
require("FontTeletext5x9Ascii").add(Graphics);

const Storage = require("Storage");

const SETTINGS_FILE = "approxclockplus.json";

const settings = Storage.readJSON(SETTINGS_FILE, 1) || {};
const level = (typeof settings.level === "number") ? settings.level : 2;


// --------------------------------------------------
// Words
// --------------------------------------------------

const numbers = {
  0: "Twelve",
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
  11: "Eleven",
  12: "Twelve",

  13: "Thirteen",
  14: "Fourteen",
  15: "Fifteen",
  16: "Sixteen",
  17: "Seventeen",
  18: "Eighteen",
  19: "Nineteen",
  20: "Twenty",
  21: "Twenty-One",
  22: "Twenty-Two",
  23: "Twenty-Three",
  24: "Twenty-Four",
  25: "Twenty-Five",
  26: "Twenty-Six",
  27: "Twenty-Seven",
  28: "Twenty-Eight",
  29: "Twenty-Nine",
  30: "Thirty",
  31: "Thirty-One",
  32: "Thirty-Two",
  33: "Thirty-Three",
  34: "Thirty-Four",
  35: "Thirty-Five",
  36: "Thirty-Six",
  37: "Thirty-Seven",
  38: "Thirty-Eight",
  39: "Thirty-Nine",
  40: "Forty",
  41: "Forty-One",
  42: "Forty-Two",
  43: "Forty-Three",
  44: "Forty-Four",
  45: "Forty-Five",
  46: "Forty-Six",
  47: "Forty-Seven",
  48: "Forty-Eight",
  49: "Forty-Nine",
  50: "Fifty",
  51: "Fifty-One",
  52: "Fifty-Two",
  53: "Fifty-Three",
  54: "Fifty-Four",
  55: "Fifty-Five",
  56: "Fifty-Six",
  57: "Fifty-Seven",
  58: "Fifty-Eight",
  59: "Fifty-Nine"
};

const quarterWords = {
  0: "O'Clock",
  15: "Fifteen",
  30: "Thirty",
  45: "Forty-Five"
};


// --------------------------------------------------
// Display
// --------------------------------------------------

const width = g.getWidth();
const height = g.getHeight();

let drawTimeout;


// --------------------------------------------------
// Time helpers
// --------------------------------------------------

function getNearestHour(hours, minutes) {
  if (minutes > 54) {
    return hours + 1;
  }

  return hours;
}


function getMinutesByQuarter(minutes) {
  if (minutes < 10) {
    return 0;
  } else if (minutes < 20) {
    return 15;
  } else if (minutes < 40) {
    return 30;
  } else if (minutes < 55) {
    return 45;
  } else {
    return 0;
  }
}


function getApproximatePrefix(minutes, minutesByQuarter) {
  if (minutes === minutesByQuarter) {
    return " exactly";
  } else if (minutesByQuarter - minutes < -54) {
    return " nearly";
  } else if (minutesByQuarter - minutes < -5) {
    return " after";
  } else if (minutesByQuarter - minutes < 0) {
    return " just after";
  } else if (minutesByQuarter - minutes > 5) {
    return " before";
  } else {
    return " nearly";
  }
}


// --------------------------------------------------
// Level 0
// --------------------------------------------------

function getDayDescription(hour) {
  if (hour < 4) {
    return "Just after yesterday";
  }

  if (hour < 20) {
    return "Today";
  }

  return "Almost tomorrow";
}


// --------------------------------------------------
// Level 1
// --------------------------------------------------

function getBroadTimeDescription(hour) {
  if (hour < 6) {
    return "Night";
  }

  if (hour < 12) {
    return "Morning";
  }

  if (hour < 18) {
    return "Day";
  }

  return "Evening";
}


// --------------------------------------------------
// Drawing helpers
// --------------------------------------------------

function clearFace() {
  g.clear();
  g.reset();

  g.setBgColor(0, 0, 0);
  g.clearRect(0, 0, width, height);

  g.setColor(1, 1, 1);
}


function drawCentered(text, font, y) {
  g.setFont(font);

  g.drawString(
    text,
    (width - g.stringWidth(text)) / 2,
    y,
    false
  );
}


// --------------------------------------------------
// Level 0
// --------------------------------------------------

function drawLevel0(hour) {
  clearFace();

  g.setFont("Vector", 26);

  drawCentered(
    getDayDescription(hour),
    "Vector",
    height * 0.45
  );
}


// --------------------------------------------------
// Level 1
// --------------------------------------------------

function drawLevel1(hour) {
  clearFace();

  g.setFont("Vector", 30);

  drawCentered(
    getBroadTimeDescription(hour),
    "Vector",
    height * 0.45
  );
}


// --------------------------------------------------
// Level 2
// Original approximate clock
// --------------------------------------------------

function drawLevel2(hour, minutes) {
  const minutesByQuarter = getMinutesByQuarter(minutes);

  const prefix =
    "It's" +
    getApproximatePrefix(minutes, minutesByQuarter);

  const hourWord =
    numbers[getNearestHour(hour, minutes)];

  const minuteWord =
    quarterWords[minutesByQuarter];

  clearFace();

  g.setFont("Vector", 22);

  drawCentered(
    prefix,
    "Vector",
    height * 0.25
  );

  g.setFont("Vector", 30);

  drawCentered(
    hourWord,
    "Vector",
    height * 0.45
  );

  g.setFont("Vector", 22);

  drawCentered(
    minuteWord,
    "Vector",
    height * 0.70
  );
}


// --------------------------------------------------
// Level 3
// Exact time as words
// --------------------------------------------------

function drawLevel3(hour, minutes) {
  // Convert 24-hour time to the same 12-hour style
  // used by the approximate clock.

  let displayHour = hour % 12;

  if (displayHour === 0) {
    displayHour = 12;
  }

  const hourWord = numbers[displayHour];

  let minuteWord;

  if (minutes === 0) {
    minuteWord = "O'Clock";
  } else {
    minuteWord = numbers[minutes];
  }

  clearFace();

  g.setFont("Vector", 22);

  drawCentered(
    "It's",
    "Vector",
    height * 0.25
  );

  g.setFont("Vector", 30);

  drawCentered(
    hourWord,
    "Vector",
    height * 0.45
  );

  g.setFont("Vector", 22);

  drawCentered(
    minuteWord,
    "Vector",
    height * 0.70
  );
}


// --------------------------------------------------
// Main clock drawing
// --------------------------------------------------

function drawTime() {
  const date = new Date();

  const hour = date.getHours();
  const minutes = date.getMinutes();

  switch (level) {
    case 0:
      drawLevel0(hour);
      break;

    case 1:
      drawLevel1(hour);
      break;

    case 2:
      drawLevel2(hour, minutes);
      break;

    case 3:
      drawLevel3(hour, minutes);
      break;

    default:
      drawLevel2(hour, minutes);
      break;
  }

  queueDraw();
}


// --------------------------------------------------
// Draw once per minute
// --------------------------------------------------

function queueDraw() {
  if (drawTimeout) {
    clearTimeout(drawTimeout);
  }

  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    drawTime();
  }, 60000 - (Date.now() % 60000));
}


// --------------------------------------------------
// Exact numeric time on touch
// --------------------------------------------------

function drawTimeExact() {
  const dateTime = new Date();

  const hours = dateTime.getHours();
  const minutes = dateTime.getMinutes()
    .toString()
    .padStart(2, "0");

  clearFace();

  g.setFont("Vector", 30);

  drawCentered(
    hours + ":" + minutes,
    "Vector",
    height * 0.30
  );

  g.setFont("Vector", 26);

  const dateText =
    (dateTime.getMonth() + 1) +
    "/" +
    dateTime.getDate() +
    "/" +
    dateTime.getFullYear();

  drawCentered(
    dateText,
    "Vector",
    height * 0.60
  );
}


// --------------------------------------------------
// Startup
// --------------------------------------------------

drawTime();


// --------------------------------------------------
// LCD power
// --------------------------------------------------

Bangle.on("lcdPower", function(on) {
  if (on) {
    drawTime();
  } else if (drawTimeout) {
    clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});


// --------------------------------------------------
// Touch temporarily shows exact numeric time
// --------------------------------------------------

Bangle.on("touch", function(button, xy) {
  drawTimeExact();

  setTimeout(function() {
    drawTime();
  }, 7000);
});


// --------------------------------------------------
// Clock UI
// --------------------------------------------------

Bangle.setUI("clock");

Bangle.loadWidgets();
Bangle.drawWidgets();
