// Derived from `sched.js` from the `sched` app, with modifications
// for features unique to the `tevtimer` app.

// Chances are boot0.js got run already and scheduled *another*
// 'load(sched.js)' - so let's remove it first!
if (Bangle.SCHED) {
  clearInterval(Bangle.SCHED);
  delete Bangle.SCHED;
}

const sched = require("sched");
const tt = require('tevtimer');

function formatMS(ms) {
  if (ms < 60000) {
    // less than a minute → show seconds
    return Math.round(ms / 1000) + "s";
  } else {
    // one minute or more → show minutes
    return Math.round(ms / 60000) + "m";
  }
}

function showSnoozeMenu(alarm) {

  Bangle.buzz(40);

  function onSnooze(snoozeTime) {
    sched.snoozeAlarm(alarms, alarm, snoozeTime);
    load();
  }

  let timerLength = alarm.timer;
  let buttons = { "15s": 15, "30s": 30, "1m": 60, "2m": 120, "5m": 300 };
  let formattedLength = formatMS(timerLength) + "*";
  buttons[formattedLength] = Math.round(timerLength / 1000);
  //different button lengths
  E.showPrompt("Choose snooze length", {
    title: "Snooze Options",
    buttons
  }).then(snoozeTime => onSnooze(snoozeTime * 1000));
}

// Regenerate the system alarms after altering a timer's state and
// ensure the `alarms` list is up to date with the latest version of the
// alarms.
function recomputeAlarms() {
  tt.update_system_alarms();
  alarms = sched.getAlarms();
}

function showAlarm(alarm) {
  // Alert the user of the alarm and handle the response

  const settings = require("sched").getSettings();
  const timer = tt.TIMERS[tt.find_timer_by_id(alarm.id)];
  if (timer === undefined) {
    console.error("tevtimer: unable to find timer with ID " + alarm.id);
    return;
  }
  let message = timer.display_name() + '\n' + alarm.msg;

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
      recomputeAlarms();
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
  const promptButtons = isChainedTimer
    ? { 'Halt': 'halt', 'OK': 'ok' }
    : { 'Snooze': 'snooze', 'OK': 'ok' };
  let buttonsLong = {'OK': 'okInvertReturn'};
  if (!isChainedTimer) {
    buttonsLong.Snooze = 'snoozeCustom';
  }
  E.showPrompt(message, {
    title: 'tev timer',
    buttons: promptButtons,
    buttonsLong: buttonsLong,
  }).then(function (action) {
    let returnToApp = tt.SETTINGS.alarm_return;
    buzzCount = 0;

    if (action === 'snoozeCustom') {
      showSnoozeMenu(alarm);
      return;
    }
    if (action === 'snooze') {
      sched.snoozeAlarm(alarms, alarm, settings.defaultSnoozeMillis);
    }
    if (action === 'ok' || action === 'okInvertReturn' || action === 'halt') {
      sched.dismissAlarm(alarms, alarm);
      if (timer !== chainTimer) {
        timer.pause();
        if (tt.SETTINGS.auto_reset) {
          timer.reset();
        }
      }
    }
    if (action === 'okInvertReturn') {
      returnToApp = !returnToApp;
    }
    if (action === 'halt') {
      chainTimer.pause();
    }
    recomputeAlarms();

    if (action === 'halt' || returnToApp) {
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


let alarms = sched.getAlarms();
let activeAlarm = sched.getActiveAlarms(alarms).find(
  alarm => alarm.appid === 'tevtimer'
);

if (activeAlarm !== undefined) {
  showAlarm(activeAlarm);
} else {
  setTimeout(load, 100);
}
