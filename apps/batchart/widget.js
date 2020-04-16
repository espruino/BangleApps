(() => {
  const Storage = require("Storage");

  const switchableConsumers = {
    none: 0,
    lcd: 1,
    compass: 2,
    bluetooth: 4,
    gps: 8,
    hrm: 16
  };

  var batChartFile; // file for battery percentage recording
  const recordingInterval10Min = 60 * 10 * 1000;
  const recordingInterval1Min = 60 * 1000; //For testing
  const recordingInterval10S = 10 * 1000; //For testing
  var recordingInterval = null;

  var compassEventReceived = false;
  var gpsEventReceived = false;
  var hrmEventReceived = false;

  // draw your widget
  function draw() {
    let x = this.x;
    let y = this.y;
    
    g.setColor(0, 1, 0);
    g.fillPoly([x + 5, y, x + 5, y + 4, x + 1, y + 4, x + 1, y + 20, x + 18, y + 20, x + 18, y + 4, x + 13, y + 4, x + 13, y], true);

    g.setColor(0, 0, 0);
    g.drawPoly([x + 5, y + 6, x + 8, y + 12, x + 13, y + 12, x + 16, y + 18], false);
    
    g.reset();
  }

  function onMag() {
    compassEventReceived = true;
    // Stop handling events when no longer necessarry
    Bangle.removeListener("mag", onMag);
  }

  function onGps() {
    gpsEventReceived = true;
    Bangle.removeListener("GPS", onGps);
  }

  function onHrm() {
    hrmEventReceived = true;
    Bangle.removeListener("HRM", onHrm);
  }

  function getEnabledConsumersValue() {
    // Wait for an event from each of the devices to see if they are switched on
    var enabledConsumers = switchableConsumers.none;

    Bangle.on('mag', onMag);
    Bangle.on('GPS', onGps);
    Bangle.on('HRM', onHrm);

    // Wait two seconds, that should be enough for each of the events to get raised once
    setTimeout(() => {
      Bangle.removeAllListeners();
    }, 2000);

    if (Bangle.isLCDOn())
      enabledConsumers = enabledConsumers | switchableConsumers.lcd;
    if (compassEventReceived)
      enabledConsumers = enabledConsumers | switchableConsumers.compass;
    if (gpsEventReceived)
      enabledConsumers = enabledConsumers | switchableConsumers.gps;
    if (hrmEventReceived)
      enabledConsumers = enabledConsumers | switchableConsumers.hrm;
    //if (Bangle.isBluetoothOn())
    //   enabledConsumers = enabledConsumers | switchableConsumers.bluetooth;

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
    WIDGETS.batchart.width = 24;

    recordingInterval = setInterval(logBatteryData, recordingInterval10Min);

    logBatteryData();
  }

  // add the widget
  WIDGETS.batchart = {
    area: "tl", width: 24, draw: draw, reload: function () {
      reload();
      Bangle.drawWidgets();
    }
  };

  reload();
})();