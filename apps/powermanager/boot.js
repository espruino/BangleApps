(function() {
  var settings = Object.assign(
    require('Storage').readJSON("powermanager.default.json", true) || {},
    require('Storage').readJSON("powermanager.json", true) || {}
  );
  
  if (settings.warnEnabled){
    var chargingInterval;

    function handleCharging(charging){
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
    }

    Bangle.on("charging",handleCharging);
    handleCharging(Bangle.isCharging());
  }
  
  if (settings.forceMonoPercentage){
    var p = (E.getBattery()+E.getBattery()+E.getBattery()+E.getBattery())/4;
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
    Bangle.on("charging", (charging)=>{
      if (charging) chargeStart = Date.now();
      if (chargeStart && !charging && (Date.now() - chargeStart > 1000*60*60*3)) require("powermanager").setCalibration();
      if (!charging) chargeStart = undefined;
    });
  }
})();
