// Chances are boot0.js got run already and scheduled *another*
// 'load(sched.js)' - so let's remove it first!
if (Bangle.SCHED) {
  clearInterval(Bangle.SCHED);
  delete Bangle.SCHED;
}

// time in ms -> { hrs, mins }
function decodeTime(t) {
  t = 0|t; // sanitise
  var hrs = 0|(t/3600000);
  return { hrs : hrs, mins : Math.round((t-hrs*3600000)/60000) };
}

function formatTime(t) {
  var o = decodeTime(t);
  return o.hrs+":"+("0"+o.mins).substr(-2);
}

function showAlarm(alarm) {
  var msg = "";
  msg += alarm.timer ? formatTime(alarm.timer) : formatTime(alarm.t);
  if (alarm.msg) {
    msg += "\n"+alarm.msg;
  } else {
    if (alarm.timer)
      msg = atob("ACQswgD//33vRcGHIQAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAAAP/wAAAAAAAAAP/wAAAAAAAAAqqoAPAAAAAAqqqqoP8AAAAKqqqqqv/AAACqqqqqqq/wAAKqqqlWqqvwAAqqqqlVaqrAACqqqqlVVqqAAKqqqqlVVaqgAKqaqqlVVWqgAqpWqqlVVVqoAqlWqqlVVVaoCqlV6qlVVVaqCqVVfqlVVVWqCqVVf6lVVVWqKpVVX/lVVVVqqpVVV/+VVVVqqpVVV//lVVVqqpVVVfr1VVVqqpVVVfr1VVVqqpVVVb/lVVVqqpVVVW+VVVVqqpVVVVVVVVVqiqVVVVVVVVWqCqVVVVVVVVWqCqlVVVVVVVaqAqlVVVVVVVaoAqpVVVVVVVqoAKqVVVVVVWqgAKqlVVVVVaqgACqpVVVVVqqAAAqqlVVVaqoAAAKqqVVWqqgAAACqqqqqqqAAAAAKqqqqqgAAAAAAqqqqoAAAAAAAAqqoAAAAA==")+" "+msg;
    else
      msg = atob("AC0swgF97///RcEpMlVVVVVVf9VVVVVVVVX/9VVf9VVf/1VVV///1Vf9VX///VVX///VWqqlV///1Vf//9aqqqqpf//9V///2qqqqqqn///V///6qqqqqqr///X//+qqoAAKqqv//3//6qoAAAAKqr//3//qqAAAAAAqq//3/+qoAADwAAKqv/3/+qgAADwAACqv/3/aqAAADwAAAqp/19qoAAADwAAAKqfV1qgAAADwAAACqXVWqgAAADwAAACqlVWqAAAADwAAAAqlVWqAAAADwAAAAqlVWqAAAADwAAAAqlVaoAAAADwAAAAKpVaoAAAADwAAAAKpVaoAAAADwAAAAKpVaoAAAAOsAAAAKpVaoAAAAOsAAAAKpVaoAAAAL/AAAAKpVaoAAAAgPwAAAKpVaoAAACAD8AAAKpVWqAAAIAA/AAAqlVWqAAAgAAPwAAqlVWqAACAAADwAAqlVWqgAIAAAAAACqlVVqgAgAAAAAACqVVVqoAAAAAAAAKqVVVaqAAAAAAAAqpVVVWqgAAAAAACqlVVVWqoAAAAAAKqlVVVVqqAAAAAAqqVVVVVaqoAAAAKqpVVVVVeqqoAAKqqtVVVVV/6qqqqqqr/VVVVX/2qqqqqqn/1VVVf/VaqqqqpV/9VVVf9VVWqqlVVf9VVVf1VVVVVVVVX9VQ==")+" "+msg;
  }
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  var buzzCount = 10;
  E.showPrompt(msg,{
    title:alarm.timer ? /*LANG*/"TIMER!" : /*LANG*/"ALARM!",
    buttons : {/*LANG*/"Snooze":true,/*LANG*/"Ok":false} // default is sleep so it'll come back in 10 mins
  }).then(function(sleep) {
    buzzCount = 0;
    if (sleep) {
      if(alarm.ot===undefined) alarm.ot = alarm.t;
      alarm.t += 10*60*1000; // 10 minutes
    } else {
      if (!alarm.timer) alarm.last = (new Date()).getDate();
      if (alarm.ot!==undefined) {
          alarm.t = alarm.ot;
          delete alarm.ot;
      }
      if (!alarm.rp) alarm.on = false;
    }
    // alarm is still a member of 'alarms', so writing to array writes changes back directly
    require("sched").setAlarms(alarms);
    load();
  });
  function buzz() {
    require("buzz").pattern(alarm.vibrate===undefined?"..":alarm.vibrate).then(function() {
      if (buzzCount--)
        setTimeout(buzz, 3000);
      else if(alarm.as) { // auto-snooze
        buzzCount = 10;
        setTimeout(buzz, 600000);
      }
    });
  }
  if ((require('Storage').readJSON('setting.json',1)||{}).quiet>1) return;
  buzz();
}

// Check for alarms
var alarms = require("sched").getAlarms();
var active = require("sched").getActiveAlarms(alarms);
if (active.length) // if there's an alarm, show it
  showAlarm(active[0]);
else // otherwise just go back to default app
  setTimeout(load, 100);
