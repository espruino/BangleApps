const SETTINGS_FILE = "infoclk.json";
const FONT = require('infoclk-font.js');

const storage = require("Storage");
const locale = require("locale");
const weather = require('weather');

let config = Object.assign({
  seconds: {
    // Displaying the seconds can reduce battery life because the CPU must wake up more often to update the display.
    // The seconds will be shown unless one of these conditions is enabled here, and currently true.
    hideLocked: false,  // Hide the seconds when the display is locked.
    hideBattery: 20,    // Hide the seconds when the battery is at or below a defined percentage.
    hideTime: true,     // Hide the seconds when between a certain period of time. Useful for when you are sleeping and don't need the seconds
    hideStart: 2200,    //    The time when the seconds are hidden: first 2 digits are hours on a 24 hour clock, last 2 are minutes
    hideEnd: 700,      //    The time when the seconds are shown again
    hideAlways: false,  // Always hide (never show) the seconds
  },

  date: {
    // Settings related to the display of the date
    mmdd: true,           // If true, display the month first. If false, display the date first.
    separator: '-',       // The character that goes between the month and date
    monthName: false,     // If false, display the month as a number. If true, display the name.
    monthFullName: false, //    If displaying the name: If false, display an abbreviation. If true, display a full name.
    dayFullName: false,   // If false, display the day of the week's abbreviation. If true, display the full name.
  },

  bottomLocked: {
    display: 'weather'    // What to display in the bottom row when locked:
    //    'weather': The current temperature and weather description
    //    'steps': Step count
    //    'health': Step count and bpm
    //    'progress': Day progress bar
    //    false: Nothing
  },

  shortcuts: [
    //8 shortcuts, displayed in the bottom half of the screen (2 rows of 4 shortcuts) when unlocked
    //    false = no shortcut
    //    '#LAUNCHER' = open the launcher
    //    any other string = name of app to open
    'stlap', 'keytimer', 'pomoplus', 'alarm',
    'rpnsci', 'calendar', 'torch', 'weather'
  ],

  swipe: {
    // 3 shortcuts to launch upon swiping:
    //    false = no shortcut
    //    '#LAUNCHER' = open the launcher
    //    any other string = name of app to open
    up: 'messages',       // Swipe up or swipe down, due to limitation of event handler
    left: '#LAUNCHER',
    right: '#LAUNCHER',
  },

  dayProgress: {
    // A progress bar representing how far through the day you are
    enabledLocked: true,    // Whether this bar is enabled when the watch is locked
    enabledUnlocked: false, // Whether the bar is enabled when the watch is unlocked
    color: [0, 0, 1],      // The color of the bar
    start: 700,            // The time of day that the bar starts filling
    end: 2200,              // The time of day that the bar becomes full
    reset: 300             // The time of day when the progress bar resets from full to empty
  },

  lowBattColor: {
    // The text can change color to indicate that the battery is low
    level: 20,        // The percentage where this happens
    color: [1, 0, 0]  // The color that the text changes to
  }
}, storage.readJSON(SETTINGS_FILE));

// Return whether the given time (as a date object) is between start and end (as a number where the first 2 digits are hours on a 24 hour clock and the last 2 are minutes), with end time wrapping to next day if necessary
function timeInRange(start, time, end) {

  // Convert the given date object to a time number
  let timeNumber = time.getHours() * 100 + time.getMinutes();

  // Normalize to prevent the numbers from wrapping around at midnight
  if (end <= start) {
    end += 2400;
    if (timeNumber < start) timeNumber += 2400;
  }

  return start <= timeNumber && timeNumber <= end;
}

// Return whether settings should be displayed based on the user's configuration
function shouldDisplaySeconds(now) {
  return !(
    (config.seconds.hideAlways) ||
    (config.seconds.hideLocked && Bangle.isLocked()) ||
    (E.getBattery() <= config.seconds.hideBattery) ||
    (config.seconds.hideTime && timeInRange(config.seconds.hideStart, now, config.seconds.hideEnd))
  );
}

// Determine the font size needed to fit a string of the given length widthin maxWidth number of pixels, clamped between minSize and maxSize
function getFontSize(length, maxWidth, minSize, maxSize) {
  let size = Math.floor(maxWidth / length);  //Number of pixels of width available to character
  size *= (20 / 12);  //Convert to height, assuming 20 pixels of height for every 12 of width

  // Clamp to within range
  if (size < minSize) return minSize;
  else if (size > maxSize) return maxSize;
  else return Math.floor(size);
}

// Get the current day of the week according to user settings
function getDayString(now) {
  if (config.date.dayFullName) return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
  else return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
}

// Pad a number with zeros to be the given number of digits
function pad(number, digits) {
  let result = '' + number;
  while (result.length < digits) result = '0' + result;
  return result;
}

// Get the current date formatted according to the user settings
function getDateString(now) {
  let month;
  if (!config.date.monthName) month = pad(now.getMonth() + 1, 2);
  else if (config.date.monthFullName) month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][now.getMonth()];
  else month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][now.getMonth()];

  if (config.date.mmdd) return `${month}${config.date.separator}${pad(now.getDate(), 2)}`;
  else return `${pad(now.getDate(), 2)}${config.date.separator}${month}`;
}

// Get a floating point number from 0 to 1 representing how far between the user-defined start and end points we are
function getDayProgress(now) {
  let start = config.dayProgress.start;
  let current = now.getHours() * 100 + now.getMinutes();
  let end = config.dayProgress.end;
  let reset = config.dayProgress.reset;

  // Normalize
  if (end <= start) end += 2400;
  if (current < start) current += 2400;
  if (reset < start) reset += 2400;

  // Convert an hhmm number into a floating-point hours
  function toDecimalHours(time) {
    let hours = Math.floor(time / 100);
    let minutes = time % 100;

    return hours + (minutes / 60);
  }

  start = toDecimalHours(start);
  current = toDecimalHours(current);
  end = toDecimalHours(end);
  reset = toDecimalHours(reset);

  let progress = (current - start) / (end - start);

  if (progress < 0 || progress > 1) {
    if (current < reset) return 1;
    else return 0;
  } else {
    return progress;
  }
}

// Get a Gadgetbridge weather string
function getWeatherString() {
  let current = weather.get();
  if (current) return locale.temp(current.temp - 273.15) + ', ' + current.txt;
  else return 'Weather unknown!';
}

// Get a second weather row showing humidity, wind speed, and wind direction
function getWeatherRow2() {
  let current = weather.get();
  if (current) return `${current.hum}%, ${locale.speed(current.wind)} ${current.wrose}`;
  else return 'Check Gadgetbridge';
}

// Get a step string
function getStepsString() {
  return '' + Bangle.getHealthStatus('day').steps + ' steps';
}

// Get a health string including daily steps and recent bpm
function getHealthString() {
  return `${Bangle.getHealthStatus('day').steps} steps ${Bangle.getHealthStatus('last').bpm} bpm`;
}

// Set the next timeout to draw the screen
let drawTimeout;
function setNextDrawTimeout() {
  if (drawTimeout) {
    clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }

  let time;
  let now = new Date();
  if (shouldDisplaySeconds(now)) time = 1000 - (now.getTime() % 1000);
  else time = 60000 - (now.getTime() % 60000);

  drawTimeout = setTimeout(draw, time);
}


const DIGIT_WIDTH = 40; // How much width is allocated for each digit, 37 pixels + 3 pixels of space (which will go off of the screen on the right edge)
const COLON_WIDTH = 19; // How much width is allocated for the colon, 16 pixels + 3 pixels of space
const HHMM_TOP = 27;    // 24 pixels for widgets + 3 pixels of space
const DIGIT_HEIGHT = 64; // How tall the digits are

const SECONDS_TOP = HHMM_TOP + DIGIT_HEIGHT + 3;    // The top edge of the seconds, top of hours and minutes + digit height + space
const SECONDS_LEFT = 2 * DIGIT_WIDTH + COLON_WIDTH; // The left edge of the seconds: displayed after 2 digits and the colon
const DATE_LETTER_HEIGHT = DIGIT_HEIGHT / 2;        // Each letter of the day of week and date will be half the height of the time digits

const DATE_CENTER_X = SECONDS_LEFT / 2;                       // Day of week and date will be centered between left edge of screen and where seconds start
const DOW_CENTER_Y = SECONDS_TOP + (DATE_LETTER_HEIGHT / 2);  // Day of week will be the top row
const DATE_CENTER_Y = DOW_CENTER_Y + DATE_LETTER_HEIGHT;      // Date will be the bottom row
const DOW_DATE_CENTER_Y = SECONDS_TOP + (DIGIT_HEIGHT / 2);   // When displaying both on one row, center it
const BOTTOM_CENTER_Y = ((SECONDS_TOP + DIGIT_HEIGHT + 3) + g.getHeight()) / 2;

// Draw the clock
function draw() {
  //Prepare to draw
  g.reset()
    .setFontAlign(0, 0);

  if (E.getBattery() <= config.lowBattColor.level) {
    let color = config.lowBattColor.color;
    g.setColor(color[0], color[1], color[2]);
  }
  now = new Date();

  if (Bangle.isLocked()) {  //When the watch is locked
    g.clearRect(0, 24, g.getWidth(), g.getHeight());

    //Draw the hours and minutes
    let x = 0;

    for (let digit of locale.time(now, 1)) {  //apparently this is how you get an hh:mm time string adjusting for the user's 12/24 hour preference
      if (digit != ' ') g.drawImage(FONT[digit], x, HHMM_TOP);
      if (digit == ':') x += COLON_WIDTH;
      else x += DIGIT_WIDTH;
    }
    if (storage.readJSON('setting.json')['12hour']) g.drawImage(FONT[(now.getHours() < 12) ? 'am' : 'pm'], 0, HHMM_TOP);

    //Draw the seconds if necessary
    if (shouldDisplaySeconds(now)) {
      let tens = Math.floor(now.getSeconds() / 10);
      let ones = now.getSeconds() % 10;
      g.drawImage(FONT[tens], SECONDS_LEFT, SECONDS_TOP)
        .drawImage(FONT[ones], SECONDS_LEFT + DIGIT_WIDTH, SECONDS_TOP);

      // Draw the day of week and date assuming the seconds are displayed

      g.setFont('Vector', getFontSize(getDayString(now).length, SECONDS_LEFT, 6, DATE_LETTER_HEIGHT))
        .drawString(getDayString(now), DATE_CENTER_X, DOW_CENTER_Y)
        .setFont('Vector', getFontSize(getDateString(now).length, SECONDS_LEFT, 6, DATE_LETTER_HEIGHT))
        .drawString(getDateString(now), DATE_CENTER_X, DATE_CENTER_Y);

    } else {
      //Draw the day of week and date without the seconds

      let string = getDayString(now) + ' ' + getDateString(now);
      g.setFont('Vector', getFontSize(string.length, g.getWidth(), 6, DATE_LETTER_HEIGHT))
        .drawString(string, g.getWidth() / 2, DOW_DATE_CENTER_Y);
    }

    // Draw the bottom area
    if (config.bottomLocked.display == 'progress') {
      let color = config.dayProgress.color;
      g.setColor(color[0], color[1], color[2])
        .fillRect(0, SECONDS_TOP + DIGIT_HEIGHT + 3, g.getWidth() * getDayProgress(now), g.getHeight());
    } else {
      let bottomString;

      if (config.bottomLocked.display == 'weather') bottomString = getWeatherString();
      else if (config.bottomLocked.display == 'steps') bottomString = getStepsString();
      else if (config.bottomLocked.display == 'health') bottomString = getHealthString();
      else bottomString = ' ';

      g.setFont('Vector', getFontSize(bottomString.length, 176, 6, g.getHeight() - (SECONDS_TOP + DIGIT_HEIGHT + 3)))
        .drawString(bottomString, g.getWidth() / 2, BOTTOM_CENTER_Y);
    }

    // Draw the day progress bar between the rows if necessary
    if (config.dayProgress.enabledLocked && config.bottomLocked.display != 'progress') {
      let color = config.dayProgress.color;
      g.setColor(color[0], color[1], color[2])
        .fillRect(0, HHMM_TOP + DIGIT_HEIGHT, g.getWidth() * getDayProgress(now), SECONDS_TOP);
    }
  } else {

    //If the watch is unlocked
    g.clearRect(0, 24, g.getWidth(), g.getHeight() / 2);
    rows = [
      `${getDayString(now)} ${getDateString(now)} ${locale.time(now, 1)}`,
      getHealthString(),
      getWeatherString(),
      getWeatherRow2()
    ];
    if (shouldDisplaySeconds(now)) rows[0] += ':' + pad(now.getSeconds(), 2);
    if (storage.readJSON('setting.json')['12hour']) rows[0] += ((now.getHours() < 12) ? ' AM' : ' PM');

    let maxHeight = ((g.getHeight() / 2) - HHMM_TOP) / (config.dayProgress.enabledUnlocked ? (rows.length + 1) : rows.length);

    let y = HHMM_TOP + maxHeight / 2;
    for (let row of rows) {
      let size = getFontSize(row.length, g.getWidth(), 6, maxHeight);
      g.setFont('Vector', size)
        .drawString(row, g.getWidth() / 2, y);
      y += maxHeight;
    }

    if (config.dayProgress.enabledUnlocked) {
      let color = config.dayProgress.color;
      g.setColor(color[0], color[1], color[2])
        .fillRect(0, y - maxHeight / 2, 176 * getDayProgress(now), y + maxHeight / 2);
    }
  }

  setNextDrawTimeout();
}

// Draw the icons. This is done separately from the main draw routine to avoid having to scale and draw a bunch of images repeatedly.
function drawIcons() {
  g.reset().clearRect(0, 24, g.getWidth(), g.getHeight());
  for (let i = 0; i < 8; i++) {
    let x = [0, 44, 88, 132, 0, 44, 88, 132][i];
    let y = [88, 88, 88, 88, 132, 132, 132, 132][i];
    let appId = config.shortcuts[i];
    let appInfo = storage.readJSON(appId + '.info', 1);
    if (!appInfo) continue;
    icon = storage.read(appInfo.icon);
    g.drawImage(icon, x, y, {
      scale: 0.916666666667
    });
  }
}

weather.on("update", draw);
Bangle.on("step", draw);
Bangle.on('lock', locked => {
  //If the watch is unlocked, draw the icons
  if (!locked) drawIcons();
  draw();
});

// Show launcher when middle button pressed
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

// Launch an app given the current ID. Handles special cases:
//    false: Do nothing
//    '#LAUNCHER': Open the launcher
//    nonexistent app: Do nothing
function launch(appId) {
  if (appId == false) return;
  else if (appId == '#LAUNCHER') {
    Bangle.buzz();
    Bangle.showLauncher();
  } else {
    let appInfo = storage.readJSON(appId + '.info', 1);
    if (appInfo) {
      Bangle.buzz();
      load(appInfo.src);
    }
  }
}

//Set up touch to launch the selected app
Bangle.on('touch', function (button, xy) {
  let x = Math.floor(xy.x / 44);
  if (x < 0) x = 0;
  else if (x > 3) x = 3;

  let y = Math.floor(xy.y / 44);
  if (y < 0) y = -1;
  else if (y > 3) y = 1;
  else y -= 2;

  if (y < 0) {
    Bangle.buzz();
    Bangle.showLauncher();
  } else {
    let i = 4 * y + x;
    launch(config.shortcuts[i]);
  }
});

//Set up swipe handler
Bangle.on('swipe', function (direction) {
  if (direction == -1) launch(config.swipe.left);
  else if (direction == 0) launch(config.swipe.up);
  else launch(config.swipe.right);
});

if (!Bangle.isLocked()) drawIcons();

draw();