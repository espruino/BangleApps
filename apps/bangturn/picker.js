/* BangTurn walk length picker, installed to Storage as "bangturn.picker".
   Two scroll wheels side by side, hours and minutes, like a phone's
   duration picker: drag a wheel up or down (or tap the number above or
   below the middle) and the value in the middle band is the one chosen.
   The total in minutes shows underneath, since the countdown only ever
   shows minutes (1 h 30 is a 90:00 walk).

   require("bangturn.picker").show(mins, done)
     mins: the length to start on (minutes)
     done(mins): called once, with the chosen length, when the button or
     the back arrow is pressed. It doesn't save anything itself; the caller
     does (require("bangturn").setMins). Used by app.js (the button menu on the
     idle screen) and settings.js (Settings > Apps > BangTurn). */

var ROW = 30;         // px between values on a wheel
var MAXH = 9;         // hours wheel 0..9, minutes 0..59, both wrap round

exports.ROW = ROW;

exports.show = function (mins, done) {
  var R = Bangle.appRect;
  var cy = R.y + 72;                       // middle of the selected band
  var top = R.y + 24, bot = R.y2 - 26;     // the wheels' area
  var cols = [
    { x: R.x + R.w * 0.3, v: Math.floor(mins / 60) % (MAXH + 1), n: MAXH + 1, label: "h" },
    { x: R.x + R.w * 0.72, v: mins % 60, n: 60, label: "min" }
  ];
  var col;       // the wheel being dragged
  var shift = 0; // its drag in px not yet turned into a step
  var finished = false;

  function total() { return cols[0].v * 60 + cols[1].v; }
  function wrap(c, v) { return ((v % c.n) + c.n) % c.n; }

  function drawWheel(c, off) {
    for (var i = -2; i <= 2; i++) {
      var y = cy + i * ROW + off;
      if (y < top - 4 || y > bot + 4) continue;
      var mid = Math.abs(y - cy) < ROW / 2;
      g.setFont("Vector", mid ? 32 : 22).setFontAlign(1, 0)
        .drawString("" + wrap(c, c.v + i), c.x + 16, y);
    }
    g.setFont("Vector", 16).setFontAlign(-1, 0).drawString(c.label, c.x + 20, cy + 3);
  }

  function draw() {
    g.reset().clearRect(R.x, R.y, R.x2, R.y2);
    g.setFont("Vector", 18).setFontAlign(0, 0).drawString("Walk length", R.x + R.w / 2, R.y + 10);
    g.setClipRect(R.x, top, R.x2, bot);
    // the selected band, like the phone's highlight
    g.drawLine(R.x + 6, cy - ROW / 2, R.x2 - 6, cy - ROW / 2)
      .drawLine(R.x + 6, cy + ROW / 2, R.x2 - 6, cy + ROW / 2);
    cols.forEach(function (c) { drawWheel(c, c === col ? shift : 0); });
    g.setClipRect(0, 0, g.getWidth() - 1, g.getHeight() - 1);
    var t = Math.max(1, total());
    g.clearRect(R.x, bot + 1, R.x2, R.y2);
    g.setFont("Vector", 20).setFontAlign(0, 0)
      .drawString(t + " min", R.x + R.w / 2, R.y2 - 12);
  }

  function step(c, d) { c.v = wrap(c, c.v + d); }

  function pick(x) { return x < R.x + R.w / 2 ? cols[0] : cols[1]; }

  /* Dragging down brings the smaller numbers above into the middle */
  function onDrag(e) {
    if (finished) return;
    if (!col) { col = pick(e.x); shift = 0; }
    shift += e.dy;
    while (shift > ROW / 2) { step(col, -1); shift -= ROW; }
    while (shift < -ROW / 2) { step(col, 1); shift += ROW; }
    if (!e.b) { col = undefined; shift = 0; } // released: snap to the middle
    draw();
  }

  /* A tap above the band goes one down, below it one up */
  function onTouch(n, e) {
    if (finished || !e) return;
    if (e.y < cy - ROW / 2) step(pick(e.x), -1);
    else if (e.y > cy + ROW / 2) step(pick(e.x), 1);
    else return;
    draw();
  }

  function finish() {
    if (finished) return;
    finished = true;
    Bangle.setUI();
    if (done) done(Math.max(1, total()));
  }

  Bangle.setUI({ mode: "custom", drag: onDrag, touch: onTouch, btn: finish, back: finish });
  draw();
  return {
    draw: draw, total: total, cols: cols, finish: finish
  };
};
