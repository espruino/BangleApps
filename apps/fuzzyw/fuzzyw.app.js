// adapted from https://github.com/hallettj/Fuzzy-Text-International/
const fuzzy_strings = require("Storage").readJSON("fuzzy_strings.json");

const SETTINGS_FILE = "fuzzyw.settings.json";
let settings = require("Storage").readJSON(SETTINGS_FILE,1)|| {'language': 'System', 'alignment':'Centre'};

if (settings.language == 'System') {
  settings.language = require('locale').name;
}

let fuzzy_string = fuzzy_strings[settings.language];

let timeout = 2.5*60;
let drawTimeout;

function queueDraw(seconds) {
  let millisecs = seconds * 1000;
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, millisecs - (Date.now() % millisecs));
}

const h = g.getHeight();
const w = g.getWidth();
let align_mode = 0;
let align_pos = w/2;
if (settings.alignment =='Left') {
  align_mode = -1;
  align_pos = 0;
} else if (settings.alignment == 'Right') {
  align_mode = 1;
  align_pos = w;
}

function getTimeString(date) {
  let segment = Math.round((date.getMinutes()*60 + date.getSeconds() + 1)/300);
  let hour = date.getHours() + Math.floor(segment/12);
  f_string = fuzzy_string.minutes[segment % 12];
  if (f_string.includes('$1')) {
    f_string = f_string.replace('$1', fuzzy_string.hours[(hour) % 24]);
  } else {
    f_string = f_string.replace('$2', fuzzy_string.hours[(hour + 1) % 24]);
  }
    return f_string;
}

function draw() {
  let time_string = getTimeString(new Date()).replace('*', '');
  // print(time_string);
  g.setFont('Vector', (h-24*2)/fuzzy_string.text_scale);
  g.setFontAlign(align_mode, 0);
  g.clearRect(0, 24, w, h-24);
  g.setColor(g.theme.fg);
  g.drawString(g.wrapString(time_string, w).join("\n"), align_pos, h/2);
  queueDraw(timeout);
}

g.clear();
draw();

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.setUI('clock');
Bangle.loadWidgets();
Bangle.drawWidgets();
