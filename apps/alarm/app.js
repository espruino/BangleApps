Bangle.loadWidgets();
Bangle.drawWidgets();

// An array of alarm objects (see sched/README.md)
var alarms = require("sched").getAlarms();

// 0 = Sunday
// 1 = Monday
var firstDayOfWeek = (require("Storage").readJSON("setting.json", true) || {}).firstDayOfWeek || 0;

function getCurrentTime() {
  var time = new Date();
  return (
    time.getHours() * 3600000 +
    time.getMinutes() * 60000 +
    time.getSeconds() * 1000
  );
}

function saveAndReload() {
  // Before saving revert the dow to the standard format
  alarms.forEach(a => a.dow = handleFirstDayOfWeek(a.dow, firstDayOfWeek));

  require("sched").setAlarms(alarms);
  require("sched").reload();
}

function showMainMenu() {
  // Timer img "\0"+atob("DhKBAP////MDDAwwMGGBzgPwB4AeAPwHOBhgwMMzDez////w")
  // Alarm img "\0"+atob("FBSBAABgA4YcMPDGP8Zn/mx/48//PP/zD/8A//AP/wD/8A//AP/wH/+D//w//8AAAADwAAYA")
  const menu = {
    '': { 'title': /*LANG*/'Alarms&Timers' },
    /*LANG*/'< Back': () => { load(); },
    /*LANG*/'New Alarm': () => editAlarm(-1),
    /*LANG*/'New Timer': () => editTimer(-1)
  };
  alarms.forEach((alarm, idx) => {
    alarm.dow = handleFirstDayOfWeek(alarm.dow, firstDayOfWeek);

    var type, txt; // a leading space is currently required (JS error in Espruino 2v12)
    if (alarm.timer) {
      type = /*LANG*/"Timer";
      txt = " " + require("sched").formatTime(alarm.timer);
    } else {
      type = /*LANG*/"Alarm";
      txt = " " + require("sched").formatTime(alarm.t);
    }
    if (alarm.rp) txt += "\0" + atob("FBaBAAABgAAcAAHn//////wAHsABzAAYwAAMAADAAAAAAwAAMAADGAAzgAN4AD//////54AAOAABgAA=");
    // rename duplicate alarms
    if (menu[type + txt]) {
      var n = 2;
      while (menu[type + " " + n + txt]) n++;
      txt = type + " " + n + txt;
    } else txt = type + txt;
    // add to menu
    menu[txt] = {
      value: "\0" + atob(alarm.on ? "EhKBAH//v/////////////5//x//j//H+eP+Mf/A//h//z//////////3//g" : "EhKBAH//v//8AA8AA8AA8AA8AA8AA8AA8AA8AA8AA8AA8AA8AA8AA///3//g"),
      onchange: function () {
        setTimeout(alarm.timer ? editTimer : editAlarm, 10, idx, alarm);
      }
    };
  });

  if (alarms.some(e => !e.on)) {
    menu[/*LANG*/"Enable All"] = () => enableAll(true);
  }
  if (alarms.some(e => e.on)) {
    menu[/*LANG*/"Disable All"] = () => enableAll(false);
  }
  if (alarms.length > 0) {
    menu[/*LANG*/"Delete All"] = () => deleteAll();
  }

  if (WIDGETS["alarm"]) WIDGETS["alarm"].reload();
  return E.showMenu(menu);
}

function editDOW(dow, onchange) {
  const menu = {
    '': { 'title': /*LANG*/'Days of Week' },
    /*LANG*/'< Back': () => onchange(dow)
  };

  require("date_utils").dows(firstDayOfWeek).forEach((day, i) => {
    menu[day] = {
      value: !!(dow & (1 << (i + firstDayOfWeek))),
      format: v => v ? /*LANG*/"Yes" : /*LANG*/"No",
      onchange: v => v ? (dow |= 1 << (i + firstDayOfWeek)) : (dow &= ~(1 << (i + firstDayOfWeek)))
    };
  });

  E.showMenu(menu);
}

function editAlarm(alarmIndex, alarm) {
  var newAlarm = alarmIndex < 0;
  var a = require("sched").newDefaultAlarm();
  a.dow = handleFirstDayOfWeek(a.dow, firstDayOfWeek);

  if (!newAlarm) Object.assign(a, alarms[alarmIndex]);
  if (alarm) Object.assign(a, alarm);
  var t = require("sched").decodeTime(a.t);

  const menu = {
    '': { 'title': /*LANG*/'Alarm' },
    /*LANG*/'< Back': () => {
      saveAlarm(newAlarm, alarmIndex, a, t);
      showMainMenu();
    },
    /*LANG*/'Hours': {
      value: t.hrs, min: 0, max: 23, wrap: true,
      onchange: v => t.hrs = v
    },
    /*LANG*/'Minutes': {
      value: t.mins, min: 0, max: 59, wrap: true,
      onchange: v => t.mins = v
    },
    /*LANG*/'Enabled': {
      value: a.on,
      format: v => v ? /*LANG*/"On" : /*LANG*/"Off",
      onchange: v => a.on = v
    },
    /*LANG*/'Repeat': {
      value: a.rp,
      format: v => v ? /*LANG*/"Yes" : /*LANG*/"No",
      onchange: v => a.rp = v
    },
    /*LANG*/'Days': {
      value: decodeDOW(a.dow),
      onchange: () => setTimeout(editDOW, 100, a.dow, d => {
        a.dow = d;
        a.t = require("sched").encodeTime(t);
        editAlarm(alarmIndex, a);
      })
    },
    /*LANG*/'Vibrate': require("buzz_menu").pattern(a.vibrate, v => a.vibrate = v),
    /*LANG*/'Auto Snooze': {
      value: a.as,
      format: v => v ? /*LANG*/"Yes" : /*LANG*/"No",
      onchange: v => a.as = v
    }
  };

  menu[/*LANG*/"Cancel"] = () => showMainMenu();

  if (!newAlarm) {
    menu[/*LANG*/"Delete"] = function () {
      alarms.splice(alarmIndex, 1);
      saveAndReload();
      showMainMenu();
    };
  }

  return E.showMenu(menu);
}

function saveAlarm(newAlarm, alarmIndex, a, t) {
  a.t = require("sched").encodeTime(t);
  a.last = (a.t < getCurrentTime()) ? (new Date()).getDate() : 0;

  if (newAlarm) {
    alarms.push(a);
  } else {
    alarms[alarmIndex] = a;
  }

  saveAndReload();
}

function editTimer(alarmIndex, alarm) {
  var newAlarm = alarmIndex < 0;
  var a = require("sched").newDefaultTimer();
  if (!newAlarm) Object.assign(a, alarms[alarmIndex]);
  if (alarm) Object.assign(a, alarm);
  var t = require("sched").decodeTime(a.timer);

  const menu = {
    '': { 'title': /*LANG*/'Timer' },
    /*LANG*/'< Back': () => {
      saveTimer(newAlarm, alarmIndex, a, t);
      showMainMenu();
    },
    /*LANG*/'Hours': {
      value: t.hrs, min: 0, max: 23, wrap: true,
      onchange: v => t.hrs = v
    },
    /*LANG*/'Minutes': {
      value: t.mins, min: 0, max: 59, wrap: true,
      onchange: v => t.mins = v
    },
    /*LANG*/'Enabled': {
      value: a.on,
      format: v => v ? /*LANG*/"On" : /*LANG*/"Off",
      onchange: v => a.on = v
    },
    /*LANG*/'Vibrate': require("buzz_menu").pattern(a.vibrate, v => a.vibrate = v),
  };

  menu[/*LANG*/"Cancel"] = () => showMainMenu();

  if (!newAlarm) {
    menu[/*LANG*/"Delete"] = function () {
      alarms.splice(alarmIndex, 1);
      saveAndReload();
      showMainMenu();
    };
  }
  return E.showMenu(menu);
}

function saveTimer(newAlarm, alarmIndex, a, t) {
  a.timer = require("sched").encodeTime(t);
  a.t = getCurrentTime() + a.timer;
  a.last = 0;

  if (newAlarm) {
    alarms.push(a);
  } else {
    alarms[alarmIndex] = a;
  }

  saveAndReload();
}

function handleFirstDayOfWeek(dow, firstDayOfWeek) {
  if (firstDayOfWeek == 1) {
    if ((dow & 1) == 1) {
      // By default 1 = Sunday.
      // Here the week starts on Monday and Sunday is ON so move Sunday to 128.
      dow += 127;
    } else if ((dow & 128) == 128) {
      dow -= 127;
    }
  }
  return dow;
}

function decodeDOW(dow) {
  return require("date_utils")
    .dows(firstDayOfWeek, 2)
    .map((day, index) => dow & (1 << (index + firstDayOfWeek)) ? day : "_")
    .join("");
}

function enableAll(on) {
  E.showPrompt(/*LANG*/"Are you sure?", {
    title: on ? /*LANG*/"Enable All" : /*LANG*/"Disable All"
  }).then((confirm) => {
    if (confirm) {
      alarms.forEach(alarm => alarm.on = on);
      saveAndReload();
    }

    showMainMenu();
  });
}

function deleteAll() {
  E.showPrompt(/*LANG*/"Are you sure?", {
    title: /*LANG*/"Delete All"
  }).then((confirm) => {
    if (confirm) {
      alarms = [];
      saveAndReload();
    }

    showMainMenu();
  });
}

showMainMenu();
