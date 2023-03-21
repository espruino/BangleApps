Bangle.loadWidgets();
Bangle.drawWidgets();

// 0 = Sunday (default), 1 = Monday
const firstDayOfWeek = (require("Storage").readJSON("setting.json", true) || {}).firstDayOfWeek || 0;
const WORKDAYS = 62;
const WEEKEND = firstDayOfWeek ? 192 : 65;
const EVERY_DAY = firstDayOfWeek ? 254 : 127;
const INTERVALS = ["day", "week", "month", "year"];
const INTERVAL_LABELS = [/*LANG*/"Day", /*LANG*/"Week", /*LANG*/"Month", /*LANG*/"Year"];

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

function getLabel(e) {
  const dateStr = e.date && require("locale").date(new Date(e.date), 1);
  return (e.timer
      ? require("time_utils").formatDuration(e.timer)
      : (dateStr ? `${dateStr}${e.rp?"*":""} ${require("time_utils").formatTime(e.t)}` : require("time_utils").formatTime(e.t) + (e.rp ? ` ${decodeRepeat(e)}` : ""))
      ) + (e.msg ? ` ${e.msg}` : "");
}

function trimLabel(label, maxLength) {
  return (label.length > maxLength
      ? label.substring(0,maxLength-3) + "..."
      : label.substring(0,maxLength));
}

function formatAlarmMessage(msg) {
  if (msg == null) {
    return msg;
  } else if (msg.length > 7) {
    return msg.substring(0,6)+"...";
  } else {
    return msg.substring(0,7);
  }
}

function showMainMenu() {
  const menu = {
    "": { "title": /*LANG*/"Alarms & Timers" },
    "< Back": () => load(),
    /*LANG*/"New...": () => showNewMenu()
  };

  alarms.forEach((e, index) => {
    menu[trimLabel(getLabel(e),40)] = {
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
    /*LANG*/"Timer": () => showEditTimerMenu(undefined, undefined),
    /*LANG*/"Event": () => showEditAlarmMenu(undefined, undefined, true)
  });
}

function showEditAlarmMenu(selectedAlarm, alarmIndex, withDate) {
  var isNew = alarmIndex === undefined;

  var alarm = require("sched").newDefaultAlarm();
  alarm.dow = handleFirstDayOfWeek(alarm.dow);

  if (selectedAlarm) {
    Object.assign(alarm, selectedAlarm);
  }

  var time = require("time_utils").decodeTime(alarm.t);
  if (withDate && !alarm.date) alarm.date = new Date().toLocalISOString().slice(0,10);
  var date = alarm.date ? new Date(alarm.date) : undefined;
  var title = date ? (isNew ? /*LANG*/"New Event" : /*LANG*/"Edit Event") : (isNew ? /*LANG*/"New Alarm" : /*LANG*/"Edit Alarm");
  var keyboard = "textinput";
  try {keyboard = require(keyboard);} catch(e) {keyboard = null;}

  const menu = {
    "": { "title": title },
    "< Back": () => {
      prepareAlarmForSave(alarm, alarmIndex, time, date);
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
    /*LANG*/"Day": {
      value: date ? date.getDate() : null,
      min: 1,
      max: 31,
      wrap: true,
      onchange: v => date.setDate(v)
    },
    /*LANG*/"Month": {
      value: date ? date.getMonth() + 1 : null,
      format: v => require("date_utils").month(v),
      onchange: v => date.setMonth((v+11)%12)
    },
    /*LANG*/"Year": {
      value: date ? date.getFullYear() : null,
      min: new Date().getFullYear(),
      max: 2100,
      onchange: v => date.setFullYear(v)
    },
    /*LANG*/"Message": {
      value: alarm.msg,
      format: formatAlarmMessage,
      onchange: () => {
        setTimeout(() => {
          keyboard.input({text:alarm.msg}).then(result => {
            alarm.msg = result;
            prepareAlarmForSave(alarm, alarmIndex, time, date, true);
            setTimeout(showEditAlarmMenu, 10, alarm, alarmIndex, withDate);
          });
        }, 100);
      }
    },
    /*LANG*/"Enabled": {
      value: alarm.on,
      onchange: v => alarm.on = v
    },
    /*LANG*/"Repeat": {
      value: decodeRepeat(alarm),
      onchange: () => setTimeout(showEditRepeatMenu, 100, alarm.rp, date || alarm.dow, (repeat, dow) => {
        alarm.rp = repeat;
        alarm.dow = dow;
        prepareAlarmForSave(alarm, alarmIndex, time, date, true);
        setTimeout(showEditAlarmMenu, 10, alarm, alarmIndex, withDate);
      })
    },
    /*LANG*/"Vibrate": require("buzz_menu").pattern(alarm.vibrate, v => alarm.vibrate = v),
    /*LANG*/"Auto Snooze": {
      value: alarm.as,
      onchange: v => alarm.as = v
    },
    /*LANG*/"Hidden": {
      value: alarm.hidden || false,
      onchange: v => alarm.hidden = v
    },
    /*LANG*/"Cancel": () => showMainMenu(),
    /*LANG*/"Confirm": () => {
      prepareAlarmForSave(alarm, alarmIndex, time);
      saveAndReload();
      showMainMenu();
    }
  };

  if (!keyboard) delete menu[/*LANG*/"Message"];
  if (!alarm.date) {
    delete menu[/*LANG*/"Day"];
    delete menu[/*LANG*/"Month"];
    delete menu[/*LANG*/"Year"];
  }

  if (!isNew) {
    menu[/*LANG*/"Delete"] = () => {
      E.showPrompt(getLabel(alarm) + "\n" + /*LANG*/"Are you sure?", { title: /*LANG*/"Delete Alarm" }).then((confirm) => {
        if (confirm) {
          alarms.splice(alarmIndex, 1);
          saveAndReload();
          showMainMenu();
        } else {
          alarm.t = require("time_utils").encodeTime(time);
          setTimeout(showEditAlarmMenu, 10, alarm, alarmIndex, withDate);
        }
      });
    };
  }

  E.showMenu(menu);
}

function prepareAlarmForSave(alarm, alarmIndex, time, date, temp) {
  alarm.t = require("time_utils").encodeTime(time);
  alarm.last = alarm.t < require("time_utils").getCurrentTimeMillis() ? new Date().getDate() : 0;
  if(date) alarm.date = date.toLocalISOString().slice(0,10);

  if(!temp) {
    if (alarmIndex === undefined) {
      alarms.push(alarm);
    } else {
      alarms[alarmIndex] = alarm;
    }
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

function decodeRepeat(alarm) {
  return alarm.rp
    ? (alarm.date
       ? `${alarm.rp.num}*${INTERVAL_LABELS[INTERVALS.indexOf(alarm.rp.interval)]}`
       : require("date_utils")
        .dows(firstDayOfWeek, 2)
        .map((day, index) => alarm.dow & (1 << (index + firstDayOfWeek)) ? day : "_")
        .join("")
        .toLowerCase())
    : /*LANG*/"Once";
}

function showEditRepeatMenu(repeat, day, dowChangeCallback) {
  var originalRepeat = repeat;
  var dow;

  const menu = {
    "": { "title": /*LANG*/"Repeat Alarm" },
    "< Back": () => dowChangeCallback(repeat, dow),
    /*LANG*/"Only Once": () => dowChangeCallback(false, EVERY_DAY)
      // The alarm will fire once. Internally it will be saved
      // as "fire every days" BUT the repeat flag is false so
      // we avoid messing up with the scheduler.
  };

  let restOfMenu;
  if (typeof day === "number") {
    dow = day;
    var originalDow = dow;
    var isCustom = repeat && dow != WORKDAYS && dow != WEEKEND && dow != EVERY_DAY;

    restOfMenu = {
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
        value: isCustom ? decodeRepeat({ rp: true, dow: dow }) : false,
        onchange: () => setTimeout(showCustomDaysMenu, 10, dow, dowChangeCallback, originalRepeat, originalDow)
      }
    };
  } else {
    // var date = day; // eventually: detect day of date and configure a repeat e.g. 3rd Monday of Month
    dow = EVERY_DAY;
    repeat = repeat || {interval: "month", num: 1};

    restOfMenu = {
      /*LANG*/"Every": {
        value: repeat.num,
        min: 1,
        onchange: v => repeat.num = v
      },
      /*LANG*/"Interval": {
        value: INTERVALS.indexOf(repeat.interval),
        format: v => INTERVAL_LABELS[v],
        min: 0,
        max: INTERVALS.length - 1,
        onchange: v => repeat.interval = INTERVALS[v]
      }
    };
  }

  Object.assign(menu, restOfMenu);
  E.showMenu(menu);
}

function showCustomDaysMenu(dow, dowChangeCallback, originalRepeat, originalDow) {
  const menu = {
    "": { "title": /*LANG*/"Custom Days" },
    "< Back": () => {
      // If the user unchecks all the days then we assume repeat = once
      // and we force the dow to every day.
      var repeat = dow > 0;
      dowChangeCallback(repeat, repeat ? dow : EVERY_DAY);
    }
  };

  require("date_utils").dows(firstDayOfWeek).forEach((day, i) => {
    menu[day] = {
      value: !!(dow & (1 << (i + firstDayOfWeek))),
      onchange: v => v ? (dow |= 1 << (i + firstDayOfWeek)) : (dow &= ~(1 << (i + firstDayOfWeek)))
    };
  });

  menu[/*LANG*/"Cancel"] = () => setTimeout(showEditRepeatMenu, 10, originalRepeat, originalDow, dowChangeCallback);

  E.showMenu(menu);
}

function showEditTimerMenu(selectedTimer, timerIndex) {
  var isNew = timerIndex === undefined;

  var timer = require("sched").newDefaultTimer();

  if (selectedTimer) {
    Object.assign(timer, selectedTimer);
  }

  var time = require("time_utils").decodeTime(timer.timer);
  var keyboard = "textinput";
  try {keyboard = require(keyboard);} catch(e) {keyboard = null;}

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
    /*LANG*/"Message": {
      value: timer.msg,
      format: formatAlarmMessage,
      onchange: () => {
        setTimeout(() => {
          keyboard.input({text:timer.msg}).then(result => {
            timer.msg = result;
            prepareTimerForSave(timer, timerIndex, time, true);
            setTimeout(showEditTimerMenu, 10, timer, timerIndex);
          });
        }, 100);
      }
    },
    /*LANG*/"Enabled": {
      value: timer.on,
      onchange: v => timer.on = v
    },
    /*LANG*/"Delete After Expiration": {
      value: timer.del,
      onchange: v => timer.del = v
    },
    /*LANG*/"Hidden": {
      value: timer.hidden || false,
      onchange: v => timer.hidden = v
    },
    /*LANG*/"Vibrate": require("buzz_menu").pattern(timer.vibrate, v => timer.vibrate = v),
    /*LANG*/"Cancel": () => showMainMenu(),
    /*LANG*/"Confirm": () => {
      prepareTimerForSave(timer, timerIndex, time);
      saveAndReload();
      showMainMenu();
    }
  };

  if (!keyboard) delete menu[/*LANG*/"Message"];
  if (!isNew) {
    menu[/*LANG*/"Delete"] = () => {
      E.showPrompt(getLabel(timer) + "\n" + /*LANG*/"Are you sure?", { title: /*LANG*/"Delete Timer" }).then((confirm) => {
        if (confirm) {
          alarms.splice(timerIndex, 1);
          saveAndReload();
          showMainMenu();
        } else {
          timer.timer = require("time_utils").encodeTime(time);
          setTimeout(showEditTimerMenu, 10, timer, timerIndex);
        }
      });
    };
  }

  E.showMenu(menu);
}

function prepareTimerForSave(timer, timerIndex, time, temp) {
  timer.timer = require("time_utils").encodeTime(time);
  timer.t = require("time_utils").getCurrentTimeMillis() + timer.timer;
  timer.last = 0;

  if (!temp) {
    if (timerIndex === undefined) {
      alarms.push(timer);
    } else {
      alarms[timerIndex] = timer;
    }
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
              prepareTimerForSave(alarm, i, require("time_utils").decodeTime(alarm.timer));
            } else {
              prepareAlarmForSave(alarm, i, require("time_utils").decodeTime(alarm.t));
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
