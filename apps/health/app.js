let settings;
const myprofile = require("Storage").readJSON("myprofile.json",1)||{};

function menuMain() {
  E.showMenu({
    "": { title: /*LANG*/"Health Tracking" },
    /*LANG*/"< Back": () => load(),
    /*LANG*/"Step Counting": () => menuStepCount(),
    /*LANG*/"Movement": () => menuMovement(),
    /*LANG*/"Heart Rate": () => menuHRM(),
    /*LANG*/"Settings": () => eval(require("Storage").read("health.settings.js"))(()=>{loadSettings();menuMain();})
  });
}

function menuStepCount() {
  const menu = {
    "": { title:/*LANG*/"Steps" },
    /*LANG*/"< Back": () => menuMain(),
    /*LANG*/"per hour": () => stepsPerHour(menuStepCount),
    /*LANG*/"per day": () => stepsPerDay(menuStepCount)
  };
  if (myprofile.strideLength) {
      menu[/*LANG*/"distance"] = () => menuDistance();
  }

  E.showMenu(menu);
}

function menuDistance() {
  const distMult = 1*require("locale").distance(myprofile.strideLength, 2); // hackish: this removes the distance suffix, e.g. 'm'
  E.showMenu({
    "": { title:/*LANG*/"Distance" },
    /*LANG*/"< Back": () => menuStepCount(),
    /*LANG*/"per hour": () => stepsPerHour(menuDistance, distMult),
    /*LANG*/"per day": () => stepsPerDay(menuDistance, distMult)
  });
}

function menuMovement() {
  E.showMenu({
    "": { title:/*LANG*/"Movement" },
    /*LANG*/"< Back": () => menuMain(),
    /*LANG*/"per hour": () => movementPerHour(),
    /*LANG*/"per day": () => movementPerDay(),
  });
}

function menuHRM() {
  E.showMenu({
    "": { title:/*LANG*/"Heart Rate" },
    /*LANG*/"< Back": () => menuMain(),
    /*LANG*/"per hour": () => hrmPerHour(),
    /*LANG*/"per day": () => hrmPerDay(),
  });
}

function stepsPerHour(back, mult) {
  E.showMessage(/*LANG*/"Loading...");
  current_selection = "stepsPerHour";
  var data = new Uint16Array(24);
  require("health").readDay(new Date(), h=>data[h.hr]+=h.steps);
  if (mult !== undefined) {
    // Calculate distance from steps
    data.forEach((d, i) => data[i] = d*mult+0.5);
  }
  setButton(back, mult);
  barChart(/*LANG*/"HOUR", data, mult);
}

function stepsPerDay(back, mult) {
  E.showMessage(/*LANG*/"Loading...");
  current_selection = "stepsPerDay";
  var data = new Uint16Array(32);
  require("health").readDailySummaries(new Date(), h=>data[h.day]+=h.steps);
  // Include data for today
  if (data[(new Date()).getDate()] === 0) {
    data[(new Date()).getDate()] = Bangle.getHealthStatus("day").steps;
  }
  if (mult !== undefined) {
    // Calculate distance from steps
    data.forEach((d, i) => data[i] = d*mult+0.5);
  }
  setButton(back, mult);
  barChart(/*LANG*/"DAY", data, mult);
  drawHorizontalLine(settings.stepGoal * (mult || 1));
}

function hrmPerHour() {
  E.showMessage(/*LANG*/"Loading...");
  current_selection = "hrmPerHour";
  var data = new Uint16Array(24);
  var cnt = new Uint8Array(24);
  require("health").readDay(new Date(), h=>{
    data[h.hr]+=h.bpm;
    if (h.bpm) cnt[h.hr]++;
  });
  data.forEach((d,i)=>data[i] = d/cnt[i]+0.5);
  setButton(menuHRM);
  barChart(/*LANG*/"HOUR", data);
}

function hrmPerDay() {
  E.showMessage(/*LANG*/"Loading...");
  current_selection = "hrmPerDay";
  var data = new Uint16Array(32);
  var cnt = new Uint8Array(32);
  require("health").readDailySummaries(new Date(), h=>{
    data[h.day]+=h.bpm;
    if (h.bpm) cnt[h.day]++;
  });
  data.forEach((d,i)=>data[i] = d/cnt[i]+0.5);
  setButton(menuHRM);
  barChart(/*LANG*/"DAY", data);
}

function movementPerHour() {
  E.showMessage(/*LANG*/"Loading...");
  current_selection = "movementPerHour";
  var data = new Uint16Array(24);
  var cnt = new Uint8Array(24);
  require("health").readDay(new Date(), h=>{
    data[h.hr]+=h.movement;
    cnt[h.hr]++;
  });
  data.forEach((d,i)=>data[i] = d/cnt[i]+0.5);
  setButton(menuMovement);
  barChart(/*LANG*/"HOUR", data);
}

function movementPerDay() {
  E.showMessage(/*LANG*/"Loading...");
  current_selection = "movementPerDay";
  var data = new Uint16Array(32);
  var cnt = new Uint8Array(32);
  require("health").readDailySummaries(new Date(), h=>{
    data[h.day]+=h.movement;
    cnt[h.day]++;
  });
  data.forEach((d,i)=>data[i] = d/cnt[i]+0.5);
  setButton(menuMovement);
  barChart(/*LANG*/"DAY", data);
}

// Bar Chart Code
const w = g.getWidth();
const h = g.getHeight();
const bar_bot = 140;

var data_len;
var chart_index;
var chart_max_datum;
var chart_label;
var chart_data;
var current_selection;

// find the max value in the array, using a loop due to array size
function max(arr) {
  var m = -Infinity;
  for(var i=0; i< arr.length; i++)
    if(arr[i] > m) m = arr[i];
  return m;
}

// find the end of the data, the array might be for 31 days but only have 2 days of data in it
function get_data_length(arr) {
  var nlen = arr.length;
  for(var i = arr.length - 1; i > 0 && arr[i] == 0;  i--)
    nlen--;
  return nlen;
}

function barChart(label, dt) {
  data_len = get_data_length(dt);
  chart_index = Math.max(data_len - 5, -5);  // choose initial index that puts the last day on the end
  chart_max_datum = max(dt);                 // find highest bar, for scaling
  chart_label = label;
  chart_data = dt;
  drawBarChart();
}

function drawBarChart() {
  const bar_width = (w - 2) / 9;  // we want 9 bars, bar 5 in the centre
  var bar_top;
  var bar;
  g.reset().clearRect(0,24,w,h);

  for (bar = 1; bar < 10; bar++) {
    if (bar == 5) {
      g.setFont('6x8', 2).setFontAlign(0,-1).setColor(g.theme.fg);
      g.drawString(chart_label + " " + (chart_index + bar -1) + "   " + chart_data[chart_index + bar - 1], g.getWidth()/2, 150);
      g.setColor("#00f");
    } else {
      g.setColor("#0ff");
    }

    // draw a fake 0 height bar if chart_index is outside the bounds of the array
    if ((chart_index + bar - 1) >= 0 && (chart_index + bar - 1) < data_len && chart_max_datum > 0)
      bar_top = bar_bot - 100 * (chart_data[chart_index + bar - 1]) / chart_max_datum;
    else
      bar_top = bar_bot;

    g.fillRect( 1 + (bar - 1)* bar_width, bar_bot, 1 + bar*bar_width, bar_top);
    g.setColor(g.theme.fg).drawRect( 1 + (bar - 1)* bar_width, bar_bot, 1 + bar*bar_width, bar_top);
  }
}

function drawHorizontalLine(value) {
  const top = bar_bot - 100 * value / chart_max_datum;
  g.setColor(g.theme.fg).drawLine(0, top ,g.getWidth(), top);
}

function setButton(fn, mult) {
  Bangle.setUI({mode:"custom",
                back:fn,
                swipe:(lr,ud) => {
    if (lr == 1) {
      // HOUR data starts at index 0, DAY data starts at index 1
      chart_index = Math.max((chart_label == /*LANG*/"DAY") ? -3 : -4, chart_index - 1);
    } else if (lr<0) {
      chart_index = Math.min(data_len - 5, chart_index + 1);
    } else {
      return fn();
    }
    drawBarChart();
    if (current_selection == "stepsPerDay") {
      drawHorizontalLine(settings.stepGoal * (mult || 1));
    }
  }});
}

function loadSettings() {
  settings = require("Storage").readJSON("health.json",1)||{};
}

Bangle.loadWidgets();
Bangle.drawWidgets();
loadSettings();
menuMain();
