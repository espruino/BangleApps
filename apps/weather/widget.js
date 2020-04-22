(() => {
  function draw() {
    const w = require('weather').load()
    if (!w) return;
    g.reset();
    g.setColor(0).fillRect(this.x, this.y, this.x+this.width, this.y+24)
    if (w.txt) {
      require('weather').drawIcon(w.txt, this.x+10, this.y+8, 8);
    }
    if (w.temp) {
      let t = require('locale').temp(w.temp-273.15);  // applies conversion
      t = t.substr(0, t.length-2); // but we have no room for units
      g.setFontAlign(0, 1); // center horizontally at bottom of widget
      g.setFont('6x8', 1);
      g.setColor(-1)
      g.drawString(t, this.x+10, this.y+24)
    }
  }

  function update(weather) {
    require('weather').save(weather);
    if (!WIDGETS["weather"].width) {
      WIDGETS["weather"].width = 20
      Bangle.drawWidgets()
    } else if (Bangle.isLCDOn()) {
      WIDGETS["weather"].draw()
    }
  }

  const _GB = global.GB;
  global.GB = (event) => {
    if (event.t==="weather") update(event);
    if (_GB) setTimeout(_GB, 0, event);
  };

  WIDGETS["weather"] = {area: "tl", width: 20, draw: draw};
  if (!require('weather').load()) {
    WIDGETS["weather"].width = 0
  }
})();
