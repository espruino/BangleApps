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
  const settings = require("sched").getSettings();

  let msg = "";
  if (alarm.timer) msg += require("time_utils").formatTime(alarm.timer);
  if (alarm.msg) {
    msg += "\n"+alarm.msg;
  }
  else msg = atob("ACQswgD//33vRcGHIQAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAABVVVAAAAAAAAAP/wAAAAAAAAAP/wAAAAAAAAAqqoAPAAAAAAqqqqoP8AAAAKqqqqqv/AAACqqqqqqq/wAAKqqqlWqqvwAAqqqqlVaqrAACqqqqlVVqqAAKqqqqlVVaqgAKqaqqlVVWqgAqpWqqlVVVqoAqlWqqlVVVaoCqlV6qlVVVaqCqVVfqlVVVWqCqVVf6lVVVWqKpVVX/lVVVVqqpVVV/+VVVVqqpVVV//lVVVqqpVVVfr1VVVqqpVVVfr1VVVqqpVVVb/lVVVqqpVVVW+VVVVqqpVVVVVVVVVqiqVVVVVVVVWqCqVVVVVVVVWqCqlVVVVVVVaqAqlVVVVVVVaoAqpVVVVVVVqoAKqVVVVVVWqgAKqlVVVVVaqgACqpVVVVVqqAAAqqlVVVaqoAAAKqqVVWqqgAAACqqqqqqqAAAAAKqqqqqgAAAAAAqqqqoAAAAAAAAqqoAAAAA==")+" "+msg;

  Bangle.loadWidgets();
  Bangle.drawWidgets();

  let buzzCount = settings.buzzCount;

  if (alarm.data.hm && alarm.data.hm == true) {
    //hard mode extends auto-snooze time
    buzzCount = buzzCount * 3;
    startHM();
  }

  else {
    E.showPrompt(msg,{
      title: "TIMER!",
      buttons : {"Snooze":true,"Ok":false} // default is sleep so it'll come back in 10 mins
    }).then(function(sleep) {
      buzzCount = 0;
      if (sleep) {
        if(alarm.ot===undefined) alarm.ot = alarm.t;
        alarm.t += settings.defaultSnoozeMillis;
      } else {
        if (!alarm.timer) alarm.last = (new Date()).getDate();
        if (alarm.ot!==undefined) {
            alarm.t = alarm.ot;
            delete alarm.ot;
        }
        if (!alarm.rp) alarm.on = false;
      }
      //reset timer value
      if (alarm.timer) alarm.timer = alarm.data.ot;
      // alarm is still a member of 'alarms', so writing to array writes changes back directly
      require("sched").setAlarms(alarms);
      load();
    });
  }

  function buzz() {
    if (settings.unlockAtBuzz) {
      Bangle.setLocked(false);
    }

    require("buzz").pattern(alarm.vibrate === undefined ? ".." : alarm.vibrate).then(() => {
      if (buzzCount--) {
        setTimeout(buzz, settings.buzzIntervalMillis);
      } else if (alarm.as) { // auto-snooze
        buzzCount = settings.buzzCount;
        setTimeout(buzz, settings.defaultSnoozeMillis);
      }
    });
  }

  if ((require("Storage").readJSON("setting.json", 1) || {}).quiet > 1)
    return;

  buzz();
}

// Check for alarms
let alarms = require("sched").getAlarms();
let active = require("sched").getActiveAlarms(alarms);
if (active.length) {
  // if there's an alarm, show it
  showAlarm(active[0]);
} else {
  // otherwise just go back to default app
  setTimeout(load, 100);
}
