var counter = 0;

function updateScreen() {
  g.clearRect(0, 50, 250, 150);
  g.setColor(0xFFFF);
  g.setFont("Vector",40).setFontAlign(0,0);
  g.drawString(Math.floor(counter), g.getWidth()/2, 100);
  g.drawString('-', 45, 100);
  g.drawString('+', 185, 100);
}


// add a count by using BTN1 or BTN5
setWatch(() => {
  counter += 1;
  updateScreen();
}, BTN1, {repeat:true});

setWatch(() => {
  counter += 1;
  updateScreen();
}, BTN5, {repeat:true});

// subtract a count by using BTN3 or BTN4
setWatch(() => {
  counter -= 1;
  updateScreen();
}, BTN4, {repeat:true});

setWatch(() => {
  counter -= 1;
  updateScreen();
}, BTN3, {repeat:true});

// reset by using BTN2
setWatch(() => {
  counter = 0;
  updateScreen();
}, BTN2, {repeat:true});

g.clear(1).setFont("6x8");
g.drawString('Tap right or BTN1 to increase\nTap left or BTN3 to decrease\nPress BTN2 to reset.', 25, 200);

Bangle.loadWidgets();
Bangle.drawWidgets();
updateScreen();

// TODO: Enable saving counts to file
// Add small watch
