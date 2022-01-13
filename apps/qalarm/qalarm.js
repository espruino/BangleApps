// This file shows the alarm

function formatTime(t) {
  let hrs = Math.floor(t / 3600000);
  let mins = Math.round((t / 60000) % 60);
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

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function getRandomFromRange(
  lowerRangeMin,
  lowerRangeMax,
  higherRangeMin,
  higherRangeMax
) {
  let lowerRange = lowerRangeMax - lowerRangeMin;
  let higherRange = higherRangeMax - higherRangeMin;
  let fullRange = lowerRange + higherRange;
  let randomNum = getRandomInt(fullRange);
  if (randomNum <= lowerRangeMax - lowerRangeMin) {
    return randomNum + lowerRangeMin;
  } else {
    return randomNum + (higherRangeMin - lowerRangeMax);
  }
}

function showNumberPicker(currentGuess, randomNum) {
  if (currentGuess == randomNum) {
    E.showMessage("" + currentGuess + "\n PRESS ENTER", "Get to " + randomNum);
  } else {
    E.showMessage("" + currentGuess, "Get to " + randomNum);
  }
}

function showPrompt(msg, buzzCount, alarm) {
  E.showPrompt(msg, {
    title: alarm.timer ? "TIMER!" : "ALARM!",
    buttons: { Sleep: true, Ok: false }, // default is sleep so it'll come back in 10 mins
  }).then(function (sleep) {
    buzzCount = 0;
    if (sleep) {
      if (alarm.ohr === undefined) alarm.ohr = alarm.t;
      alarm.t += 10 / 60; // 10 minutes
      require("Storage").write("qalarm.json", JSON.stringify(alarms));
      load();
    } else {
      alarm.last = new Date().getDate();
      if (alarm.ohr !== undefined) {
        alarm.t = alarm.ohr;
        delete alarm.ohr;
      }
      if (!alarm.rp) alarm.on = false;
      require("Storage").write("qalarm.json", JSON.stringify(alarms));
      load();
    }
  });
}

function showAlarm(alarm) {
  if ((require("Storage").readJSON("setting.json", 1) || {}).quiet > 1) return; // total silence
  let msg = formatTime(alarm.t);
  let buzzCount = 20;
  if (alarm.msg) msg += "\n" + alarm.msg + "!";

  if (alarm.hard) {
    let okClicked = false;
    let currentGuess = 10;
    let randomNum = getRandomFromRange(0, 7, 13, 20);
    showNumberPicker(currentGuess, randomNum);
    setWatch(
      (o) => {
        if (!okClicked && currentGuess < 20) {
          currentGuess = currentGuess + 1;
          showNumberPicker(currentGuess, randomNum);
        }
      },
      BTN1,
      { repeat: true, edge: "rising" }
    );

    setWatch(
      (o) => {
        if (currentGuess == randomNum) {
          okClicked = true;
          showPrompt(msg, buzzCount, alarm);
        }
      },
      BTN2,
      { repeat: true, edge: "rising" }
    );

    setWatch(
      (o) => {
        if (!okClicked && currentGuess > 0) {
          currentGuess = currentGuess - 1;
          showNumberPicker(currentGuess, randomNum);
        }
      },
      BTN3,
      { repeat: true, edge: "rising" }
    );
  } else {
    showPrompt(msg, buzzCount, alarm);
  }

  function buzz() {
    Bangle.buzz(500).then(() => {
      setTimeout(() => {
        Bangle.buzz(500).then(function () {
          setTimeout(() => {
            Bangle.buzz(2000).then(function () {
              if (buzzCount--) setTimeout(buzz, 2000);
              else if (alarm.as) {
                // auto-snooze
                buzzCount = 20;
                setTimeout(buzz, 600000); // 10 minutes
              }
            });
          }, 100);
        });
      }, 100);
    });
  }
  buzz();
}

let time = new Date();
let t = getCurrentTime();
let alarms = require("Storage").readJSON("qalarm.json", 1) || [];

let active = alarms.filter(
  (alarm) =>
    alarm.on &&
    alarm.t <= t &&
    alarm.last != time.getDate() &&
    (alarm.timer || alarm.daysOfWeek[time.getDay()])
);

if (active.length) {
  showAlarm(active.sort((a, b) => a.t - b.t)[0]);
}
