Bangle.loadWidgets();
Bangle.drawWidgets();

// 0 = Sunday (default), 1 = Monday
const firstDayOfWeek = (require("Storage").readJSON("setting.json", true) || {}).firstDayOfWeek || 0;
const WORKDAYS = 62
const WEEKEND = firstDayOfWeek ? 192 : 65;
const EVERY_DAY = firstDayOfWeek ? 254 : 127;

const iconAlarmOn = "\0" + atob("GBiBAAAAAAAAAAYAYA4AcBx+ODn/nAP/wAf/4A/n8A/n8B/n+B/n+B/n+B/n+B/h+B/4+A/+8A//8Af/4AP/wAH/gAB+AAAAAAAAAA==");
const iconAlarmOff = "\0" + (g.theme.dark
  ? atob("GBjBAP////8AAAAAAAAGAGAOAHAcfjg5/5wD/8AH/+AP5/AP5/Af5/gf5/gf5wAf5gAf4Hgf+f4P+bYP8wMH84cD84cB8wMAebYAAf4AAHg=")
  : atob("GBjBAP//AAAAAAAAAAAGAGAOAHAcfjg5/5wD/8AH/+AP5/AP5/Af5/gf5/gf5wAf5gAf4Hgf+f4P+bYP8wMH84cD84cB8wMAebYAAf4AAHg="));

const iconTimerOn = "\0" + (g.theme.dark
  ? atob("GBjBAP////8AAAAAAAAAAAAH/+AH/+ABgYABgYABgYAA/wAA/wAAfgAAPAAAPAAAfgAA5wAAwwABgYABgYABgYAH/+AH/+AAAAAAAAAAAAA=")
  : atob("GBjBAP//AAAAAAAAAAAAAAAH/+AH/+ABgYABgYABgYAA/wAA/wAAfgAAPAAAPAAAfgAA5wAAwwABgYABgYABgYAH/+AH/+AAAAAAAAAAAAA="));
const iconTimerOff = "\0" + (g.theme.dark
  ? atob("GBjBAP////8AAAAAAAAAAAAH/+AH/+ABgYABgYABgYAA/wAA/wAAfgAAPAAAPAAAfgAA5HgAwf4BgbYBgwMBg4cH84cH8wMAAbYAAf4AAHg=")
  : atob("GBjBAP//AAAAAAAAAAAAAAAH/+AH/+ABgYABgYABgYAA/wAA/wAAfgAAPAAAPAAAfgAA5HgAwf4BgbYBgwMBg4cH84cH8wMAAbYAAf4AAHg="));

// An array of alarm objects (see sched/README.md)
var alarms = require("sched").getAlarms();

function handleFirstDayOfWeek(dow) {
  if (firstDayOfWeek == 1) {
    if ((dow & 1) == 1) {
      // In the scheduler API Sunday is 1.
      // Here the week starts on Monday and Sunday is ON so
      // when I read the dow I need to move Sunday to 128...
      dow += 127;
    } else if ((dow & 128) == 128) {
      // ... and then when I write the dow I need to move Sunday back to 1.
      dow -= 127;
    }
  }
  return dow;
}

// Check the first day of week and update the dow field accordingly (alarms only!)
alarms.filter(e => e.timer === undefined).forEach(a => a.dow = handleFirstDayOfWeek(a.dow));

function showMainMenu() {
  const menu = {
    "": { "title": /*LANG*/"Alarms & Timers" },
    "< Back": () => load(),
    /*LANG*/"New...": () => showNewMenu()
  };

  alarms.forEach((e, index) => {
    var label = e.timer
      ? require("time_utils").formatDuration(e.timer)
      : require("time_utils").formatTime(e.t) + (e.rp ? ` ${decodeDOW(e)}` : "");
    menu[label] = {
      value: e.on ? (e.timer ? iconTimerOn : iconAlarmOn) : (e.timer ? iconTimerOff : iconAlarmOff),
      onchange: () => setTimeout(e.timer ? showEditTimerMenu : showEditAlarmMenu, 10, e, index)
    };
  });

  menu[/*LANG*/"Advanced"] = () => showAdvancedMenu();

  E.showMenu(menu);
}

function showNewMenu() {
  E.showMenu({
    "": { "title": /*LANG*/"New..." },
    "< Back": () => showMainMenu(),
    /*LANG*/"Alarm": () => showEditAlarmMenu(undefined, undefined),
    /*LANG*/"Timer": () => showEditTimerMenu(undefined, undefined)
  });
}

function showEditAlarmMenu(selectedAlarm, alarmIndex) {
  var isNew = alarmIndex === undefined;

  var alarm = require("sched").newDefaultAlarm();
  alarm.dow = handleFirstDayOfWeek(alarm.dow);

  if (selectedAlarm) {
    Object.assign(alarm, selectedAlarm);
  }

  var time = require("time_utils").decodeTime(alarm.t);

  const menu = {
    "": { "title": isNew ? /*LANG*/"New Alarm" : /*LANG*/"Edit Alarm" },
    "< Back": () => {
      prepareAlarmForSave(alarm, alarmIndex, time);
      saveAndReload();
      showMainMenu();
    },
    /*LANG*/"Hour": {
      value: time.h,
      format: v => ("0" + v).substr(-2),
      min: 0,
      max: 23,
      wrap: true,
      onchange: v => time.h = v
    },
    /*LANG*/"Minute": {
      value: time.m,
      format: v => ("0" + v).substr(-2),
      min: 0,
      max: 59,
      wrap: true,
      onchange: v => time.m = v
    },
    /*LANG*/"Enabled": {
      value: alarm.on,
      onchange: v => alarm.on = v
    },
    /*LANG*/"Repeat": {
      value: decodeDOW(alarm),
      onchange: () => setTimeout(showEditRepeatMenu, 100, alarm.rp, alarm.dow, (repeat, dow) => {
        alarm.rp = repeat;
        alarm.dow = dow;
        alarm.t = require("time_utils").encodeTime(time);
        setTimeout(showEditAlarmMenu, 10, alarm, alarmIndex);
      })
    },
    /*LANG*/"Vibrate": require("buzz_menu").pattern(alarm.vibrate, v => alarm.vibrate = v),
    /*LANG*/"Auto Snooze": {
      value: alarm.as,
      onchange: v => alarm.as = v
    },
    /*LANG*/"Cancel": () => showMainMenu()
  };

  if (!isNew) {
    menu[/*LANG*/"Delete"] = () => {
      E.showPrompt(/*LANG*/"Are you sure?", { title: /*LANG*/"Delete Alarm" }).then((confirm) => {
        if (confirm) {
          alarms.splice(alarmIndex, 1);
          saveAndReload();
          showMainMenu();
        } else {
          alarm.t = require("time_utils").encodeTime(time);
          setTimeout(showEditAlarmMenu, 10, alarm, alarmIndex);
        }
      });
    };
  }

  E.showMenu(menu);
}

function prepareAlarmForSave(alarm, alarmIndex, time) {
  alarm.t = require("time_utils").encodeTime(time);
  alarm.last = alarm.t < require("time_utils").getCurrentTimeMillis() ? new Date().getDate() : 0;

  if (alarmIndex === undefined) {
    alarms.push(alarm);
  } else {
    alarms[alarmIndex] = alarm;
  }
}

function saveAndReload() {
  // Before saving revert the dow to the standard format (alarms only!)
  alarms.filter(e => e.timer === undefined).forEach(a => a.dow = handleFirstDayOfWeek(a.dow));

  require("sched").setAlarms(alarms);
  require("sched").reload();

  // Fix after save
  alarms.filter(e => e.timer === undefined).forEach(a => a.dow = handleFirstDayOfWeek(a.dow));
}

function decodeDOW(alarm) {
  return alarm.rp
    ? require("date_utils")
      .dows(firstDayOfWeek, 2)
      .map((day, index) => alarm.dow & (1 << (index + firstDayOfWeek)) ? day : "_")
      .join("")
      .toLowerCase()
    : "Once"
}

function showEditRepeatMenu(repeat, dow, dowChangeCallback) {
  var originalRepeat = repeat;
  var originalDow = dow;
  var isCustom = repeat && dow != WORKDAYS && dow != WEEKEND && dow != EVERY_DAY;

  const menu = {
    "": { "title": /*LANG*/"Repeat Alarm" },
    "< Back": () => dowChangeCallback(repeat, dow),
    /*LANG*/"Once": {
      // The alarm will fire once. Internally it will be saved
      // as "fire every days" BUT the repeat flag is false so
      // we avoid messing up with the scheduler.
      value: !repeat,
      onchange: () => dowChangeCallback(false, EVERY_DAY)
    },
    /*LANG*/"Workdays": {
      value: repeat && dow == WORKDAYS,
      onchange: () => dowChangeCallback(true, WORKDAYS)
    },
    /*LANG*/"Weekends": {
      value: repeat && dow == WEEKEND,
      onchange: () => dowChangeCallback(true, WEEKEND)
    },
    /*LANG*/"Every Day": {
      value: repeat && dow == EVERY_DAY,
      onchange: () => dowChangeCallback(true, EVERY_DAY)
    },
    /*LANG*/"Custom": {
      value: isCustom ? decodeDOW({ rp: true, dow: dow }) : false,
      onchange: () => setTimeout(showCustomDaysMenu, 10, isCustom ? dow : EVERY_DAY, dowChangeCallback, originalRepeat, originalDow)
    }
  };

  E.showMenu(menu);
}

function showCustomDaysMenu(dow, dowChangeCallback, originalRepeat, originalDow) {
  const menu = {
    "": { "title": /*LANG*/"Custom Days" },
    "< Back": () => {
      // If the user unchecks all the days then we assume repeat = once
      // and we force the dow to every day.
      var repeat = dow > 0;
      dowChangeCallback(repeat, repeat ? dow : EVERY_DAY)
    }
  };

  require("date_utils").dows(firstDayOfWeek).forEach((day, i) => {
    menu[day] = {
      value: !!(dow & (1 << (i + firstDayOfWeek))),
      onchange: v => v ? (dow |= 1 << (i + firstDayOfWeek)) : (dow &= ~(1 << (i + firstDayOfWeek)))
    };
  });

  menu[/*LANG*/"Cancel"] = () => setTimeout(showEditRepeatMenu, 10, originalRepeat, originalDow, dowChangeCallback)

  E.showMenu(menu);
}

function showEditTimerMenu(selectedTimer, timerIndex) {
  var isNew = timerIndex === undefined;

  var timer = require("sched").newDefaultTimer();

  if (selectedTimer) {
    Object.assign(timer, selectedTimer);
  }

  var time = require("time_utils").decodeTime(timer.timer);

  const menu = {
    "": { "title": isNew ? /*LANG*/"New Timer" : /*LANG*/"Edit Timer" },
    "< Back": () => {
      prepareTimerForSave(timer, timerIndex, time);
      saveAndReload();
      showMainMenu();
    },
    /*LANG*/"Hours": {
      value: time.h,
      min: 0,
      max: 23,
      wrap: true,
      onchange: v => time.h = v
    },
    /*LANG*/"Minutes": {
      value: time.m,
      min: 0,
      max: 59,
      wrap: true,
      onchange: v => time.m = v
    },
    /*LANG*/"Seconds": {
      value: time.s,
      min: 0,
      max: 59,
      step: 1,
      wrap: true,
      onchange: v => time.s = v
    },
    /*LANG*/"Enabled": {
      value: timer.on,
      onchange: v => timer.on = v
    },
    /*LANG*/"Vibrate": require("buzz_menu").pattern(timer.vibrate, v => timer.vibrate = v),
    /*LANG*/"Cancel": () => showMainMenu()
  };

  if (!isNew) {
    menu[/*LANG*/"Delete"] = () => {
      E.showPrompt(/*LANG*/"Are you sure?", { title: /*LANG*/"Delete Timer" }).then((confirm) => {
        if (confirm) {
          alarms.splice(timerIndex, 1);
          saveAndReload();
          showMainMenu();
        } else {
          timer.timer = require("time_utils").encodeTime(time);
          setTimeout(showEditTimerMenu, 10, timer, timerIndex)
        }
      });
    };
  }

  E.showMenu(menu);
}

function prepareTimerForSave(timer, timerIndex, time) {
  timer.timer = require("time_utils").encodeTime(time);
  timer.t = require("time_utils").getCurrentTimeMillis() + timer.timer;
  timer.last = 0;

  if (timerIndex === undefined) {
    alarms.push(timer);
  } else {
    alarms[timerIndex] = timer;
  }
}

function showAdvancedMenu() {
  E.showMenu({
    "": { "title": /*LANG*/"Advanced" },
    "< Back": () => showMainMenu(),
    /*LANG*/"Scheduler Settings": () => eval(require("Storage").read("sched.settings.js"))(() => showAdvancedMenu()),
    /*LANG*/"Enable All": () => enableAll(true),
    /*LANG*/"Disable All": () => enableAll(false),
    /*LANG*/"Delete All": () => deleteAll()
  });
}

function enableAll(on) {
  if (alarms.filter(e => e.on == !on).length == 0) {
    E.showAlert(
      on ? /*LANG*/"Nothing to Enable" : /*LANG*/"Nothing to Disable",
      on ? /*LANG*/"Enable All" : /*LANG*/"Disable All"
    ).then(() => showAdvancedMenu());
  } else {
    E.showPrompt(/*LANG*/"Are you sure?", { title: on ? /*LANG*/"Enable All" : /*LANG*/"Disable All" }).then((confirm) => {
      if (confirm) {
        alarms.forEach((alarm, i) => {
          alarm.on = on;
          if (on) {
            if (alarm.timer) {
              prepareTimerForSave(alarm, i, require("time_utils").decodeTime(alarm.timer))
            } else {
              prepareAlarmForSave(alarm, i, require("time_utils").decodeTime(alarm.t))
            }
          }
        });
        saveAndReload();
        showMainMenu();
      } else {
        showAdvancedMenu();
      }
    });
  }
}

function deleteAll() {
  if (alarms.length == 0) {
    E.showAlert(/*LANG*/"Nothing to delete", /*LANG*/"Delete All").then(() => showAdvancedMenu());
  } else {
    E.showPrompt(/*LANG*/"Are you sure?", {
      title: /*LANG*/"Delete All"
    }).then((confirm) => {
      if (confirm) {
        alarms = [];
        saveAndReload();
        showMainMenu();
      } else {
        showAdvancedMenu();
      }
    });
  }
}

showMainMenu();
