const Storage = require("Storage");

const settings =
  Storage.readJSON("approxclockplus.json", 1) || {};

const level =
  typeof settings.level === "number"
    ? settings.level
    : 2;

function drawTime() {
  const date = new Date();

  const hour = date.getHours();

  let text;

  if (level === 0) {
    if (hour < 4) {
      text = "Just after yesterday";
    } else if (hour < 20) {
      text = "Today";
    } else {
      text = "Almost tomorrow";
    }

  } else if (level === 1) {
    if (hour < 6) {
      text = "Night";
    } else if (hour < 12) {
      text = "Morning";
    } else if (hour < 18) {
      text = "Day";
    } else {
      text = "Evening";
    }

  } else {
    text = "Level " + level;
  }

  g.reset();
  g.setBgColor(0, 0, 0);
  g.clearRect(0, 0, g.getWidth(), g.getHeight());
  g.setColor(1, 1, 1);

  g.setFont("Vector", 24);

  const x =
    (g.getWidth() - g.stringWidth(text)) / 2;

  g.drawString(
    text,
    x,
    100
  );
}

Bangle.setUI("clock");

drawTime();