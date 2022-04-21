Bangle.loadWidgets();
Bangle.drawWidgets();

// An array of alarm objects (see sched/README.md)
let alarms = require("sched").getAlarms();

function getCurrentTime() {
  let time = new Date();
  return (
    time.getHours() * 3600000 +
    time.getMinutes() * 60000 +
    time.getSeconds() * 1000
  );
}

function saveAndReload() {
  require("sched").setAlarms(alarms);
  require("sched").reload();
}

function showMainMenu() {
  // Timer img "\0"+atob("DhKBAP////MDDAwwMGGBzgPwB4AeAPwHOBhgwMMzDez////w")
  // Alarm img "\0"+atob("FBSBAABgA4YcMPDGP8Zn/mx/48//PP/zD/8A//AP/wD/8A//AP/wH/+D//w//8AAAADwAAYA")
  const menu = {
    '': { 'title': /*LANG*/'Alarms&Timers' },
    /*LANG*/'< Back' : ()=>{load();},
    /*LANG*/'New Alarm': ()=>editAlarm(-1),
    /*LANG*/'New Timer': ()=>editTimer(-1)
  };
  alarms.forEach((alarm,idx)=>{
    var type,txt; // a leading space is currently required (JS error in Espruino 2v12)
    if (alarm.timer) {
      type = /*LANG*/"Timer";
      txt = " "+require("sched").formatTime(alarm.timer);
    } else {
      type = /*LANG*/"Alarm";
      txt = " "+require("sched").formatTime(alarm.t);
    }

    if (alarm.rp) txt += " \0"+atob("FBaBAAABgAAcAAHn//////wAHsABzAAYwAAMAADAAAAAAwAAMAADGAAzgAN4AD//////54AAOAABgAA=");

    // rename duplicate alarms
    if (menu[type+txt]) {
      var n = 2;
      while (menu[type+" "+n+txt]) n++;
      txt = type+" "+n+txt;
    } else txt = type+txt;

    if (!alarm.timer) {
      txt = txt + "\n" + decodeDOW(alarm.dow);
    }

    // add to menu
    menu[txt] = {
      value : "\0"+atob(alarm.on?"EhKBAH//v/////////////5//x//j//H+eP+Mf/A//h//z//////////3//g":"EhKBAH//v//8AA8AA8AA8AA8AA8AA8AA8AA8AA8AA8AA8AA8AA8AA///3//g"),
      onchange : function() {
        if (alarm.timer) editTimer(idx, alarm);
        else editAlarm(idx, alarm);
      }
    };
  });
  if (WIDGETS["alarm"]) WIDGETS["alarm"].reload();
  return E.showMenu(menu);
}

function decodeDOW(dow) {
  return require("locale").dowAll(2).map((day, index) => dow & (1 << index) ? day : "_").join("");
}

function editDOW(dow, onchange) {
  const menu = {
    '': { 'title': /*LANG*/'Days of Week' },
    /*LANG*/'< Back' : () => onchange(dow)
  };
  for (let i = 0; i < 7; i++) (i => {
    let dayOfWeek = require("locale").dow({ getDay: () => i });
    menu[dayOfWeek] = {
      value: !!(dow&(1<<i)),
      format: v => v ? /*LANG*/"Yes" : /*LANG*/"No",
      onchange: v => v ? dow |= 1<<i : dow &= ~(1<<i),
    };
  })(i);
  E.showMenu(menu);
}

function editAlarm(alarmIndex, alarm) {
  let newAlarm = alarmIndex < 0;
  let a = require("sched").newDefaultAlarm();
  if (!newAlarm) Object.assign(a, alarms[alarmIndex]);
  if (alarm) Object.assign(a,alarm);
  let t = require("sched").decodeTime(a.t);

  const menu = {
    '': { 'title': /*LANG*/'Alarm' },
    /*LANG*/'< Back' : () => showMainMenu(),
    /*LANG*/'Hours': {
      value: t.hrs, min : 0, max : 23, wrap : true,
      onchange: v => t.hrs=v
    },
    /*LANG*/'Minutes': {
      value: t.mins, min : 0, max : 59, wrap : true,
      onchange: v => t.mins=v
    },
    /*LANG*/'Enabled': {
      value: a.on,
      format: v => v ? /*LANG*/"On" : /*LANG*/"Off",
      onchange: v=>a.on=v
    },
    /*LANG*/'Repeat': {
      value: a.rp,
      format: v => v ? /*LANG*/"Yes" : /*LANG*/"No",
      onchange: v => a.rp = v
    },
    /*LANG*/'Days': {
      value: decodeDOW(a.dow),
      onchange: () => editDOW(a.dow, d => {
        a.dow = d;
        a.t = require("sched").encodeTime(t);
        editAlarm(alarmIndex, a);
      })
    },
    /*LANG*/'Vibrate': require("buzz_menu").pattern(a.vibrate, v => a.vibrate=v ),
    /*LANG*/'Auto Snooze': {
      value: a.as,
      format: v => v ? /*LANG*/"Yes" : /*LANG*/"No",
      onchange: v => a.as = v
    }
  };
  menu[/*LANG*/"Save"] = function() {
    a.t = require("sched").encodeTime(t);
    a.last = (a.t < getCurrentTime()) ? (new Date()).getDate() : 0;
    if (newAlarm) alarms.push(a);
    else alarms[alarmIndex] = a;
    saveAndReload();
    showMainMenu();
  };
  if (!newAlarm) {
    menu[/*LANG*/"Delete"] = function() {
      alarms.splice(alarmIndex,1);
      saveAndReload();
      showMainMenu();
    };
  }
  return E.showMenu(menu);
}

function editTimer(alarmIndex, alarm) {
  let newAlarm = alarmIndex < 0;
  let a = require("sched").newDefaultTimer();
  if (!newAlarm) Object.assign(a, alarms[alarmIndex]);
  if (alarm) Object.assign(a,alarm);
  let t = require("sched").decodeTime(a.timer);

  const menu = {
    '': { 'title': /*LANG*/'Timer' },
    /*LANG*/'< Back' : () => showMainMenu(),
    /*LANG*/'Hours': {
      value: t.hrs, min : 0, max : 23, wrap : true,
      onchange: v => t.hrs=v
    },
    /*LANG*/'Minutes': {
      value: t.mins, min : 0, max : 59, wrap : true,
      onchange: v => t.mins=v
    },
    /*LANG*/'Enabled': {
      value: a.on,
      format: v => v ? /*LANG*/"On" : /*LANG*/"Off",
      onchange: v => a.on = v
    },
    /*LANG*/'Vibrate': require("buzz_menu").pattern(a.vibrate, v => a.vibrate=v ),
  };
  menu[/*LANG*/"Save"] = function() {
    a.timer = require("sched").encodeTime(t);
    a.t = getCurrentTime() + a.timer;
    a.last = 0;
    if (newAlarm) alarms.push(a);
    else alarms[alarmIndex] = a;
    saveAndReload();
    showMainMenu();
  };
  if (!newAlarm) {
    menu[/*LANG*/"Delete"] = function() {
      alarms.splice(alarmIndex,1);
      saveAndReload();
      showMainMenu();
    };
  }
  return E.showMenu(menu);
}

showMainMenu();
