// check if enabled in settings
if ((require("Storage").readJSON("sleeplogalarm.settings.json", true) || {enabled: true}).enabled) {

  // insert neccessary settings into widget
  WIDGETS.sleeplogalarm = {
    area: "tl",
    width: 0,
    drawTime: settings.drawTime,
    color: settings.color,
    time: 0,
    earlier: settings.earlier,
    draw: function () {
      // draw zzz
      g.reset().setColor(this.color).drawImage(atob("BwoBD8SSSP4EEEDg"), this.x + 1, this.y);
      // draw time of alarm if enabled
      if (this.drawTime && this.time) {
        // directly include Font4x5Numeric
        g.setFontCustom(atob("CAZMA/H4PgvXoK1+DhPg7W4P1uCEPg/X4O1+AA=="), 46, atob("AgQEAgQEBAQEBAQE"), 5).setFontAlign(1, 1);
        g.drawString(0|(this.time / 36E5), this.x + this.width + 1, this.y + 12);
        g.drawString(0|((this.time / 36E5)%1 * 60), this.x + this.width + 1, this.y + 23);
      }
    },
    reload: require("sleeplogalarm").widReload()
  };

  // load widget
  WIDGETS.sleeplogalarm.reload();
}