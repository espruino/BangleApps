Array.prototype.sample = function(){
  return this[Math.floor(Math.random()*this.length)];
};

{
const SETTINGS_FILE = "mosaic.settings.json";
let settings;
let theme;
let timeout = 60;
let drawTimeout;
let colours = [
  '#f00', '#00f', '#0f0', '#ff0', '#f0f', '#0ff',
  '#8f0', '#f08', '#f80', '#80f', '#0f8', '#08f',
];
let digits = [
  E.toArrayBuffer(atob("BQcB/Gtax+A=")),
  E.toArrayBuffer(atob("BQeCAX9c1zXNc1zX9A==")),
  E.toArrayBuffer(atob("BQcB/Hsbx+A=")),
  E.toArrayBuffer(atob("BQcB/Hsex+A=")),
  E.toArrayBuffer(atob("BQeCAf/zPM8D/Nc1/A==")),
  E.toArrayBuffer(atob("BQcB/G8ex+A=")),
  E.toArrayBuffer(atob("BQcB/G8ax+A=")),
  E.toArrayBuffer(atob("BQeCAf/wP81zXNc1/A==")),
  E.toArrayBuffer(atob("BQcB/Gsax+A=")),
  E.toArrayBuffer(atob("BQcB/Gsex+A="))
];

let loadSettings = function() {
  settings = require("Storage").readJSON(SETTINGS_FILE,1)|| {'showWidgets': false, 'theme':'System'};
}

let loadThemeColors = function() {
  theme = {fg: g.theme.fg, bg: g.theme.bg};
  if (settings.theme === "Dark") {
    theme.fg = g.toColor(1,1,1);
    theme.bg = g.toColor(0,0,0);
  }
  else if (settings.theme === "Light") {
    theme.fg = g.toColor(0,0,0);
    theme.bg = g.toColor(1,1,1);
  }
}

let queueDraw = function(seconds) {
  let millisecs = seconds * 1000;
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, millisecs - (Date.now() % millisecs));
}

let draw = function() {
  // draw colourful grid
  for (let i_x = 0; i_x < num_squares_w; i_x++) {
    for (let i_y = 0; i_y < num_squares_h; i_y++) {
      g.setColor(colours.sample()).fillRect(
        o_w+i_x*s, o_h+i_y*s, o_w+i_x*s+s, o_h+i_y*s+s
      );
    }
  }
  let t = require("locale").time(new Date(), 1);
  let hour = parseInt(t.split(":")[0]);
  let minute = parseInt(t.split(":")[1]);
  g.setBgColor(theme.fg);
  g.setColor(theme.bg);
  g.drawImage(digits[Math.floor(hour/10)], (mid_x-5)*s+o_w, (mid_y-7)*s+o_h, {scale:s});
  g.drawImage(digits[hour % 10], (mid_x+1)*s+o_w, (mid_y-7)*s+o_h, {scale:s});
  g.drawImage(digits[Math.floor(minute/10)], (mid_x-5)*s+o_w, (mid_y+1)*s+o_h, {scale:s});
  g.drawImage(digits[minute % 10], (mid_x+1)*s+o_w, (mid_y+1)*s+o_h, {scale:s});

  queueDraw(timeout);
}

g.clear();
loadSettings();
loadThemeColors();

const offset_widgets = settings.showWidgets ? 24 : 0;
let available_height = g.getHeight() - offset_widgets;

// Calculate grid size and offsets
let s = Math.floor(available_height/17);
let num_squares_w = Math.round(g.getWidth()/s) - 1;
let num_squares_h = Math.round(available_height/s) - 1;
let o_w = Math.floor((g.getWidth() - num_squares_w * s)/2);
let o_h = Math.floor((g.getHeight() - num_squares_h * s+offset_widgets)/2);
let mid_x = Math.floor(num_squares_w/2);
let mid_y = Math.floor((num_squares_h-1)/2);

Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.setUI({
  mode : 'clock',
  remove : function() {
    // Called to unload all of the clock app
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    delete Array.prototype.sample;
    require('widget_utils').show(); // re-show widgets
  }
});

Bangle.loadWidgets();
if (settings.showWidgets) {
  Bangle.drawWidgets();
} else {
  require("widget_utils").swipeOn(); // hide widgets, make them visible with a swipe
}

draw();
}