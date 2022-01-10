require("FontLECO1976Regular").add14(Graphics);

exports.drawLocked1 = function () {
  x = 128;
  y = 5;

  if (Bangle.isLocked()) {
    g.setFontLECO1976Regular14();
    g.setFontAlign(0, -1);
    g.setColor("#000");
    g.drawString("LOCKED", x, y);
    g.drawLine(102, 17, 152, 17);
    g.drawLine(102, 19, 152, 19);
  } else {
    g.setColor("#FFF");
    g.fillRect(x - 26, y, x + 26, y + 14);
  }
};

exports.drawLocked2 = function () {
  if (Bangle.isLocked()) {
    g.setFontAlign(0, -1);
    g.setColor("#000");
    g.fillPoly(
      [
        (x = 60),
        (y = 49),
        (x -= 5),
        (y += 7),
        (x += 5),
        (y += 7),
        (x += 56),
        y,
        (x += 5),
        (y -= 7),
        (x -= 5),
        (y -= 7),
      ],
      true
    );
    g.drawLine((x -= 54), (y -= 2), (x += 52), y);

    // g.setFont("Vector",10);

    g.setColor("#FFF");
    g.drawString("LOCKED", 88, 51);
  } else {
    g.setColor("#FFF");
    g.fillRect(50, 47, 120, 52);
  }
};

exports.drawLocked = function () {
  if (Bangle.isLocked()) {
    g.setColor("#000");
    g.fillCircle(166, 88, 10);
    g.setColor("#000");
    g.fillRect(166, 78, 176, 98);
    g.drawLine(166, 76, 176, 76);
    g.drawLine(166, 100, 176, 100);

    g.setColor("#FFF");
    g.drawCircle(167, 87, 4);
    g.fillRect(163, 87, 171, 89);
    g.setColor("#AAA");
    g.fillRect(163, 90, 171, 93);
    g.setColor("#000");
    g.fillRect(166, 89, 167, 92);

  }
};
