(function() {
  WIDGETS["cal"] = {
    area: "tl", width: 22, draw: function() {
      const x = this.x, y = this.y,
        x2 = x+21, y2 = y+23,
        date = new Date(),
        month = require("locale").month(date, true),
        day = date.getDate();

      g.reset().setFontAlign(0, 0) // center all text
        // header
        .setBgColor("#f00").setColor("#fff")
        .clearRect(x, y, x2, y+8).setFont("4x6").drawString(month, (x+x2)/2+1, y+5)
        // date
        .setBgColor("#fff").setColor("#000")
        .clearRect(x, y+9, x2, y2).setFont("Vector:16").drawString(day, (x+x2)/2+2, y+17);
      if (!g.theme.dark) {
        // black border around date for light themes
        g.setColor("#000").drawPoly([
          x, y+9,
          x, y2,
          x2, y2,
          x2, y+9
        ]);
      }
      // redraw when date changes
      if (WIDGETS["cal"].to) clearTimeout(WIDGETS["cal"].to);
      WIDGETS["cal"].to = setTimeout(()=>WIDGETS["cal"].draw(), (86401 - Math.floor(date/1000) % 86400)*1000);
    }
  };
})();
