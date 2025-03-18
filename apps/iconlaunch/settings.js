// make sure to enclose the function in parentheses
(function(back) {
  const s = require("Storage");
  let settings = Object.assign({
    showClocks: true,
    fullscreen: false,
    direct: false,
    oneClickExit: true,
    swipeExit: false,
    timeOut:"Off"
  }, s.readJSON("iconlaunch.json", true) || {});

  function save(key, value) {
    settings[key] = value;
    s.write("iconlaunch.json",settings);
  }
  const timeOutChoices = [/*LANG*/"Off", "10s", "15s", "20s", "30s"];
  const appMenu = {
    "": { "title": /*LANG*/"Launcher", back: back },
    /*LANG*/"Show Clocks": {
      value: settings.showClocks == true,
      onchange: (m) => {
        save("showClocks", m);
        s.erase("iconlaunch.cache.json"); //delete the cache app list
     }
    },
    /*LANG*/"Fullscreen": {
      value: settings.fullscreen == true,
      onchange: (m) => { save("fullscreen", m) }
    },
    /*LANG*/"Direct launch": {
      value: settings.direct == true,
      onchange: (m) => { save("direct", m) }
    },
    /*LANG*/"One click exit": {
      value: settings.oneClickExit == true,
      onchange: (m) => { save("oneClickExit", m) }
    },
    /*LANG*/"Swipe exit": {
      value: settings.swipeExit == true,
      onchange: m => { save("swipeExit", m) }
    },
    /*LANG*/'Time Out': {
      value: timeOutChoices.indexOf(settings.timeOut),
      min: 0, max: timeOutChoices.length-1,
      format: v => timeOutChoices[v],
      onchange: m => {
        save("timeOut", timeOutChoices[m]);
      }
    },
  };
  E.showMenu(appMenu);
})
