Graphics.prototype.setFont16x32N = function() {
  this.setFontCustom(atob(
    "/////v////7////+4AAADuAAAA7gAAAO4AAADuAAAA7gAAAO4AAADuAAAA7gAAAO/////v////7////+AAAAAOAAAA7gAAAO4AAADuAAAA7gAAAO4AAADv////7////+/////gAAAA4AAAAOAAAADgAAAA4AAAAOAAAADgAAAADgA//+4AP//uAD//7gA4AO4AOADuADgA7gA4AO4AOADuADgA7gA4AO4AOADuADgA7//4AO//+ADv//gA4AAAAA4AOADuADgA7gA4AO4AOADuADgA7gA4AO4AOADuADgA7gA4AO4AOADuADgA7gA4AO/////v////7////+AAAAAP//gAD//4AA//+AAAADgAAAA4AAAAOAAAADgAAAA4AAAAOAAAADgAAAA4AAAAOAAP////7////+/////gAAAAD//4AO//+ADv//gA7gA4AO4AOADuADgA7gA4AO4AOADuADgA7gA4AO4AOADuADgA7gA//+4AP//uAD//4AAAAA/////v////7////+4AOADuADgA7gA4AO4AOADuADgA7gA4AO4AOADuADgA7gA4AO4AP//uAD//7gA//+AAAAAOAAAADgAAAA4AAAAOAAAADgAAAA4AAAAOAAAADgAAAA4AAAAOAAAADgAAAA4AAAAP////7////+/////gAAAAD////+/////v////7gA4AO4AOADuADgA7gA4AO4AOADuADgA7gA4AO4AOADuADgA7////+/////v////4AAAAA//+ADv//gA7//4AO4AOADuADgA7gA4AO4AOADuADgA7gA4AO4AOADuADgA7gA4AO/////v////7////+AAAAAA=="
  ), "0".charCodeAt(0), 16, 32);
};

Bangle.setUI("clock"); // set UI first, so widgets know about Bangle.CLOCK
Bangle.loadWidgets(); // load widgets, so Bangle.appRect knows about them

const r1 = 84, // inner radius
  r3 = Math.min(Bangle.appRect.w/2, Bangle.appRect.h/2), // outer radius
  r2 = (r1*3+r3*2)/5,
  teeth = 12,
  edge = 0.45, point = 0.35; // as fraction of arc

const x = Bangle.appRect.x+Bangle.appRect.w/2,
  y = Bangle.appRect.y+Bangle.appRect.h/2;

/**
 * Add coordinates for nth tooth to vertices
 * @param {array} poly Array to add points to
 * @param {number} n Tooth number
 */
function addTooth(poly, n) {
  const
    tau = Math.PI*2, arc = tau/teeth,
    e = arc*edge, p = arc*point, s = (arc-(e+p))/2; // edge,point,slopes
  const sin = Math.sin, cos = Math.cos;
  let r = (n-1)*arc+e/2; // rads
  poly.push(x+r2*sin(r), y-r2*cos(r));
  r += s;
  poly.push(x+r3*sin(r), y-r3*cos(r));
  r += p;
  poly.push(x+r3*sin(r), y-r3*cos(r));
  r += s;
  poly.push(x+r2*sin(r), y-r2*cos(r));
}

function drawCog() {
  g.drawCircle(x, y, r1);
  let poly = [];
  for(let t = 1; t<=teeth; t++) {
    addTooth(poly, t);
  }
  g.drawPoly(poly, true);
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
    .setColor(g.theme.fg).drawPoly(poly); // fillPoly colored over the outline
}

let last = {tooth: 0}, timeOut;
function draw() {
  if (!Bangle.isLCDOn()) return; // no drawing, also no new update scheduled
  g.reset();
  const pad2 = num => (num<10 ? "0" : "")+num,
    d = new Date(),
    year = d.getFullYear(),
    date = pad2(d.getDate())+pad2(d.getMonth()),
    time = pad2(d.getHours())+pad2(d.getMinutes()),
    tooth = Math.round(d.getSeconds()/60*teeth),
    m = d.getMilliseconds();
  if (year!==last.year) {
    g.setFont("16x32N").setFontAlign(0, -1) // center top
      .drawString(year, x, y+34, true);
  }
  if (date!==last.date) {
    g.setFont("16x32N").setFontAlign(0, 1) // center bottom
      .drawString(date, x, y-34, true);
  }
  if (time!==last.time) {
    g.setFont("16x32N:2").setFontAlign(0, 0) // center middle
      .drawString(time, x, y, true);
  }
  if (tooth!==last.tooth) {
    if (tooth>last.tooth) {
      for(let t = last.tooth; t<=tooth; t++) { // fill missing teeth
        fillTooth(t, g.theme.fg2);
      }
    } else {
      for(let t = last.tooth; t>tooth; t--) { // erase extraneous teeth
        fillTooth(t, g.theme.bg);
      }
    }
  }

  last = {
    year: year,
    date: date,
    time: time,
    tooth: tooth,
  };
  timeOut = setTimeout(draw, 1000-m);
}
g.clear();
Bangle.drawWidgets();
Bangle.on("lcdPower", on => {
  if (timeOut) {
    clearTimeout(timeOut);
    timeOut = undefined;
  }
  if (on) draw();
});
drawCog();
draw();
