(function(back) {
  const CONFIGFILE = "sleepphasealarm.json";
  // Load settings
  const config = Object.assign({
      logs: [], // array of length 31 with one entry for each day of month
      settings: {
          startBeforeAlarm: 0, // 0 = start immediately, 1..23 = start 1h..23h before alarm time
          disableAlarm: false,
      }
  }, require("Storage").readJSON(CONFIGFILE,1) || {});

  function writeSettings() {
    require('Storage').writeJSON(CONFIGFILE, config);
  }

  function draw(log) {
    const step = 10*60*1000; // resolution 10min
    const yTicks = ["sleep", "awake", "alarm"];
    const starttime = dateFromJson(log[0].time);
    const endtime = dateFromJson(log[log.length-1].time);

    let logidx = 0;
    let curtime = starttime;
    const data = new Uint8Array(Math.ceil((endtime-curtime)/step) + 1);
    let curval;
    let logtime;
    let i=0;
    while(curtime < endtime) {
      if (logtime === undefined || curtime > logtime) {
        curval = yTicks.indexOf(log[logidx].type);
        logidx++;
        logtime = dateFromJson(log[logidx].time);
      }

      data[i++] = curval;
      curtime = new Date(curtime + step);
    }
    data[i] = 1; // always end with awake

    Bangle.setUI({
      mode: "custom",
      back: () => selectday(),
    });
    g.reset().setFont("6x8",1);

    require("graph").drawLine(g, data, {
      axes: true,
      x: 4,
      y: Bangle.appRect.y+8,
      height: Bangle.appRect.h-20,
      gridx: 1,
      gridy: 1,
      miny: -1,
      maxy: 2,
      title: /*LANG*/"Wakeup " + require("locale").date(endtime, 1),
      ylabel: y => y >= 0 && y <= 1 ? yTicks[y] : "",
      xlabel: x => {
        if (x === Math.round(data.length/10)) {
          return require("locale").time(starttime, 1);
        } else if (x === (data.length-2)-Math.round(data.length/10)) {
          return require("locale").time(endtime, 1);
        }
        return "";
      },
    });
  }

  function selectday() {
    E.showMessage(/*LANG*/"Loading...");

    const logs = config.logs.filter(log => log != null && log.filter(entry => entry.type === "alarm").length > 0);
    logs.sort(function(a, b) { // sort by alarm date desc
      const adate = dateFromJson(a.filter(entry => entry.type === "alarm")[0].time);
      const bdate = dateFromJson(b.filter(entry => entry.type === "alarm")[0].time);
      return bdate - adate;
    });

    const menu = {};
    menu[""] = { title: /*LANG*/"Select day" };
    menu["< Back"] = () => settingsmenu();
    logs.forEach((log, i) => {
      const date = dateFromJson(log.filter(entry => entry.type === "alarm")[0].time);
      menu[require("locale").date(date, 1)] = () => { E.showMenu(); draw(log); };
    });
    E.showMenu(menu);
  }

  function dateFromJson(o) {
    return new Date(typeof o === 'string' ? o : o.ms);
  }

  function settingsmenu() {
    // Show the menu
    E.showMenu({
      "" : { "title" : "SleepPhaseAlarm" },
      'Keep alarm enabled': {
        value: !config.settings.disableAlarm,
        onchange: v => {
          config.settings.disableAlarm = !v;
          writeSettings();
        }
      },   "< Back" : () => back(),
      'Run before alarm': {
        format: v => v === 0 ? 'disabled' : v+'h',
        value: config.settings.startBeforeAlarm,
        min: 0, max: 23,
        onchange: v => {
          config.settings.startBeforeAlarm = v;
          writeSettings();
        }
      },
      /*LANG*/'Select day': () => selectday(),
    });
  }

  settingsmenu();
})
