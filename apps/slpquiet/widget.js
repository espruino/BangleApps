(function () {
  WIDGETS["slpquiet"] = {
    area: "tl",
    width: ((require("Storage").readJSON("setting.json", 1) || {}).quiet | 0) ? 24 : 0,
    draw: function () {
      const mode = (require("Storage").readJSON("setting.json", 1) || {}).quiet | 0;
      if (mode === 0) { // Off
        if (this.width !== 0) {
          this.width = 0;
          Bangle.drawWidgets();
        }
        return;
      }
      // not Off: make sure width is correct
      if (this.width !== 24) {
        this.width = 24;
        Bangle.drawWidgets();
        return; // drawWidgets will call draw again
      }
      let x = this.x, y = this.y;
      g.reset().clearRect(x, y, x + 23, y + 23);
      // quiet mode: draw red one-way-street sign (dim red on Bangle.js 1)
      x = this.x + 11; y = this.y + 11; // center of widget
      g.setColor(process.env.HWVERSION === 2 ? 1 : 0.8, 0, 0).fillCircle(x, y, 8);
      g.setColor(g.theme.bg).fillRect(x - 6, y - 2, x + 6, y + 2);
      if (mode > 1) { return; } // no alarms
      // alarms still on: draw alarm icon in bottom-right corner
      x = this.x + 18; y = this.y + 17; // center of alarm
      g.setColor(1, 1, 0)
        .fillCircle(x, y, 3) // alarm body
        .fillRect(x - 5, y + 2, x + 5, y + 3) // bottom ridge
        .fillRect(x - 1, y - 5, x + 1, y + 5).drawLine(x, y - 6, x, y + 6) // top+bottom
        .drawLine(x + 5, y - 3, x + 3, y - 5).drawLine(x - 5, y - 3, x - 3, y - 5); // wriggles
    },
  };
})();
