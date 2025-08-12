(function() {
  var settings = Object.assign(
    require('Storage').readJSON("powermanager.default.json", true) || {},
    require('Storage').readJSON("powermanager.json", true) || {}
  );

  if (settings.log) {
    let logFile = require('Storage').open("powermanager.log","a");
    let def = require('Storage').readJSON("powermanager.def.json", true) || {};
    if (!def.start) def.start = Date.now();
    if (!def.deferred) def.deferred = {};
    let hw = require('Storage').readJSON("powermanager.hw.json", true) || {};
    if (!hw.start) hw.start = Date.now();
    if (!hw.power) hw.power = {};

    const saveEvery = 1000 * 60 * 5;
    const TO_WRAP = ["GPS","Compass","Barometer","HRM","LCD"];

    let save = ()=>{
      let defExists = require("Storage").read("powermanager.def.json")!==undefined;
      if (!(!defExists && def.saved)){
        def.saved = Date.now();
        require('Storage').writeJSON("powermanager.def.json", def);
      }
      let hwExists = require("Storage").read("powermanager.hw.json")!==undefined;
      if (!(!hwExists && hw.saved)){
        hw.saved = Date.now();
        require('Storage').writeJSON("powermanager.hw.json", hw);
      }
    }

    setInterval(save, saveEvery);

    E.on("kill", ()=>{
      for (let c of TO_WRAP){
        if (lastPowerOn[c] && Bangle["is"+c+"On"]()){
          hw.power[c] += Date.now() - lastPowerOn[c];
        }
      }
      save();
    });


    let logPower = (type, oldstate, state, app) => {
      logFile.write(Date.now() + ",p," + type + ',' + (oldstate?1:0) + ',' + (state?1:0) + ',' + app + "\n");
    };
    let logDeferred = (type, duration, source) => {
      logFile.write(Date.now() + "," + type + ',' + duration + ',' + source.replace(/\n/g, " ").replace(/,/g,"") + "\n");
    };

    let lastPowerOn = {};

    for (let c of TO_WRAP){
      let functionName = "set" + c + "Power";
      let checkName = "is" + c + "On";
      let type = c + "";
      lastPowerOn[type] = (!lastPowerOn[type] && Bangle[checkName]()) ? Date.now() : undefined;

      lastPowerOn[type] = Date.now();

      Bangle[functionName] = ((o) => (a,b) => {
        let oldstate = Bangle[checkName]();
        let result = o(a,b);
        if (!lastPowerOn[type] && result) {
          //switched on, store time
          lastPowerOn[type] = Date.now();
        } else if (lastPowerOn[type] && !result){
          //switched off
          hw.power[type] += Date.now() - lastPowerOn[type];
          lastPowerOn[type] = undefined;
        }

        if (settings.logDetails) logPower(type, oldstate, result, b);
        return result;
      })(Bangle[functionName]);
    }

    let wrapDeferred = ((o,t) => (a) => {
      if (a == eval || typeof a == "string") {
        return o.apply(this, arguments);
      } else {
        let wrapped = a;
        if (!a.__wrapped){
          wrapped = ()=>{
            let start = Date.now();
            let result = a.apply(undefined, arguments.slice(2)); // function arguments for deferred calls start at index 2, first is function, second is time
            let end = Date.now()-start;
            let f = a.toString().substring(0,100);
            if (settings.logDetails) logDeferred(t, end, f);
            if (!def.deferred[f]) def.deferred[f] = 0;
            def.deferred[f] += end;
            return result;
          };
          //copy over properties of functions
          for (let p in a){
            wrapped[p] = a[p];
          }
          //mark function as wrapped
          wrapped.__wrapped = true;
        }
        let newArgs = arguments.slice();
        newArgs[0] = wrapped;
        return o.apply(this, newArgs);
      }
    });

    global.setTimeout = wrapDeferred(global.setTimeout, "t");
    global.setInterval = wrapDeferred(global.setInterval, "i");
  }

  if (settings.warnEnabled){
    var chargingInterval;

    let handleCharging = (charging) => {
        if (charging){
          if (chargingInterval) clearInterval(chargingInterval);
          chargingInterval = setInterval(()=>{
            if (E.getBattery() > settings.warn){
              Bangle.buzz(1000);
            }
          }, 10000);
      }
      if (chargingInterval && !charging){
        clearInterval(chargingInterval);
        chargingInterval = undefined;
      }
    };

    Bangle.on("charging",handleCharging);
    handleCharging(Bangle.isCharging());
  }

  if (settings.forceMonoPercentage){
    var p = Math.round((E.getBattery()+E.getBattery()+E.getBattery()+E.getBattery())/4);
    var op = E.getBattery;
    E.getBattery = function() {
      var current = Math.round((op()+op()+op()+op())/4);
      if (Bangle.isCharging() && current > p) p = current;
      if (!Bangle.isCharging() && current < p) p = current;
      return p;
    };
  }
  
  if (settings.forceMonoVoltage){
    var v = (NRF.getBattery()+NRF.getBattery()+NRF.getBattery()+NRF.getBattery())/4;
    var ov = NRF.getBattery;
    NRF.getBattery = function() {
      var current = (ov()+ov()+ov()+ov())/4;
      if (Bangle.isCharging() && current > v) v = current;
      if (!Bangle.isCharging() && current < v) v = current;
      return v;
    };
  }

  if (settings.autoCalibration){
    let chargeStart;
    if (Bangle.isCharging()) chargeStart = Date.now();
    Bangle.on("charging", (charging)=>{
      if (!chargeStart && charging) chargeStart = Date.now();
      if (chargeStart && !charging && (Date.now() - chargeStart > 1000*60*60*3)) require("powermanager").setCalibration();
      if (!charging) chargeStart = undefined;
    });
  }
})();
