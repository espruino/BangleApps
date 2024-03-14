var minutes;
var seconds;
var hours;
var date;
//var first = true;
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

// Ssettings
const settings = {
  time: {
    color: '#dddddd',
    font: 'Vector',
    size: 100,
    middle: screen.middle,
    center: screen.center,
  },
  date: {
    color: '#dddddd',
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
    height: screen.height
  },
  hr: {
    color: '#333333',
    size: 20,
    x: screen.center,
    y: screen.middle + 65
  }
};

const dateStr = function (date) {
  return locale.date(new Date(), 1);
};

const getFormated = function(val) {
  if (val<10) {
    val='0'+val;
  }

  return val;
};

const drawMin = function (sections, color) {

  g.setFontAlign(0, 0, 0);
  g.setColor('#000000');
  g.setFont(settings.time.font, settings.time.size/2);
  g.drawString(getFormated(sections-1), settings.time.center+50, settings.time.middle);
  g.setColor(settings.time.color);
  g.setFont(settings.time.font, settings.time.size/2);
  g.drawString(getFormated(sections), settings.time.center+50, settings.time.middle);
};

const drawSec = function (sections, color) {
  g.setFontAlign(0, 0, 0);
  g.setColor('#000000');
  g.setFont(settings.time.font, settings.time.size/4);
  g.drawString(getFormated(sections-1), settings.time.center+100, settings.time.middle);
  g.setColor(settings.time.color);
  g.setFont(settings.time.font, settings.time.size/4);
  g.drawString(getFormated(sections), settings.time.center+100, settings.time.middle);
};

const drawClock = function () {

  const currentTime = new Date();

  //Get date as a string
  date = dateStr(currentTime);

  if(seconds==59) {
      g.clear();
  }

  // Update minutes when needed
  if (minutes != currentTime.getMinutes()) {
    minutes = currentTime.getMinutes();
    drawMin(minutes, settings.circle.colormin);
  }

  //Update seconds when needed
  if (seconds != currentTime.getSeconds()) {
    seconds = currentTime.getSeconds();
    drawSec(seconds, settings.circle.colorsec);
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
  g.drawString(timestr, settings.time.center-40, settings.time.middle);

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
    g.setColor(settings.hr.color);
    g.fillCircle(settings.hr.x, settings.hr.y, size);
  } else {
    g.setColor("#000000");
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
