const h = g.getHeight();
const w = g.getWidth();

function draw() {
  var date = new Date();
  var timeStr = require("locale").time(date,1);
  
  g.reset();
  g.setColor(g.theme.bg);
  g.fillRect(Bangle.appRect);

  g.setFont('Vector', w/3);
  g.setFontAlign(0, 0);
  g.setColor(g.theme.fg);
  g.drawString(timeStr, w/2, h/2);
  console.log(timeStr + ", simplest");
  queueDraw();
}

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

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

g.clear();

// Show launcher when middle button pressed
// Bangle.setUI("clock");
// use  clockupdown as it tests for issue #1249
Bangle.setUI("clockupdown", btn=> {
  draw();
});

// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
draw();
