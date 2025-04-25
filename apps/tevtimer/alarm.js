// Chances are boot0.js got run already and scheduled *another*
// 'load(sched.js)' - so let's remove it first!
if (Bangle.SCHED) {
  clearInterval(Bangle.SCHED);
  delete Bangle.SCHED;
}

const tt = require('tevtimer');

function showAlarm(alarm) {
  const settings = require("sched").getSettings();
  const timer = tt.TIMERS[tt.find_timer_by_id(alarm.id)];
  if (timer === undefined) {
    console.error("tevtimer: unable to find timer with ID " + alarm.id);
    return;
  }
  let message = timer.display_name() + '\n' + alarm.msg;

  // If there's a timer chained from this one, start it
  if (timer.chain_id !== null) {
    const chainTimer = tt.TIMERS[tt.find_timer_by_id(timer.chain_id)];
    if (chainTimer !== undefined) {
      chainTimer.reset();
      chainTimer.start();
      tt.set_last_viewed_timer(chainTimer);
    } else {
      console.warn("tevtimer: unable to find chained timer with ID " + timer.chain_id);
    }
  }

  if (alarm.msg) {
    message += "\n" + alarm.msg;
  } else {
    message = (alarm.timer
      ? atob("ACQswgD//33vRcGHIQAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAAAP/wAAAAAAAAAP/wAAAAAAAAAqqoAPAAAAAAqqqqoP8AAAAKqqqqqv/AAACqqqqqqq/wAAKqqqlWqqvwAAqqqqlVaqrAACqqqqlVVqqAAKqqqqlVVaqgAKqaqqlVVWqgAqpWqqlVVVqoAqlWqqlVVVaoCqlV6qlVVVaqCqVVfqlVVVWqCqVVf6lVVVWqKpVVX/lVVVVqqpVVV/+VVVVqqpVVV//lVVVqqpVVVfr1VVVqqpVVVfr1VVVqqpVVVb/lVVVqqpVVVW+VVVVqqpVVVVVVVVVqiqVVVVVVVVWqCqVVVVVVVVWqCqlVVVVVVVaqAqlVVVVVVVaoAqpVVVVVVVqoAKqVVVVVVWqgAKqlVVVVVaqgACqpVVVVVqqAAAqqlVVVaqoAAAKqqVVWqqgAAACqqqqqqqAAAAAKqqqqqgAAAAAAqqqqoAAAAAAAAqqoAAAAA==")
      : atob("AC0swgF97///RcEpMlVVVVVVf9VVVVVVVVX/9VVf9VVf/1VVV///1Vf9VX///VVX///VWqqlV///1Vf//9aqqqqpf//9V///2qqqqqqn///V///6qqqqqqr///X//+qqoAAKqqv//3//6qoAAAAKqr//3//qqAAAAAAqq//3/+qoAADwAAKqv/3/+qgAADwAACqv/3/aqAAADwAAAqp/19qoAAADwAAAKqfV1qgAAADwAAACqXVWqgAAADwAAACqlVWqAAAADwAAAAqlVWqAAAADwAAAAqlVWqAAAADwAAAAqlVaoAAAADwAAAAKpVaoAAAADwAAAAKpVaoAAAADwAAAAKpVaoAAAAOsAAAAKpVaoAAAAOsAAAAKpVaoAAAAL/AAAAKpVaoAAAAgPwAAAKpVaoAAACAD8AAAKpVWqAAAIAA/AAAqlVWqAAAgAAPwAAqlVWqAACAAADwAAqlVWqgAIAAAAAACqlVVqgAgAAAAAACqVVVqoAAAAAAAAKqVVVaqAAAAAAAAqpVVVWqgAAAAAACqlVVVWqoAAAAAAKqlVVVVqqAAAAAAqqVVVVVaqoAAAAKqpVVVVVeqqoAAKqqtVVVVV/6qqqqqqr/VVVVX/2qqqqqqn/1VVVf/VaqqqqpV/9VVVf9VVWqqlVVf9VVVf1VVVVVVVVX9VQ==")
    ) + " " + message
  }

  Bangle.loadWidgets();
  Bangle.drawWidgets();

  // buzzCount should really be called buzzRepeat, so subtract 1
  let buzzCount = timer.buzz_count - 1;

  E.showPrompt(message, {
    title: 'tev timer',
    buttons: { "Snooze": true, "Stop": false } // default is sleep so it'll come back in some mins
  }).then(function (sleep) {
    buzzCount = 0;

    if (sleep) {
      if (alarm.ot === undefined) {
        alarm.ot = alarm.t;
      }
      let time = new Date();
      let currentTime = (time.getHours()*3600000)+(time.getMinutes()*60000)+(time.getSeconds()*1000);
      alarm.t = currentTime + settings.defaultSnoozeMillis;
      alarm.t %= 86400000;
      Bangle.emit("alarmSnooze", alarm);
    } else {
      // Don't do timer deletions here; this is handled by the
      // tevtimer library code (and it may rearrange the alarm indeces
      // in the process)

      if (alarm.date && alarm.rp) {
        setNextRepeatDate(alarm);
      } else if (!alarm.timer) {
        alarm.last = new Date().getDate();
      }
      if (alarm.ot !== undefined) {
        alarm.t = alarm.ot;
        delete alarm.ot;
      }
      if (!alarm.rp) {
        alarm.on = false;
      }
    }
    Bangle.emit("alarmDismiss", alarm);

    // The updated alarm is still a member of 'alarms'
    // so writing to array writes changes back directly
    require("sched").setAlarms(alarms);

    // Update system alarms for any changed timers just before we finish
    tt.update_system_alarms();

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

  function setNextRepeatDate(alarm) {
    let date = new Date(alarm.date);
    let rp = alarm.rp;
    if (rp===true) { // fallback in case rp is set wrong
      date.setDate(date.getDate() + 1);
    } else switch(rp.interval) { // rp is an object
      case "day":
        date.setDate(date.getDate() + rp.num);
        break;
      case "week":
        date.setDate(date.getDate() + (rp.num * 7));
        break;
      case "month":
        if (!alarm.od) alarm.od = date.getDate();
        date = new Date(date.getFullYear(), date.getMonth() + rp.num, alarm.od);
        if (date.getDate() != alarm.od) date.setDate(0);
        break;
      case "year":
        if (!alarm.od) alarm.od = date.getDate();
        date = new Date(date.getFullYear() + rp.num, date.getMonth(), alarm.od);
        if (date.getDate() != alarm.od) date.setDate(0);
        break;
      default:
        console.log(`sched: unknown repeat '${JSON.stringify(rp)}'`);
        break;
    }
    alarm.date = date.toLocalISOString().slice(0,10);
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
