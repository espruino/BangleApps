const Storage = require("Storage");

const SETTINGS_FILE = "approxclockplus.json";

function drawTime() {
  const date = new Date();

  const hour = date.getHours();
  const minutes = date.getMinutes();

  g.reset();
  g.setBgColor(0, 0, 0);
  g.clearRect(0, 0, g.getWidth(), g.getHeight());
  g.setColor(1, 1, 1);

  g.setFont("Vector", 30);

  g.drawString(
    "Hour: " + hour,
    20,
    80
  );

  g.drawString(
    "Minute: " + minutes,
    20,
    130
  );
}

Bangle.setUI("clock");

drawTime();