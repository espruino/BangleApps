{
  var minutes;
  var seconds;
  var hours;
  var date;
  var first = true;
  var locale = require('locale');
  var _12hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"] || false;

  const screen = {
    width: g.getWidth(),
    height: g.getWidth(),
    middle: g.getWidth() / 2,
    center: g.getHeight() / 2,
  };

  // Ssettings
  const settings = {
    time: {
      color: '#f0af00',
      shadow: '#CF7500',
      font: 'Vector',
      size: 60,
      middle: screen.middle - 30,
      center: screen.center,
    },
    date: {
      color: '#f0af00',
      shadow: '#CF7500',
      font: 'Vector',
      size: 15,
      middle: screen.height - 20, // at bottom of screen
      center: screen.center,
    },
    circle: {
      colormin: '#eeeeee',
      colorsec: '#bbbbbb',
      width: 10,
      middle: screen.middle,
      center: screen.center,
      height: screen.height
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
    rad = (settings.circle.height / 2) - 20;
    r1 = getArcXY(settings.circle.middle, settings.circle.center, rad, sections * (360 / 60) - 90);
    //g.setPixel(r[0],r[1]);
    r2 = getArcXY(settings.circle.middle, settings.circle.center, rad - settings.circle.width, sections * (360 / 60) - 90);
    //g.setPixel(r[0],r[1]);
    g.drawLine(r1[0], r1[1], r2[0], r2[1]);
    g.setColor('#333333');
    g.drawCircle(settings.circle.middle, settings.circle.center, rad - settings.circle.width - 4)
  };

  const drawSecArc = function (sections, color) {
    g.setColor(color);
    rad = (settings.circle.height / 2) - 40;
    r1 = getArcXY(settings.circle.middle, settings.circle.center, rad, sections * (360 / 60) - 90);
    //g.setPixel(r[0],r[1]);
    r2 = getArcXY(settings.circle.middle, settings.circle.center, rad - settings.circle.width, sections * (360 / 60) - 90);
    //g.setPixel(r[0],r[1]);
    g.drawLine(r1[0], r1[1], r2[0], r2[1]);
    g.setColor('#333333');
    g.drawCircle(settings.circle.middle, settings.circle.center, rad - settings.circle.width - 4)
  };

  const drawClock = function () {

    currentTime = new Date();

    //Set to initial time when started
    if (first == true) {
      minutes = currentTime.getMinutes();
      seconds = currentTime.getSeconds();
      for (count = 0; count <= minutes; count++) {
        drawMinArc(count, settings.circle.colormin);
      }

      for (count = 0; count <= seconds; count++) {
        drawSecArc(count, settings.circle.colorsec);
      }
      first = false;
    }

    // Reset seconds
    if (seconds == 59) {
      g.setColor('#000000');
      g.fillCircle(settings.circle.middle, settings.circle.center, (settings.circle.height / 2) - 40);
    }
    // Reset minutes
    if (minutes == 59 && seconds == 59) {
      g.setColor('#000000');
      g.fillCircle(settings.circle.middle, settings.circle.center, (settings.circle.height / 2) - 20);
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

    g.setColor(settings.time.color);
    g.setFont(settings.time.font, settings.time.size);
    g.drawString(timestr, settings.time.center, settings.time.middle);

    //Write the date as configured in the settings
    g.setColor(settings.date.color);
    g.setFont(settings.date.font, settings.date.size);
    g.drawString(date, settings.date.center, settings.date.middle);
  };

  Bangle.on('lcdPower', function (on) {
    if (on) drawClock();
  });

  // clean app screen
  g.clear();
  g.setFontAlign(0, 0, 0);
  Bangle.loadWidgets();
  Bangle.drawWidgets();

  // refesh every 30 sec
  setInterval(drawClock, 1E3);

  // draw now
  drawClock();

  // Show launcher when middle button pressed
  setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });

}