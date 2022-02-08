// log data JSON format (sorting: latest first):
// [
//   [
//     int,   // timestamp in ms
//     int,   // status: 0 = unknown, 1 = not worn, 2 = awake, 3 = sleeping
//     string // additional information
//   ],
//   [...], ...
// ]

exports = {
  // define en-/disable function
  setEnabled: function(status) {
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
  },

  // define read log function
  readLog: function(since, until) {
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
  },

  // define log to humanreadable string function, format:
  // "{substring of ISO date} - {status} for {duration}min\n..."
  getReadableLog: function(printLog, since, until) {
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
};
