// called by getActiveAlarms(...)[0].js
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
    let dir;
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

function buzz() {
  const settings = require("sched").getSettings();
  let buzzCount = 3 * settings.buzzCount;

  require("buzz").pattern(alarm.vibrate === undefined ? "::" : alarm.vibrate).then(() => {
    if (buzzCount--) {
      setTimeout(buzz, settings.buzzIntervalMillis);
    } else if (alarm.as) { // auto-snooze
      buzzCount = settings.buzzCount;
      setTimeout(buzz, settings.defaultSnoozeMillis);
    }
  });
}

let alarms = require("sched").getAlarms();
let active = require("sched").getActiveAlarms(alarms);
let alarm = active[0];
// active[0] is a HM alarm (otherwise we'd have triggered sched.js instead of this file)
startHM();
buzz();
