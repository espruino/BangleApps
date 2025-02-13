(function() {
   var settings = require("Storage").readJSON("coretemp.json", 1) || {};

  let log = () => { };
  if (settings.debuglog)
    log = print;
  var device;
  var gatt;
  var service;
  var characteristic;
  
  class CoreSensor {
    constructor() {
      this.unit = "";
      this.core = -1;
      this.skin = -1;
      this.heartRate = 0;
      this.HSI = 0;
      this.battery = 0;
    }
  
    updateSensor(event) {
      if (event.target.uuid === "00002101-5b1e-4347-b07c-97b514dae121") {
        let dv = new DataView(event.target.value.buffer);
        log(dv);
  
        let flags = dv.getUint8(0);
  
        // Determine temperature unit
        this.unit = (flags & 8) ? "F" : "C";
  
        // Extract Core Body Temperature if available
        this.core = (flags & 2) ? dv.getInt16(1, true) / 100.0 : 0;
  
        // Extract Skin Temperature if available
        this.skin = (flags & 1) ? dv.getInt16(3, true) / 100.0 : 0;
  
        // Extract Heart Rate if available
        this.heartRate = dv.getUint8(8); // Heart Rate at index 8
  
        // Extract Heat Strain Index if available
        this.HSI = dv.getUint8(9) / 10.0; // Heat Strain Index at index 9
  
        let data = {
          core: this.core,
          skin: this.skin,
          unit: this.unit,
          hr: this.heartRate,
          hsi: this.HSI,
          battery: this.battery
        };
  
        log(data);
        Bangle.emit("CoreTemp", data);
      }
    }
  
    updateBatteryLevel(event) {
      if (event.target.uuid === "0x2a19") {
        let dv = new DataView(event.target.value.buffer);
        this.battery = dv.getUint8(0);
        log(`Battery Level: ${this.battery}%`);
      }
    }
  }
  
  var mySensor = new CoreSensor();
  
  function getSensorBatteryLevel(gatt) {
    gatt.getPrimaryService("180f")
        .then(function(s) { return s.getCharacteristic("2a19"); })
        .then(function(c) {
          c.on('characteristicvaluechanged',
               (event) => mySensor.updateBatteryLevel(event));
          return c.startNotifications();
        });
  }
  
  function connection_setup() {
    log("Scanning for CoreTemp sensor...");
    NRF.requestDevice({active:true,timeout : 20000, filters : [ {namePrefix : 'CORE'} ]})
        .then(function(d) {
          device = d;
          log("Found device");
          return device.gatt.connect();
        })
        .then(function(g) {
          gatt = g;
          return gatt.getPrimaryService('00002100-5b1e-4347-b07c-97b514dae121');
        })
        .then(function(s) {
          service = s;
          return service.getCharacteristic(
              '00002101-5b1e-4347-b07c-97b514dae121');
        })
        .then(function(c) {
          characteristic = c;
          characteristic.on('characteristicvaluechanged',
                            (event) => mySensor.updateSensor(event));
          return characteristic.startNotifications();
        })
        .then(function() {
          log("Done!");
          getSensorBatteryLevel(gatt);
        })
        .catch(function(e) {
          //log(e.toString(), "ERROR");
          log(e);
          connection_setup();
        });
  }
  
  function connection_end() {
    if (gatt != undefined)
      NRF.removeListener("disconnect", connection_setup); 
      gatt.disconnect();
  }
  
  settings = require("Storage").readJSON("coretemp2.json", 1) || {};
  log("Settings:");
  log(settings);
  
  if (true) {
    connection_setup();
    NRF.on('disconnect', connection_setup);
  }
  
  E.on('kill', () => { connection_end(); });
  
  })();