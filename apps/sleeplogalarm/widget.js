// check if sleeplog is available and any alarm is active
if (typeof (global.sleeplog || {}).onChange === "object" &&
    (require("Storage").readJSON("sched.json", 1) || []).some(a => a.on && !a.timer)) {

  // read settings to calculate alarm range
  var settings = Object.assign({
    enabled: true,
    hide: false,
    drawRange: true,
    from: 4, // 0400
    to: 8, // 0800
    earlier: 6E4 * 30
  }, require("Storage").readJSON("sleeplogalarm.settings.json", true) || {});

  // abort if not enabled in settings
  if (!settings.enabled) return;

  // setup widget depending on settings
  WIDGETS.sleeplogalarm = {
    area: "tl",
    width: 0,
    from: settings.from,
    to: settings.to,
    earlier: settings.earlier,
    draw: function() {
      if (this.width) g.reset().setColor(1, 1, 0).drawImage(atob(""), this.x, this.y + this.width - 8);
      if (this.width > 8) {
        g.setFont().setFontAllign();
        g.drwaString(this.from, this.x + 6, this.y);
        g.drwaString(this.to, this.x + 18, this.y);
      }
    }
  };

  // set widget width and draw
  WIDGETS.sleeplogalarm.width = settings.hide ? 0 : settings.drawRange ? 24 : 8;
  WIDGETS.sleeplogalarm.draw();

  // add sleeplogalarm function to onChange
  sleeplog.onChange.push(function(data) {
    // abort if not changed from deep sleep to light sleep or awake
    if (data.prevStatus !== 4 || !(data.status === 3 || data.status === 2)) return;

    // get now and calculate time of now
    var now = new Date();
    var tNow = (now.getHours() * 3600000) + (now.getMinutes() * 60000) + (now.getSeconds() * 1000);

    // abort if now is outside the possible alarm range
    if (tNow + WIDGETS.sleeplogalarm.earlier < WIDGETS.sleeplogalarm.from * 36E5 ||
          tNow + WIDGETS.sleeplogalarm.earlier >= WIDGETS.sleeplogalarm.to * 36E5) return;

    // execute trigger function
    require("sleeplogalarm.trigger.js")(now, tNow);
  });
}
