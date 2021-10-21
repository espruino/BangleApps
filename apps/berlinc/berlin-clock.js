// Berlin Clock see https://en.wikipedia.org/wiki/Mengenlehreuhr
// https://github.com/eska-muc/BangleApps
const fields = [4, 4, 11, 4];
const offset = 24;
const width = g.getWidth() - 2 * offset;
const height = g.getHeight() - 2 * offset;
const rowHeight = height / 4;

var show_date = false;
var show_time = false;
var yy = 0;

var rowlights = [];
var time_digit = [];

// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

function draw() {
  g.reset().clearRect(0,24,g.getWidth(),g.getHeight());
  var now = new Date();

  // show date below the clock
  if (show_date) {
    var yr = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var dateString = `${yr}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
    var strWidth = g.stringWidth(dateString);
    g.setColor(g.theme.fg).setFontAlign(-1,-1);
    g.drawString(dateString, ( g.getWidth() - strWidth ) / 2, height + offset + 4);
  }

  rowlights[0] = Math.floor(now.getHours() / 5);
  rowlights[1] = now.getHours() % 5;
  rowlights[2] = Math.floor(now.getMinutes() / 5);
  rowlights[3] = now.getMinutes() % 5;

  time_digit[0] = Math.floor(now.getHours() / 10);
  time_digit[1] = now.getHours() % 10;
  time_digit[2] = Math.floor(now.getMinutes() / 10);
  time_digit[3] = now.getMinutes() % 10;

  g.drawRect(offset, offset, width + offset, height + offset);
  for (row = 0; row < 4; row++) {
    nfields = fields[row];
    boxWidth = width / nfields;

    for (col = 0; col < nfields; col++) {
      x1 = col * boxWidth + offset;
      y1 = row * rowHeight + offset;
      x2 = (col + 1) * boxWidth + offset;
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

function toggleDate() {
  show_date = ! show_date;
  draw();
}

function toggleTime() {
  show_time = ! show_time;
  draw();
}

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

// Show launcher when button pressed, handle up/down
Bangle.setUI("clockupdown", dir=> {
  if (dir<0) toggleTime();
  if (dir>0) toggleDate();
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
draw();
