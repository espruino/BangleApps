function menuMain() {
  E.showMenu({
    "":{title:"Health Tracking"},
    "< Back":()=>load(),
    "Step Counting":()=>menuStepCount(),
    "Movement":()=>menuMovement()
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
  var data = new Uint16Array(24);
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
  Bangle.setUI("updown", ()=>menuStepCount());
}

function movementPerDay() {
  E.showMessage("Loading...");
  var data = new Uint16Array(24);
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
  Bangle.setUI("updown", ()=>menuStepCount());
}

Bangle.loadWidgets();
Bangle.drawWidgets();
menuMain();
