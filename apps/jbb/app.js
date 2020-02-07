/**
 * draw the current level value
 */
function draw(level) {
  console.log('draw', level);
  // Clear the screen
  g.clear();
  g.setFontAlign(0, 0); // center font
  g.setFont("6x8", 8); // bitmap font, 8x magnified
  g.drawString(level + "%", 120, 80);
  g.setFont("6x8", 4);
  g.drawString("power", 120, 130);
}

function getBatteryLevel() {
  level = E.getBattery();
  console.log('getBatteryLevel', level);

  draw(level);

  checkCharging(Bangle.isCharging());

  // again, 10 secs later
  setTimeout(getBatteryLevel, 10E3);
}

function checkCharging(charging) {
  console.log('checkCharging', charging);
  // Green LED
  //LED2.write(charging);
  if (charging) {
    g.setFontAlign(0, 0); // center font
    g.setFont("6x8", 3); // bitmap font, 3x magnifier
    g.drawString("charging", 120, 160);
  }
}

function main() {
  console.log('starting jbb version 0.0.1');
  getBatteryLevel();
}

g.clear();
g.flip();
Bangle.loadWidgets();
Bangle.drawWidgets();

Bangle.on('charging', checkCharging);

main();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
