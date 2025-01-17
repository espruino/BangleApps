let reloader = (function () {
  let settings = Object.assign({
    reload_delay_in_hours: 2,
  }, require("Storage").readJSON("reloader.json", true) || {});

  let reload = function () {
    if (!Bangle.isLocked()) {
      console.log("Reloader: Device maybe in use. Waiting...");
      setTimeout(reload, 600000);
    }
    else {
    console.log("Reloader: Idle for to long reloading...");
    load();
    }
  };
  
  if (settings.reload_delay_in_hours != 0) {
    setInterval(reload, settings.reload_delay_in_hours * 3600000);
  }
});

reloader();