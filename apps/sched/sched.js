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
  var msg = alarm.timer ? formatTime(alarm.timer) : formatTime(alarm.t);
  var buzzCount = 10;
  if (alarm.msg)
    msg += "\n"+alarm.msg;
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  E.showPrompt(msg,{
    title:alarm.timer ? /*LANG*/"TIMER!" : /*LANG*/"ALARM!",
    buttons : {/*LANG*/"Sleep":true,/*LANG*/"Ok":false} // default is sleep so it'll come back in 10 mins
  }).then(function(sleep) {
    buzzCount = 0;
    if (sleep) {
      if(alarm.ot===undefined) alarm.ot = alarm.t;
      alarm.t += 10*60*1000; // 10 minutes
    } else {
      alarm.last = (new Date()).getDate();
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
