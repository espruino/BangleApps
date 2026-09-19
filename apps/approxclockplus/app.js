function drawTime() {
  const date = new Date();

  const hour = date.getHours();

  let text;

  if (hour < 4) {
    text = "Just after yesterday";
  } else if (hour < 20) {
    text = "Today";
  } else {
    text = "Almost tomorrow";
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