Bangle.loadWidgets();
Bangle.drawWidgets();

let alarms = require("Storage").readJSON("alarm.json", 1) || [];
/*alarms = [
  { on : true,
    hr : 6.5, // hours + minutes/60
    msg : "Eat chocolate",
    last : 0, // last day of the month we alarmed on - so we don't alarm twice in one day!
    rp : true, // repeat
    as : false, // auto snooze
    hard: true, // whether it's "hard" or not
    timer : 5, // OPTIONAL - if set, this is a timer and it's the time in minutes
    daysOfWeek: [true,true,true,true,true,true,true] // What days of the week the alarm is on. First item is Sunday, 2nd is Monday, etc.
  }
];*/

function formatTime(t) {
  let hrs = 0 | t; // Same as Math.floor(t)
  let mins = Math.round((t - hrs) * 60);
  return hrs + ":" + ("0" + mins).substr(-2);
}

function getCurrentHr() {
  let time = new Date();
  return time.getHours() + time.getMinutes() / 60 + time.getSeconds() / 3600;
}

function showMainMenu() {
  const menu = {
    "": { title: "Alarms" },
    "New Alarm": () => showEditAlarmMenu(-1),
    "New Timer": () => showEditTimerMenu(-1),
  };
  alarms.forEach((alarm, idx) => {
    let txt =
      (alarm.timer ? "TIMER " : "ALARM ") +
      (alarm.on ? "on  " : "off ") +
      (alarm.timer ? formatMins(alarm.timer) : formatTime(alarm.hr));
    menu[txt] = function () {
      if (alarm.timer) showEditTimerMenu(idx);
      else showEditAlarmMenu(idx);
    };
  });
  menu["< Back"] = () => {
    load();
  };

  if (WIDGETS["alarm"]) WIDGETS["alarm"].reload();
  return E.showMenu(menu);
}

function showEditAlarmMenu(alarmIndex, alarm) {
  const newAlarm = alarmIndex < 0;

  if (!alarm) {
    if (newAlarm) {
      alarm = {
        hr: 12,
        on: true,
        rp: true,
        as: false,
        hard: false,
        daysOfWeek: new Array(7).fill(true),
      };
    } else {
      alarm = Object.assign({}, alarms[alarmIndex]); // Copy object in case we don't save it
    }
  }

  let hrs = 0 | alarm.hr;
  let mins = Math.round((alarm.hr - hrs) * 60);

  const menu = {
    "": { title: alarm.msg ? alarm.msg : "Alarms" },
    Hours: {
      value: hrs,
      onchange: function (v) {
        if (v < 0) v = 23;
        if (v > 23) v = 0;
        hrs = v;
        this.value = v;
      }, // no arrow fn -> preserve 'this'
    },
    Minutes: {
      value: mins,
      onchange: function (v) {
        if (v < 0) v = 59;
        if (v > 59) v = 0;
        mins = v;
        this.value = v;
      }, // no arrow fn -> preserve 'this'
    },
    Enabled: {
      value: alarm.on,
      format: (v) => (v ? "On" : "Off"),
      onchange: (v) => (alarm.on = v),
    },
    Repeat: {
      value: alarm.rp,
      format: (v) => (v ? "Yes" : "No"),
      onchange: (v) => (alarm.rp = v),
    },
    "Auto snooze": {
      value: alarm.as,
      format: (v) => (v ? "Yes" : "No"),
      onchange: (v) => (alarm.as = v),
    },
    Hard: {
      value: alarm.hard,
      format: (v) => (v ? "Yes" : "No"),
      onchange: (v) => (alarm.hard = v),
    },
    "Days of week": () => showDaysMenu(alarmIndex, getAlarm()),
  };

  function getAlarm() {
    alarm.hr = hrs + mins / 60;
    alarm.last = 0;
    // If alarm is for tomorrow not today (eg, in the past), set day
    if (alarm.hr < getCurrentHr()) alarm.last = new Date().getDate();
    // Save alarm
    return alarm;
  }

  menu["> Save"] = function () {
    if (newAlarm) alarms.push(getAlarm());
    else alarms[alarmIndex] = getAlarm();
    require("Storage").write("alarm.json", JSON.stringify(alarms));
    showMainMenu();
  };

  if (!newAlarm) {
    menu["> Delete"] = function () {
      alarms.splice(alarmIndex, 1);
      require("Storage").write("alarm.json", JSON.stringify(alarms));
      showMainMenu();
    };
  }
  menu["< Back"] = showMainMenu;
  return E.showMenu(menu);
}

function showDaysMenu(alarmIndex, alarm) {
  const menu = {
    "": { title: alarm.msg ? alarm.msg : "Alarms" },
    "< Back": () => showEditAlarmMenu(alarmIndex, alarm),
  };

  [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ].forEach((dayOfWeek, i) => {
    menu[dayOfWeek] = {
      value: alarm.daysOfWeek[i],
      format: (v) => (v ? "Yes" : "No"),
      onchange: (v) => (alarm.daysOfWeek[i] = v),
    };
  });

  return E.showMenu(menu);
}

function showEditTimerMenu(timerIndex) {
  var newAlarm = timerIndex < 0;

  let alarm;
  if (newAlarm) {
    alarm = {
      timer: 0.0833333333,
      on: true,
      rp: false,
      as: false,
      hard: false,
    };
  } else {
    alarm = alarms[timerIndex];
  }

  let hrs = 0 | (alarm.timer / 60);
  let mins = (0 | alarm.timer) % 60;

  const menu = {
    "": { title: "Timer" },
    Hours: {
      value: hrs,
      onchange: function (v) {
        if (v < 0) v = 23;
        if (v > 23) v = 0;
        hrs = v;
        this.value = v;
      }, // no arrow fn -> preserve 'this'
    },
    Minutes: {
      value: mins,
      onchange: function (v) {
        if (v < 0) v = 59;
        if (v > 59) v = 0;
        mins = v;
        this.value = v;
      }, // no arrow fn -> preserve 'this'
    },
    Enabled: {
      value: alarm.on,
      format: (v) => (v ? "On" : "Off"),
      onchange: (v) => (alarm.on = v),
    },
    Hard: {
      value: alarm.hard,
      format: (v) => (v ? "On" : "Off"),
      onchange: (v) => (alarm.hard = v),
    },
  };
  function getTimer() {
    const d = new Date(Date.now() + (hrs * 60 + mins) * 60000);
    alarm.hr = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    alarm.timer = hrs * 60 + mins;
    // Save alarm
    return alarm;
  }
  menu["> Save"] = function () {
    if (newAlarm) alarms.push(getTimer());
    else alarms[alarmIndex] = getTimer();
    require("Storage").write("alarm.json", JSON.stringify(alarms));
    showMainMenu();
  };
  if (!newAlarm) {
    menu["> Delete"] = function () {
      alarms.splice(alarmIndex, 1);
      require("Storage").write("alarm.json", JSON.stringify(alarms));
      showMainMenu();
    };
  }
  menu["< Back"] = showMainMenu;
  return E.showMenu(menu);
}

showMainMenu();
