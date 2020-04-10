(() => {
  var switchableConsumers = {
    none: 0,
    lcd: 1,
    compass: 2,
    bluetooth: 4,
    gps: 8,
    hrm: 16
  };

  var settings = {};
  var batChartFile; // file for battery percentage recording
  const recordingInterval10Min = 60 * 10 * 1000;
  const recordingInterval1Min = 60*1000; //For testing 
  const recordingInterval10S = 10*1000; //For testing 
  var recordingInterval = null;

  // draw your widget
  function draw() {
    g.reset();
    g.drawString("BC", this.x, this.y);
  }

  function getEnabledConsumersValue() {
    var enabledConsumers = switchableConsumers.none;

    if (Bangle.isLCDOn())
      enabledConsumers = enabledConsumers | switchableConsumers.lcd;
    // Already added in the hope they will be available soon to get more details
    // if (Bangle.isCompassOn())
    //   enabledConsumers = enabledConsumers | switchableConsumers.compass;
    // if (Bangle.isBluetoothOn())
    //   enabledConsumers = enabledConsumers | switchableConsumers.bluetooth;
    // if (Bangle.isGpsOn())
    //   enabledConsumers = enabledConsumers | switchableConsumers.gps;
    // if (Bangle.isHrmOn())
    //   enabledConsumers = enabledConsumers | switchableConsumers.hrm;

    return enabledConsumers;
  }

  function logBatteryData() {
    const previousWriteLogName = "bcprvday";
    const previousWriteDay = require("Storage").read(previousWriteLogName);
    const currentWriteDay = new Date().getDay();

    const logFileName = "bclog" + currentWriteDay;

    // Change log target on day change
    if (previousWriteDay != currentWriteDay) {
      //Remove a log file containing data from a week ago
      require("Storage").erase(logFileName);
      require("Storage").write(previousWriteLogName, currentWriteDay);
    }

    var bcLogFileA = require("Storage").open(logFileName, "a");
    if (bcLogFileA) {
      console.log([getTime().toFixed(0), E.getBattery(), E.getTemperature(), getEnabledConsumersValue()].join(","));
      bcLogFileA.write([[getTime().toFixed(0), E.getBattery(), E.getTemperature(), getEnabledConsumersValue()].join(",")].join(",")+"\n");
    }
  }

  // Called by the heart app to reload settings and decide what's
  function reload() {
    WIDGETS["batchart"].width = 24;

    recordingInterval = setInterval(logBatteryData, recordingInterval10Min);

    logBatteryData();
  }

  // add the widget
  WIDGETS["batchart"]={area:"tl",width:24,draw:draw,reload:function() {
    reload();
    Bangle.drawWidgets(); // relayout all widgets
  }};
  // load settings, set correct widget width
  reload();
})()