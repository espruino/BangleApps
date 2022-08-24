// place your const, vars, functions or classes here

// clear the screen
g.clear();

var n = 0;

// redraw the screen
function draw() {
  g.reset().clearRect(Bangle.appRect);
  g.setFont("6x8").setFontAlign(0,0).drawString("Up / Down",g.getWidth()/2,g.getHeight()/2 - 20);
  g.setFont("Vector",60).setFontAlign(0,0).drawString(n,g.getWidth()/2,g.getHeight()/2 + 30);
}

// Respond to user input
Bangle.setUI({mode: "updown"}, function(dir) {
  if (dir<0) {
    n--;
    draw();
  } else if (dir>0) {
    n++;
    draw();
  } else {
    n = 0;
    draw();
  }
});

// First draw...
draw();

// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
