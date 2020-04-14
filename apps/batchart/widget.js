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
  const recordingInterval1Min = 60*1000; //For testing 
  const recordingInterval10S = 10*1000; //For testing 
  var recordingInterval = null;

  var compassEventReceived = false;
  var gpsEventReceived = false;
  var hrmEventReceived = false;

  // draw your widget
  function draw() {
    g.reset();
    g.drawString("BC", this.x, this.y);
  }

  function getEnabledConsumersValue() {
    var enabledConsumers = switchableConsumers.none;

    Bangle.on('mag', (() => {
      console.log("mag received");
      compassEventReceived = true;
    }));
    
    Bangle.on('GPS', (() => {
      console.log("GPS received");
      gpsEventReceived = true;
    }));

    Bangle.on('HRM', (() => {
      console.log("HRM received");
      hrmEventReceived = true;
    }));

    // Wait two seconds, that should be enough for each of the events to get raised once
    setTimeout(() => { 
      Bangle.removeAllListeners;
    }, 2000);

    if (Bangle.isLCDOn())
      enabledConsumers = enabledConsumers | switchableConsumers.lcd;
    // Already added in the hope they will be available soon to get more details
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

    console.log("Enabled: " + enabledConsumers);

    return enabledConsumers;
  }

  function logBatteryData() {
    const previousWriteLogName = "bcprvday";
    const previousWriteDay = Storage.read(previousWriteLogName);
    const currentWriteDay = new Date().getDay();

    const logFileName = "bclog" + currentWriteDay;

    // Change log target on day change
    if (previousWriteDay != currentWriteDay) {
      //Remove a log file containing data from a week ago
      Storage.open(logFileName, "r")­.erase();
      Storage.write(previousWriteLogName, currentWriteDay);
    }

    var bcLogFileA = Storage.open(logFileName, "a");
    if (bcLogFileA) {
      console.log([getTime().toFixed(0), E.getBattery(), E.getTemperature(), getEnabledConsumersValue()].join(","));
      bcLogFileA.write([[getTime().toFixed(0), E.getBattery(), E.getTemperature(), getEnabledConsumersValue()].join(",")].join(",")+"\n");
    }
  }

  function reload() {
    WIDGETS["batchart"].width = 24;

    recordingInterval = setInterval(logBatteryData, recordingInterval10S);

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