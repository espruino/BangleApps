exports.enable = () => {
  var settings = require("Storage").readJSON("coretemp.json", 1) || {};
  let log = function() {};//print
  Bangle.enableCORESensorLog = function() {
    log = function(text, param){
        let logline = new Date().toISOString() + " - " + text;
        if (param) logline += ": " + JSON.stringify(param);
        print(logline);
    };
  };

  let gatt;
  let device;
  let batteryCharacteristic = null;


  //From BTHRM to call if connected or not:
  if (settings.enabled){
    Bangle.isCORESensorOn = function(){
      return (Bangle._PWR && Bangle._PWR.CORESensor && Bangle._PWR.CORESensor.length > 0);
    };

    Bangle.isCORESensorConnected = function(){
      return gatt && gatt.connected;
    };
  }

  let onDisconnect = function(reason) {
    log("Disconnect: " + reason);
    if (Bangle.isCORESensorOn()){ //might have accidentally disconnected or had trouble connecting, reconnect attempt
      setTimeout(initCORESensor, 1000);
    }
  };

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
        let index = 0;
        let flags = dv.getUint8(index++); 
        let coreTemp = dv.getInt16(index, true) / 100.0;
        index += 2;
        let skinTemp = dv.getInt16(index, true) / 100.0;
        index += 2;
        let coreReserved = dv.getInt16(index, true);
        index += 2;
        let qualityAndState = dv.getUint8(index++);
        let heartRate = dv.getUint8(index++);
        let heatStrainIndex = dv.getUint8(index) / 10.0;
        this.unit = (flags & 0b00001000) ? "F" : "C"; 
        this.core = coreTemp;
        this.skin = skinTemp;
        this.coreReserved = coreReserved;
        this.qualityAndState = qualityAndState;
        this.heartRate = heartRate;
        this.HSI = heatStrainIndex;
        let data = {
          core: this.core,
          skin: this.skin,
          unit: this.unit,
          hr: this.heartRate,
          hsi: this.HSI,
          battery: this.battery
        };
        log(data);
        Bangle.emit("CORESensor", data);
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
  /*
  function setupBatteryRead(gatt) {
    gatt.getPrimaryService("180f")
      .then(s => s.getCharacteristic("2a19"))
      .then(c => {
        batteryCharacteristic = c; // Store for later use
      })
      .catch(e => log("Failed to get battery characteristic:", e));
  }

  function readBatteryLevel() {
    if (batteryCharacteristic) {
      batteryCharacteristic.readValue()
        .then(event => mySensor.updateBatteryLevel(event))
        .catch(e => log("Error reading battery:", e));
    } else {
      log("Battery characteristic not ready yet.");
    }
  }
  */
  function initCORESensor(){
    if(!settings.btname){
      log("CORESensor not paired, quitting");
      return;
    }
    NRF.requestDevice({ filters: [{ name: settings.btname, active:true }] }).then(function (d) {
      device = d;
      log("Found device " + device.id);
      device.on('gattserverdisconnected', onDisconnect);
      return device.gatt.connect();
    }).then(function (g) {
      log("Connected");
      gatt = g;
      return gatt.getPrimaryService('00002100-5b1e-4347-b07c-97b514dae121');
    }).then(function (service) {
      return service.getCharacteristic('00002101-5b1e-4347-b07c-97b514dae121');
    }).then(function (characteristic) {
      log("Got characteristic");
      characteristic.on('characteristicvaluechanged', event => {
        mySensor.updateSensor(event);});
      return characteristic.startNotifications();
    }).then(function () {
      log("Ready");
      log("Done!");
    }).catch(function (err) {
      log("CORESensor Connectiong Error", err);
      gatt = undefined;
      onDisconnect(err);
    });
  }
  Bangle.setCORESensorPower = function (isOn, app) {
    // Do app power handling
    if (!app) app = "?";
    log("setCORESensorPower ->", isOn, app);
    if (Bangle._PWR === undefined) Bangle._PWR = {};
    if (Bangle._PWR.CORESensor === undefined) Bangle._PWR.CORESensor = [];
    if (isOn && !Bangle._PWR.CORESensor.includes(app)) Bangle._PWR.CORESensor.push(app);
    if (!isOn && Bangle._PWR.CORESensor.includes(app)) Bangle._PWR.CORESensor = Bangle._PWR.CORESensor.filter(a => a != app);
    isOn = Bangle._PWR.CORESensor.length;
    // so now we know if we're really on
    if (isOn) {
      log("setCORESensorPower on"+ app);
      if(!Bangle.isCORESensorConnected()) initCORESensor();
    } else { // being turned off! 
      log("setCORESensorPower turning off ", app);
      if (gatt) {
        if (gatt.connected){
          log("CORESensor: Disconnect with gatt", gatt);
          try{
            gatt.disconnect().then(()=>{
              log("CORESensor: Successful disconnect");
            }).catch((e)=>{
              log("CORESensor: Error during disconnect promise", e);
            });
          } catch (e){
            log("CORESensor: Error during disconnect attempt", e);
          }
        }
      }
    }
  };

  // disconnect when swapping apps
  E.on("kill", function () {
    if (gatt) {
      log("CORESensor connected - disconnecting");
      try { gatt.disconnect(); } catch (e) {
        log("CORESensor disconnect error", e);
      }
      gatt = undefined;
    }
  });

};