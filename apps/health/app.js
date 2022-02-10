function getSettings() {
  return require("Storage").readJSON("health.json",1)||{};
}

function setSettings(s) {
  require("Storage").writeJSON("health.json",s);
}

function menuMain() {
  swipe_enabled = false;
  clearButton();
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
  swipe_enabled = false;
  clearButton();
  var s=getSettings();
  E.showMenu({
    "":{title:"Health Tracking"},
    "< Back":()=>menuMain(),
    "Heart Rt":{
      value : 0|s.hrm,
      min : 0, max : 3,
      format : v=>["Off","3 mins","10 mins","Always"][v],
      onchange : v => { s.hrm=v;setSettings(s); }
    }
  });
}

function menuStepCount() {
  swipe_enabled = false;
  clearButton();
  E.showMenu({
    "":{title:"Step Counting"},
    "< Back":()=>menuMain(),
    "per hour":()=>stepsPerHour(),
    "per day":()=>stepsPerDay()
  });
}

function menuMovement() {
  swipe_enabled = false;
  clearButton();
  E.showMenu({
    "":{title:"Movement"},
    "< Back":()=>menuMain(),
    "per hour":()=>movementPerHour(),
    "per day":()=>movementPerDay(),
  });
}

function menuHRM() {
  swipe_enabled = false;
  clearButton();
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
  setButton(menuStepCount);
  barChart("HOUR", data);
}

function stepsPerDay() {
  E.showMessage("Loading...");
  var data = new Uint16Array(31);
  require("health").readDailySummaries(new Date(), h=>data[h.day]+=h.steps);
  g.clear(1);
  Bangle.drawWidgets();
  g.reset();
  setButton(menuStepCount);
  barChart("DAY", data);
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
  setButton(menuHRM);
  barChart("HOUR", data);
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
  setButton(menuHRM);
  barChart("DAY", data);
}

function movementPerHour() {
  E.showMessage("Loading...");
  var data = new Uint16Array(24);
  require("health").readDay(new Date(), h=>data[h.hr]+=h.movement);
  g.clear(1);
  Bangle.drawWidgets();
  g.reset();
  setButton(menuMovement);
  barChart("HOUR", data);
}

function movementPerDay() {
  E.showMessage("Loading...");
  var data = new Uint16Array(31);
  require("health").readDailySummaries(new Date(), h=>data[h.day]+=h.movement);
  g.clear(1);
  Bangle.drawWidgets();
  g.reset();
  setButton(menuMovement);
  barChart("DAY", data);
}

// Bar Chart Code

const w = g.getWidth();
const h = g.getHeight();

var data_len;
var chart_index;
var chart_max_datum;
var chart_label;
var chart_data;
var swipe_enabled = false;
var btn;

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
  swipe_enabled = true;
}

function drawBarChart() {
  const bar_bot = 140;
  const bar_width = (w - 2) / 9;  // we want 9 bars, bar 5 in the centre
  var bar_top;
  var bar;
  
  g.setColor(g.theme.bg);
  g.fillRect(0,24,w,h);
  
  for (bar = 1; bar < 10; bar++) {
    if (bar == 5) {
      g.setFont('6x8', 2);
      g.setFontAlign(0,-1)
      g.setColor(g.theme.fg);
      g.drawString(chart_label + " " + (chart_index + bar -1) + "   " + chart_data[chart_index + bar - 1], g.getWidth()/2, 150);
      g.setColor("#00f");
    } else {
      g.setColor("#0ff");
    }

    // draw a fake 0 height bar if chart_index is outside the bounds of the array
    if ((chart_index + bar - 1) >= 0 && (chart_index + bar - 1) < data_len) 
      bar_top = bar_bot - 100 * (chart_data[chart_index + bar - 1]) / chart_max_datum;
    else
      bar_top = bar_bot;

    g.fillRect( 1 + (bar - 1)* bar_width, bar_bot, 1 + bar*bar_width, bar_top);
    g.setColor(g.theme.fg);
    g.drawRect( 1 + (bar - 1)* bar_width, bar_bot, 1 + bar*bar_width, bar_top);
  }
}

function next_bar() {
  chart_index = Math.min(data_len - 5, chart_index + 1);
}

function prev_bar() {
  // HOUR data starts at index 0, DAY data starts at index 1
  chart_index = Math.max((chart_label == "DAY") ? -3 : -4, chart_index - 1);
}

Bangle.on('swipe', dir => {
  if (!swipe_enabled) return;
  if (dir == 1) prev_bar(); else next_bar();
  drawBarChart();
});

// use setWatch() as Bangle.setUI("updown",..) interacts with swipes
function setButton(fn) {
  // cancel callback, otherwise a slight up down movement will show the E.showMenu()
  Bangle.setUI("updown", undefined);
  
  if (process.env.HWVERSION == 1)
    btn = setWatch(fn, BTN2);
  else
    btn = setWatch(fn, BTN1);
}

function clearButton() {
  if (btn !== undefined) {
    clearWatch(btn);
    btn = undefined;
  }
}

Bangle.loadWidgets();
Bangle.drawWidgets();
menuMain();
