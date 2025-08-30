
// Chances are boot0.js got run already and scheduled *another*
// 'load(sched.js)' - so let's remove it first!
if (Bangle.SCHED) {
  clearInterval(Bangle.SCHED);
  delete Bangle.SCHED;
}

function formatMS(ms) {
  if (ms < 60000) {
    // less than a minute → show seconds
    return Math.round(ms / 1000) + "s";
  } else {
    // one minute or more → show minutes
    return Math.round(ms / 60000) + "m";
  }
}

function showSnoozeMenu(alarm){

  Bangle.buzz(40);

  function onSnooze(snoozeTime) {
    if (alarm.ot === undefined) {
      alarm.ot = alarm.t;
    }
    let time = new Date();
    let currentTime = (time.getHours()*3600000)+(time.getMinutes()*60000)+(time.getSeconds()*1000);
    alarm.t = currentTime + snoozeTime;
    alarm.t %= 86400000;
    Bangle.emit("alarmSnooze", alarm);

    // The updated alarm is still a member of 'alarms'
    // so writing to array writes changes back directly
    require("sched").setAlarms(alarms);
    load();
  }

  if(alarm.timer){
    
    let timerLength=alarm.timer
    let buttons={ "15s": 15, "30s":30,"1m":60 ,"2m":120,"5m":360};
    let formattedLength = formatMS(timerLength)+"*";
    buttons[formattedLength] = Math.round(timerLength/1000);
    //different button lengths
    E.showPrompt("Choose snooze length", {
      title: "Snooze Options",
      buttons
    }).then(snoozeTime => onSnooze(snoozeTime * 1000));
  }else{
    E.showPrompt("Choose snooze length", {
      title: "Snooze Options",
      buttons: { "1m": 1, "2m":2,"5m": 5,"10m":10 } 
    }).then(snoozeTime => onSnooze(snoozeTime * 60000));
  }
}
  
function showAlarm(alarm) {
  const alarmIndex = alarms.indexOf(alarm);
  const settings = require("sched").getSettings();

  let message = "";
  message += alarm.timer ? require("time_utils").formatDuration(alarm.timer) : require("time_utils").formatTime(alarm.t);
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

  let buzzCount = settings.buzzCount;

  E.showPrompt(message, {
    title: alarm.timer ? /*LANG*/"TIMER!" : /*LANG*/"ALARM!",
    buttons: { /*LANG*/"Snooze": 1, /*LANG*/"Stop": 2 }, // default is sleep so it'll come back in some mins
    buttonsLong:{/*LANG*/"Snooze":3},
  }).then(function (sleep) {
    buzzCount = 0;
    //long press triggered
    if(sleep==3){
      showSnoozeMenu(alarm);
      return;
    }
    if (sleep==1) {
      if (alarm.ot === undefined) {
        alarm.ot = alarm.t;
      }
      let time = new Date();
      let currentTime = (time.getHours()*3600000)+(time.getMinutes()*60000)+(time.getSeconds()*1000);
      alarm.t = currentTime + settings.defaultSnoozeMillis;
      alarm.t %= 86400000;
      Bangle.emit("alarmSnooze", alarm);
    } else {
      let del = alarm.del === undefined ? settings.defaultDeleteExpiredTimers : alarm.del;
      if (del) {
        alarms.splice(alarmIndex, 1);
      } else {
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
    }

    // The updated alarm is still a member of 'alarms'
    // so writing to array writes changes back directly
    require("sched").setAlarms(alarms);
    load();
  });

  function buzz() {
    if (settings.unlockAtBuzz) {
      Bangle.setLocked(false);
    }

    const pattern = alarm.vibrate || (alarm.timer ? settings.defaultTimerPattern : settings.defaultAlarmPattern);
    require("buzz").pattern(pattern).then(() => {
      if (buzzCount == null || buzzCount--) {
        setTimeout(buzz, settings.buzzIntervalMillis);
      } else if (alarm.as) { // auto-snooze
        buzzCount = settings.buzzCount;
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
