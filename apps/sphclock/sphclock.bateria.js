require("FontLECO1976Regular").add11(Graphics);

exports.drawBattery = function (x, y, steps, step_size) {
  steps = steps || 6;
  step_size = step_size || 4;
  // Battery
  battery = E.getBattery();
  g.setFontLECO1976sph11();
  if (Bangle.isCharging()) g.setColor("#00F");
  else g.setColor("#000");
  g.drawPoly(
    [
      x,
      ++y,
      x,
      (y += steps * (step_size + 1)),
      ++x,
      ++y,
      (x += 8),
      y,
      ++x,
      --y,
      x,
      (y -= steps * (step_size + 1)),
      --x,
      --y,
      (x -= 8),
      y,
    ],
    true
  );

  x++;
  y += 2;

  g.setColor("#F00");
  step = 100 / (steps + 1);
  for (i = steps; i >= 0; i--) {
    if (battery > i * step)
      if (Bangle.isCharging()) g.setColor("#00F");
      else g.setColor("#F00");
    else g.setColor("#888");
    if (i > 0) {
      g.fillPoly(
        [x, y, x, y + step_size, x + 6, y + step_size, x + 6 + 1, y],
        true
      );
      y += step_size + 1;
    }
  }

  g.setColor("#FFF");
  g.fillRect(x - 5, y + 2, x + 10, y + 12);

  g.setColor("#000");
  g.setFontAlign(0, 0);
  g.drawString(`${battery}`, x + 4, y + 8);
  queueDraw();
};
