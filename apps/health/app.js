function getSettings() {
  return require("Storage").readJSON("health.json",1)||{};
}

function setSettings(s) {
  require("Storage").writeJSON("health.json",s);
}

function menuMain() {
  E.showMenu({
    "":{title:"Health Tracking"},
    "< Back":()=>load(),
    "Step Counting":()=>menuStepCount(),
    "Movement":()=>menuMovement(),
    "Heart Rate":()=>menuHRM(),
    "Settings":()=>menuSettings()
  });
}

function menuSettings() {
  var s=getSettings();
  E.showMenu({
    "":{title:"Health Tracking"},
    "< Back":()=>menuMain(),
    "Heart Rt":{
      value : 0|s.hrm,
      min : 0, max : 2,
      format : v=>["Off","10 mins","Always"][v],
      onchange : v => { s.hrm=v;setSettings(s); }
    }
  });
}

function menuStepCount() {
  E.showMenu({
    "":{title:"Step Counting"},
    "< Back":()=>menuMain(),
    "per hour":()=>stepsPerHour(),
    "per day":()=>stepsPerDay()
  });
}

function menuMovement() {
  E.showMenu({
    "":{title:"Movement"},
    "< Back":()=>menuMain(),
    "per hour":()=>movementPerHour(),
    "per day":()=>movementPerDay(),
  });
}

function menuHRM() {
  E.showMenu({
    "":{title:"Heart Rate"},
    "< Back":()=>menuMain(),
    "per hour":()=>hrmPerHour(),
    "per day":()=>hrmPerDay(),
  });
}


function stepsPerHour() {
  E.showMessage("Loading...");
  var data = new Uint16Array(24);
  require("health").readDay(new Date(), h=>data[h.hr]+=h.steps);
  g.clear(1);
  Bangle.drawWidgets();
  g.reset();
  require("graph").drawBar(g, data, {
    y:24,
    miny: 0,
    axes : true,
    gridx : 6,
    gridy : 500
  });
  Bangle.setUI("updown", ()=>menuStepCount());
}

function stepsPerDay() {
  E.showMessage("Loading...");
  var data = new Uint16Array(31);
  require("health").readDailySummaries(new Date(), h=>data[h.day]+=h.steps);
  g.clear(1);
  Bangle.drawWidgets();
  g.reset();
  require("graph").drawBar(g, data, {
    y:24,
    miny: 0,
    axes : true,
    gridx : 5,
    gridy : 2000
  });
  Bangle.setUI("updown", ()=>menuStepCount());
}

function hrmPerHour() {
  E.showMessage("Loading...");
  var data = new Uint16Array(24);
  var cnt = new Uint8Array(23);
  require("health").readDay(new Date(), h=>{
    data[h.hr]+=h.bpm;
    if (h.bpm) cnt[h.hr]++;
  });
  data.forEach((d,i)=>data[i] = d/cnt[i]);
  g.clear(1);
  Bangle.drawWidgets();
  g.reset();
  require("graph").drawBar(g, data, {
    y:24,
    miny: 0,
    axes : true,
    gridx : 6,
    gridy : 20
  });
  Bangle.setUI("updown", ()=>menuHRM());
}

function hrmPerDay() {
  E.showMessage("Loading...");
  var data = new Uint16Array(31);
  var cnt = new Uint8Array(31);
  require("health").readDailySummaries(new Date(), h=>{
    data[h.day]+=h.bpm;
    if (h.bpm) cnt[h.day]++;
  });
  data.forEach((d,i)=>data[i] = d/cnt[i]);
  g.clear(1);
  Bangle.drawWidgets();
  g.reset();
  require("graph").drawBar(g, data, {
    y:24,
    miny: 0,
    axes : true,
    gridx : 5,
    gridy : 20
  });
  Bangle.setUI("updown", ()=>menuHRM());
}

function movementPerHour() {
  E.showMessage("Loading...");
  var data = new Uint16Array(24);
  require("health").readDay(new Date(), h=>data[h.hr]+=h.movement);
  g.clear(1);
  Bangle.drawWidgets();
  g.reset();
  require("graph").drawLine(g, data, {
    y:24,
    miny: 0,
    axes : true,
    gridx : 6,
    ylabel : null
  });
  Bangle.setUI("updown", ()=>menuMovement());
}

function movementPerDay() {
  E.showMessage("Loading...");
  var data = new Uint16Array(31);
  require("health").readDailySummaries(new Date(), h=>data[h.day]+=h.movement);
  g.clear(1);
  Bangle.drawWidgets();
  g.reset();
  require("graph").drawBar(g, data, {
    y:24,
    miny: 0,
    axes : true,
    gridx : 5,
    ylabel : null
  });
  Bangle.setUI("updown", ()=>menuMovement());
}

Bangle.loadWidgets();
Bangle.drawWidgets();
menuMain();
