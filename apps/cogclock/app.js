Graphics.prototype.setFont15x32N = function() {
  this.setFontCustom(atob(
    // 15x32.png, converted using http://ebfc.mattbrailsford.com/
    "/////oAAAAKAAAACgAAAAoAAAAKAAAACgf//AoEAAQKB//8CgAAAAoAAAAKAAAACgAAAAoAAAAL////+/wAB/oEAAQKBAAECgf//AoAAAAKAAAACgAAAAoAAAAKAAAACgAAAAoAAAAKAAAAC////AgAAAQIAAAH+/w///oEIAAKBCAACgQgAAoEIAAKBCAACgQg/AoEIIQKB+CECgAAhAoAAIQKAACECgAAhAoAAIQL//+H+/w/h/oEIIQKBCCECgQghAoEIIQKBCCECgQghAoEIIQKB+D8CgAAAAoAAAAKAAAACgAAAAoAAAAL////+///gAIAAIACAACAAgAAgAIAAIAD/+CAAAAggAAAIIAAACD/+//gAAoAAAAKAAAACgAAAAoAAAAL////+///h/oAAIQKAACECgAAhAoAAIQKAACECgfghAoEIIQKBCD8CgQgAAoEIAAKBCAACgQgAAoEIAAL/D//+/////oAAAAKAAAACgAAAAoAAAAKAAAACgfg/AoEIIQKBCD8CgQgAAoEIAAKBCAACgQgAAoEIAAL/D//+/wAAAIEAAACBAAAAgQAAAIEAAACBAAAAgQAAAIH///6AAAACgAAAAoAAAAKAAAACgAAAAoAAAAL////+/////oAAAAKAAAACgAAAAoAAAAKAAAACgfg/AoEIIQKB+D8CgAAAAoAAAAKAAAACgAAAAoAAAAL////+///h/oAAIQKAACECgAAhAoAAIQKAACECgfghAoEIIQKB+D8CgAAAAoAAAAKAAAACgAAAAoAAAAL////+"
  ), "0".charCodeAt(0), 15, 32);
};

/**
 * Add coordinates for nth tooth to vertices
 * @param {array} poly Array to add points to
 * @param {number} n Tooth number
 */
function addTooth(poly, n) {
  const
    tau = Math.PI*2, arc = tau/clock.teeth,
    e = arc*clock.edge, p = arc*clock.point, s = (arc-(e+p))/2; // edge,point,slopes
  const sin = Math.sin, cos = Math.cos,
    x = clock.x, y = clock.y,
    r2 = clock.r2, r3 = clock.r3;
  let r = (n-1)*arc+e/2; // rads
  poly.push(x+r2*sin(r), y-r2*cos(r));
  r += s;
  poly.push(x+r3*sin(r), y-r3*cos(r));
  r += p;
  poly.push(x+r3*sin(r), y-r3*cos(r));
  r += s;
  poly.push(x+r2*sin(r), y-r2*cos(r));
}

/**
 * @param {number} n Tooth number to fill (1-based)
 * @param col Fill color
 */
function fillTooth(n, col) {
  if (!n) return; // easiest to check here
  let poly = [];
  addTooth(poly, n);
  g.setColor(col).fillPoly(poly)
    .setColor(g.theme.fg2).drawPoly(poly); // fillPoly colored over the outline
}

const ClockFace = require("ClockFace");
const clock = new ClockFace({
  precision: 1,
  settingsFile: "cogclock.settings.json",
  init: function() {
    this.r1 = (process.env.HWVERSION>1) ? 68 : 84; // inner radius
    this.r3 = Math.min(Bangle.appRect.w/2, Bangle.appRect.h/2); // outer radius
    this.r2 = (this.r1*3+this.r3*2)/5;
    this.teeth = 12;
    this.edge = 0.45;
    this.point = 0.35; // as fraction of arc
    this.x = Bangle.appRect.x+Bangle.appRect.w/2;
    this.y = Bangle.appRect.y+Bangle.appRect.h/2;
  },
  draw: function(d) {
    const x = this.x, y = this.y;
    g.setColor(g.theme.bg2).fillCircle(x, y, this.r2) // fill cog
      .setColor(g.theme.bg).fillCircle(x, y, this.r1) // clear center
      .setColor(g.theme.fg2).drawCircle(x, y, this.r1); // draw inner border
    let poly = []; // complete teeth outline
    for(let t = 1; t<=this.teeth; t++) {
      fillTooth(t, g.theme.bg2);
      addTooth(poly, t);
    }
    g.drawPoly(poly, true); // draw outer border
    if (!this.showDate) {
      // draw top/bottom rectangles (instead of year/date)
      g.reset()
        .fillRect(x-30, y-60, x+29, y-33).clearRect(x-28, y-58, x+27, y-33)
        .fillRect(x-30, y+60, x+29, y+30).clearRect(x-28, y+58, x+27, y+30);
    }
    this.tooth = 0;
    this.update(d, {s: 1, m: 1, h: 1, d: 1});
  },
  update: function(d, c) {
    g.reset();
    const pad2 = num => (num<10 ? "0" : "")+num,
      year = d.getFullYear(),
      date = pad2(d.getDate())+pad2(d.getMonth()),
      time = pad2(d.getHours())+pad2(d.getMinutes()),
      tooth = Math.round(d.getSeconds()/60*this.teeth);
    const x = this.x, y = this.y;
    if (c.m) {
      g.setFont("15x32N:2").setFontAlign(0, 0) // center middle
        .drawString(time, x, y, true);
    }
    if (this.showDate) {
      if (c.d) {
        g.setFont("15x32N").setFontAlign(0, -1) // center top
          .drawString(year, x, y+32, true)
          .setFont("15x32N").setFontAlign(0, 1) // center bottom
          .drawString(date, x, y-32, true);
      }
    }

    if (tooth!==this.tooth) {
      if (tooth>this.tooth) {
        for(let t = this.tooth; t<=tooth; t++) { // fill missing teeth
          fillTooth(t, g.theme.fg2);
        }
      } else {
        for(let t = this.tooth; t>tooth; t--) { // erase extraneous teeth
          fillTooth(t, g.theme.bg2);
        }
      }
    }
    this.tooth = tooth;
  }
});
clock.start();
