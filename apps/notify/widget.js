(function() {
  var s = require("Storage");

  global.ShowFullscreenNotification = function(src, title, body) {
    var cfg = s.readJSON("notify.json", 1);
    cfg.notifications.unshift({src: src, title: title, body: body});
    cfg.notifications.splice(cfg.maxCount)
    cfg.isNotify = true;
    s.writeJSON("notify.json", cfg)
    load("notify.app.js");
  }
})();
