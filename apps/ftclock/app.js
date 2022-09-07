let getNextFourTwenty = require("fourTwenty").getNextFourTwenty;
require("FontTeletext10x18Ascii").add(Graphics);
let leaf_img = "\x17\x18\x81\x00\x00\x10\x00\x00 \x00\x00@\x00\x01\xc0\x00\x03\x80\x00\x0f\x80\x00\x1f\x00\x00>\x00\x00|\x00\xc0\xf8\x19\xe1\xf0\xf1\xe3\xe3\xc3\xf7\xdf\x83\xff\xfe\x03\xff\xf8\x03\xff\xe0\x03\xff\x80\x03\xfe\x00\x7f\xff\xc0\xff\xff\xc0\x06\xe0\x00\x18\xc0\x00 \x80\x00\x00\x00";

// timeout used to update every minute
let drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}


function draw() {
  g.reset();
  let date = new Date();
  let timeStr = require("locale").time(date,1);
  let next420 = getNextFourTwenty();
  g.clearRect(0,26,g.getWidth(),g.getHeight());
  g.setColor("#00ff00").setFontAlign(0,-1).setFont("Teletext10x18Ascii",2);
  g.drawString(next420.minutes? timeStr: `\0${leaf_img}${timeStr}\0${leaf_img}`, g.getWidth()/2, 28);
  g.setColor(g.theme.fg);
  g.setFontAlign(-1,-1).setFont("Teletext10x18Ascii");
  g.drawString(g.wrapString(next420.text, g.getWidth()-8).join("\n"),4,60);

  // queue draw in one minute
  queueDraw();
}

// Clear the screen once, at startup
g.clear();
// Show launcher when middle button pressed
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
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

