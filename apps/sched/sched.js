// Chances are boot0.js got run already and scheduled *another*
// 'load(sched.js)' - so let's remove it first!

function showPromptBtnCancel(msg,options) {
  if (!options) options={};
  if (!options.buttons)
    options.buttons = {"Yes":true,"No":false};
  var btns = Object.keys(options.buttons);
  var btnPos;
  function draw(highlightedButton) {
    g.reset().setFont("6x8:2").setFontAlign(0,-1);
    var Y = Bangle.appRect.y;
    var W = g.getWidth(), H = g.getHeight()-Y, FH=g.getFontHeight();
    var titleLines = g.wrapString(options.title, W-2);
    var msgLines = g.wrapString(msg||"", W-2);
    var y = Y + (H + (titleLines.length - msgLines.length)*FH )/2 - 24;
    if (options.img) {
      var im = g.imageMetrics(options.img);
      g.drawImage(options.img,(W-im.width)/2,y - im.height/2);
      y += 4+im.height/2;
    }
    if (titleLines)
      g.setColor(g.theme.fgH).setBgColor(g.theme.bgH).
        clearRect(0,Y,W-1,Y+4+titleLines.length*FH).
        drawString(titleLines.join("\n"),W/2,Y+2);
    g.setColor(g.theme.fg).setBgColor(g.theme.bg).
      drawString(msgLines.join("\n"),W/2,y);
    y += msgLines.length*FH+32;

    var buttonWidths = 0;
    var buttonPadding = 24;
    g.setFontAlign(0,0);
    btns.forEach(btn=>buttonWidths += buttonPadding+g.stringWidth(btn));
    if (buttonWidths>W) { // if they don't fit, use smaller font
      g.setFont("6x8");
      buttonWidths = 0;
      btns.forEach(btn=>buttonWidths += buttonPadding+g.stringWidth(btn));
    }
    var x = (W-buttonWidths)/2;
    btnPos = [];
    btns.forEach((btn,idx)=>{
      var w = g.stringWidth(btn);
      x += (buttonPadding+w)/2;
      var bw = 6+w/2;
      var poly = [x-bw,y-16,
                  x+bw,y-16,
                  x+bw+4,y-12,
                  x+bw+4,y+12,
                  x+bw,y+16,
                  x-bw,y+16,
                  x-bw-4,y+12,
                  x-bw-4,y-12,
                  x-bw,y-16];
      btnPos.push({x1:x-bw-buttonPadding/2, x2:x+bw+buttonPadding/2,
                   y1:y-30, y2:y+30,
                   poly: poly});
      g.setColor(idx===highlightedButton ? g.theme.bgH : g.theme.bg2).fillPoly(poly).
        setColor(idx===highlightedButton ? g.theme.fgH : g.theme.fg2).drawPoly(poly).drawString(btn,x,y+1);
      x += (buttonPadding+w)/2;
    });
    Bangle.setLCDPower(1); // ensure screen is on
  }
  g.reset().clearRect(Bangle.appRect); // clear screen
  if (!msg) {
    Bangle.setUI(); // remove watches
    return Promise.resolve();
  }
  draw();
  return new Promise(resolve=>{
    Bangle.setUI({mode:"custom", remove: options.remove, redraw: draw, back:options.back,
      btn: () => { // Handle physical buttons explicitly
            showPromptBtnCancel();
            resolve(options.buttons.No);
          }, 
      touch:(_,e)=>{
        btnPos.forEach((b,i)=>{
          if (e.x > b.x1 && e.x < b.x2 &&
              e.y > b.y1 && e.y < b.y2) {
            draw(i); // highlighted button
            g.flip(); // write to screen
            showPromptBtnCancel(); // remove
            resolve(options.buttons[btns[i]]);
          }
        });
    }});
  });
}

function showCustomPrompt(message, options, btnToStop) {
  const BANGLEJS2 = process.env.HWVERSION==2;
  if (BANGLEJS2 && btnToStop) {
    return showPromptBtnCancel(message, options);
  } else {
    return E.showPrompt(message, options);
  }
}

if (Bangle.SCHED) {
  clearInterval(Bangle.SCHED);
  delete Bangle.SCHED;
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

  showCustomPrompt(message, {
    title: alarm.timer ? /*LANG*/"TIMER!" : /*LANG*/"ALARM!",
    buttons: { /*LANG*/"Snooze": true, /*LANG*/"Stop": false } // default is sleep so it'll come back in some mins
  }, settings.btnToStop).then(function (sleep) {
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
