<<<<<<< HEAD
(() => {
  const weather = require('weather');

  function draw() {
    const w = weather.current;
    if (!w) return;
    g.reset();
    g.setColor(0).fillRect(this.x, this.y, this.x+this.width-1, this.y+23);
    if (w.txt) {
      weather.drawIcon(w.txt, this.x+10, this.y+8, 7.5);
    }
    if (w.temp) {
      let t = require('locale').temp(w.temp-273.15);  // applies conversion
      t = t.match(/[\d\-]*/)[0]; // but we have no room for units
      g.setFontAlign(0, 1); // center horizontally at bottom of widget
      g.setFont('6x8', 1);
      g.setColor(-1);
      g.drawString(t, this.x+10, this.y+24);
    }
  }

  var dirty = false;

  function update() {
    if (!WIDGETS["weather"].width) {
      WIDGETS["weather"].width = 20;
      Bangle.drawWidgets();
    } else if (Bangle.isLCDOn()) {
      WIDGETS["weather"].draw();
    } else {
      dirty = true;
    }
  }

  function hide() {
    WIDGETS["weather"].width = 0;
    Bangle.drawWidgets();
  }

  weather.on("update", () => {
    if (weather.current) update();
    else hide();
  });

  Bangle.on('lcdPower', on => {
    if (on && dirty) {
      WIDGETS["weather"].draw();
      dirty = false;
    }
  });

  WIDGETS["weather"] = {
    area: "tl",
    width: weather.current ? 20 : 0,
    draw: draw,
  };
})();
=======
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
        t = t.match(/[\d\-]*/)[0]; // but we have no room for units
        g.reset();
        g.setFontAlign(0, 1); // center horizontally at bottom of widget
        g.setFont('6x8', 1);
        g.drawString(t, this.x+10, this.y+24);
      }
    },
  };
})();
>>>>>>> 1cc7674aa7f990f88644e78d9d19cd981ea34324
