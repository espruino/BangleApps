(function(back) {
  const s = require("Storage");
  const apps = s
    .list(/\.info$/)
    .map(app => {
      var a = s.readJSON(app, 1);
      return a && (a.type=="app" || a.type=="clock" || !a.type) && {n: a.name, src: a.src};
    })
    .filter(Boolean);
  apps.sort((a, b) => {
    if (a.n < b.n) return -1;
    if (a.n > b.n) return 1;
    return 0;
  });
  apps.push({n: "NONE", src: null});

  const settings = s.readJSON("shortcuts.json", 1) || {
    BTN1: null,
    BTN3: null
  };

  function showApps(btn) {
    function format(v) {
      return v === settings[btn] ? "*" : "";
    }

    function onchange(v) {
      settings[btn] = v;
      s.writeJSON("shortcuts.json", settings);
    }

    const btnMenu = {
      "": {
        title: `Apps for ${btn}`
      },
      "< Back": () => E.showMenu(mainMenu)
    };

    if (apps.length > 0) {
      for (let a of apps) {
        btnMenu[a.n] = {
          value: a.src,
          format: format,
          onchange: onchange
        };
      }
    } else {
      btnMenu["...No Apps..."] = {
        value: undefined,
        format: () => "",
        onchange: () => {}
      };
    }

    E.showMenu(btnMenu);
  }

  const mainMenu = {
    "": { title: "Shortcuts Settings" },
    "< Back": back,
    "BTN1 app": () => showApps("BTN1"),
    "BTN3 app": () => showApps("BTN3")
  };
  E.showMenu(mainMenu);
})
