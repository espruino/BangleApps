if (timerclkTimerTimeout) clearInterval(timerclkTimerTimeout);
var timerclk = require("timerclk.lib.js");
var settings = require('Storage').readJSON("timerclk.json", true) || {};
settings = Object.assign({
  "vibrate":10
}, settings.timer||{});

function showTimer(timer) {
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  Bangle.setLocked(false);
  E.showPrompt("Timer finished!",{
    title:"TIMER!",
    buttons : {/*LANG*/"Ok":true}
  }).then(function(ok) {
    buzzCount = 0;
    timer.start = null;
    require("Storage").write("timerclk.timer.json",JSON.stringify(timers));
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

// Check for timers
console.log("checking for timers...");
var timers = require("Storage").readJSON("timerclk.timer.json",1)||[];
var active = timers.filter(e=>e.start);
if (active.length) {
  // if there's an active timer, show it
  active = active.sort((a,b)=>timerclk.timerExpiresIn(a)-timerclk.timerExpiresIn(b));
  showTimer(active[0]);
} else {
  // otherwise just go back to default app
  setTimeout(load, 100);
}
