// log data JSON format (sorting: latest first):
// [
//   [
//     int,   // timestamp in ms
//     int,   // status: 0 = unknown, 1 = not worn, 2 = awake, 3 = sleeping
//     string // additional information
//   ],
//   [...], ...
// ]

// define en-/disable function
function setEnabled(status) {
  // check if sleeplog is available
  if (typeof global.sleeplog !== "object") return;

  // check if status needs to be changed
  if (status === global.sleeplog.enabled) return;

  // stop if enabled
  if (global.sleeplog.enabled) global.sleeplog.stop();

  // define storage and filename
  var storage = require("Storage");
  var filename = "sleeplog.json";

  // change enabled value in settings
  storage.writeJSON(filename, Object.assign(storage.readJSON(filename, true) || {}, {
    enabled: status
  }));

  // clear variables
  storage = undefined;
  filename = undefined;
  return true;
}

// define read log function
function readLog(since, until) {
  // check if sleeplog is available
  if (typeof global.sleeplog !== "object") return [];

  // check if since is in the future
  if (since > Date()) return [];

  // read log json to array
  var log = require("Storage").readJSON(global.sleeplog.logfile);

  // search for latest entry befor since
  since = (log.find(element => element[0] <= since) || [0])[0];

  // filter selected timeperiod
  log = log.filter(element => (element[0] >= since) && (element[0] <= (until || 1E14)));

  // output log
  return log;
}

// define log to humanreadable string function, format:
// "{substring of ISO date} - {status} for {duration}min\n..."
function getReadableLog(printLog, since, until) {
  // read log and check
  var log = readLog(since, until);
  if (!log.length) return;
  // reverse array to set last timestamp to the end
  log.reverse();

  // define status description and log string
  var statusText = ["unknown ", "not worn", "awake   ", "sleeping"];
  var logString = [];

  // rewrite each entry
  log.forEach((element, index) => {
    logString[index] = "" +
      Date(element[0] - Date().getTimezoneOffset() * 6E4).toISOString().substr(0, 19).replace("T", " ") + " - " +
      statusText[element[1]] +
      (index === log.length - 1 ? "" : " for " + Math.round((log[index + 1][0] - element[0]) / 60000) + "min") +
      (element[2] ? " | " + element[2] : "");
  });
  logString = logString.join("\n");

  // if set print and return string
  if (printLog) {
    print(logString);
    print("- first", Date(log[0][0]));
    print("-  last", Date(log[log.length - 1][0]));
    var period = log[log.length - 1][0] - log[0][0];
    print("-     period= " + Math.floor(period / 864E5) + "d " + Math.floor(period % 864E5 / 36E5) + "h " + Math.floor(period % 36E5 / 6E4) + "min");
  }
  return logString;
}

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
  var log = readLog(viewUntil.valueOf() - period, viewUntil.valueOf());

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

// check if loaded as app or module
if (global.__FILE__ === "sleeplog.app.js") {

  // ### APP ###

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

} else {

  // ### MODULE ###

  // export useable functions
  exports = {
    setEnabled: setEnabled,
    readLog: readLog,
    getReadableLog: getReadableLog
  };

}
