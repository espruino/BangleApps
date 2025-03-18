{
// Berlin Clock see https://en.wikipedia.org/wiki/Mengenlehreuhr
// https://github.com/eska-muc/BangleApps

var settings = require('Storage').readJSON("berlinc.json", true) || {};
const fields = [4, 4, 11, 4];

let fullscreen = !!settings.fullscreen;

let show_date = false;
let show_time = false;

let rowlights = [];
let time_digit = [];

// timeout used to update every minute
let drawTimeout;

// schedule a draw for the next minute
let queueDraw = () => {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
};

let draw = () => {
  let width = Math.min(Bangle.appRect.w,Bangle.appRect.h);
  let height = width;
  let offset = g.getHeight() - height;
  let x = Math.floor((g.getWidth() - width)/2);

  if (show_date) height -= 8;
  let rowHeight = (height - 1) / 4;
  g.setBgColor(g.theme.bg);
  g.reset().clearRect(Bangle.appRect);
  var now = new Date();

  // show date below the clock
  if (show_date) {
    var yr = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var dateString = `${yr}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
    var strWidth = g.stringWidth(dateString);
    g.setColor(g.theme.fg).setFontAlign(-1,-1);
    g.drawString(dateString, ( Bangle.appRect.x + Bangle.appRect.w - strWidth ) / 2, Bangle.appRect.y2 - 5);
  }

  rowlights[0] = Math.floor(now.getHours() / 5);
  rowlights[1] = now.getHours() % 5;
  rowlights[2] = Math.floor(now.getMinutes() / 5);
  rowlights[3] = now.getMinutes() % 5;

  time_digit[0] = Math.floor(now.getHours() / 10);
  time_digit[1] = now.getHours() % 10;
  time_digit[2] = Math.floor(now.getMinutes() / 10);
  time_digit[3] = now.getMinutes() % 10;

  g.setColor(g.theme.fg);
  g.drawRect(x, offset, x + width - 1, height + offset - 1);
  for (row = 0; row < 4; row++) {
    nfields = fields[row];
    boxWidth = (width - 1) / nfields;

    for (col = 0; col < nfields; col++) {
      x1 = col * boxWidth + x;
      y1 = row * rowHeight + offset;
      x2 = (col + 1) * boxWidth + x;
      y2 = (row + 1) * rowHeight + offset;

      g.setColor(g.theme.fg).drawRect(x1, y1, x2, y2);
      if (col < rowlights[row]) {
        if (row === 2) {
          if (((col + 1) % 3) === 0) {
            g.setColor(1, 0, 0);
          } else {
            g.setColor(1, 1, 0);
          }
        } else {
          g.setColor(1, 0, 0);
        }
        g.fillRect(x1 + 2, y1 + 2, x2 - 2, y2 - 2);
      }
      if (row == 3 && show_time) {
        g.setColor(g.theme.fg).setFontAlign(0,0);
        g.drawString(time_digit[col],(x1+x2)/2,(y1+y2)/2);
      }
    }
  }

  queueDraw();
}

let toggleDate = () => {
  show_date = ! show_date;
  draw();
}

let toggleTime = () => {
  show_time = ! show_time;
  draw();
}

let clear = () => {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
}

let onLcdPower = on => {
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    clear();
  }
}

let cleanup = () => {
  clear();
  Bangle.removeListener("lcdPower", onLcdPower);
  require("widget_utils").show();
}

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',onLcdPower);

// Show launcher when button pressed, handle up/down
Bangle.setUI({mode: "clockupdown", remove: cleanup}, dir=> {
  if (dir<0) toggleTime();
  if (dir>0) toggleDate();
});

g.clear();
Bangle.loadWidgets();

if (fullscreen){
  if (process.env.HWVERSION == 2) require("widget_utils").swipeOn();
  else require("widget_utils").hide();
}

Bangle.drawWidgets();

draw();
}