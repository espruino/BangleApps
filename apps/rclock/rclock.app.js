var minutes;
var seconds;
var hours;
var date;
var first = true;
var locale = require('locale');
var _12hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"] || false;

//HR variables
var id = 0;
var grow = true;
var size=10;

//Screen dimensions
const screen = {
  width: g.getWidth(),
  height: g.getWidth(),
  middle: g.getWidth() / 2,
  center: g.getHeight() / 2,
};

// Settings
const settings = {
  time: {
    color: '#D6ED17',
    font: 'Vector',
    size: 60,
    middle: screen.middle,
    center: screen.center,
  },
  date: {
    color: '#D6ED17',
    font: 'Vector',
    size: 15,
    middle: screen.height-17, // at bottom of screen
    center: screen.center,
  },
  circle: {
    colormin: '#ffffff',
    colorsec: '#ffffff',
    width: 10,
    middle: screen.middle,
    center: screen.center,
    height: screen.height-24
  },
  hr: {
    color: '#333333',
    size: 10,
    x: screen.center,
    y: screen.middle + 45
  }
};

const dateStr = function (date) {
  return locale.date(new Date(), 1);
};

const getArcXY = function (centerX, centerY, radius, angle) {
  var s, r = [];
  s = 2 * Math.PI * angle / 360;
  r.push(centerX + Math.round(Math.cos(s) * radius));
  r.push(centerY + Math.round(Math.sin(s) * radius));

  return r;
};

const drawMinArc = function (sections, color) {
  g.setColor(color);
  var rad = (settings.circle.height / 2) - 40;
  var r1 = getArcXY(settings.circle.middle, settings.circle.center, rad, sections * (360 / 60) - 90);
  //g.setPixel(r[0],r[1]);
  var r2 = getArcXY(settings.circle.middle, settings.circle.center, rad - settings.circle.width, sections * (360 / 60) - 90);
  //g.setPixel(r[0],r[1]);
  g.drawLine(r1[0], r1[1], r2[0], r2[1]);
  g.setColor('#333333');
  g.drawCircle(settings.circle.middle, settings.circle.center, rad - settings.circle.width - 4);
};

const drawSecArc = function (sections, color) {
  g.setColor(color);
  var rad = (settings.circle.height / 2) - 20;
  var r1 = getArcXY(settings.circle.middle, settings.circle.center, rad, sections * (360 / 60) - 90);
  //g.setPixel(r[0],r[1]);
  var r2 = getArcXY(settings.circle.middle, settings.circle.center, rad - settings.circle.width, sections * (360 / 60) - 90);
  //g.setPixel(r[0],r[1]);
  g.drawLine(r1[0], r1[1], r2[0], r2[1]);
  g.setColor('#333333');
  g.drawCircle(settings.circle.middle, settings.circle.center, rad - settings.circle.width - 4);
};

const drawClock = function () {
  g.reset();
  let currentTime = new Date();

  //Set to initial time when started
  if (first == true) {
    minutes = currentTime.getMinutes();
    seconds = currentTime.getSeconds();
    for (let count = 0; count <= minutes; count++) {
      drawMinArc(count, settings.circle.colormin);
    }

    for (let count = 0; count <= seconds; count++) {
      drawSecArc(count, settings.circle.colorsec);
    }
    first = false;
  }

  // Reset
  if (seconds == 59) {
    g.setColor('#000000');
    g.fillCircle(settings.circle.middle, settings.circle.center, (settings.circle.height / 2));
    for (let count = 0; count <= minutes; count++) {
      drawMinArc(count, settings.circle.colormin);
    }
  }

  //Get date as a string
  date = dateStr(currentTime);

  // Update minutes when needed
  if (minutes != currentTime.getMinutes()) {
    minutes = currentTime.getMinutes();
    drawMinArc(minutes, settings.circle.colormin);
  }

  //Update seconds when needed
  if (seconds != currentTime.getSeconds()) {
    seconds = currentTime.getSeconds();
    drawSecArc(seconds, settings.circle.colorsec);
  }

  //Write the time as configured in the settings
  hours = currentTime.getHours();
  if (_12hour && hours > 13) {
    hours = hours - 12;
  }

  var meridian;

  if (typeof locale.meridian === "function") {
    meridian = locale.meridian(new Date());
  } else {
    meridian = "";
  }

  var timestr;

  if (meridian.length > 0 && _12hour) {
    timestr = hours + " " + meridian;
  } else {
    timestr = hours;
  }
  g.setFontAlign(0, 0, 0);
  g.setColor(settings.time.color);
  g.setFont(settings.time.font, settings.time.size);
  g.drawString(timestr, settings.time.center, settings.time.middle);

  //Write the date as configured in the settings
  g.setColor(settings.date.color);
  g.setFont(settings.date.font, settings.date.size);
  g.drawString(date, settings.date.center, settings.date.middle);
};

//setInterval for HR visualisation
const newBeats = function (hr) {
  if (id != 0) {
    changeInterval(id, 6e3 / hr.bpm);
  } else {
    id = setInterval(drawHR, 6e3 / hr.bpm);
  }
};

//visualize HR with circles pulsating
const drawHR = function () {
  if (grow && size < settings.hr.size) {
    size++;
  }

  if (!grow && size > 3) {
    size--;
  }

  if (size == settings.hr.size || size == 3) {
    grow = !grow;
  }

  if (grow) {
    color = settings.hr.color;
    g.setColor(color);
    g.fillCircle(settings.hr.x, settings.hr.y, size);
  } else {
    color = "#000000";
    g.setColor(color);
    g.drawCircle(settings.hr.x, settings.hr.y, size);
  }
};

// Show launcher when button pressed
Bangle.setUI("clock");

// clean app screen
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();

//manage when things should be enabled and not
Bangle.on('lcdPower', function (on) {
  if (on) {
    Bangle.setHRMPower(1);
  } else {
    Bangle.setHRMPower(0);
  }
});

// refesh every second
setInterval(drawClock, 1E3);

//start HR monitor and update frequency of update
Bangle.setHRMPower(1);
Bangle.on('HRM', function (d) {
  newBeats(d);
});

// draw now
drawClock();

