
const h = g.getHeight();
const w = g.getWidth();

function draw() {
  var d = new Date();
  var da = d.toString().split(" ");
  var time = da[4].substr(0,5);

  g.reset();
  g.clearRect(0, 30, w, 99);
  g.setFontAlign(0, -1);
  g.setFont("Vector", w/3);
  g.drawString(time, w/2, 40);
}

// handle switch display on by pressing BTN1
Bangle.on('lcdPower', function(on) {
  if (on) draw();
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
setInterval(draw, 15000); // refresh every 15s
draw();
// Show launcher when button pressed
Bangle.setUI("clock");
