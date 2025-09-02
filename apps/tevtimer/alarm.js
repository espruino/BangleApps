// Derived from `sched.js` from the `sched` app, with modifications
// for features unique to the `tevtimer` app.

// Chances are boot0.js got run already and scheduled *another*
// 'load(sched.js)' - so let's remove it first!
if (Bangle.SCHED) {
  clearInterval(Bangle.SCHED);
  delete Bangle.SCHED;
}

const tt = require('tevtimer');

function showAlarm(alarm) {
  // Alert the user of the alarm and handle the response

  const settings = require("sched").getSettings();
  const timer = tt.TIMERS[tt.find_timer_by_id(alarm.id)];
  if (timer === undefined) {
    console.error("tevtimer: unable to find timer with ID " + alarm.id);
    return;
  }
  let message = timer.display_name() + '\n' + alarm.msg;

  // Altering alarms from here is tricky. Making changes to timers
  // requires calling tt.update_system_alarms() to update the system
  // alarm list to reflect the new timer state. But that means we need
  // to retrieve the alarms again from sched.getAlarms() before
  // changing them ourselves or else we risk overwriting the changes.
  // Likewise, after directly modifying alarms, we need to write them
  // back with sched.setAlarms() before doing anything that will call
  // tt.update_system_alarms(), or else the latter will work with an
  // outdated list of alarms.

  // If there's a timer chained from this one, start it (only for
  // alarms not in snoozed status)
  var isChainedTimer = false;
  var chainTimer = null;
  if (timer.chain_id !== null && alarm.ot === undefined) {
    chainTimer = tt.TIMERS[tt.find_timer_by_id(timer.chain_id)];
    if (chainTimer !== undefined) {
      chainTimer.reset();
      chainTimer.start();
      tt.set_last_viewed_timer(chainTimer);
      isChainedTimer = true;

      // Update system alarm list
      tt.update_system_alarms();
      alarms = require("sched").getAlarms();
    } else {
      console.warn("tevtimer: unable to find chained timer with ID " + timer.chain_id);
    }
  }

  if (alarm.msg) {
    message += "\n" + alarm.msg;
  } else {
    message = atob("ACQswgD//33vRcGHIQAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAAAP/wAAAAAAAAAP/wAAAAAAAAAqqoAPAAAAAAqqqqoP8AAAAKqqqqqv/AAACqqqqqqq/wAAKqqqlWqqvwAAqqqqlVaqrAACqqqqlVVqqAAKqqqqlVVaqgAKqaqqlVVWqgAqpWqqlVVVqoAqlWqqlVVVaoCqlV6qlVVVaqCqVVfqlVVVWqCqVVf6lVVVWqKpVVX/lVVVVqqpVVV/+VVVVqqpVVV//lVVVqqpVVVfr1VVVqqpVVVfr1VVVqqpVVVb/lVVVqqpVVVW+VVVVqqpVVVVVVVVVqiqVVVVVVVVWqCqVVVVVVVVWqCqlVVVVVVVaqAqlVVVVVVVaoAqpVVVVVVVqoAKqVVVVVVWqgAKqlVVVVVaqgACqpVVVVVqqAAAqqlVVVaqoAAAKqqVVWqqgAAACqqqqqqqAAAAAKqqqqqgAAAAAAqqqqoAAAAAAAAqqoAAAAA==") + " " + message
  }

  Bangle.loadWidgets();
  Bangle.drawWidgets();

  // buzzCount should really be called buzzRepeat, so subtract 1
  let buzzCount = timer.buzz_count - 1;

  // Alarm options for non-chained timer are OK (dismiss the alarm) and
  // Snooze (retrigger the alarm after a delay).
  // Alarm options for chained timer are OK (dismiss) and Halt (dismiss
  // and pause the triggering timer).
  let promptButtons = isChainedTimer
    ? { 'Halt': 'halt', 'OK': 'ok' }
    : { 'Snooze': 'snooze', 'OK': 'ok' };
  E.showPrompt(message, {
    title: 'tev timer',
    buttons: promptButtons,
  }).then(function (action) {
    buzzCount = 0;

    if (action === 'snooze') {
      if (alarm.ot === undefined) {
        alarm.ot = alarm.t;
      }
      let time = new Date();
      let currentTime = (time.getHours()*3600000)+(time.getMinutes()*60000)+(time.getSeconds()*1000);
      alarm.t = currentTime + settings.defaultSnoozeMillis;
      alarm.t %= 86400000;
      require("sched").setAlarms(alarms);

      Bangle.emit("alarmSnooze", alarm);
    }
    if (action === 'ok' || action === 'halt') {
      let index = alarms.indexOf(alarm);
      if (index !== -1) {
        alarms.splice(index, 1);
        require("sched").setAlarms(alarms);
      }
      if (timer !== chainTimer) {
        timer.pause();
        if (tt.SETTINGS.auto_reset) {
          timer.reset();
        }
      }
    }
    if (action === 'halt') {
      chainTimer.pause();
    }
    tt.update_system_alarms();
    alarms = require("sched").getAlarms();

    Bangle.emit("alarmDismiss", alarm);

    require("sched").setAlarms(alarms);

    if (action === 'halt' || tt.SETTINGS.alarm_return) {
      load('tevtimer.app.js');
    } else {
      load();
    }
  });

  function buzz() {
    // Handle buzzing and screen unlocking

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
