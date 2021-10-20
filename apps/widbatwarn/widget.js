(function() {
  const SETTINGS_FILE = "widbatwarn.json";
  let settings;

  function loadSettings() {
    settings = require("Storage").readJSON(SETTINGS_FILE, 1) || {};
    const DEFAULTS = {
      buzz: true,
      percentage: 10,
    };
    Object.keys(DEFAULTS).forEach(k => {
      if (settings[k]===undefined) settings[k] = DEFAULTS[k];
    });
  }

  function setting(key) {
    if (!settings) { loadSettings(); }
    return settings[key];
  }

  let warning = false; // did we show the warning already?
  function check() {
    if (Bangle.isCharging()
      || E.getBattery()>setting("percentage")) {
      require("notify").hide({id: "widbatwarn"});
      warning = false;
      return;
    }
    if (warning) return; // already warned
    warning = true; // only show once (until we recharge)
    require("notify").show({
      size: 56, id: "widbatwarn",
      // battery-low.png
      icon: require("heatshrink").decompress(atob("jEYwgfchnM5nABaQJCBoQLSAhAL/Bf6bHAAYLpACgA==")),
      title: "Low Battery",
      render: a => {
        g.setFont("6x8", 2).setFontAlign(-1, 0)
          .setColor(-1).drawString("Battery: ", a.x+8, a.y+a.h/2)
          .setColor(0xF800).drawString(`${E.getBattery()}%`, a.x+8+100, a.y+a.h/2);
      },
    });
    if (setting("buzz")
      && !(require('Storage').readJSON('setting.json',1)||{}).quiet) {
      Bangle.buzz();
    }
  }

  Bangle.on("charging", check);

  function reload() {
    loadSettings();
    // check right away, so user sees it work when fiddling with settings
    check();
  }

  // we never draw anything, but 'area' and 'draw' are required
  WIDGETS["batwarn"] = {width: 0, reload: reload, area: "tl", draw: () => {}};

  // check every minute
  // deliberately not right away, to prevent instant notifications in settings
  setTimeout(check, 60000);
})();