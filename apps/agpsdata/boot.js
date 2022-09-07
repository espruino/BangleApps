(function() {
  let waiting = false;
  let settings = require("Storage").readJSON("agpsdata.settings.json", 1) || {
    enabled: true,
    refresh: 1440
  };
  
  if (settings.refresh == undefined) settings.refresh = 1440;

  function successCallback(){
    waiting = false;
  }

  function errorCallback(){
    waiting = false;
  }

  if (settings.enabled) {
    let lastUpdate = settings.lastUpdate;
    if (!lastUpdate || lastUpdate + settings.refresh * 1000 * 60 < Date.now()){
      if (!waiting){
        waiting = true;
        require("agpsdata").pull(successCallback, errorCallback);
      }
    }
    setInterval(() => {
      if (!waiting && NRF.getSecurityStatus().connected){
        waiting = true;
        require("agpsdata").pull(successCallback, errorCallback);
      }
    }, settings.refresh * 1000 * 60);
  }
})();
