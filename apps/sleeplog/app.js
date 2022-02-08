// define draw log function
function drawLog(topY, viewUntil) {
  // set default view time
  viewUntil = viewUntil || Date();

  // define parameters
  var statusValue = [0, 0.3, 0.4, 1]; // unknown, not worn, awake, sleeping
  var statusColor = [0, 63488, 2016, 31]; // black, red, green, blue
  var period = 432E5; // 12h
  var graphHeight = 30;
  var labelHeight = 10;
  var width = g.getWidth();
  var y = topY + graphHeight;

  // read 12h wide log
  var log = require("sleeplog").readLog(viewUntil.valueOf() - period, viewUntil.valueOf());

  // format log array if not empty
  if (log.length) {
    // check if the period goes into the future
    if (viewUntil > Date()) {
      // add entry with unknown status at the beginning
      log.unshift([Date().valueOf(), 0]);
    }

    // check if the period goes earlier than logged data
    if (log[log.length - 1][0] > viewUntil.valueOf() - period) {
      // add entry with unknown status at the end
      log.push([viewUntil.valueOf() - period, 0]);
    } else {
      // set time of last entry according to period
      log[log.length - 1][0] = viewUntil.valueOf() - period;
    }

    // map as xy coordinates
    log = log.map((element, index) => [
      ((log[index - 1] || [viewUntil.valueOf()])[0] - element[0]) / period, element[1]
    ]);

    // start with the oldest entry to build graph left to right
    log.reverse();
  }

  // clear area
  g.reset().clearRect(0, topY, width, y + labelHeight);
  // draw x axis
  g.drawLine(0, y + 1, width, y + 1);
  // draw x label
  var hours = period / 36E5;
  var stepwidth = width / hours;
  var startHour = 24 + viewUntil.getHours() - hours;
  for (var x = 0; x < hours; x++) {
    g.fillRect(x * stepwidth, y + 2, x * stepwidth, y + 4);
    g.setFontAlign(-1, -1).drawString((startHour + x) % 24, x * stepwidth, y + 6);
  }

  // draw graph
  var pos = 0;
  log.forEach(element => {
    // calculate second point
    var pos2 = pos + width * element[0];
    var y2 = y + 1 - graphHeight * statusValue[element[1]];
    // draw bar
    g.setColor(statusColor[element[1]]).fillRect(pos, y, pos2, y2).reset();
    if (y !== y2) g.fillRect(pos, y2, pos2, y2);
    // set next startpoint
    pos = pos2 + 1;
  });

  // clear variables
  log = undefined;
}

// define draw night to function
function drawNightTo(prevDays) {
  // calculate 10am of this or a previous day
  var date = Date();
  date = Date(date.getFullYear(), date.getMonth(), date.getDate() - prevDays, 10);

  // get width
  var width = g.getWidth();

  // draw headline
  g.reset().clearRect(0, 30, width, 75);
  g.setFont("12x20").setFontAlign(0, -1).drawString("Night to\n" + require('locale').date(date), width / 2, 30);

  // draw log graphs
  drawLog(75, date);
  drawLog(125, Date(date.valueOf() - 432E5));
}

// define day to display
var prevDays = 0;

// first draw
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
drawNightTo(prevDays);

// setup UI
Bangle.setUI("leftright", (btn) => {
  if (!btn) {
    load();
  } else if (prevDays + btn >= -1) {
    drawNightTo((prevDays += btn));
  }
});
