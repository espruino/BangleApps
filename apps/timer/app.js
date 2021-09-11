let counter;
let counterInterval;

function outOfTime() {
  if (counterInterval) return;
  
  E.showMessage("Out of time", "My Timer");
  Bangle.buzz();
  Bangle.beep(200, 4000)
    .then(() => new Promise(resolve => setTimeout(resolve, 200)))
    .then(() => Bangle.beep(200, 3000));
  setTimeout(outOfTime, 10000);
}

function countDown() {
  counter--;
  
  if (counter <= 0) {
    clearInterval(counterInterval);
    counterInterval = undefined;
    setWatch(startTimer, BTN2);
    outOfTime();
    return;
  }

  g.clear();
  g.setFontAlign(0, 0);
  g.setFont("Vector", 80);
  g.drawString(counter, g.getWidth() / 2, g.getHeight() / 2);
  g.flip();
}

function startTimer() {
  counter = 30;
  countDown();
  if (!counterInterval)
    counterInterval = setInterval(countDown, 1000);
}

startTimer();
