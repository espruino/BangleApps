const tt = require('triangletimer');

function showAlarm(alarm) {
  const settings = require("sched").getSettings();
  const tri_timer = tt.TIMERS[alarm.data.idx];
  const message =  tt.format_triangle(tri_timer) + '\n' + alarm.msg;

  Bangle.loadWidgets();
  Bangle.drawWidgets();

  // buzzCount should really be called buzzRepeat, so subtract 1
  let buzzCount = tri_timer.buzz_count - 1;

  tt.update_system_alarms();

  E.showPrompt(message, {
    title: 'Triangle timer',
    buttons: { "Goto": true, "OK": false }
  }).then(function (go) {
    buzzCount = 0;

    Bangle.emit("alarmDismiss", alarm);

    if (go) {
      console.log('alarm ' + alarm.data.idx);
      tt.set_last_viewed_timer(tri_timer);
      load('triangletimer.app.js');
    } else {
      load();
    }
  });

  function buzz() {
    if (settings.unlockAtBuzz) {
      Bangle.setLocked(false);
    }

    const pattern = tri_timer.vibrate_pattern || settings.defaultTimerPattern;
    console.log('buzz: ' + pattern);
    console.log('buzzCount: ' + buzzCount);
    require("buzz").pattern(pattern).then(() => {
      if (buzzCount == null || buzzCount--) {
        setTimeout(buzz, settings.buzzIntervalMillis);
      } else if (alarm.as) { // auto-snooze
        // buzzCount should really be called buzzRepeat, so subtract 1
        buzzCount = tri_timer.buzz_count - 1;
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
