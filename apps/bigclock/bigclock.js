const REFRESH_RATE = 10000;

let interval;

function drawTime() {
  const d = new Date();
  const da = d.toString().split(" ");
  const time = da[4].substr(0, 5).split(":");
  const dow = da[0];
  const month = da[1];
  const day = da[2];
  const year = da[3];
  const hours = time[0];
  const minutes = time[1];
  g.clearRect(0, 24, 239, 239);
  g.setColor(1, 1, 1);
  g.setFont("Vector", 100);
  g.drawString(hours, 50, 24, true);
  g.setColor(1, 50, 1);
  g.drawString(minutes, 50, 135, true);
  g.setFont("Vector", 20);
  g.setRotation(3);
  g.drawString(`${dow} ${day} ${month}`, 50, 20, true);
  g.drawString(year, 85, 205, true);
  g.setRotation(0);
}

Bangle.on("lcdPower", function(on) {
  if (on) {
    g.clear();
    Bangle.drawWidgets();
    drawTime();
    interval = setInterval(drawTime, REFRESH_RATE, settings.drawMode);
  } else {
    clearInterval(interval);
  }
});

Bangle.setLCDMode();

// Show launcher when middle button pressed
clearWatch();
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });

g.clear();
clearInterval();
drawTime();
interval = setInterval(drawTime, REFRESH_RATE);

Bangle.loadWidgets();
Bangle.drawWidgets();
