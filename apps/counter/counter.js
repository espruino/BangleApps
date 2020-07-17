var counter = 0;

g.setColor(0xFFFF);

function updateScreen() {
  g.clearRect(0, 50, 250, 150);
  g.setFont("Vector",40).setFontAlign(0,0);
  g.drawString(Math.floor(counter), g.getWidth()/2, 100);
}


// add a count by using BTN1
setWatch(() => {
  counter += 1;
  updateScreen();
}, BTN1, {repeat:true});

setWatch(() => {
  counter = 0;
  updateScreen();
}, BTN3, {repeat:true});

g.clear(1).setFont("6x8");
g.drawString('Use BTN1 to increase\nthe counter by one.\nUse BTN3 to reset counter.', 25, 200);

Bangle.loadWidgets();
Bangle.drawWidgets();

// TODO: Enable saving counts to file
// Does not work if widgets are not visible
// Add small watch
