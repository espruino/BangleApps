function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  return hours + ":" + minutes + ":" + seconds;
}


var counter = 0;
var started = false;

function drawInterface() {
  g.clear();
  g.setFontAlign(0, 0);
  g.setFont("6x8", 2);
  g.drawString("+5m", g.getWidth() - 30, 30);
  g.drawString("+30s", g.getWidth() - 30, g.getHeight() / 2);
  g.drawString("+5s", g.getWidth() - 30, g.getHeight() - 30);

  g.setFontAlign(0, 0); // center font
  g.setFont("6x8", 3);
  // draw the current counter value

  g.drawString(msToTime(counter * 1000), g.getWidth() / 2 - 30, g.getHeight() / 2);
  // optional - this keeps the watch LCD lit up
  g.flip();
}

function countDown() {
  if (counter > 0) {
    if (started) {
      counter--;
      drawInterface();
    }
  } else {
    if (started) {
      Bangle.buzz();
    }
  }
}

setWatch((p) => {
  if (p.time - p.lastTime < 0.1) {
    counter = 0;
    started = false;
  } else {
    counter += 60 * 5;
  }
  drawInterface();
}, BTN1, { repeat: true });

setWatch(() => {
  counter += 30;
  drawInterface();
}, BTN2, { repeat: true });

setWatch(() => {
  counter += 5;
  drawInterface();
}, BTN3, { repeat: true });

Bangle.on('touch', function (button) {
  started = !started;
});

setInterval(countDown, 1000);
drawInterface();