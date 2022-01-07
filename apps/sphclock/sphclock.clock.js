exports.drawClock = function (date, y) {
  var timeStr = require("locale").time(date, 1);

  g.setColor("#FFF");
  g.fillRect(0, y + 7, 176, y + 58);

  g.setFontLECO1976Regular42();
  g.setFontAlign(0, 0);
  g.setColor("#f88");
  g.drawString(timeStr, 90, 100);
  g.setColor("#400");
  g.drawString(timeStr, 88, 98);
  g.setColor("#F00"); 
  g.drawString(timeStr, 86, 96);
};

exports.drawClockBackground = function(y) {
  g.setColor("#FFF");
  g.fillRect(0, y, 176, y + 68);

  g.setColor("#000");
  g.drawLine(0, y, 176, y);
  g.fillRect(0, y + 2, 176, y + 6);

  g.fillRect(0, y + 62, 176, y + 66);
  g.drawLine(0, y + 68, 176, y + 68);
}