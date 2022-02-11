// Sleep/Wake detection with Estimation of Stationary Sleep-segments (ESS):
// Marko Borazio, Eugen Berlin, Nagihan Kücükyildiz, Philipp M. Scholl and Kristof Van Laerhoven, "Towards a Benchmark for Wearable Sleep Analysis with Inertial Wrist-worn Sensing Units", ICHI 2014, Verona, Italy, IEEE Press, 2014.
// https://ubicomp.eti.uni-siegen.de/home/datasets/ichi14/index.html.en

// sleeplog.status values: 0 = unknown, 1 = not worn, 2 = awake, 3 = sleeping

// load settings into global object 
global.sleeplog = Object.assign({
  enabled: true, // en-/disable completely
  logfile: "sleeplog.log", // logfile
  winwidth: 13, // 13 values, read with 12.5Hz = every 1.04s
  nomothresh: 0.012, // values lower than 0.008 getting triggert by noise
  sleepthresh: 577, // 577 times no movement * 1.04s window width > 10min
  tempthresh: 27, // every temperature above ist registered as worn
}, require("Storage").readJSON("sleeplog.json", true) || {});

// delete app settings
["breaktod", "maxawake", "minconsec"].forEach(property => delete global.sleeplog[property]);

// check if service enabled
if (global.sleeplog.enabled) {

  // add cached values and functions to global object
  global.sleeplog = Object.assign(global.sleeplog, {
    // set cached values
    ess_values: [],
    nomocount: 0,
    firstnomodate: undefined,
    resting: undefined,
    status: 0,

    // define acceleration listener function
    accel: function(xyz) {
      // save acceleration magnitude and start calculation on enough saved data
      if (global.sleeplog.ess_values.push(xyz.mag) >= global.sleeplog.winwidth) global.sleeplog.calc();
    },

    // define calculator function
    calc: function() {
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
          // change resting state, status and write to log
          this.resting = true;
          // check if the watch is worn
          if (E.getTemperature() > this.tempthresh) {
            // set status and write to log as sleping
            this.status = 3;
            this.log(this.firstnomodate, 3, E.getTemperature());
          } else {
            // set status and write to log as not worn
            this.status = 1;
            this.log(this.firstnomodate, 1, E.getTemperature());
          }
        }
      } else {
        // reset non-movement sections count
        this.nomocount = 0;
        // check resting state
        if (this.resting !== false) {
          // change resting state
          this.resting = false;
          // set status and write to log as awake
          this.status = 2;
          this.log(Math.floor(Date.now()), 2);
        }
      }
    },

    // define logging function
    log: function(date, status, temperature, info) {
      // skip logging if logfile is undefined or does not end with ".log"
      if (!this.logfile || !this.logfile.endsWith(".log")) return;
      // prevent logging on implausible date
      if (date < 9E11 || Date() < 9E11) return;

      // set default value for status
      status = status || 0;

      // define storage
      var storage = require("Storage");

      // read previous logfile
      var logContent = storage.read(this.logfile) || "";

      // parse previous logfile
      var log = JSON.parse(logContent.length > 0 ? atob(logContent) : "[]") ;

      // remove last state if it was unknown and is less then 10min ago
      if (log.length > 0 && log[0][1] === 0 &&
        Math.floor(Date.now()) - log[0][0] < 600000) log.shift();

      // add actual status at the first position if it has changed
      if (log.length === 0 || log[0][1] !== status)
        log.unshift(info ? [date, status, temperature, info] : temperature ? [date, status, temperature] : [date, status]);

      // write log to storage
      storage.write(this.logfile, btoa(JSON.stringify(log)));

      // clear variables
      log = undefined;
      storage = undefined;
    },

    // define stop function (logging will restart if enabled and boot file is executed)
    stop: function() {
      // remove acceleration and kill listener
      Bangle.removeListener('accel', global.sleeplog.accel);
      E.removeListener('kill', global.sleeplog.stop);
      // write log with undefined sleeping status
      global.sleeplog.log(Math.floor(Date.now()));
      // reset cached values
      global.sleeplog.ess_values = [];
      global.sleeplog.nomocount = 0;
      global.sleeplog.firstnomodate = undefined;
      global.sleeplog.resting = undefined;
      global.sleeplog.status = 0;
    },

    // define restart function (also use for initial starting)
    start: function() {
      // add acceleration listener
      Bangle.on('accel', global.sleeplog.accel);
      // add kill listener
      E.on('kill', global.sleeplog.stop);
    },
  });

  // initial starting
  global.sleeplog.start();
}
