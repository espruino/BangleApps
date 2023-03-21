Bangle.loadWidgets();
Bangle.drawWidgets();

let alarms = require("Storage").readJSON("qalarm.json", 1) || [];
/*
Alarm format:
{
  on : true,
  t : 23400000, // Time of day since midnight in ms
  msg : "Eat chocolate", // (optional) Must be set manually from the IDE
  last : 0, // Last day of the month we alarmed on - so we don't alarm twice in one day!
  rp : true, // Repeat
  as : false, // Auto snooze
  hard: true, // Whether the alarm will be like HardAlarm or not
  timer : 300, // (optional) If set, this is a timer and it's the time in seconds
  daysOfWeek: [true,true,true,true,true,true,true] // What days of the week the alarm is on. First item is Sunday, 2nd is Monday, etc.
}
*/

function formatTime(t) {
  mins = 0 | (t / 60000) % 60;
  hrs = 0 | (t / 3600000);
  return hrs + ":" + ("0" + mins).substr(-2);
}

function formatTimer(t) {
  mins = 0 | (t / 60) % 60;
  hrs = 0 | (t / 3600);
  return hrs + ":" + ("0" + mins).substr(-2);
}

function getCurrentTime() {
  let time = new Date();
  return (
    time.getHours() * 3600000 +
    time.getMinutes() * 60000 +
    time.getSeconds() * 1000
  );
}

function showMainMenu() {
  const menu = {
    "": { title: "Alarms" },
    "< Back" : () => load(),
    "New Alarm": () => showEditAlarmMenu(-1),
    "New Timer": () => showEditTimerMenu(-1),
  };
  alarms.forEach((alarm, idx) => {
    let txt =
      (alarm.timer ? "TIMER " : "ALARM ") +
      (alarm.on ? "on  " : "off ") +
      (alarm.timer ? formatTimer(alarm.timer) : formatTime(alarm.t));
    menu[txt] = function () {
      if (alarm.timer) showEditTimerMenu(idx);
      else showEditAlarmMenu(idx);
    };
  });
  menu

  if (WIDGETS["qalarm"]) WIDGETS["qalarm"].reload();
  return E.showMenu(menu);
}

function showEditAlarmMenu(alarmIndex, alarm) {
  const newAlarm = alarmIndex < 0;

  if (!alarm) {
    if (newAlarm) {
      alarm = {
        t: 43200000,
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

  let hrs = 0 | (alarm.t / 3600000);
  let mins = 0 | (alarm.t / 60000) % 60;
  let secs = 0 | (alarm.t / 1000) % 60;

  const menu = {
    "": { title: alarm.msg ? alarm.msg : "Alarms" },
    "< Back" : showMainMenu,
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
    Seconds: {
      value: secs,
      onchange: function (v) {
        if (v < 0) v = 59;
        if (v > 59) v = 0;
        secs = v;
        this.value = v;
      }, // no arrow fn -> preserve 'this'
    },
    Enabled: {
      value: alarm.on,
      onchange: (v) => (alarm.on = v),
    },
    Repeat: {
      value: alarm.rp,
      onchange: (v) => (alarm.rp = v),
    },
    "Auto snooze": {
      value: alarm.as,
      onchange: (v) => (alarm.as = v),
    },
    Hard: {
      value: alarm.hard,
      onchange: (v) => (alarm.hard = v),
    },
    "Days of week": () => showDaysMenu(alarmIndex, getAlarm()),
  };

  function getAlarm() {
    alarm.t = hrs * 3600000 + mins * 60000 + secs * 1000;

    alarm.last = 0;
    // If alarm is for tomorrow not today (eg, in the past), set day
    if (alarm.t < getCurrentTime()) alarm.last = new Date().getDate();

    return alarm;
  }

  menu["> Save"] = function () {
    if (newAlarm) alarms.push(getAlarm());
    else alarms[alarmIndex] = getAlarm();
    require("Storage").write("qalarm.json", JSON.stringify(alarms));
    eval(require("Storage").read("qalarmcheck.js"));
    showMainMenu();
  };

  if (!newAlarm) {
    menu["> Delete"] = function () {
      alarms.splice(alarmIndex, 1);
      require("Storage").write("qalarm.json", JSON.stringify(alarms));
      eval(require("Storage").read("qalarmcheck.js"));
      showMainMenu();
    };
  }
  return E.showMenu(menu);
}

function showDaysMenu(alarmIndex, alarm) {
  const menu = {
    "": { title: alarm.msg ? alarm.msg : "Alarms" },
    "< Back": () => showEditAlarmMenu(alarmIndex, alarm),
  };

  for (let i = 0; i < 7; i++) {
    let dayOfWeek = require("locale").dow({ getDay: () => i });
    menu[dayOfWeek] = {
      value: alarm.daysOfWeek[i],
      onchange: (v) => (alarm.daysOfWeek[i] = v),
    };
  }

  return E.showMenu(menu);
}

function showEditTimerMenu(timerIndex) {
  var newAlarm = timerIndex < 0;

  let alarm;
  if (newAlarm) {
    alarm = {
      timer: 300,
      on: true,
      rp: false,
      as: false,
      hard: false,
    };
  } else {
    alarm = alarms[timerIndex];
  }

  let hrs = 0 | (alarm.timer / 3600);
  let mins = 0 | (alarm.timer / 60) % 60;
  let secs = (0 | alarm.timer) % 60;

  const menu = {
    "": { title: "Timer" },
    "< Back" : showMainMenu,
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
    Seconds: {
      value: secs,
      onchange: function (v) {
        if (v < 0) v = 59;
        if (v > 59) v = 0;
        secs = v;
        this.value = v;
      }, // no arrow fn -> preserve 'this'
    },
    Enabled: {
      value: alarm.on,
      onchange: (v) => (alarm.on = v),
    },
    Hard: {
      value: alarm.hard,
      onchange: (v) => (alarm.hard = v),
    },
  };
  function getTimer() {
    alarm.timer = hrs * 3600 + mins * 60 + secs;
    alarm.t = (getCurrentTime() + alarm.timer * 1000) % 86400000;
    return alarm;
  }
  menu["> Save"] = function () {
    if (newAlarm) alarms.push(getTimer());
    else alarms[timerIndex] = getTimer();
    require("Storage").write("qalarm.json", JSON.stringify(alarms));
    eval(require("Storage").read("qalarmcheck.js"));
    showMainMenu();
  };
  if (!newAlarm) {
    menu["> Delete"] = function () {
      alarms.splice(timerIndex, 1);
      require("Storage").write("qalarm.json", JSON.stringify(alarms));
      eval(require("Storage").read("qalarmcheck.js"));
      showMainMenu();
    };
  }

  return E.showMenu(menu);
}

showMainMenu();
