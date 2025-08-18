(function(){
  
  var showPercent = false;
  const width = 40;
  const height = 24;

  let COLORS = {
    'bg': g.theme.bg,
    'fg': g.theme.fg,
    'charging': "#08f",
    'high': g.theme.dark ? "#fff" : "#000",
    'low': "#f00",
  };

  const levelColor = (l) => {
    if (Bangle.isCharging()) return COLORS.charging;
    if (l >= 30) return COLORS.high;
    return COLORS.low;
  };

  function draw() {
  let batt=E.getBattery();
  let data = require("smartbatt").get();
  let hrsLeft=data.hrsLeft;
  let days = hrsLeft / 24;

  let txt = showPercent
    ? batt
    : (days >= 1
      ? Math.round(Math.min(days, 99)) + "d"
      : Math.round(hrsLeft) + "h");
  if(Bangle.isCharging()) txt=E.getBattery();
  let s = 29;
  let x = this.x, y = this.y;
  let xl = x + 4 + batt * (s - 12) / 100;
  
  // Drawing code follows...
  g.setColor(COLORS.bg);
  g.fillRect(x + 2, y + 5, x + s - 6, y + 18);

  g.setColor(levelColor(batt));
  g.fillRect(x + 1, y + 3, x + s - 5, y + 4);
  g.fillRect(x + 1, y + 19, x + s - 5, y + 20);
  g.fillRect(x, y + 4, x + 1, y + 19);
  g.fillRect(x + s - 5, y + 4, x + s - 4, y + 19);
  g.fillRect(x + s - 3, y + 8, x + s - 2, y + 16);
  g.fillRect(x + 4, y + 15, xl, y + 16);

  g.setColor(COLORS.fg);
  g.setFontAlign(0, 0);
  g.setFont('6x8');
  g.drawString(txt, x + 14, y + 10);

  
}
  WIDGETS["widsmartbatt"] = {
    area: "tr",
    width: 30,
    draw: draw
  };

  // Touch to temporarily show battery percent
  Bangle.on("touch", function (_btn, xy) {
    if (WIDGETS["back"] || !xy) return;

    var oversize = 5;
    var w = WIDGETS["widsmartbatt"];
    var x = xy.x, y = xy.y;

    if (w.x - oversize <= x && x < w.x + width + oversize
      && w.y - oversize <= y && y < w.y + height + oversize) {
      E.stopEventPropagation && E.stopEventPropagation();
      showPercent = true;
      setTimeout(() => {
        showPercent = false;
        w.draw(w);
      }, 3000);
      w.draw(w);
    }
  });

  // Update widget on charging state change
  Bangle.on('charging', function () {
    WIDGETS["widsmartbatt"].draw();
  });
  
  setInterval(() => WIDGETS["widsmartbatt"].draw(), 60000);

  
})();
