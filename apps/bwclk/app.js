const locale = require('locale');


// timeout used to update every minute
var W = g.getWidth();
var H = g.getHeight();
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}



function getSteps() {
  try{
      if (WIDGETS.wpedom !== undefined) {
          return WIDGETS.wpedom.getSteps();
      } else if (WIDGETS.activepedom !== undefined) {
          return WIDGETS.activepedom.getSteps();
      }
  } catch(ex) {
      // In case we failed, we can only show 0 steps.
  }

  return 0;
}


function draw() {
  // Hide widgets
  for (let wd of WIDGETS) {wd.draw=()=>{};wd.area="";}

  // Clear old watch face
  var x = W/2;
  var y = H/2-20;
  g.reset().clearRect(0,0,W,W);

  // Draw background
  g.setColor("#000");
  g.fillRect(0,0,W/2,H/2);
  g.setColor("#fff");
  g.fillRect(W/2,H/2,W/2,H/2);

  // // Draw time
  // var date = new Date();
  // var timeStr = locale.time(date,1);
  // g.setFontAlign(0,0);
  // g.setFontTime();
  // g.drawString(timeStr, x, y);

  // // Draw date
  // y += 50;
  // x = x - g.stringWidth(timeStr) / 2 + 5;
  // g.setFontDate();
  // g.setFontAlign(-1,0);
  // var dateStr = locale.dow(date, true).toUpperCase() + date.getDate();
  // var fc = Bangle.isLocked() ? "#0ff" :"#fff";
  // fc = E.getBattery() < 50 ? "#f00" : fc;
  // g.drawString(dateStr, x, y);

  // queue draw in one minute
  queueDraw();
}

Bangle.loadWidgets();

// Clear the screen once, at startup
g.setTheme({bg:"#000",fg:"#fff",dark:false}).clear();
// draw immediately at first, queue update
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


Bangle.on('lock', function(isLocked) {
  print("LOCK");
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;
  draw();
});


// Show launcher when middle button pressed
Bangle.setUI("clock");
