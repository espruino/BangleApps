(function() {
  //var sf = require("Storage").open("bthrm.log","a");
  var log = function(text, param){
    /*var logline = Date.now().toFixed(3) + " - " + text;
    if (param){
      logline += " " + JSON.stringify(param);
    }
    sf.write(logline + "\n");
    print(logline);*/
  }
  
  log("Start");
  
  var blockInit = false;
  var gatt;
  var currentRetryTimeout;
  var initialRetryTime = 40;
  var maxRetryTime = 60000;
  var retryTime = initialRetryTime;
  
  var origIsHRMOn = Bangle.isHRMOn;
  
  Bangle.isBTHRMOn = function(){
    return (gatt!==undefined && gatt.connected);
  };
  
  Bangle.isHRMOn = function() {
    var settings = require('Storage').readJSON("bthrm.json", true) || {};

    if (settings.enabled && !settings.replace){
        return origIsHRMOn();
    } else if (settings.enabled && settings.replace){
        return Bangle.isBTHRMOn();
    }
    return origIsHRMOn() || Bangle.isBTHRMOn();
  };
  
  var serviceFilters = [{
    services: [
      "180d"
    ]
  }];

  function retry(){
    log("Retry with time " + retryTime);
    if (currentRetryTimeout){
      log("Clearing timeout " + currentRetryTimeout);
      clearTimeout(currentRetryTimeout);
      currentRetryTimeout = undefined;
    }
    
    var clampedTime = retryTime < 200 ? 200 : initialRetryTime;
    currentRetryTimeout = setTimeout(() => {
      log("Set timeout for retry as " + clampedTime);
      initBt();
    }, clampedTime);
    
    retryTime = Math.pow(retryTime, 1.1);
    if (retryTime > maxRetryTime){
      retryTime = maxRetryTime;
    }
  }

  function onDisconnect(reason) {
    log("Disconnect: " + reason);
    log("Gatt: ", gatt);
    retry();
  }

  function onCharacteristic(event) {
    var settings = require('Storage').readJSON("bthrm.json", true) || {};
    var dv = event.target.value;
    var flags = dv.getUint8(0);
    // 0 = 8 or 16 bit
    // 1,2 = sensor contact
    // 3 = energy expended shown
    // 4 = RR interval
    var bpm = (flags & 1) ? (dv.getUint16(1) / 100 /* ? */ ) : dv.getUint8(1); // 8 or 16 bit
    /*  var idx = 2 + (flags&1); // index of next field
    if (flags&8) idx += 2; // energy expended
    if (flags&16) {
      var interval = dv.getUint16(idx,1); // in milliseconds
    }*/

    Bangle.emit(settings.replace ? "HRM" : "BTHRM", {
      bpm: bpm,
      confidence: bpm == 0 ? 0 : 100,
      src: settings.replace ? "bthrm" : undefined
    });
  }
  
  var reUseCounter=0;

  function initBt() {
    log("initBt with blockInit: " + blockInit);
    if (blockInit){
      retry();
      return;
    }
    
    blockInit = true;
    
    var connectionPromise;

    if (reUseCounter > 3){
      log("Reuse counter to high")
      if (gatt.connected == true){
        try {
          log("Force disconnect with gatt: ", gatt);
          gatt.disconnect();
        } catch(e) {
          log("Error during force disconnect", e);
        }
      }
      gatt=undefined;
      reUseCounter = 0;
    }
    
    if (!gatt){
      var requestPromise = NRF.requestDevice({ filters: serviceFilters });
      connectionPromise = requestPromise.then(function(device) {
        gatt = device.gatt;
        log("Gatt after request:", gatt);
        gatt.device.on('gattserverdisconnected', onDisconnect);
      });
    } else {
      reUseCounter++;
      log("Reusing gatt:", gatt);
      connectionPromise = gatt.connect();
    }


    var servicePromise = connectionPromise.then(function() {
      return gatt.getPrimaryService(0x180d);
    });

    var characteristicPromise = servicePromise.then(function(service) {
      log("Got service:", service);
      return service.getCharacteristic(0x2A37);
    });

    var notificationPromise = characteristicPromise.then(function(c) {
      log("Got characteristic:", c);
      c.on('characteristicvaluechanged', onCharacteristic);
      return c.startNotifications();
    });
    notificationPromise.then(()=>{
      log("Wait for notifications");
      retryTime = initialRetryTime;
      blockInit=false;
    });
    notificationPromise.catch((e) => {
      log("Error:", e);
      blockInit = false;
      retry();
    });
  }
  
  
  Bangle.setBTHRMPower = function(isOn, app) {
    var settings = require('Storage').readJSON("bthrm.json", true) || {};
  
    // Do app power handling
    if (!app) app="?";
    if (Bangle._PWR===undefined) Bangle._PWR={};
    if (Bangle._PWR.BTHRM===undefined) Bangle._PWR.BTHRM=[];
    if (isOn && !Bangle._PWR.BTHRM.includes(app)) Bangle._PWR.BTHRM.push(app);
    if (!isOn && Bangle._PWR.BTHRM.includes(app)) Bangle._PWR.BTHRM = Bangle._PWR.BTHRM.filter(a=>a!=app);
    isOn = Bangle._PWR.BTHRM.length;
    // so now we know if we're really on
    if (isOn) {
      if (!Bangle.isBTHRMOn()) {
        initBt();
      }
    } else { // not on
      log("Power off for " + app);
      if (gatt) {
        try {
          log("Disconnect with gatt: ", gatt);
          gatt.disconnect();
        } catch(e) {
          log("Error during disconnect", e);
        }
        blockInit = false;
        gatt = undefined;
      }
    }
  };
  
  var origSetHRMPower = Bangle.setHRMPower;
    
  Bangle.setHRMPower = function(isOn, app) {
    log("setHRMPower for " + app + ":" + (isOn?"on":"off"));
    var settings = require('Storage').readJSON("bthrm.json", true) || {};
    if (settings.enabled || !isOn){
      log("Enable BTHRM power");
      Bangle.setBTHRMPower(isOn, app);
    }
    if ((settings.enabled && !settings.replace) || !settings.enabled || !isOn){
      log("Enable HRM power");
      origSetHRMPower(isOn, app);
    }
  }
  
  var settings = require('Storage').readJSON("bthrm.json", true) || {};
  if (settings.enabled && settings.replace){
    log("Replace HRM event");
    if (!(Bangle._PWR===undefined) && !(Bangle._PWR.HRM===undefined)){
      for (var i = 0; i < Bangle._PWR.HRM.length; i++){
        var app = Bangle._PWR.HRM[i];
        log("Moving app " + app);
        origSetHRMPower(0, app);
        Bangle.setBTHRMPower(1, app);
        if (Bangle._PWR.HRM===undefined) break;
      }
    }
  }
})();
