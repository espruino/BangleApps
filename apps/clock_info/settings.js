(function(back) {
  let settings = require("clock_info").loadSettings();

  function save(key, value) {
    if (key)
      settings[key] = value;
    require('Storage').write("clock_info.json", settings);
  }

  let forced = false;
  function forceBootUpdate() {
    if(forced) return;

    const fname = "setting.json";
    const j = require("Storage").readJSON(fname);
    j.toggle = !j.toggle;
    require("Storage").writeJSON(fname);
    forced = true;
  }

  let menu = {
    '': { 'title': 'Clock Info' },
    /*LANG*/'< Back': back,
    /*LANG*/'Defocus on Lock': {
      value:  !!settings.defocusOnLock,
      onchange: x => save('defocusOnLock', x),
    },
    /*LANG*/'Health Category': {
      value: !!settings.healthCategory,
      onchange: x => save('healthCategory', x),
    },
    /*LANG*/'HRM': {
      value: settings.hrmOn,
      min: 0, max: 1, step: 1,
      format: v => ["Always","Tap"][v],
      onchange: x => save('hrmOn', x),
    },
    /*LANG*/'Max Altitude': {
      value: settings.maxAltitude,
      min: 500, max: 10000, step: 500,
      format: v => v+"m",
      onchange: x => save('maxAltitude', x),
    },
    /*LANG*/'Haptics': {
      value:  !!settings.haptics,
      onchange: x => save('haptics', x),
    },
    /*LANG*/'Filtering': () => {
      let filterMenu = {
        '': { 'title': 'Exclude clkinfos' },
        '< Back': () => E.showMenu(menu)
      };

      const re = /\.clkinfo\.js$/;
      require("Storage")
        .list(re)
        .forEach(file => {
          const name = file.replace(re, "");

          filterMenu[name] = {
            value: !!(settings.exclude && settings.exclude[file]),
            format: v => v ? "hide" : "show",
            onchange: v => {
              if (v) {
                if (!settings.exclude)
                  settings.exclude = {};
                settings.exclude[file] = true;
              } else {
                if (settings.exclude)
                  delete settings.exclude[file];
              }
              save();
              forceBootUpdate();
            },
          };
        });

      let changed = false;
      // clean up stale entries
      Object
        .keys(settings.exclude)
        .filter(k => !(k.replace(re, "") in filterMenu))
        .forEach(k => {
          delete settings.exclude[k];
          changed = true;
        });

      if(changed) save();

      E.showMenu(filterMenu);
    },
  };

  E.showMenu(menu);
})
