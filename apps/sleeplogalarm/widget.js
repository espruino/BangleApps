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

// check if enabled in settings
if (settings.enabled) {

  // insert neccessary settings into widget
  WIDGETS.sleeplogalarm = {
    area: "tl",
    width: 0,
    drawRange: settings.drawRange,
    color: settings.color,
    from: settings.from,
    to: settings.to,
    earlier: settings.earlier,
    draw: function () {
      // draw zzz
      g.reset().setColor(this.color).drawImage(atob("BwoBD8SSSP4EEEDg"), this.x + 1, this.y);
      // draw alarm range times if enabled
      if (this.drawRange) {
        require("Font4x5Numeric").add(Graphics);
        g.setFont("4x5Numeric").drawString(this.from, this.x + 1, this.y + 12);
        g.setFontAlign(1, 1).drawString(this.to, this.x + this.width + 1, this.y + 23);
      }
    },
    reload: function () {
      // abort if onChange is not available
      if (typeof (global.sleeplog || {}).onChange === "object") return;

      // abort if no alarm exists inside range
      if (!(require("Storage").readJSON("sched.json", 1) || [])
          .filter(a => a.on && !a.timer)
          .some(a => a.t >= this.from * 36E5 && a.t < this.to * 36E5)) return;

      // set widget width if not hidden
      if (!this.hidden) this.width = 8;

      // insert sleeplogalarm function to onChange
      sleeplog.onChange.sleeplogalarm = function (data) {
        // abort if not changed from deep sleep to light sleep or awake
        if (data.prevStatus !== 4 || !(data.status === 3 || data.status === 2)) return;

        // get cahed data, now and calculate time of now
        var data = WIDGET.sleeplogalarm;
        var now = new Date();
        var tNow = (((now.getHours() * 60 + now.getMinutes()) * 60 + now.getSeconds()) * 1000);

        // abort if now is outside the possible alarm range
        if (tNow + data.earlier * 6E4 < data.from * 36E5 ||
          tNow + data.earlier * 6E4 >= data.to * 36E5) return;

        // execute trigger function
        require("sleeplogalarm.trigger.js")(now, tNow);
      };
    }
  };

  // load widget
  WIDGETS.sleeplogalarm.reload();
}