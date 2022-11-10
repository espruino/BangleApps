// check if sleeplog is available and any alarm is active
if (typeof (global.sleeplog || {}).onChange === "object" &&
    (require("Storage").readJSON("sched.json", 1) || []).some(a => a.on && !a.timer)) {

  // read settings to calculate alarm range
  var settings = Object.assign({
    enabled: true,
    hide: false,
    drawRange: true,
    color: g.theme.dark ? 65504 : 31, // yellow or blue
    from: 4, // 0400
    to: 8, // 0800
    earlier: 30
  }, require("Storage").readJSON("sleeplogalarm.settings.json", true) || {});

  // abort if not enabled in settings
  if (!settings.enabled) return;

  // insert neccessary settings into widget
  WIDGETS.sleeplogalarm = {
    area: "tl",
    width: 0,
    drawRange: settings.drawRange,
    color: settings.color,
    from: settings.from,
    to: settings.to,
    earlier: settings.earlier,
    draw: ()=>{}
  };

  // setup widget depending if not hidden
  if (!settings.hide) {
    WIDGETS.sleeplogalarm.width = 8;
    WIDGETS.sleeplogalarm.draw = function() {
      g.reset().setColor(this.color).drawImage(atob("BwoBD8SSSP4EEEDg"), this.x + 1, this.y);
      if (this.drawRange) {
        require("Font4x5Numeric").add(Graphics);
        g.setFont("4x5Numeric").drawString(this.from, this.x + 1, this.y + 12);
        g.setFontAlign(1, 1).drawString(this.to, this.x + this.width + 1, this.y + 23);
      }
    };
  }

  // set widget width and draw
  WIDGETS.sleeplogalarm.draw();

  // add sleeplogalarm function to onChange
  sleeplog.onChange.sleeplogalarm = function(data) {
    // abort if not changed from deep sleep to light sleep or awake
    if (data.prevStatus !== 4 || !(data.status === 3 || data.status === 2)) return;

    // get now and calculate time of now
    var now = new Date();
    var tNow = (now.getHours() * 3600000) + (now.getMinutes() * 60000) + (now.getSeconds() * 1000);

    // abort if now is outside the possible alarm range
    if (tNow + WIDGETS.sleeplogalarm.earlier * 6E4 < WIDGETS.sleeplogalarm.from * 36E5 ||
          tNow + WIDGETS.sleeplogalarm.earlier * 6E4 >= WIDGETS.sleeplogalarm.to * 36E5) return;

    // execute trigger function
    require("sleeplogalarm.trigger.js")(now, tNow);
  };
}
