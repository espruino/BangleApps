var scale;
var screen;
var center;
var buf;
var img;

function format(value) {
  return ("0" + value).substr(-2);
}

function renderEllipse(g) {
  g.fillEllipse(center.x - 5 * scale, center.y - 70 * scale, center.x + 160 * scale, center.y + 90 * scale);
}

function renderText(g, date) {
  const hour = date.getHours() - (this.is12Hour && date.getHours() > 12 ? 12 : 0);
  const month = date.getMonth() + 1;

  const monthName = require("date_utils").month(month, 1);
  const dayName = require("date_utils").dow(date.getDay(), 1);

  g.setFontAlign(1, 0).setFont("Vector", 90 * scale);
  g.drawString(format(hour), center.x + 32 * scale, center.y - 31 * scale);
  g.drawString(format(date.getMinutes()), center.x + 32 * scale, center.y + 46 * scale);

  g.setFontAlign(1, 0).setFont("Vector", 16 * scale);
  g.drawString(date.getFullYear(), center.x + 80 * scale, center.y - 42 * scale);
  g.drawString(format(month), center.x + 80 * scale, center.y - 26 * scale);
  g.drawString(format(date.getDate()), center.x + 80 * scale, center.y - 10 * scale);
  g.drawString(monthName, center.x + 80 * scale, center.y + 44 * scale);
  g.drawString(dayName, center.x + 80 * scale, center.y + 60 * scale);
}

const ClockFace = require("ClockFace");
const clock = new ClockFace({
  init: function () {
    const appRect = Bangle.appRect;

    screen = {
      width: appRect.w,
      height: appRect.h
    };

    center = {
      x: screen.width / 2,
      y: screen.height / 2
    };

    buf = Graphics.createArrayBuffer(screen.width, screen.height, 1, { msb: true });

    scale = g.getWidth() / screen.width;

    img = {
      width: screen.width,
      height: screen.height,
      transparent: 0,
      bpp: 1,
      buffer: buf.buffer
    };

    // default to RED (see settings.js)
    // don't use || to default because 0 is a valid color
    this.color = this.color === undefined ? 63488 : this.color;
  },
  draw: function (date) {
    // render outside text with ellipse
    buf.clear();
    renderText(buf.setColor(1), date);
    renderEllipse(buf.setColor(0));
    g.setColor(this.color).drawImage(img, 0, 24);

    // render ellipse with inside text
    buf.clear();
    renderEllipse(buf.setColor(1));
    renderText(buf.setColor(0), date);
    g.setColor(this.color).drawImage(img, 0, 24);
  },
  settingsFile: "ffcniftyb.json"
});
clock.start();