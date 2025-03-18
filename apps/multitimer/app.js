{
Bangle.loadWidgets();
Bangle.drawWidgets();

const R = Bangle.appRect;
let layer;
let drag;
let timerInt1 = [];
let timerInt2 = [];

function getCurrentTime() {
  let time = new Date();
  return (
    time.getHours() * 3600000 +
    time.getMinutes() * 60000 +
    time.getSeconds() * 1000
  );
}

function decodeTime(t) {
  let hrs = 0 | Math.floor(t / 3600000);
  let mins = 0 | Math.floor(t / 60000 % 60);
  let secs = 0 | Math.floor(t / 1000 % 60);
  return { hrs: hrs, mins: mins, secs: secs };
}

function encodeTime(o) {
  return o.hrs * 3600000 + o.mins * 60000 + o.secs * 1000;
}

function formatTime(t) {
  let o = decodeTime(t);
  return o.hrs + ":" + ("0" + o.mins).substr(-2) + ":" + ("0" + o.secs).substr(-2);
}

function decodeTimeDecis(t) {
  let hrs = 0 | Math.floor(t / 3600000);
  let mins = 0 | Math.floor(t / 60000 % 60);
  let secs = 0 | Math.floor(t / 1000 % 60);
  let decis = 0 | Math.floor(t / 100 % 100);
  return { hrs: hrs, mins: mins, secs: secs, decis: decis };
}

function formatTimeDecis(t) {
  let o = decodeTimeDecis(t);
  return o.hrs + ":" + ("0" + o.mins).substr(-2) + ":" + ("0" + o.secs).substr(-2) + "." + ("0" + o.decis).substr(-1);
}

function clearInt() {
  for (let i = 0; i < timerInt1.length; i++) {
    if (timerInt1[i]) clearTimeout(timerInt1[i]);
  }
  for (let i = 0; i < timerInt2.length; i++) {
    if (timerInt2[i]) clearInterval(timerInt2[i]);
  }
  timerInt1 = [];
  timerInt2 = [];
}

function setHM(alarm, on) {
  if (on)
    alarm.js = "(require('Storage').read('multitimer.alarm.js') !== undefined) ? load('multitimer.alarm.js') : load('sched.js')";
  else
    delete alarm.js;
  alarm.data.hm = on;
}

function drawTimers() {
  layer = 0;
  const timers = require("sched").getAlarms().filter(a => a.timer && a.appid == "multitimer");

  function updateTimers(idx) {
    if (!timerInt1[idx]) timerInt1[idx] = setTimeout(function() {
      s.drawItem(idx+1);
      if (!timerInt2[idx]) timerInt2[idx] = setInterval(function(){
        s.drawItem(idx+1);
      }, 1000);
    }, 1000 - (timers[idx].t % 1000));
  }

  const s = E.showScroller({
    h : 40, c : timers.length+2,
    back : function() {load();},
    draw : (idx, r) => {
      function drawMenuItem(a) {
        let msg = "";
        g.setClipRect(R.x,R.y,R.x2,R.y2);
        if (idx > 0 && timers[idx-1].msg) msg = "\n"+(timers[idx-1].msg.length > 10 ?
          timers[idx-1].msg.substring(0, 10)+"..." : timers[idx-1].msg);
        return g.setColor(g.theme.bg2).fillRect({x:r.x+4,y:r.y+2,w:r.w-8, h:r.h-4, r:5})
        .setColor(g.theme.fg2).setFont("6x8:2").setFontAlign(-1,0).drawString(a+msg,r.x+12,r.y+(r.h/2));
      }

      if (idx == 0) {
        drawMenuItem("+ New Timer");
      }
      if (idx == timers.length+1) {
        g.setColor(g.theme.bg).fillRect({x:r.x+4,y:r.y+2,w:r.w-8, h:r.h-4, r:5})
        .setColor(g.theme.fg).setFont("6x8:2").setFontAlign(0,0).drawString("<   Swipe   >",r.x+(r.w/2),r.y+(r.h/2));
      }
      else if (idx > 0 && idx < timers.length+1) {
        if (timers[idx-1].on == true) {
          drawMenuItem(formatTime(timers[idx-1].t-getCurrentTime()));
          updateTimers(idx-1);
        }
        else drawMenuItem(formatTime(timers[idx-1].timer));
      }
    },
    select : (idx) => {
      clearInt();
      if (idx == 0) editTimer(-1);
      else if (idx > 0 && idx < timers.length+1) timerMenu(idx-1);
    }
  });
  setUI();
}

function timerMenu(idx) {
  layer = -1;
  const timers = require("sched").getAlarms();
  const timerIdx = [];
  let a;

  for (let i = 0; i < timers.length; i++) {
    if (timers[i].timer && timers[i].appid == "multitimer") {
      a = i;
      timerIdx.push(a);
    }
  }
  a = timers[timerIdx[idx]];

  function updateTimer() {
    if (timerInt1[0] == undefined) timerInt1[0] = setTimeout(function() {
      s.drawItem(0);
      if (timerInt2[0] == undefined) timerInt2[0] = setInterval(function(){
        s.drawItem(0);
      }, 1000);
    }, 1000 - (a.t % 1000));
  }

  const s = E.showScroller({
    h : 40, c : 5,
    back : function() {
      clearInt();
      drawTimers();
    },
    draw : (i, r) => {

      function drawMenuItem(b) {
        return g.setClipRect(R.x,R.y,R.x2,R.y2).setColor(g.theme.bg2)
          .fillRect({x:r.x+4,y:r.y+2,w:r.w-8, h:r.h-4, r:5})
          .setColor(g.theme.fg2).setFont("6x8:2").setFontAlign(-1,0).drawString(b,r.x+12,r.y+(r.h/2));
      }

      if (i == 0) {
        let msg = "";
        if (a.msg) msg = "\n"+(a.msg.length > 10 ? a.msg.substring(0, 10)+"..." : a.msg);
        if (a.on == true) {
          drawMenuItem(formatTime(a.t-getCurrentTime())+msg);
          updateTimer();
        }
        else {
          clearInt();
          drawMenuItem(formatTime(a.timer)+msg);
        }
      }
      if (i == 1) {
        if (a.on == true) drawMenuItem("Pause");
        else drawMenuItem("Start");
      }
      if (i == 2) drawMenuItem("Reset");
      if (i == 3) drawMenuItem("Edit");
      if (i == 4) drawMenuItem("Delete");
    },
    select : (i) => {

      function saveAndReload() {
        require("sched").setAlarms(timers);
        require("sched").reload();
        s.draw();
      }

      //pause/start
      if (i == 1) {
        if (a.on == true) {
          clearInt();
          a.timer = a.t-getCurrentTime();
          a.on = false;
          timers[timerIdx[idx]] = a;
          saveAndReload();
        }
        else {
          a.t = a.timer+getCurrentTime();
          a.on = true;
          timers[timerIdx[idx]] = a;
          saveAndReload();
        }
      }
      //reset
      if (i == 2) {
        clearInt();
        a.timer = a.data.ot;
        if (a.on == true) a.on = false;
        saveAndReload();
      }
      //edit
      if (i == 3) {
        clearInt();
        editTimer(idx);
      }
      //delete
      if (i == 4) {
        clearInt();
        timers.splice(timerIdx[idx], 1);
        saveAndReload();
        drawTimers();
      }
    }
  });
  setUI();
}

function editTimer(idx, a) {
  layer = -1;
  const timers = require("sched").getAlarms().filter(a => a.timer && a.appid == "multitimer");
  const alarms = require("sched").getAlarms();
  const timerIdx = [];
  for (let i = 0; i < alarms.length; i++) {
    if (alarms[i].timer && alarms[i].appid == "multitimer") {
      timerIdx.push(i);
    }
  }
  if (!a) {
    if (idx < 0) a = require("sched").newDefaultTimer();
    else a = timers[idx];
  }
  if (!a.data) {
    a.data = { hm: false };
  }
  const t = decodeTime(a.timer);

  function editMsg(idx, a) {
    let msg;
    g.clear();
    idx < 0 ? msg = "" : msg = a.msg;
    require("textinput").input({text:msg}).then(result => {
    if (result != "") {
      a.msg = result;
    }
    else delete a.msg;
    editTimer(idx, a);
    });
  }

  function kbAlert() {
    E.showAlert("Must install keyboard app").then(function() {
      editTimer(idx, a);
    });
    setUI();
  }

  const menu = {
    "": { "title": "Timer" },
    "< Back": () => {
      a.t = getCurrentTime() + a.timer;
      a.last = 0;
      a.data.ot = a.timer;
      a.appid = "multitimer";
      if (idx < 0) alarms.push(a);
      else alarms[timerIdx[idx]] = a;
      require("sched").setAlarms(alarms);
      require("sched").reload();
      drawTimers();
    },
    "Enabled": {
      value: a.on,
      onchange: v => {
        delete a.last;
        a.on = v;
      }
    },
    "Hours": {
      value: t.hrs, min: 0, max: 23, wrap: true,
      onchange: v => {
        t.hrs = v;
        a.timer = encodeTime(t);
      }
    },
    "Minutes": {
      value: t.mins, min: 0, max: 59, wrap: true,
      onchange: v => {
        t.mins = v;
        a.timer = encodeTime(t);
      }
    },
    "Seconds": {
      value: t.secs, min: 0, max: 59, wrap: true,
      onchange: v => {
        t.secs = v;
        a.timer = encodeTime(t);
      }
    },
    "Hard Mode": {
      value: a.data.hm,
      onchange: v => setHM(a, v),
    },
    "Vibrate": require("buzz_menu").pattern(a.vibrate, v => a.vibrate = v),
    "Delete After Expiration": {
      value: !!a.del,
      onchange: v => a.del = v
    },
    "Msg": {
      value: !a.msg ? "" : a.msg.length > 6 ? a.msg.substring(0, 6)+"..." : a.msg,
      //menu glitch? setTimeout required here
      onchange: () => {
        const kbapp = require("Storage").read("textinput");
        if (kbapp != undefined) setTimeout(editMsg, 0, idx, a);
        else setTimeout(kbAlert, 0);
      }
    },
    "Cancel": () => {
      if (idx >= 0) timerMenu(idx);
      else drawTimers();
    },
  };

  E.showMenu(menu);
  setUI();
}

function readJson() {
  let json = require("Storage").readJSON("multitimer.json", true) || {};

  if (Array.isArray(json)) {
    // old format, convert
    json = { sw: json };
    require("Storage").writeJSON("multitimer.json", json);
  }
  if (!json.sw) json.sw = [];

  return json;
}

function drawSw() {
  layer = 1;
  const sw = readJson().sw;

  function updateTimers(idx) {
    if (!timerInt1[idx]) timerInt1[idx] = setTimeout(function() {
      s.drawItem(idx+1);
      if (!timerInt2[idx]) timerInt2[idx] = setInterval(function(){
        s.drawItem(idx+1);
      }, 1000);
    }, 1000 - (sw[idx].t % 1000));
  }

  const s = E.showScroller({
    h : 40, c : sw.length+2,
    back : function() {load();},
    draw : (idx, r) => {

      function drawMenuItem(a) {
        let msg;
        g.setClipRect(R.x,R.y,R.x2,R.y2);
        if (idx > 0 && sw[idx-1].msg) msg = "\n"+(sw[idx-1].msg.length > 10 ?
          sw[idx-1].msg.substring(0, 10)+"..." : sw[idx-1].msg);
        else msg = "";
        return g.setColor(g.theme.bg2).fillRect({x:r.x+4,y:r.y+2,w:r.w-8, h:r.h-4, r:5})
        .setColor(g.theme.fg2).setFont("6x8:2").setFontAlign(-1,0).drawString(a+msg,r.x+12,r.y+(r.h/2));
      }

      if (idx == 0) {
        drawMenuItem("+ New Chrono");
      }
      if (idx == sw.length+1) {
        g.setColor(g.theme.bg).fillRect({x:r.x+4,y:r.y+2,w:r.w-8, h:r.h-4, r:5})
        .setColor(g.theme.fg).setFont("6x8:2").setFontAlign(0,0).drawString("<   Swipe   >",r.x+(r.w/2),r.y+(r.h/2));
      }
      else if (idx > 0 && idx < sw.length+1) {
        if (sw[idx-1].on == true) {
          drawMenuItem(formatTime(Date.now()-sw[idx-1].t));
          updateTimers(idx-1);
        }
        else drawMenuItem(formatTime(sw[idx-1].t));
      }
    },
    select : (idx) => {
      clearInt();
      if (idx == 0) swMenu(sw.length);
      else if (idx > 0 && idx < sw.length+1) swMenu(idx-1);
    }
  });
  setUI();
}

function swMenu(idx, a) {
  layer = -1;
  const json = readJson();
  const sw = json.sw;
  if (sw[idx]) a = sw[idx];
  else {
    a = {"t" : 0, "on" : false, "msg" : ""};
    sw[idx] = a;
    require("Storage").writeJSON("multitimer.json", json);
  }

  function updateTimer() {
    if (timerInt1[0] == undefined) timerInt1[0] = setTimeout(function() {
      s.drawItem(0);
      if (timerInt2[0] == undefined) timerInt2[0] = setInterval(function(){
        s.drawItem(0);
      }, 100);
    }, 100 - (a.t % 100));
  }

  function editMsg(idx, a) {
    g.clear();
    const msg = a.msg;
    require("textinput").input({text:msg}).then(result => {
    if (result != "") {
      a.msg = result;
    }
    else delete a.msg;
    sw[idx] = a;
    require("Storage").writeJSON("multitimer.json", json);
    swMenu(idx, a);
    });
  }

  function kbAlert() {
    E.showAlert("Must install keyboard app").then(function() {
      swMenu(idx, a);
    });
    setUI();
  }

  const s = E.showScroller({
    h : 40, c : 5,
    back : function() {
      clearInt();
      drawSw();
    },
    draw : (i, r) => {

      function drawMenuItem(b) {
        return g.setClipRect(R.x,R.y,R.x2,R.y2).setColor(g.theme.bg2)
          .fillRect({x:r.x+4,y:r.y+2,w:r.w-8, h:r.h-4, r:5})
          .setColor(g.theme.fg2).setFont("6x8:2").setFontAlign(-1,0).drawString(b,r.x+12,r.y+(r.h/2));
      }

      if (i == 0) {
        let msg;
        if (a.msg) msg = "\n"+(a.msg.length > 10 ? a.msg.substring(0, 10)+"..." : a.msg);
        else msg = "";
        if (a.on == true) {
          drawMenuItem(formatTimeDecis(Date.now()-a.t)+msg);
          updateTimer();
        }
        else {
          clearInt();
          drawMenuItem(formatTimeDecis(a.t)+msg);
        }
      }
      if (i == 1) {
        if (a.on == true) drawMenuItem("Pause");
        else drawMenuItem("Start");
      }
      if (i == 2) drawMenuItem("Reset");
      if (i == 3) drawMenuItem("Msg");
      if (i == 4) drawMenuItem("Delete");
    },
    select : (i) => {

      function saveAndReload() {
        require("Storage").writeJSON("multitimer.json", json);
        s.draw();
      }

      //pause/start
      if (i == 1) {
        if (a.on == true) {
          clearInt();
          a.t = Date.now()-a.t;
          a.on = false;
          sw[idx] = a;
          saveAndReload();
        }
        else {
          a.t == 0 ? a.t = Date.now() : a.t = Date.now()-a.t;
          a.on = true;
          sw[idx] = a;
          saveAndReload();
        }
      }
      //reset
      if (i == 2) {
        clearInt();
        a.t = 0;
        if (a.on == true) a.on = false;
        saveAndReload();
      }
      //edit message
      if (i == 3) {
        clearInt();
        const kbapp = require("Storage").read("textinput");
        if (kbapp != undefined) editMsg(idx, a);
        else kbAlert();
      }
      //delete
      if (i == 4) {
        clearInt();
        sw.splice(idx, 1);
        saveAndReload();
        drawSw();
      }
    }
  });
  setUI();
}

function drawAlarms() {
  layer = 2;
  const alarms = require("sched").getAlarms().filter(a => !a.timer);

  E.showScroller({
    h : 40, c : alarms.length+2,
    back : function() {load();},
    draw : (idx, r) => {

      function drawMenuItem(a) {
        g.setClipRect(R.x,R.y,R.x2,R.y2);
        let on = "";
        let dow = "";
        if (idx > 0 && alarms[idx-1].on == true) on = " - on";
        else if (idx > 0 && alarms[idx-1].on == false) on = " - off";
        if (idx > 0 && idx < alarms.length+1) dow = "\n"+"SMTWTFS".split("").map((d,n)=>alarms[idx-1].dow&(1<<n)?d:".").join("");
        return g.setColor(g.theme.bg2).fillRect({x:r.x+4,y:r.y+2,w:r.w-8, h:r.h-4, r:5})
        .setColor(g.theme.fg2).setFont("6x8:2").setFontAlign(-1,0).drawString(a+on+dow,r.x+12,r.y+(r.h/2));
      }

      if (idx == 0) {
        drawMenuItem("+ New Alarm");
      }
      if (idx == alarms.length+1) {
        g.setColor(g.theme.bg).fillRect({x:r.x+4,y:r.y+2,w:r.w-8, h:r.h-4, r:5})
        .setColor(g.theme.fg).setFont("6x8:2").setFontAlign(0,0).drawString("<   Swipe   >",r.x+(r.w/2),r.y+(r.h/2));
      }
      else if (idx > 0 && idx < alarms.length+1){
        const str = formatTime(alarms[idx-1].t);
        drawMenuItem(str.slice(0, -3));
      }
    },
    select : (idx) => {
      clearInt();
      if (idx == 0) editAlarm(-1);
      else if (idx > 0 && idx < alarms.length+1) editAlarm(idx-1);
    }
  });
  setUI();
}

function editDOW(dow, onchange) {
  const menu = {
    '': { 'title': 'Days of Week' },
    '< Back' : () => onchange(dow)
  };
  for (let i = 0; i < 7; i++) (i => {
    const dayOfWeek = require("locale").dow({ getDay: () => i });
    menu[dayOfWeek] = {
      value: !!(dow&(1<<i)),
      onchange: v => v ? dow |= 1<<i : dow &= ~(1<<i),
    };
  })(i);
  E.showMenu(menu);
  setUI();
}

function editAlarm(idx, a) {
  layer = -1;
  const alarms = require("sched").getAlarms();
  const alarmIdx = [];
  for (let i = 0; i < alarms.length; i++) {
    if (!alarms[i].timer) {
      alarmIdx.push(i);
    }
  }
  if (!a) {
    if (idx >= 0) a = alarms[alarmIdx[idx]];
    else a = require("sched").newDefaultAlarm();
  }
  if (!a.data) {
    a.data = { hm: false };
  }
  const t = decodeTime(a.t);

  function editMsg(idx, a) {
    let msg;
    g.clear();
    idx < 0 ? msg = "" : msg = a.msg;
    require("textinput").input({text:msg}).then(result => {
    if (result != "") {
      a.msg = result;
    }
    else delete a.msg;
    editAlarm(idx, a);
    });
  }

  function kbAlert() {
    E.showAlert("Must install keyboard app").then(function() {
      editAlarm(idx, a);
    });
    setUI();
  }

  const menu = {
    "": { "title": "Alarm" },
    "< Back": () => {
      if (idx >= 0) alarms[alarmIdx[idx]] = a;
      else alarms.push(a);
      require("sched").setAlarms(alarms);
      require("sched").reload();
      drawAlarms();
    },
    "Enabled": {
      value: a.on,
      onchange: v => {
        delete a.last;
        a.on = v;
      }
    },
    "Hours": {
      value: t.hrs, min: 0, max: 23, wrap: true,
      onchange: v => {
        t.hrs = v;
        a.t = encodeTime(t);
      }
    },
    "Minutes": {
      value: t.mins, min: 0, max: 59, wrap: true,
      onchange: v => {
        t.mins = v;
        a.t = encodeTime(t);
      }
    },
    "Repeat": {
      value: a.rp,
      onchange: v => a.rp = v
    },
    "Days": {
      value: "SMTWTFS".split("").map((d,n)=>a.dow&(1<<n)?d:".").join(""),
      onchange: () => editDOW(a.dow, d=>{a.dow=d;editAlarm(idx,a);})
    },
    "Hard Mode": {
      value: a.data.hm,
      onchange: v => setHM(a, v),
    },
    "Vibrate": require("buzz_menu").pattern(a.vibrate, v => a.vibrate = v),
    "Delete After Expiration": {
      value: !!a.del,
      onchange: v => a.del = v
    },
    "Auto Snooze": {
      value: a.as,
      onchange: v => a.as = v
    },
    "Msg": {
      value: !a.msg ? "" : a.msg.length > 6 ? a.msg.substring(0, 6)+"..." : a.msg,
      //menu glitch? setTimeout required here
      onchange: () => {
        const kbapp = require("Storage").read("textinput");
        if (kbapp != undefined) setTimeout(editMsg, 0, idx, a);
        else setTimeout(kbAlert, 0);
      }
    },
    "Delete": () => {
      if (idx >= 0) {
        alarms.splice(alarmIdx[idx], 1);
        require("sched").setAlarms(alarms);
        require("sched").reload();
      }
      drawAlarms();
    },
  };

  E.showMenu(menu);
  setUI();
}

function setUI() {
  // E.showMenu/E.showScroller/E.showAlert call setUI, so we register onDrag() separately
  // and tack on uiRemove after the fact to avoid interfering
  Bangle.on("drag", onDrag);
  const origRemove = Bangle.uiRemove;
  Bangle.uiRemove = () => {
    Bangle.removeListener("drag", onDrag);
    Object.values(timerInt1).forEach(clearTimeout);
    Object.values(timerInt2).forEach(clearTimeout);
    if (origRemove) origRemove();
  };
}

function onDrag(e) {
  if (layer < 0) return;
  if (!drag) { // start dragging
    drag = {x: e.x, y: e.y};
  }
  else if (!e.b) { // released
    const dx = e.x-drag.x, dy = e.y-drag.y;
    drag = null;
    if (dx == 0) return;
    //horizontal swipes
    if (Math.abs(dx)>Math.abs(dy)+10) {
      //swipe left
      if (dx<0) layer == 2 ? layer = 0 : layer++;
      //swipe right
      if (dx>0) layer == 0 ? layer = 2 : layer--;
      clearInt();
      if (layer == 0) drawTimers();
      else if (layer == 1) drawSw();
      else if (layer == 2) drawAlarms();
    }
  }
}

switch (readJson().initialScreen) {
  case 1:
    drawSw();
    break;
  case 2:
    drawAlarms();
    break;
  case 0:
  case undefined:
  default:
    drawTimers();
    break;
}
}
