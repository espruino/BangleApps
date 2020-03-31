E.showMessage("My\nSimple\nApp","My App")

var counter = 30;

function countDown() {
  counter--;

  g.clear();
  // draw the current counter value
  g.drawString(counter, g.getWidth()/2, g.getHeight()/2);
  // optional - this keeps the watch LCD lit up
  g.flip();
}

var interval = setInterval(countDown, 1000);