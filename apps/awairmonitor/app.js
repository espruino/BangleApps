Graphics.prototype.setFontMichroma36 = function() {
g.setFontCustom(atob("AAAAAAAAAAAAAAAAeAAAAAeAAAAAeAAAAAeAAAAAAAAAAAAAAAAAAAAAAAGAAAAA+AAAAD+AAAAP+AAAA/8AAAD/wAAAf/AAAB/4AAAH/gAAAf+AAAB/4AAAH/gAAAf+AAAAfwAAAAfAAAAAcAAAAAAAAAAAAAAAAAAAAAAAA///AAD///wAH///4AP///8APwAD+APAAAeAeAAAeAeAAAPAeAAAPAeAAAPAeAAAPAeAAAPAeAAAPAeAAAPAeAAAPAeAAAPAeAAAPAeAAAPAeAAAPAeAAAPAeAAAPAeAAAPAeAAAPAeAAAPAeAAAPAeAAAeAPAAAeAPwAD+AP///8AH///4AD///wAA///AAAAAAAAAAAAAAAAAAAAAEAAAAAOAAAAAfAAAAA+AAAAB8AAAAD8AAAAH4AAAAPwAAAAPgAAAAfAAAAAf///+Af///+Af///+Af///+AAAAAAAAAAAAAAAAAAAAAAAAAA/Af+AD/A/+AH/B/+AP/D/+APwD4eAPADweAfADweAeADweAeADweAeADweAeAHgeAeAHgeAeAHgeAeAHgeAeAHgeAeAHgeAeAHgeAeAHgeAeAHgeAeAHgeAeAPgeAeAPAeAeAPAeAeAPAeAeAPAeAfAPAeAPw/AeAP/+AeAH/+AeAD/8AeAB/wAOAAAAAAAAAAAAAAAAAAAAAAAAAB8APgAD8AP4AH8AP8AP8AP8APgAB+AfAAAeAeAAAeAeAAAPAeAAAPAeAAAPAeAAAPAeAeAPAeAeAPAeAeAPAeAeAPAeAeAPAeAeAPAeAeAPAeAeAPAeAeAPAeAeAPAeAeAPAeAeAPAeAeAPAeAeAeAfAeAeAPx/h+AP///+AH///8AD///4AB/h/gAAAAAAAAAAAAAAAAAAAAAAeAAAAA/AAAAA/AAAAB/AAAAD/AAAAH/AAAAPvAAAAPPAAAAfPAAAA+PAAAB8PAAAD4PAAADwPAAAHwPAAAPgPAAAfAPAAA+APAAA8APAAB8APAAD4APAAHwAPAAPgAPAAPAAPAAfAAPAAf///+Af///+Af///+Af///+AAAAPAAAAAPAAAAAPAAAAAPAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAf/8PgAf/8P4Af/8P8Af/8P8AeB4A+AeB4AeAeDwAeAeDwAPAeDwAPAeDwAPAeDwAPAeDwAPAeDwAPAeDwAPAeDwAPAeDwAPAeDwAPAeDwAPAeDwAPAeDwAPAeDwAPAeDwAPAeDwAPAeDwAfAeDwAeAeD4A+AeD+D+AeB//8AeB//4AeA//4AAAP/AAAAAAAAAAAAAAAAAAAAAAAAAAA///AAD///wAH///4AH///8AP4fB+APAeAeAfA8AeAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAfA8APAPA+AeAPgeAeAP8fh+AH8f/8AD8P/8AA8H/4AAAB/gAAAAAAAAAAAAAAAAAAAAAAAAAeAAAAAeAAAAAeAAAAAeAAAAAeAAAAAeAAACAeAAAGAeAAAOAeAAAeAeAAA+AeAAD+AeAAH8AeAAP4AeAAfwAeAA/gAeAB/AAeAD+AAeAP4AAeAfwAAeA/gAAeB/AAAeD+AAAeH8AAAefwAAAe/gAAAf/AAAAf+AAAAf8AAAAf4AAAAfgAAAAfAAAAAAAAAAAAAAAAAAAAAAAAAAMAAB+B/wAD/j/4AH/3/8AP///+AP//A+AfB+AeAeA+AeAeA+APAeA+APAeA+APAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAeA8APAeA+APAeA+APAeA+APAeA+AOAeA+AeAPh/A+AP///+AP/3/8AH/3/8AB/D/wAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAA/wAAAD/4HAAH/8HwAP/+H4AP5/H8AfAfA8AeAPAeAeAPAeAeAPAeAeAHgfAeAHgPAeAHgPAeAHgPAeAHgPAeAHgPAeAHgPAeAHgPAeAHgPAeAHgPAeAHgPAeAHgPAeAHgPAeAHAPAeAPAOAeAPAeAPAPAeAPwfB+AP///8AH///4AD///wAA///AAAAAAAAAAAAAAAAAAAAAAAAAAAB8DwAAB8HwAAB8HwAAB8DwAAAAAAAAAAAAA"), 46, atob("CBIkESMjJCMjIyMjCA=="), 36+(1<<8)+(1<<16));
};

var drawTimeout;

function queueNextDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 1000 - (Date.now() % 1000));
}

var locale = require("locale");

var bt_current_co2 = 0;
var bt_current_voc = 0;
var bt_current_pm25 = 0;
var bt_current_humi = 0;
var bt_current_temp = 0;
var bt_last_update = 0;

var last_update = 0;
var bt_co2_history = new Array(10).fill(0);
var bt_voc_history = new Array(10).fill(0);
var bt_pm25_history = new Array(10).fill(0);
var bt_humi_history = new Array(10).fill(0);
var bt_temp_history = new Array(10).fill(0);

var internal_last_update = -1;

var display_frozen = false;

function draw() {
  g.reset().clearRect(0,24,g.getWidth(),g.getHeight());

  var date = new Date();
  g.setFontAlign(0,0);
  g.setFont("Michroma36").drawString(locale.time(date,1), g.getWidth()/2, 56);

  g.setFont("6x8");
  g.drawString(locale.date(new Date(),1), g.getWidth()/2, 80);

  g.setFont("6x8");
  g.drawString("CO2", 20, 100);
  g.drawString("VOC", 55, 100);
  g.drawString("PM25", 90, 100);
  g.drawString("Humi", 125, 100);
  g.drawString("Temp", 160, 100);

  if (last_update != bt_last_update) {
    display_frozen = false;
    last_update = bt_last_update;
    internal_last_update = last_update;
    if (last_update % 10 == 0) {
      bt_co2_history.shift(); bt_co2_history.push(bt_current_co2);
      bt_voc_history.shift(); bt_voc_history.push(bt_current_voc);
      bt_pm25_history.shift(); bt_pm25_history.push(bt_current_pm25);
      bt_humi_history.shift(); bt_humi_history.push(bt_current_humi);
      bt_temp_history.shift(); bt_temp_history.push(bt_current_temp);
    }
  }

  if (internal_last_update == -1) {
    g.drawString("Waiting for connection", 88, 164);
  } else if ((internal_last_update > last_update + 5) && (internal_last_update < last_update + 60)) {
    g.drawString("Trying to reconnect since " + (internal_last_update - last_update), 88, 164);
  } else if (internal_last_update > last_update + 5) {
    display_frozen = true;
    g.drawString("Waiting for connection", 88, 164);
  }

  if (display_frozen) { g.setColor("#888"); }

  g.setFont("HaxorNarrow7x17");
  g.drawString(""+bt_current_co2, 18, 110);
  g.drawString(""+bt_current_voc, 53, 110);
  g.drawString(""+bt_current_pm25, 88, 110);
  g.drawString(""+bt_current_humi, 123, 110);
  g.drawString(""+bt_current_temp, 158, 110);

  for (let i = 0; i < 10; i++) {
    if (display_frozen) { g.setColor("#888"); }

    // max height = 32
    g.drawLine(10+i*2, 150-(Math.min(Math.max(bt_co2_history[i],400), 1200)-400)/25, 10+i*2, 150);
    g.drawLine(45+i*2, 150-(Math.min(Math.max(bt_voc_history[i],0), 1440)-0)/45, 45+i*2, 150);
    g.drawLine(80+i*2, 150-(Math.min(Math.max(bt_pm25_history[i],0), 32)-0)/1, 80+i*2, 150);
    g.drawLine(115+i*2, 150-(Math.min(Math.max(bt_humi_history[i],20), 60)-20)/1.25, 115+i*2, 150);
    g.drawLine(150+i*2, 150-(Math.min(Math.max(bt_temp_history[i],19), 27)-19)*4, 150+i*2, 150);

    // target humidity level
    g.setColor("#00F").drawLine(115, 150-(40-20)/1.25, 115+18, 150-(40-20)/1.25);
    g.reset();
  }

  if (internal_last_update != -1) { internal_last_update++; }
  queueNextDraw();
}

// init
Bangle.setUI("clock");
require("FontHaxorNarrow7x17").add(Graphics);
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
draw();
