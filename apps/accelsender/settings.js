/**
 * @param {function} back Use back() to return to settings menu
 */
(function(back) {

  // Load the current settings from the boot code's in-memory config.
  // This isn't perfect, since things could change after loading
  // This also assumes accelSender is already defined, which should be true since boot.js runs before settings.js
  let s = {
    enabled: globalThis.accelSender.isEnabled(),
    interval: globalThis.accelSender.getInterval(),
    widget: globalThis.accelSender.getWidget()
  };

  function save(key, value) {
    s[key] = value;
    // Instead of saving to file, update boot.js in-memory config and let it trigger any changes immediately
    switch(key) {
      case "interval": 
        globalThis.accelSender.setInterval(value);
        break;
      case "widget":
        globalThis.accelSender.setWidget(value);
        break;
      case "enabled":
        globalThis.accelSender.setEnabled(value);
        break;
    }
  }

  const menu = {
    "": {"title": "Accel Sender"},
    "< Back": back,
    "Enabled": {
      value: s.enabled,
      onchange: (v) => save("enabled", v)
    },
    // Widgets: Disabled, Sleep (may add non-sleep in future)
    "Widget": {
      value: s.widget,
      format: v => ["Disabled", "Sleep Icon"][v],
      min: 0, max: 1, step: 1,
      onchange: (v) => save("widget", v)
    },
    // Max for SleepAsAndroid is 10s
    "Interval (s)": {
      value: s.interval / 1000,
      min: 1, max: 10, step: 1,
      onchange: (v) => save("interval", v * 1000)
    },
  };
  E.showMenu(menu);
})
