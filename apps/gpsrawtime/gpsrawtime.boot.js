(function () {
  var setTimeTimeout, gpsTimeout;

  var log = (text) => {
    var logText = (new Date()).toISOString() + " - " + text;
    require("Storage").open("gpsrawtime.log", "a").write(logText + "\n");
  };

  function calcTime(nema) {
    if (nema.substr(3, 3) !== "RMC") {
      return;
    }
    log("calcTime");

    var values = nema.split(",");
    if (values.length < 10) {
      return;
    }
    var timeStr = values[1];
    var dateStr = values[9];

    var year = "20" + dateStr.substr(4, 2);
    var month = Number(dateStr.substr(2, 2)) - 1;
    var day = dateStr.substr(0, 2);

    var hours = timeStr.substr(0, 2);
    var minutes = timeStr.substr(2, 2);
    var seconds = timeStr.substr(4, 2);
    var milliseconds = Number(timeStr.substr(7));

    var receivedDateTime = new Date(year, month, day, hours, minutes, seconds, milliseconds);
    var receivedTimeStamp = receivedDateTime.getTime() - 60000 * receivedDateTime.getTimezoneOffset();
    var watchTimeStamp = Math.round(Date.now());
    var delta = watchTimeStamp - receivedTimeStamp;

    log("Difference: " + Math.abs(delta));
    if (Math.abs(delta) >= 2000) {
      log("Setting time");
      setTimeout(_ => setTime(receivedTimeStamp / 1000), 1000 - milliseconds);
    }

    disableGPS();
  }

  function planNextRun() {
    if (setTimeTimeout) {
      clearTimeout(setTimeTimeout);
    }

    var runTime = 4 * 60 * 60 * 1000; // run every 4 hours
    var nextRun = (runTime - (Date.now() % runTime));
    log("Next run in " + (nextRun / 1000).toFixed(0) + " seconds");
    setTimeTimeout = setTimeout(enableGPS, nextRun);
  }

  function disableGPS() {
    if (gpsTimeout) {
      clearTimeout(gpsTimeout);
    }

    Bangle.setGPSPower(0, "setTimeFromRawGPS");
    Bangle.removeListener("GPS-raw", calcTime);

    planNextRun();
  }

  function enableGPS() {
    log("enableGPS");

    Bangle.on("GPS-raw", calcTime);
    Bangle.setGPSPower(1, "setTimeFromRawGPS");

    // disable gps after 10 seconds
    gpsTimeout = setTimeout(_ => {
      log("got no GPS-raw $GPRMC within 10 seconds");
      disableGPS();
    }, 10 * 1000);
  }

  // enable RMC (e.g. $GPRMC) messages
  Bangle.setGPSPower(1, "setTimeFromRawGPS");
  Serial1.println("$PCAS03,,,,,1,,,,,,,,,*33");
  Bangle.setGPSPower(0, "setTimeFromRawGPS");

  // run plan on app start
  planNextRun();
})();