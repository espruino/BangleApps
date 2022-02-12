exports = {
  // define en-/disable function, restarts the service to make changes take effect
  setEnabled: function(enable, logfile, powersaving) {
    // check if sleeplog is available
    if (typeof global.sleeplog !== "object") return;

    // set default logfile
    logfile = logfile.endsWith(".log") ? logfile :
      logfile === false ? undefined :
      "sleeplog.log";

    // stop if enabled
    if (global.sleeplog.enabled) global.sleeplog.stop();

    // define storage and filename
    var storage = require("Storage");
    var filename = "sleeplog.json";

    // change enabled value in settings
    storage.writeJSON(filename, Object.assign(storage.readJSON(filename, true) || {}, {
      enabled: enable,
      logfile: logfile,
      powersaving: powersaving
    }));

    // force changes to take effect by executing the boot script
    eval(storage.read("sleeplog.boot.js"));

    // clear variables
    storage = undefined;
    filename = undefined;
    return true;
  },

  // define read log function
  // sorting: latest first, format:
  // [[number, int, float, string], [...], ... ]
  // - number // timestamp in ms
  // - int    // status: 0 = unknown, 1 = not worn, 2 = awake, 3 = sleeping
  // - float  // internal temperature
  // - string // additional information
  readLog: function(since, until) {
    // set logfile
    var logfile = (global.sleeplog || {}).logfile || "sleeplog.log";

    // check if since is in the future
    if (since > Date()) return [];

    // read log json to array
    var log = storage.read(this.logfile) || "";
    log = log ? JSON.parse(atob(log)) || [] : [];

    // search for latest entry befor since
    since = (log.find(element => element[0] <= since) || [0])[0];

    // filter selected time period
    log = log.filter(element => (element[0] >= since) && (element[0] <= (until || 1E14)));

    // output log
    return log;
  },

  // define log to humanreadable string function
  // sorting: latest last, format:
  // "{substring of ISO date} - {status} for {duration}min\n..."
  getReadableLog: function(printLog, since, until) {
    // read log and check
    var log = this.readLog(since, until);
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
        (element[2] ? " | Temp: " + element[2] + "°C" : "") +
        (element[3] ? " | " + element[3] : "");
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
  },

  // define function to eliminate some errors inside the log
  restoreLog: function(logfile) {
    // define storage
    var storage = require("Storage");

    // read log json to array
    var log = storage.read(this.logfile) || "";
    log = log ? JSON.parse(atob(log)) || [] : [];

    // define output variable to show number of changes
    var output = log.length;

    // remove non decremental entries
    log = log.filter((element, index) => log[index][0] >= (log[index + 1] || [0])[0]);

    // write log to storage
    storage.write(logfile, btoa(JSON.stringify(log)));

    // return difference in length
    return output - log.length;
  },

  // define function to reinterpret worn status based on given temperature threshold
  reinterpretTemp: function(logfile, tempthresh) {
    // define storage
    var storage = require("Storage");

    // read log json to array
    var log = storage.read(this.logfile) || "";
    log = log ? JSON.parse(atob(log)) || [] : [];

    // define output variable to show number of changes
    var output = 0;

    // remove non decremental entries
    log = log.map(element => {
      if (element[2]) {
        var tmp = element[1];
        element[1] = element[2] > tempthresh ? 3 : 1;
        if (tmp !== element[1]) output++;
      }
      return element;
    });

    // write log to storage
    storage.write(logfile, btoa(JSON.stringify(log)));

    // return output
    return output;
  }

};
