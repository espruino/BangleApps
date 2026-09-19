const Storage = require("Storage");

const settings = Storage.readJSON(
  "approxclockplus.json",
  1
) || {};

const level =
  typeof settings.level === "number"
    ? settings.level
    : 2;

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
    "Level: " + level,
    20,
    60
  );

  g.drawString(
    "Hour: " + hour,
    20,
    110
  );

  g.drawString(
    "Minute: " + minutes,
    20,
    160
  );
}

Bangle.setUI("clock");

drawTime();