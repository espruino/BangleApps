// sleeplog.status values:
// undefined = service stopped,  0 = unknown, 1 = not worn, 2 = awake, 3 = light sleep, 4 = deep sleep
// sleeplog.consecutive values:
// undefined = service stopped,  0 = unknown, 1 = no consecutive sleep, 2 = consecutive sleep

// create global object with settings
global.sleeplog = {
  conf: Object.assign({
    // main settings
    enabled: true, //   en-/disable completely
    // threshold settings
    maxAwake: 36E5, //  [ms] maximal awake time to count for consecutive sleep
    minConsec: 18E5, // [ms] minimal time to count for consecutive sleep
    deepTh: 100, //     threshold for deep sleep
    lightTh: 200, //    threshold for light sleep
  }, require("Storage").readJSON("sleeplog.json", true) || {})
};

// check if service is enabled
if (sleeplog.conf.enabled) {
  // assign functions to global object
  global.sleeplog = Object.assign({
    // define function to initialy start or restart the service
    start: function() {
      // add kill and health listener
      E.on('kill', sleeplog.saveStatus);
      Bangle.on('health', sleeplog.health);

      // restore saved status
      this.restoreStatus();
    },

    // define function to stop the service, it will be restarted on reload if enabled
    stop: function() {
      // remove all listeners
      Bangle.removeListener('health', sleeplog.health);
      E.removeListener('kill', sleeplog.saveStatus);

      // save active values
      this.saveStatus();
      // reset active values
      this.status = undefined;
      this.consecutive = undefined;
    },

    // define function to restore active values on a restart or reload
    restoreStatus: function() {
      // define restore objects with default values
      var restore = {
        status: 0,
        consecutive: 0,
        info: {}
      };

      // open log file
      var file = require("Storage").open("sleeplog.log", "r");
      // read last 55 chars from log
      file.read(file.getLength() - 52);
      file = file.read(52);

      // check if the log contains data
      if (file) {
        // remove unneeded data
        file = file.trim().split("\n").reverse().filter((e, i) => i < 2);
        // convert file into accessable array
        file = file.map(e => e.split(",").map(e => parseInt(e)));

        // add default data if no previous status is available
        if (file.length < 2 || file[1].length !== 3) file.push([0, 0, 0]);

        // check if data to restore has been saved
        if (file[0].length > 3) {
          // read data into restore object
          restore = {
            status: file[1][1],
            consecutive: file[1][2],
            info: {
              lastChange: file[1][0] * 6E5,
              lastCheck: file[0][1] * 6E5,
              awakeSince: file[0][2] * 6E5,
              asleepSince: file[0][3] * 6E5
            }
          };

          // add debug if set
          if (file[0].length === 6)
            restore = Object.assign(restore, {
              debug: file[0][4] ? {
                writeUntil: file[0][4] * 6E5,
                fileid: file[0][5]
              } : true
            });

          // calculate timestamp in 10min steps, corrected to 10min ago
          var timestamp = (Date.now() / 6E5 | 0) - 1;

          // check if restored status not unknown and lastCheck was 20min before timestamp
          if (restore.status && restore.info.lastCheck + 12E5 < timestamp) {
            // set status and consecutive to unknown
            restore.status = 0;
            restore.consecutive = 0;
            restore.info.lastChange = restore.info.lastCheck + 6E5;
            restore.info.lastCheck = timestamp;
            // write undefined status 10min after restored lastCheck
            this.appendStatus(restore.info.lastChange, 0, 0);
          } else {
            // set saveUpToDate
            restore.info.saveUpToDate = true;
          }
        }
      }

      // write restored values into global object
      global.sleeplog = Object.assign(this, restore);
    },

    // define function to save active values on a stop or kill event
    // - called by event listener: "this"-reference points to global
    saveStatus: function(force) {
      // check if global variable accessable
      if (!global.sleeplog) return new Error("sleeplog: Can't save status, global object missing!");

      // check saveUpToDate is not set or forced
      if (!sleeplog.info.saveUpToDate || force) {
        // save status, consecutive status and info timestamps to restore on reload
        var save = [sleeplog.info.lastCheck, sleeplog.info.awakeSince, sleeplog.info.asleepSince];
        // add debuging status if active
        if (sleeplog.debug) save.push(sleeplog.debug.writeUntil, sleeplog.debug.fileid);

        // stringify entries
        save = "," + save.map((entry, index) => {
          if (index < 4) entry /= 6E5; // store in 10min steps
          return entry | 0; // sanitize
        }).join(",") + "\n";

        // add present status if forced
        if (force) save = (sleeplog.info.lastChange / 6E5) + "," +
          sleeplog.status + "," + sleeplog.consecutive + "\n" + save;

        // append saved data to StorageFile
        require("Storage").open("sleeplog.log", "a").write(save);

        // clear save string to free ram
        save = undefined;
      }
    },

    // define health listener function
    // - called by event listener: "this"-reference points to global
    health: function(data) {
      // check if global variable accessable
      if (!global.sleeplog) return new Error("sleeplog: Can't process health event, global object missing!");

      // check if movement is available
      if (!data.movement) return;

      // add timestamp rounded to 10min, corrected to 10min ago
      data.timestamp = data.timestamp || ((Date.now() / 6E5 | 0) - 1) * 6E5;

      // add preliminary status depending on charging and movement thresholds
      // 1 = not worn, 2 = awake, 3 = light sleep, 4 = deep sleep
      data.status = Bangle.isCharging() ? 1 :
        data.movement <= sleeplog.conf.deepTh ? 4 :
        data.movement <= sleeplog.conf.lightTh ? 3 : 2;

      // check if changing to deep sleep from non sleeping
      if (data.status === 4 && sleeplog.status <= 2) {
        // check wearing status
        sleeplog.checkIsWearing((isWearing, data) => {
          // correct status
          if (!isWearing) data.status = 1;
          // set status
          sleeplog.setStatus(data);
        }, data);
      } else {
        // set status
        sleeplog.setStatus(data);
      }
    },

    // define function to check if the bangle is worn by using the hrm
    checkIsWearing: function(returnFn, data) {
      // create a temporary object to store data and functions
      global.tmpWearingCheck = {
        // define temporary hrm listener function to read the wearing status
        hrmListener: hrm => tmpWearingCheck.isWearing = hrm.isWearing,
        // set default wearing status
        isWearing: false,
      };

      // enable HRM
      Bangle.setHRMPower(true, "wearingCheck");
      // wait until HRM is initialised
      setTimeout((returnFn, data) => {
        // add HRM listener
        Bangle.on('HRM-raw', tmpWearingCheck.hrmListener);
        // wait for two cycles (HRM working on 60Hz)
        setTimeout((returnFn, data) => {
          // remove listener and disable HRM
          Bangle.removeListener('HRM-raw', tmpWearingCheck.hrmListener);
          Bangle.setHRMPower(false, "wearingCheck");
          // cache wearing status
          var isWearing = tmpWearingCheck.isWearing;
          // clear temporary object
          delete global.tmpWearingCheck;
          // call return function with status
          returnFn(isWearing, data);
        }, 34, returnFn, data);
      }, 2500, returnFn, data);
    },

    // define function to set the status
    setStatus: function(data) {
      // update lastCheck
      this.info.lastCheck = data.timestamp;

      // correct light sleep status to awake if
      //  previous status not deep sleep and not too long awake (asleepSince unset)
      if (data.status === 3 && this.status !== 4 && !this.info.asleepSince) {
        data.status = 2;
      }

      // cache consecutive status to check for changes later on
      data.consecutive = this.consecutive;

      // check if changing to deep sleep from non sleepling
      if (data.status === 4 && this.status <= 2) {
        // set asleepSince if undefined
        this.info.asleepSince = this.info.asleepSince || data.timestamp;
        // reset consecutive status
        data.consecutive = 0;
        // check if changing to awake
      } else if (data.status === 2 && this.status > 2) {
        // set awakeSince if undefined
        this.info.awakeSince = this.info.awakeSince || data.timestamp;
        // reset consecutive status
        data.consecutive = 0;
      }
      // reset consecutive sleep if not worn
      if (data.status === 1) this.consecutive = 1;
      // check if consecutive unknown
      if (!this.consecutive) {
        // check if long enough asleep or too long awake
        if (data.status === 4 && this.info.asleepSince &&
          this.info.asleepSince + this.conf.minConsec <= data.timestamp) {
          // set consecutive sleep
          data.consecutive = 2;
          // reset awakeSince
          this.info.awakeSince = 0;
        } else if (data.status <= 2 && this.info.awakeSince &&
          this.info.awakeSince + this.conf.maxAwake <= data.timestamp) {
          // set non consecutive sleep
          data.consecutive = 1;
          // reset asleepSince
          this.info.asleepSince = 0;
        }
      }

      // check if the status has changed
      var changed = data.status !== this.status || data.consecutive !== this.consecutive;

      // read and check trigger entries
      var triggers = Object.keys(this.trigger) || [];
      if (triggers.length) {
        // calculate time from timestamp in ms on full minutes
        var time = new Date();
        time = (time.getHours() * 60 + time.getMinutes()) * 60 * 1000;
        // go through all triggers
        triggers.forEach(key => {
          // read entry to key
          let entry = this.trigger[key];
          // set from and to values to default if unset
          let from = entry.from || 0;
          let to = entry.to || 24 * 60 * 60 * 1000;
          // check if the event matches the entries requirements
          if (typeof entry.fn === "function" && (changed || !entry.onChange) &&
            (from <= to ? from <= time && time <= to : time <= to || from <= time))
            // and call afterwards with status data
            setTimeout(entry.fn, 100, {
              timestamp: new Date(data.timestamp),
              status: data.status,
              consecutive: data.consecutive,
              prevStatus: data.status === this.status ? undefined : this.status,
              prevConsecutive: data.consecutive === this.consecutive ? undefined : this.consecutive
            }, (e => {delete e.fn; return e;})(entry.clone()));
        });
      }

      // cache change into a known consecutive state
      var changeIntoConsec = data.consecutive;

      // actions on a status change
      if (changed) {
        // append status
        this.appendStatus(data.timestamp, data.status, data.consecutive);

        // set new states and update lastChange
        this.status = data.status;
        this.consecutive = data.consecutive;
        this.info.lastChange = data.timestamp;
        // reset saveUpToDate status
        delete this.info.saveUpToDate;
      }

      // send status to gadgetbridge
      var gb_kinds = "unknown,not_worn,activity,light_sleep,deep_sleep";
      Bluetooth.println("");
      Bluetooth.println(JSON.stringify({
        t: "act",
        act: gb_kinds.split(",")[data.status],
        ts: data.timestamp
      }));

      // call debugging function if set
      if (this.debug) require("sleeplog").debug(data);

      // check if changed into known consecutive state
      if (changeIntoConsec) {
        // check if change is to consecutive sleep or not
        if (changeIntoConsec === 2) {
          // call move log function
          require("sleeplog").moveLog();
        } else {
          // update stats cache if available
          if (this.statsCache) this.statsCache = require("sleeplog").getStats();
        }
        // remove module from cache if cached
        if (Modules.getCached().includes("sleeplog")) Modules.removeCached("sleeplog");
      }
    },

    // define function to append the status to the StorageFile log
    appendStatus: function(timestamp, status, consecutive) {
      // exit on missing timestamp
      if (!timestamp) return;
      // reduce timestamp to 10min step
      timestamp = timestamp / 6E5 | 0;
      // append to StorageFile
      require("Storage").open("sleeplog.log", "a").write(
        [timestamp, status || 0, consecutive || 0].join(",") + "\n"
      );
    },

    // define function to access stats of the last night
    getStats: function() {
      // check if stats cache is not defined or older than 12h
      //  if stats cache is set it will be updated on every change to non consecutive sleep
      if (this.statsCache === undefined || this.statsCache.calculatedAt + 432E5 < Date.now()) {
        // read stats of the last night into cache and remove module from cache
        this.statsCache = require("sleeplog").getStats();
        // remove module from cache if cached
        if (Modules.getCached().includes("sleeplog")) Modules.removeCached("sleeplog");
      }
      // return stats cache
      return this.statsCache;
    },

    // define trigger object
    trigger: {}
  }, sleeplog);

  // initial starting
  global.sleeplog.start();
} else {
  // clear global object from ram
  delete global.sleeplog;
}
