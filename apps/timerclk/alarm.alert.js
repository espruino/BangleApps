if (timerclkAlarmTimeout) clearInterval(timerclkAlarmTimeout);
var timerclk = require("timerclk.lib.js");
var settings = require('Storage').readJSON("timerclk.json", true) || {};
settings = Object.assign({
  "vibrate":10
}, settings.alarm||{});

function showAlarm(alarm) {
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  Bangle.setLocked(false);
  E.showPrompt("Alarm!",{
    title:"ALARM!",
    buttons : {/*LANG*/"Ok":true}
  }).then(function(ok) {
    buzzCount = 0;
    if (ok) {
      alarm.last = new Date().getDate();
    }
    require("Storage").write("timerclk.alarm.json",JSON.stringify(alarms));
    load();
  });
  function vibrate(counter) {
    VIBRATE.write(1);
    setTimeout(() => VIBRATE.write(0), 100);
    if (--counter) setTimeout(() => vibrate(counter), 250);
  }
  function buzz() {
    if ((require('Storage').readJSON('setting.json',1)||{}).quiet>1) return; // total silence
    vibrate(4);
    if (buzzCount--)
      setTimeout(buzz, 3000);
    else { // auto-snooze
      buzzCount = settings.vibrate;
      setTimeout(buzz, 600000);
    }
  }
  var buzzCount = settings.vibrate;
  buzz();
}

// Check for alarms
console.log("checking for alarms...");
var alarms = require("Storage").readJSON("timerclk.alarm.json",1)||[];
var active = alarms.filter(e=>e.on);
if (active.length) {
  // if there's an alarm, show it
  active = active.sort((a,b)=>(a.time-b.time)+(a.last-b.last)*86400000);
  if (active[0].last != new Date().getDate()) {
    showAlarm(active[0]);
  } else {
    setTimeout(load, 100);
  }
} else {
  // otherwise just go back to default app
  setTimeout(load, 100);
}
