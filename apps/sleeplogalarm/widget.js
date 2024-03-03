// check if enabled in settings
if ((require("Storage").readJSON("sleeplogalarm.settings.json", true) || {enabled: true}).enabled) {
  // read settings
  let settings = require("sleeplogalarm").getSettings();

  // insert neccessary settings into widget
  WIDGETS.sleeplogalarm = {
    area: "tl",
    width: 0,
    time: 0,
    earlier: settings.earlier,
    draw: function () {
      // draw if width is set
      if (this.width) {
        // draw zzz
        g.reset().setColor(settings.wid.color).drawImage(atob("BwoBD8SSSP4EEEDg"), this.x + 1, this.y);
        // call function to draw the time of alarm if a alarm is found
        if (this.time) this.drawTime(this.time + 1);
      }
    },
    drawTime: () => {},
    reload: require("sleeplogalarm").widReload
  };

  // add function to draw the time of alarm if enabled
  if (settings.wid.time) WIDGETS.sleeplogalarm.drawTime = function(time) {
    // directly include Font4x5Numeric
    g.setFontCustom(atob("CAZMA/H4PgvXoK1+DhPg7W4P1uCEPg/X4O1+AA=="), 46, atob("AgQEAgQEBAQEBAQE"), 5).setFontAlign(1, 1);
    g.drawString(0|(time / 36E5), this.x + this.width + 1, this.y + 17);
    g.drawString(0|((time / 36E5)%1 * 60), this.x + this.width + 1, this.y + 23);
  };

  // load widget
  WIDGETS.sleeplogalarm.reload();
}