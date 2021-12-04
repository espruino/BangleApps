(() => {
  const weather = require('weather');

  var dirty = false;

  weather.on("update", w => {
    if (w) {
      if (!WIDGETS["weather"].width) {
        WIDGETS["weather"].width = 20;
        Bangle.drawWidgets();
      } else if (Bangle.isLCDOn()) {
        WIDGETS["weather"].draw();
      } else {
        dirty = true;
      }
    }
    else {
      WIDGETS["weather"].width = 0;
      Bangle.drawWidgets();
    }
  });

  Bangle.on('lcdPower', on => {
    if (on && dirty) {
      WIDGETS["weather"].draw();
      dirty = false;
    }
  });

  WIDGETS["weather"] = {
    area: "tl",
    width: weather.get() ? 20 : 0,
    draw: function() {
      const w = weather.get();
      if (!w) return;
      g.reset();
      g.clearRect(this.x, this.y, this.x+this.width-1, this.y+23);
      if (w.txt) {
        weather.drawIcon(w.txt, this.x+10, this.y+8, 7.5);
      }
      if (w.temp) {
        let t = require('locale').temp(w.temp-273.15);  // applies conversion
        t = t.match(/[\d\-]*/)[0]*9/5+32; // but we have no room for units
        g.reset();
        g.setFontAlign(0, 1); // center horizontally at bottom of widget
        g.setFont('6x8', 1);
        g.drawString(t, this.x+10, this.y+24);
      }
    },
  };
})();
