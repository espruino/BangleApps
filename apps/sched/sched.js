// Chances are boot0.js got run already and scheduled *another*
// 'load(sched.js)' - so let's remove it first!
if (Bangle.ALARM) {
  clearInterval(Bangle.ALARM);
  delete Bangle.ALARM;
}

// time in ms -> { hrs, mins }
function decodeTime(t) {
  t = 0|t; // sanitise
  var hrs = 0|(t/3600000);
  return { hrs : hrs, mins : Math.round((t-hrs*3600000)/60000) };
}

// time in { hrs, mins } -> ms
function encodeTime(o) {
  return o.hrs*3600000 + o.mins*60000;
}

function formatTime(t) {
  var o = decodeTime(t);
  return o.hrs+":"+("0"+o.mins).substr(-2);
}

function getCurrentTime() {
  var time = new Date();
  return (
    time.getHours() * 3600000 +
    time.getMinutes() * 60000 +
    time.getSeconds() * 1000
  );
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
    require("Storage").write("sched.json",JSON.stringify(alarms));
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
var day = (new Date()).getDate();
var currentTime = getCurrentTime()+10000; // get current time - 10s in future to ensure we alarm if we've started the app a tad early
var alarms = require("Storage").readJSON("sched.json",1)||[];
var active = alarms.filter(a=>a.on&&(a.t<currentTime)&&(a.last!=day) && (!a.date || a.date==time.toISOString().substr(0,10)));
if (active.length) {
  // if there's an alarm, show it
  active = active.sort((a,b)=>a.t-b.t);
  showAlarm(active[0]);
} else {
  // otherwise just go back to default app
  setTimeout(load, 100);
}
