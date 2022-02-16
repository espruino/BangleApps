exports = {
  // define en-/disable function, restarts the service to make changes take effect
  setEnabled: function(enable, logfile, powersaving) {
    // check if sleeplog is available
    if (typeof global.sleeplog !== "object") return;

    // set default logfile
    if ((typeof logfile !== "string" || !logfile.endsWith(".log")) &&
      logfile !== false) logfile = "sleeplog.log";

    // stop if enabled
    if (global.sleeplog.enabled) global.sleeplog.stop();

    // define storage and filename
    var storage = require("Storage");
    var filename = "sleeplog.json";

    // change enabled value in settings
    storage.writeJSON(filename, Object.assign(storage.readJSON(filename, true) || {}, {
      enabled: enable,
      logfile: logfile,
      powersaving: powersaving || false
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
  readLog: function(logfile, since, until) {
    // check/set logfile
    if (typeof logfile !== "string" || !logfile.endsWith(".log")) {
      logfile = (global.sleeplog || {}).logfile || "sleeplog.log";
    }

    // check if since is in the future
    if (since > Date()) return [];

    // read logfile
    var log = require("Storage").read(logfile);
    // return empty log
    if (!log) return [];
    // decode data if needed 
    if (log[0] !== "[") log = atob(log);
    // do a simple check before parsing
    if (!log.startsWith("[[") || !log.endsWith("]]")) return [];
    log = JSON.parse(log) || [];

    // check if filtering is needed
    if (since || until) {
      // search for latest entry befor since
      if (since) since = (log.find(element => element[0] <= since) || [0])[0];
      // filter selected time period
      log = log.filter(element => (element[0] >= since) && (element[0] <= (until || 1E14)));
    }

    // output log
    return log;
  },

  // define write log function, append or replace log depending on input
  // append input if array length >1 and element[0] >9E11
  // replace log with input if at least one entry like above is inside another array
  writeLog: function(logfile, input) {
    // check/set logfile
    if (typeof logfile !== "string" || !logfile.endsWith(".log")) {
      if (!global.sleeplog || sleeplog.logfile === false) return;
      logfile = sleeplog.logfile || "sleeplog.log";
    }

    // check if input is an array
    if (typeof input !== "object" || typeof input.length !== "number") return;

    // check for entry plausibility
    if (input.length > 1 && input[0] * 1 > 9E11) {
      // read log
      var log = this.readLog(logfile);

      // remove last state if it was unknown and less then 5min ago
      if (log.length > 0 && log[0][1] === 0 &&
        Math.floor(Date.now()) - log[0][0] < 3E5) log.shift();

      // add entry at the first position if it has changed
      if (log.length === 0 || input.some((e, index) => index > 0 && input[index] !== log[0][index])) log.unshift(input);

      // map log as input
      input = log;
    }

    // simple check for log plausibility
    if (input[0].length > 1 && input[0][0] * 1 > 9E11) {
      // write log to storage
      require("Storage").write(logfile, btoa(JSON.stringify(input)));
      return true;
    }
  },

  // define log to humanreadable string function
  // sorting: latest last, format:
  // "{substring of ISO date} - {status} for {duration}min\n..."
  getReadableLog: function(printLog, since, until, logfile) {
    // read log and check
    var log = this.readLog(logfile, since, until);
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
        (index === log.length - 1 ?
          element.length < 3 ? "" : " ".repeat(12) :
          " for " + ("" + Math.round((log[index + 1][0] - element[0]) / 60000)).padStart(4) + "min"
        ) +
        (element[2] ? " | Temp: " + ("" + element[2]).padEnd(5) + "°C" : "") +
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
    // read log and check
    var log = this.readLog(logfile);
    if (!log.length) return;

    // define output variable to show number of changes
    var output = log.length;

    // remove non decremental entries
    log = log.filter((element, index) => log[index][0] >= (log[index + 1] || [0])[0]);

    // write log
    this.writeLog(logfile, log);

    // return difference in length
    return output - log.length;
  },

  // define function to reinterpret worn status based on given temperature threshold
  reinterpretTemp: function(logfile, tempthresh) {
    // read log and check
    var log = this.readLog(logfile);
    if (!log.length) return;

    // set default tempthresh
    tempthresh = tempthresh || (global.sleeplog ? sleeplog.tempthresh : 27);

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

    // write log
    this.writeLog(logfile, log);

    // return output
    return output;
  }

};
