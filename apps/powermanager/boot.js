(function() {
  var settings = Object.assign(
    require('Storage').readJSON("powermanager.default.json", true) || {},
    require('Storage').readJSON("powermanager.json", true) || {}
  );
  
  if (settings.warnEnabled){
    print("Charge warning enabled");
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
})();
