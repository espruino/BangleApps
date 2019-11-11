require("Storage").write("-timer",` var counter = 30;
var counterInterval;

function outOfTime() {
  E.showMessage("Out of Time");
  Bangle.buzz();
  Bangle.beep(200, 4000)
    .then(() => new Promise(resolve => setTimeout(resolve,200)))
    .then(() => Bangle.beep(200, 3000));
  // again, 10 secs later
  setTimeout(outOfTime, 10000);
}

function countDown() {
  counter--;
  // Out of time
  if (counter<=0) {
    clearInterval(counterInterval);
    counterInterval = undefined;
    outOfTime();
    return;
  }

  g.clear();
  g.setFontAlign(0,0); // center font
  g.setFont("6x8",8);
  // draw the current counter value
  g.drawString(counter,120,120);
  // optional; - this keeps the watch LCD lit up
  g.flip();
}

counterInterval = setInterval(countDown, 1000);`);

require("Storage").write("+timer",{
  "name":"My Timer",
  "src":"-timer"
});
