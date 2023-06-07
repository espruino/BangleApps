//sched.js, modified
// Chances are boot0.js got run already and scheduled *another*
// 'load(sched.js)' - so let's remove it first!
if (Bangle.SCHED) {
  clearInterval(Bangle.SCHED);
  delete Bangle.SCHED;
}

function hardMode(tries, max) {
  var R = Bangle.appRect;

  function adv() {
    tries++;
    hardMode(tries, max);
  }

  if (tries < max) {
    g.clear();
    g.reset();
    g.setClipRect(R.x,R.y,R.x2,R.y2);
    var code = Math.abs(E.hwRand()%4);
    if (code == 0) dir = "up";
    else if (code == 1) dir = "right";
    else if (code == 2) dir = "down";
    else dir = "left";
    g.setFont("6x8:2").setFontAlign(0,0).drawString(tries+"/"+max+"\nSwipe "+dir, (R.x2-R.x)/2, (R.y2-R.y)/2);
    var drag;
    Bangle.setUI({
    mode : "custom",
    drag : e=>{
      if (!drag) { // start dragging
        drag = {x: e.x, y: e.y};
        } else if (!e.b) { // released
          const dx = e.x-drag.x, dy = e.y-drag.y;
          drag = null;
          //horizontal swipes
          if (Math.abs(dx)>Math.abs(dy)+10) {
            //left
            if (dx<0 && code == 3) adv();
            //right
            else if (dx>0 && code == 1) adv();
            //wrong swipe - reset
            else startHM();
          }
          //vertical swipes
          else if (Math.abs(dy)>Math.abs(dx)+10) {
            //up
            if (dy<0 && code == 0) adv();
            //down
            else if (dy>0 && code == 2) adv();
            //wrong swipe - reset
            else startHM();
          }
        }
      }
    });
  }
  else {
    if (!active[0].timer) active[0].last = (new Date()).getDate();
    if (!active[0].rp) active[0].on = false;
    if (active[0].timer) active[0].timer = active[0].data.ot;
    require("sched").setAlarms(alarms);
    load();
  }
}

function startHM() {
  //between 5-8 random swipes
  hardMode(0, Math.abs(E.hwRand()%4)+5);
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

  if (alarm.data.hm && alarm.data.hm == true) {
    //hard mode extends auto-snooze time
    buzzCount = buzzCount * 3;
    startHM();
  }

  else {
    E.showPrompt(message, {
      title: alarm.timer ? /*LANG*/"TIMER!" : /*LANG*/"ALARM!",
      buttons: { /*LANG*/"Snooze": true, /*LANG*/"Stop": false } // default is sleep so it'll come back in some mins
    }).then(function (sleep) {
      buzzCount = 0;

      if (sleep) {
        if (alarm.ot === undefined) {
          alarm.ot = alarm.t;
        }
        alarm.t += settings.defaultSnoozeMillis;
        Bangle.emit("alarmSnooze", alarm);
      } else {
        let del = alarm.del === undefined ? settings.defaultDeleteExpiredTimers : alarm.del;
        if (del) {
          if (alarmIndex >= 0) alarms.splice(alarmIndex, 1);
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
      //reset timer value
      if (alarm.timer) alarm.timer = alarm.data.ot;
      // The updated alarm is still a member of 'alarms'
      // so writing to array writes changes back directly
      require("sched").setAlarms(alarms);
      load();
    });
  }

  function buzz() {
    if (settings.unlockAtBuzz) {
      Bangle.setLocked(false);
    }

    const pattern = alarm.vibrate || (alarm.timer ? settings.defaultTimerPattern : settings.defaultAlarmPattern);
    require("buzz").pattern(pattern).then(() => {
      if (buzzCount--) {
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
