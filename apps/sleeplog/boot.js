// Sleep/Wake detection with Estimation of Stationary Sleep-segments (ESS):
// Marko Borazio, Eugen Berlin, Nagihan Kücükyildiz, Philipp M. Scholl and Kristof Van Laerhoven, "Towards a Benchmark for Wearable Sleep Analysis with Inertial Wrist-worn Sensing Units", ICHI 2014, Verona, Italy, IEEE Press, 2014.
// https://ubicomp.eti.uni-siegen.de/home/datasets/ichi14/index.html.en

// sleeplog.status values: undefined = service stopped,  0 = unknown, 1 = not worn, 2 = awake, 3 = sleeping

// load settings into global object 
global.sleeplog = Object.assign({
  enabled: true, // en-/disable completely
  logfile: "sleeplog.log", // logfile
  powersaving: false, // disables ESS and uses build in movement detection
  winwidth: 13, // 13 values, read with 12.5Hz = every 1.04s
  nomothresh: 0.012, // values lower than 0.008 getting triggert by noise
  sleepthresh: 577, // 577 times no movement * 1.04s window width > 10min
  maxmove: 100, // movement threshold on power saving mode
  tempthresh: 27, // every temperature above ist registered as worn
}, require("Storage").readJSON("sleeplog.json", true) || {});

// delete app settings
["breaktod", "maxawake", "minconsec"].forEach(property => delete sleeplog[property]);

// check if service enabled
if (sleeplog.enabled) {

  // add always used values and functions to global object
  sleeplog = Object.assign(sleeplog, {
    // set cached values
    resting: undefined,
    status: undefined,

    // define function to handle stopping the service, it will be restarted on reload if enabled
    stopHandler: function() {
      // remove all listeners
      Bangle.removeListener('accel', sleeplog.accel);
      Bangle.removeListener('health', sleeplog.health);
      // write log with undefined sleeping status
      require("sleeplog").writeLog(0, [Math.floor(Date.now()), 0]);
      // reset cached values if sleeplog is defined
      if (global.sleeplog) {
        sleeplog.resting = undefined;
        sleeplog.status = undefined;
        // reset cached ESS calculation values
        if (!sleeplog.powersaving) {
          sleeplog.ess_values = [];
          sleeplog.nomocount = 0;
          sleeplog.firstnomodate = undefined;
        }
      }
    },

    // define function to remove the kill listener and stop the service
    // https://github.com/espruino/BangleApps/issues/1445
    stop: function() {
      E.removeListener('kill', sleeplog.stopHandler);
      sleeplog.stopHandler();
    },

    // define function to initialy start or restart the service
    start: function() {
      // add kill listener
      E.on('kill', sleeplog.stopHandler);
      // add health listener if defined and 
      if (sleeplog.health) Bangle.on('health', sleeplog.health);
      // add acceleration listener if defined and set status to unknown
      if (sleeplog.accel) Bangle.on('accel', sleeplog.accel);
      // read log since 5min ago and restore status to last known state or unknown
      sleeplog.status = (require("sleeplog").readLog(0, Date.now() - 3E5)[1] || [0, 0])[1];
      // update resting according to status
      sleeplog.resting = sleeplog.status % 2;
      // write restored status to log
      require("sleeplog").writeLog(0, [Math.floor(Date.now()), sleeplog.status]);
    }
  });

  // check for power saving mode
  if (sleeplog.powersaving) {
    // power saving mode using build in movement detection
    // delete unused settings
    ["winwidth", "nomothresh", "sleepthresh"].forEach(property => delete sleeplog[property]);
    // add cached values and functions to global object
    sleeplog = Object.assign(sleeplog, {
      // define health listener function
      health: function(data) {
        // set global object and check for existence
        var gObj = global.sleeplog;
        if (!gObj) return;

        // calculate timestamp for this measurement
        var timestamp = Math.floor(Date.now() - 6E5);

        // check for non-movement according to the threshold
        if (data.movement <= gObj.maxmove) {
          // check resting state
          if (gObj.resting !== true) {
            // change resting state
            gObj.resting = true;
            // set status to sleeping or worn
            gObj.status = E.getTemperature() > gObj.tempthresh ? 3 : 1;
            // write status to log, 
            require("sleeplog").writeLog(0, [timestamp, gObj.status, E.getTemperature()]);
          }
        } else {
          // check resting state
          if (gObj.resting !== false) {
            // change resting state, set status and write status to log
            gObj.resting = false;
            gObj.status = 2;
            require("sleeplog").writeLog(0, [timestamp, 2]);
          }
        }
      }
    });
  } else {
    // full ESS calculation
    // add cached values and functions to global object
    sleeplog = Object.assign(sleeplog, {
      // set cached values
      ess_values: [],
      nomocount: 0,
      firstnomodate: undefined,

      // define acceleration listener function
      accel: function(xyz) {
        // save acceleration magnitude and start calculation on enough saved data
        if (global.sleeplog && sleeplog.ess_values.push(xyz.mag) >= sleeplog.winwidth) sleeplog.calc();
      },

      // define calculator function
      calc: function() {
        // exit on wrong this
        if (this.enabled === undefined) return;
        // calculate standard deviation over 
        var mean = this.ess_values.reduce((prev, cur) => cur + prev) / this.winwidth;
        var stddev = Math.sqrt(this.ess_values.map(val => Math.pow(val - mean, 2)).reduce((prev, cur) => prev + cur) / this.winwidth);
        // reset saved acceleration data
        this.ess_values = [];

        // check for non-movement according to the threshold
        if (stddev < this.nomothresh) {
          // increment non-movement sections count, set date of first non-movement
          if (++this.nomocount == 1) this.firstnomodate = Math.floor(Date.now());
          // check resting state and non-movement count against threshold
          if (this.resting !== true && this.nomocount >= this.sleepthresh) {
            // change resting state
            this.resting = true;
            // set status to sleeping or worn
            this.status = E.getTemperature() > this.tempthresh ? 3 : 1;
            // write status to log, with first no movement timestamp
            require("sleeplog").writeLog(0, [this.firstnomodate, this.status, E.getTemperature()]);
          }
        } else {
          // reset non-movement sections count
          this.nomocount = 0;
          // check resting state
          if (this.resting !== false) {
            // change resting state and set status
            this.resting = false;
            this.status = 2;
            // write status to log 
            require("sleeplog").writeLog(0, [Math.floor(Date.now()), 2]);
          }
        }
      }
    });
  }

  // initial starting
  global.sleeplog.start();
}
