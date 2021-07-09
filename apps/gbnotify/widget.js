(() => {

  function store(e) {
    const s = require("Storage");
    const db = s.readJSON("gbnotify.json", true) || [];
    if (db.unshift(e) > 5) {
      db.pop();
    }
    s.writeJSON("gbnotify.json", db)
  }

  var _GB = global.GB;
  global.GB = (event) => {
    if (event.t === "notify") {
      store(event);
      if (!Bangle.isLCDOn()) Bangle.buzz();
      require("notify").show(event);
    }
    if (event.t === "notify-") {
      require("notify").hide(event);
    }
    if(_GB)setTimeout(_GB,0,event);
  };
})()
