// copied from: https://gist.github.com/IamSilviu/5899269#gistcomment-3035480
function ISO8601_week_no(date) {
  var tdt = new Date(date.valueOf());
  var dayn = (date.getDay() + 6) % 7;
  tdt.setDate(tdt.getDate() - dayn + 3);
  var firstThursday = tdt.valueOf();
  tdt.setMonth(0, 1);
  if (tdt.getDay() !== 4) {
    tdt.setMonth(0, 1 + ((4 - tdt.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - tdt) / 604800000);
}

function format(value) {
  return ("0" + value).substr(-2);
}

const ClockFace = require("ClockFace");
const clock = new ClockFace({
  init: function () {
    const appRect = Bangle.appRect;

    this.viewport = {
      width: appRect.w,
      height: appRect.h
    };

    this.center = {
      x: this.viewport.width / 2,
      y: Math.round((this.viewport.height / 2) + appRect.y)
    };

    this.scale = g.getWidth() / this.viewport.width;
    this.centerTimeScaleX = this.center.x + 32 * this.scale;
    this.centerDatesScaleX = this.center.x + 40 * this.scale;
  },
  draw: function (date) {
    const hour = date.getHours() - (this.is12Hour && date.getHours() > 12 ? 12 : 0);
    const month = date.getMonth() + 1;
    const monthName = require("date_utils").month(month, 1);
    const dayName = require("date_utils").dow(date.getDay(), 1);

    g.setFontAlign(1, 0).setFont("Vector", 90 * this.scale);
    g.drawString(format(hour), this.centerTimeScaleX, this.center.y - 31 * this.scale);
    g.drawString(format(date.getMinutes()), this.centerTimeScaleX, this.center.y + 46 * this.scale);

    g.fillRect(this.center.x + 30 * this.scale, this.center.y - 72 * this.scale, this.center.x + 32 * this.scale, this.center.y + 74 * this.scale);

    g.setFontAlign(-1, 0).setFont("Vector", 16 * this.scale);
    g.drawString(date.getFullYear(date), this.centerDatesScaleX, this.center.y - 62 * this.scale);
    g.drawString(format(month), this.centerDatesScaleX, this.center.y - 44 * this.scale);
    g.drawString(format(date.getDate()), this.centerDatesScaleX, this.center.y - 26 * this.scale);
    if (this.showWeekNum) g.drawString(format(ISO8601_week_no(date)), this.centerDatesScaleX, this.center.y + 15 * this.scale);
    g.drawString(monthName, this.centerDatesScaleX, this.center.y + 48 * this.scale);
    g.drawString(dayName, this.centerDatesScaleX, this.center.y + 66 * this.scale);
  },
  settingsFile: "ffcniftya.json"
});
clock.start();