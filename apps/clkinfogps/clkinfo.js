(function () {
  var timeout;
  var last_fix;
  var fixTs;
  var geo = require("geotools");

  var debug = function(o) {
    //console.log(o);
  };

  var resetLastFix = function() {
    last_fix = {
      fix: 0,
      alt: 0,
      lat: 0,
      lon: 0,
      speed: 0,
      time: 0,
      course: 0,
      satellites: 0
    };
  };

  var formatTime = function(now) {
    try {
      var fd = now.toUTCString().split(" ");
      return fd[4];
    } catch (e) {
      return "00:00:00";
    }
  };

  var clearTimer = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
      debug("timer cleared");
    }
  };

  var queueGPSon = function() {
    clearTimer();
    // power on the GPS again in 90 seconds
    timeout = setTimeout(function() {
      timeout = undefined;
      Bangle.setGPSPower(1,"clkinfo");
    }, 90000);
    debug("gps on queued");
  };

  var onGPS = function(fix) {
    debug(fix);
    last_fix.time = fix.time;

    // we got a fix
    if (fix.fix) {
      last_fix = fix;
      fixTs = Math.round(getTime());
      // cancel the timeout, if not already timed out
      clearTimer();
      // power off the GPS
      Bangle.setGPSPower(0,"clkinfo");
      queueGPSon();
    }

    // if our last fix was more than 4 minutes ago, reset the fix to show gps time + satelites
    if (Math.round(getTime()) - fixTs > 240) {
      resetLastFix();
      fixTs = Math.round(getTime());
      // cancel the timeout and power off the gps, tap required to restart
      clearTimer();
      Bangle.setGPSPower(0,"clkinfo");
    }

    info.items[0].emit("redraw");
  };

  var img = function() {
    return atob("GBgBAAAAAAAAABgAAb2ABzzgB37gD37wHn54AAAADEwIPn58Pn58Pv58Pn58FmA4AAAAHn54D37wD37gBzzAAb2AABgAAAAAAAAA");
  };

  var gpsText = function() {
    if (last_fix === undefined)
      return '';

    // show gps time and satelite count
    if (!last_fix.fix)
      return formatTime(last_fix.time) + ' ' + last_fix.satellites;

    return geo.gpsToOSMapRef(last_fix);
  };

  var info = {
    name: "GPS",
    items: [
      {
        name: "gridref",
        get: function () { return ({
          img: img(),
          text: gpsText()
        }); },
        run : function() {
          debug("run");
          // if the timer is already runnuing reset it, we can get multiple run calls by tapping
          clearTimer();
          Bangle.setGPSPower(1,"clkinfo");
        },
        show: function () {
          debug("show");
          resetLastFix();
          fixTs = Math.round(getTime());
          Bangle.on("GPS",onGPS);
          this.run();
        },
        hide: function() {
          debug("hide");
          clearTimer();
          Bangle.setGPSPower(0,"clkinfo");
          Bangle.removeListener("GPS", onGPS);
          resetLastFix();
        }
      }
    ]
  };

  return info;
});
