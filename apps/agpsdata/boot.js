(function() {
  let waiting = false;
  let timer;
  let settings = Object.assign(
    { enabled: true, refresh: 1440 },
    require("Storage").readJSON("agpsdata.default.json", 1) || {},
    require("Storage").readJSON("agpsdata.settings.json", 1) || {}
  );
  let refreshMs = (settings.refresh || 1440) * 60000;

  function schedule(delayMs) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(check, Math.max(15000, delayMs));
  }

  function successCallback(){
    waiting = false;
    schedule(refreshMs);
  }

  function errorCallback(){
    waiting = false;
    schedule(15 * 60000);
  }

  function check() {
    timer = undefined;
    let lastUpdate = (require("Storage").readJSON("agpsdata.json", 1) || {}).lastUpdate || 0;
    let age = Date.now() - lastUpdate;
    if (age >= 0 && age < refreshMs) {
      schedule(refreshMs - age);
      return;
    }
    if (!waiting && NRF.getSecurityStatus().connected){
      waiting = true;
      require("agpsdata").pull(successCallback, errorCallback);
    } else {
      schedule(15 * 60000);
    }
  }

  if (settings.enabled) {
    schedule(15000);
    NRF.on("connect", () => schedule(10000));
  }
})();
