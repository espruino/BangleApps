// define accessable functions
exports = {
  // define en-/disable function, restarts the service to make changes take effect
  setEnabled: function(enable) {
    // stop if enabled
    if (global.sleeplog && global.sleeplog.enabled) global.sleeplog.stop();

    // define settings filename
    var settings = "sleeplog.json";

    // change enabled value in settings
    require("Storage").writeJSON(settings, Object.assign(
      require("Storage").readJSON(settings, true) || {}, {
        enabled: enable
      }
    ));

    // force changes to take effect by executing the boot script
    eval(require("Storage").read("sleeplog.boot.js"));

    return true;
  },

  // define read log function, returns log array
  // sorting: ascending (latest first), format:
  // [[number, int, int], [...], ... ]
  // - number // timestamp in 10min
  // - int    // status: 0 = unknown, 1 = not worn, 2 = awake, 3 = light sleep, 4 = deep sleep
  // - int    // consecutive: 0 = unknown, 1 = no consecutive sleep, 2 = consecutive sleep
  readLog: function(since, until) {
    // set now and check if now is before since
    var now = Date.now();
    if (now < since) return [];

    // set defaults and convert since, until and now to 10min steps
    since = Math.floor((since || 0) / 6E5);
    until = Math.ceil((until || now) / 6E5);
    now = Math.ceil(now / 6E5);

    // define output log
    var log = [];

    // open StorageFile
    var file = require("Storage").open("sleeplog.log", "r");
    // cache StorageFile size
    var storageFileSize = file.getLength();
    // check if a Storage File needs to be read
    if (storageFileSize) {
      // define previous line cache
      var prevLine;
      // loop through StorageFile entries
      while (true) {
        // cache new line
        var line = file.readLine();
        // exit loop if all lines are read
        if (!line) break;
        // skip lines starting with ","
        if (line.startsWith(",")) continue;
        // parse line
        line = line.trim().split(",").map(e => parseInt(e));
        // exit loop if new line timestamp is not before until
        if (line[0] >= until) break;
        // check if new line timestamp is 24h before since or not after since
        if (line[0] + 144 < since) {
          // skip roughly the next 10 lines
          file.read(118);
          file.readLine();
        } else if (line[0] <= since) {
          // cache line for next cycle
          prevLine = line;
        } else {
          // add previous line if it was cached
          if (prevLine) log.push(prevLine);
          // add new line at the end of log
          log.push(line);
          // clear previous line cache
          prevLine = undefined;
        }
      }
      // add previous line if it was cached
      if (prevLine) log.push(prevLine);
      // set unknown consecutive statuses
      log = log.reverse().map((entry, index) => {
        if (entry[2] === 0) entry[2] = (log[index - 1] || [])[2] || 0;
        return entry;
      }).reverse();
      // remove duplicates
      log = log.filter((entry, index) =>
        !(index > 0 && entry[1] === log[index - 1][1] && entry[2] === log[index - 1][2])
      );
    }

    // check if log empty or first entry is after since
    if (!log[0] || log[0][0] > since) {
      // look for all needed storage files
      var files = require("Storage").list(/^sleeplog_\d\d\d\d\.log$/, {
        sf: false
      });

      // check if any file available
      if (files.length) {
        // generate start and end times in 10min steps
        files = files.map(file => {
          var start = this.fnToMs(parseInt(file.substr(9, 4))) / 6E5;
          return {
            name: file,
            start: start,
            end: start + 2016
          };
        }).sort((a, b) => b.start - a.start);

        // read all neccessary files
        var filesLog = [];
        files.some(file => {
          // exit loop if since after end
          if (since >= file.end) return true;
          // read file if until after start and since before end
          if (until > file.start || since < file.end) {
            var thisLog = require("Storage").readJSON(file.name, 1) || [];
            if (thisLog.length) filesLog = thisLog.concat(filesLog);
          }
        });
        // free ram
        files = undefined;

        // check if log from files is available
        if (filesLog.length) {
          // remove unwanted entries
          filesLog = filesLog.filter((entry, index, filesLog) => (
            (filesLog[index + 1] || [now])[0] >= since && entry[0] <= until
          ));
          // add to log as previous entries
          log = filesLog.concat(log);
        }
        // free ram
        filesLog = undefined;
      }
    }

    // define last index
    //var lastIndex = log.length - 1;
    // set timestamp of first entry to since if first entry before since
    if (log[0] && log[0][0] < since) log[0][0] = since;
    // add timestamp at now with unknown status if until after now
    if (until > now) log.push([now, 0, 0]);

    return log;
  },

  // define move log function, move StorageFile content into files seperated by fortnights
  moveLog: function(force) {
    // first day of this fortnight period
    var thisFirstDay = this.fnToMs(this.msToFn(Date.now()));

    // read timestamp of the first StorageFile entry
    var firstDay = (require("Storage").open("sleeplog.log", "r").read(47) || "").match(/\n\d*/);
    // calculate the first day of the fortnight period
    if (firstDay) firstDay = this.fnToMs(this.msToFn(parseInt(firstDay[0].trim()) * 6E5));

    // check if moving is neccessary or forced
    if (force || firstDay && firstDay < thisFirstDay) {
      // read log for each fortnight period
      while (firstDay) {
        // calculate last day
        var lastDay = firstDay + 12096E5;
        // read log of the fortnight period
        var log = require("sleeplog").readLog(firstDay, lastDay);

        // check if before this fortnight period
        if (firstDay < thisFirstDay) {
          // write log in seperate file
          if(log.length > 0)
            require("Storage").writeJSON("sleeplog_" + this.msToFn(firstDay) + ".log", log);
          // set last day as first
          firstDay = lastDay;
        } else {
          // rewrite StorageFile
          require("Storage").open("sleeplog.log", "w").write(log.map(e => e.join(",")).join("\n"));
          // clear first day to exit loop
          firstDay = undefined;
        }

        // free ram
        log = undefined;
      }
    }
  },

  // define function to return stats from the last date [ms] for a specific duration [ms] or for the complete log
  getStats: function(until, duration, log) {
    // define stats variable
    var stats = {
      calculatedAt: //   [date] timestamp of the calculation
        Math.round(Date.now()),
      deepSleep: 0, //   [min] deep sleep duration
      lightSleep: 0, //  [min] light sleep duration
      awakeSleep: 0, //  [min] awake duration inside consecutive sleep
      consecSleep: 0, // [min] consecutive sleep duration
      awakeTime: 0, //   [min] awake duration outside consecutive sleep
      notWornTime: 0, // [min] duration of not worn status
      unknownTime: 0, // [min] duration of unknown status
      logDuration: 0, // [min] duration of all entries taken into account
      firstDate: undefined, // [date] first entry taken into account
      lastDate: undefined // [date] last entry taken into account
    };

    // set default inputs
    until = until || stats.calculatedAt;
    if (!duration) duration = 864E5;

    // read log for the specified duration or complete log if not handed over
    if (!log) log = this.readLog(duration ? until - duration : 0, until);

    // check if log not empty or corrupted
    if (log && log.length && log[0] && log[0].length === 3) {
      // calculate and set first log date from 10min steps
      stats.firstDate = log[0][0] * 6E5;
      stats.lastDate = log[log.length - 1][0] * 6E5;

      // cycle through log to calculate sums til end or duration is exceeded
      log.forEach((entry, index, log) => {
        // calculate duration of this entry from 10min steps to minutes
        var duration = ((log[index + 1] || [until / 6E5 | 0])[0] - entry[0]) * 10;

        // check if duration greater 0
        if (duration) {
          // calculate sums
          if (entry[1] === 4) stats.deepSleep += duration;
          else if (entry[1] === 3) stats.lightSleep += duration;
          else if (entry[1] === 2) {
            if (entry[2] === 2) stats.awakeSleep += duration;
            else if (entry[2] === 1) stats.awakeTime += duration;
          }
          if (entry[2] === 2) stats.consecSleep += duration;
          if (entry[1] === 1) stats.notWornTime += duration;
          if (entry[1] === 0) stats.unknownTime += duration;
          stats.logDuration += duration;
        }
      });
    }

    // free ram
    log = undefined;

    // return stats of the last day
    return stats;
  },

  // define function to return last break time of day from date or now (default: 12 o'clock)
  getLastBreak: function(date, ToD) {
    // set default date or correct date type if needed
    if (!date || !date.getDay) date = date ? new Date(date) : new Date();
    // set default ToD as set in sleeplog.conf or settings if available
    if (ToD === undefined) ToD = (global.sleeplog && global.sleeplog.conf ? global.sleeplog.conf.breakToD :
      (require("Storage").readJSON("sleeplog.json", true) || {}).breakToD) || 12;
    // calculate last break time and return
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), ToD);
  },

  // define functions to convert ms to the number of fortnights since the first Sunday at noon: 1970-01-04T12:00
  fnToMs: function(no) {
    return (no + 0.25) * 12096E5;
  },
  msToFn: function(ms) {
    return (ms / 12096E5 - 0.25) | 0;
  },

  // define set debug function, options:
  //  enable as boolean, start/stop debugging
  //  duration in hours, generate csv log if set, max: 96h
  setDebug: function(enable, duration) {
    // check if global variable accessable
    if (!global.sleeplog) return new Error("sleeplog: Can't set debugging, global object missing!");

    // check if nothing has to be changed
    if (!duration &&
      (enable && global.sleeplog.debug === true) ||
      (!enable && !global.sleeplog.debug)) return;

    // check if en- or disable debugging
    if (enable) {
      // define debug object
      global.sleeplog.debug = {};

      // check if a file should be generated
      if (typeof duration === "number") {
        // check duration boundaries, 0 => 8
        duration = duration > 96 ? 96 : duration || 12;
        // calculate and set writeUntil in 10min steps
        global.sleeplog.debug.writeUntil = ((Date.now() / 6E5 | 0) + duration * 6) * 6E5;
        // set fileid to "{hours since 1970}"
        global.sleeplog.debug.fileid = Date.now() / 36E5 | 0;
        // write csv header on empty file
        var file = require("Storage").open("sleeplog_" + global.sleeplog.debug.fileid + ".csv", "a");
        if (!file.getLength()) file.write(
          "timestamp,movement,status,consecutive,asleepSince,awakeSince,bpm,bpmConfidence\n"
        );
        // free ram
        file = undefined;
      } else {
        // set debug as active
        global.sleeplog.debug = true;
      }
    } else {
      // disable debugging
      delete global.sleeplog.debug;
    }

    // save status forced
    global.sleeplog.saveStatus(true);
  },

  // define debugging function, called after logging if debug is set
  debug: function(data) {
    // check if global variable accessable and debug active
    if (!global.sleeplog || !global.sleeplog.debug) return;

    // set functions to convert timestamps
    function localTime(timestamp) {
      return timestamp ? Date(timestamp).toString().split(" ")[4].substr(0, 5) : "- - -";
    }
    function officeTime(timestamp) {
      // days since 30.12.1899
      return timestamp / 864E5 + 25569;
    }

    // generate console output
    var console = "sleeplog: " +
      localTime(data.timestamp) + " > " +
      "movement: " + ("" + data.movement).padStart(4) + ", " +
      "unknown    ,non consec.,consecutive".split(",")[global.sleeplog.consecutive] + " " +
      "unknown,not worn,awake,light sleep,deep sleep".split(",")[data.status].padEnd(12) + ", " +
      "asleep since: " + localTime(global.sleeplog.info.asleepSince) + ", " +
      "awake since: " + localTime(global.sleeplog.info.awakeSince);
    // add bpm if set
    if (data.bpm) console += ", " +
      "bpm: " + ("" + data.bpm).padStart(3) + ", " +
      "confidence: " + data.bpmConfidence;
    // output to console
    print(console);

    // check if debug is set as object with a file id and it is not past writeUntil
    if (typeof global.sleeplog.debug === "object" && global.sleeplog.debug.fileid &&
      Date.now() < global.sleeplog.debug.writeUntil) {
      // generate next csv line
      var csv = [
        officeTime(data.timestamp),
        data.movement,
        data.status,
        global.sleeplog.consecutive,
        global.sleeplog.info.asleepSince ? officeTime(global.sleeplog.info.asleepSince) : "",
        global.sleeplog.info.awakeSince ? officeTime(global.sleeplog.info.awakeSince) : "",
        data.bpm || "",
        data.bpmConfidence || ""
      ].join(",");
      // write next line to log if set
      require("Storage").open("sleeplog_" + global.sleeplog.debug.fileid + ".csv", "a").write(csv + "\n");
    } else {
      // clear file setting in debug
      global.sleeplog.debug = true;
    }

  },

  // print log as humanreadable output similar to debug output
  printLog: function(since, until) {
    // set default until
    until = until || Date.now();
    // print each entry inside log
    this.readLog(since, until).forEach((entry, index, log) => {
      // calculate duration of this entry from 10min steps to minutes
      var duration = ((log[index + 1] || [until / 6E5 | 0])[0] - entry[0]) * 10;
      // print this entry
      print((index + ")").padStart(4) + " " +
        Date(entry[0] * 6E5).toString().substr(0, 21) + " > " +
        "unknown    ,non consec.,consecutive".split(",")[entry[2]] + " " +
        "unknown,not worn,awake,light sleep,deep sleep".split(",")[entry[1]].padEnd(12) +
        "for" + (duration + "min").padStart(8));
    });
  }
};
