(() => {
  let recordingInterval = null;
  const Storage = require("Storage");

  const switchableConsumers = {
    none: 0,
    lcd: 1,
    compass: 2,
    bluetooth: 4,
    gps: 8,
    hrm: 16
  };

  //var batChartFile; // file for battery percentage recording
  const recordingInterval10Min = 60 * 10 * 1000;
  //const recordingInterval1Min = 60 * 1000; //For testing
  //const recordingInterval10S = 10 * 1000; //For testing

  var compassEventReceived = false;
  var gpsEventReceived = false;
  var hrmEventReceived = false;

  function draw() {
    // void
  }

  function batteryChartOnMag() {
    compassEventReceived = true;
    // Stop handling events when no longer necessarry
    Bangle.removeListener("mag", batteryChartOnMag);
  }

  function batterChartOnGps() {
    gpsEventReceived = true;
    Bangle.removeListener("GPS", batterChartOnGps);
  }

  function batteryChartOnHrm() {
    hrmEventReceived = true;
    Bangle.removeListener("HRM", batteryChartOnHrm);
  }

  function getEnabledConsumersValue() {
    // Wait for an event from each of the devices to see if they are switched on
    var enabledConsumers = switchableConsumers.none;

    Bangle.on('mag', batteryChartOnMag);
    Bangle.on('GPS', batterChartOnGps);
    Bangle.on('HRM', batteryChartOnHrm);

    // Wait two seconds, that should be enough for each of the events to get raised once
    setTimeout(() => {
      Bangle.removeListener('mag', batteryChartOnMag);
      Bangle.removeListener('GPS', batterChartOnGps);
      Bangle.removeListener('HRM', batteryChartOnHrm);
    }, 2000);

    if (Bangle.isLCDOn())
      enabledConsumers = enabledConsumers | switchableConsumers.lcd;
    if (compassEventReceived)
      enabledConsumers = enabledConsumers | switchableConsumers.compass;
    if (gpsEventReceived)
      enabledConsumers = enabledConsumers | switchableConsumers.gps;
    if (hrmEventReceived)
      enabledConsumers = enabledConsumers | switchableConsumers.hrm;

    // Very coarse first approach to check if the BLE device is on.
    if (NRF.getSecurityStatus().connected)
      enabledConsumers = enabledConsumers | switchableConsumers.bluetooth;

    // Reset the event registration vars
    compassEventReceived = false;
    gpsEventReceived = false;
    hrmEventReceived = false;

    return enabledConsumers.toString();
  }

  function logBatteryData() {
    const previousWriteLogName = "bcprvday";
    const previousWriteDay = parseInt(Storage.open(previousWriteLogName, "r").readLine());
    const currentWriteDay = new Date().getDay();

    const logFileName = "bclog" + currentWriteDay;

    // Change log target on day change
    if (!isNaN(previousWriteDay) && previousWriteDay != currentWriteDay) {
      //Remove a log file containing data from a week ago
      Storage.open(logFileName, "r").erase();
      Storage.open(previousWriteLogName, "w").write(parseInt(currentWriteDay));
    }

    var bcLogFileA = Storage.open(logFileName, "a");
    if (bcLogFileA) {
      let logTime = getTime().toFixed(0);
      let logPercent = E.getBattery();
      let logTemperature = E.getTemperature();
      let logConsumers = getEnabledConsumersValue();

      let logString = [logTime, logPercent, logTemperature, logConsumers].join(",");

      bcLogFileA.write(logString + "\n");
    }
  }

  function reload() {
    WIDGETS["batchart"].width = 0;

    if (recordingInterval) {
      clearInterval(recordingInterval);
      recordingInterval = null;
    }

    recordingInterval = setInterval(logBatteryData, recordingInterval10Min);
  }

  // add the widget
  WIDGETS["batchart"] = {
    area: "tl", width: 0, draw: draw, reload: reload
  };

  reload();
})();
