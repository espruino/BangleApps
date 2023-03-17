(() => {
  var stat = {date: 0};

  WIDGETS.devst = {area: "tr", width: 22, draw: function() {
    if (WIDGETS.devst._draw) return;
    var d = new Date();
    var t;
    if ((d - stat.date) < 6e4) {
      t = process.memory(false);
    } else {
      stat.date = d;
      t = require('Storage').getStats();
      stat.sto = t.fileBytes / t.totalBytes;
      t = process.memory();
    }
    t = t.usage / t.total;
    var x = this.x;
    var y = this.y;
    g.reset();
    g.clearRect(x, y, x + 21, y + 23);
    g.drawRect(x + 2, y + 1, x + 20, y + 21);
    g.setFont('6x8', 1);
    if (NRF.getSecurityStatus().connected) g.drawString('B', x + 5, y + 3);
    if (Bangle.isCompassOn()) g.drawString('C', x + 13, y + 3);
    if (Bangle.isGPSOn()) g.drawString('G', x + 5, y + 12);
    if (Bangle.isHRMOn()) g.drawString('H', x + 13, y + 12);
    g.setColor(col(stat.sto)); g.drawRect(x + 2, y + 21, x + 2 + stat.sto * 18, y + 22);
    g.setColor(col(t)); g.drawRect(x + 1, y + 21 - t * 20, x + 2, y + 21);
  }};

  function col(p) {
    return p < 0.5 ? '#0f0' : (p < 0.8 ? '#f80' : '#f00');
  }

  var draw = WIDGETS.devst.draw.bind(WIDGETS.devst);
  var iid = setInterval(draw, Bangle.isLocked() ? 6e4 : 2e3);

  Bangle.on('lcdPower', (on) => {
    if (on) {
      draw();
      if (!iid) iid = setInterval(draw, Bangle.isLocked() ? 6e4 : 2e3);
    } else if (iid) iid = clearInterval(iid);
  });
  Bangle.on('lock', (on) => {
    if (iid) {
      clearInterval(iid);
      iid = setInterval(draw, on ? 6e4 : 2e3);
    }
  });
})();
