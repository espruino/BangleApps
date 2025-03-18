(function(back) {
  const s = require("Storage");
  const apps = s
    .list(/\.info$/)
    .map(app => {
      var a = s.readJSON(app, 1);
      return (
        a && {
          n: a.name,
          t: a.type,
          src: a.src
        }
      );
    })
    .filter(app => app && (app.t == "app" || app.t == "clock" || !app.t))
    .map(a => {
      return { n: a.n, src: a.src };
    });
  apps.sort((a, b) => {
    if (a.n < b.n) return -1;
    if (a.n > b.n) return 1;
    return 0;
  });
  apps.push({
    n: "NONE",
    src: ""
  });

  const settings = s.readJSON("largeclock.json", 1) || {
    BTN1: "",
    BTN3: "",
    right_hand: false
  };

  function showApps(btn) {
    function format(v) {
      return v === settings[btn] ? "*" : "";
    }

    function onchange(v) {
      settings[btn] = v;
      s.writeJSON("largeclock.json", settings);
    }

    const btnMenu = {
      "": {
        title: `Apps for ${btn}`
      },
      "< Back": () => E.showMenu(mainMenu)
    };

    if (apps.length > 0) {
      for (let i = 0; i < apps.length; i++) {
        btnMenu[apps[i].n] = {
          value: apps[i].src,
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
    return E.showMenu(btnMenu);
  }

  const mainMenu = {
    "": { title: "Large Clock" },
    "< Back": back,
    "BTN1 app": () => showApps("BTN1"),
    "BTN3 app": () => showApps("BTN3"),
    "On right hand": {
      value: !!settings.right_hand,
      onchange: v=>{
        settings.right_hand = v;
        s.writeJSON("largeclock.json", settings);
      }
    }
  };

  E.showMenu(mainMenu);
})
