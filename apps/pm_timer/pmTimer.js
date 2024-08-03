var counter = 30;
var counterInterval;

function countDown() {
  counter--;

  if (counter<=0) {
    clearInterval(counterInterval);
    counterInterval = undefined;

    E.showMessage("Out of Time","My Timer");
    Bangle.buzz();
    counterInterval = setInterval(() => Bangle.buzz(), 5000);

    Bangle.setUI({
      mode : "custom",
      btn : ()=>{
        Bangle.setUI();
        startTimer();
      }
    });
    return;
  }

  g.clear(1); // clear screen and reset graphics state
  g.setFontAlign(0,0); // center font
  g.setFont("Vector",80); // vector font, 80px

  g.drawString(counter, g.getWidth()/2, g.getHeight()/2);

  Bangle.setLCDPower(1); // optional - this keeps the watch LCD lit up
}

function startTimer() {
  counter = 30;
  countDown();

  if (counterInterval)
    clearInterval(counterInterval);

  counterInterval = setInterval(countDown, 1000);

  Bangle.setUI({
    mode : "updown",
  }, dir => {
    if (!dir) { // if tapped or button pressed, start/stop
      if (counterInterval) {
        clearInterval(counterInterval);
        counterInterval = undefined;
      } else counterInterval = setInterval(countDown, 1000);
    } else { // otherwise if dir nonzero, count time up/down
      counter += dir + 1; // +1 because countDown decrements
      if (counter<3) counter=3;
      countDown();
    }
  });
}

startTimer();