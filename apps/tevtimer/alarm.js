const tt = require('tevtimer');

function showAlarm(alarm) {
  const settings = require("sched").getSettings();
  const timer = tt.TIMERS[alarm.data.idx];
  const message =  timer.display_name() + '\n' + alarm.msg;

  Bangle.loadWidgets();
  Bangle.drawWidgets();

  // buzzCount should really be called buzzRepeat, so subtract 1
  let buzzCount = timer.buzz_count - 1;

  E.showPrompt(message, {
    title: 'Timer',
    buttons: { "OK": true }
  }).then(function (go) {
    buzzCount = 0;
    Bangle.emit("alarmDismiss", alarm);
    load();
  });

  function buzz() {
    if (settings.unlockAtBuzz) {
      Bangle.setLocked(false);
    }

    const pattern = timer.vibrate_pattern || settings.defaultTimerPattern;
    console.log('buzz: ' + pattern);
    console.log('buzzCount: ' + buzzCount);
    require("buzz").pattern(pattern).then(() => {
      if (buzzCount == null || buzzCount--) {
        setTimeout(buzz, settings.buzzIntervalMillis);
      } else if (alarm.as) { // auto-snooze
        // buzzCount should really be called buzzRepeat, so subtract 1
        buzzCount = timer.buzz_count - 1;
        setTimeout(buzz, settings.defaultSnoozeMillis);
      }
    });
  }

  if ((require("Storage").readJSON("setting.json", 1) || {}).quiet > 1)
    return;

  buzz();
}

let alarms = require("sched").getAlarms();
let active = require("sched").getActiveAlarms(alarms);
if (active.length) {
  // if there's an alarm, show it
  showAlarm(active[0]);
} else {
  // otherwise just go back to default app
  setTimeout(load, 100);
}
