/* =====================================================================
 *  Shared helpers
 * ===================================================================== */

var tick         = null;   // interval id of the draw toy redraw loop
var animInterval = null;   // interval id of the ripple toy animation
var btnWatch     = null;

function clearBtnWatch() {
  if (btnWatch) {
    clearWatch(btnWatch);
    btnWatch = null;
  }
}

function stopTimers() {
  if (tick)         { clearInterval(tick);         tick = null; }
  if (animInterval) { clearInterval(animInterval); animInterval = null; }
}

function quitApp() {
  stopTimers();
  clearBtnWatch();
  Bangle.removeAllListeners();
  g.setColor(0, 0, 0);
  g.clear();
  g.flip();
  load();
}

function installButton(onShortPress) {
  clearBtnWatch();
  var downTime = 0;
  btnWatch = setWatch(function (e) {
    if (e.state) {
      downTime = e.time;
    } else if (e.time - downTime > 1.5) {
      quitApp();
    } else if (onShortPress) {
      onShortPress();
    }
  }, BTN, { repeat: true, edge: "both", debounce: 30 });
}


/* =====================================================================
 *  Toy 1 : Draw
 * ===================================================================== */

var STROKE_W      = 10;    // line width in pixels
var FADE_MS       = 3000;  // how long a finished stroke stays on screen
var TOUCH_TIMEOUT = 150;   // ms without touch data => stroke is finished
var FLIP_MS       = 50;    // how often to push the buffer to the LCD

var strokes   = [];        // every stroke
var cur       = null;      // the stroke currently being drawn
var lastTouch = 0;
var dirty     = false;
var R         = STROKE_W / 2;

function clearCanvas() {
  g.setColor(1, 1, 1);
  g.fillRect(0, 0, g.getWidth(), g.getHeight());
}

function setPen() {
  g.setColor(0, 0, 0);
}

function dot(x, y) {
  g.fillCircle(x, y, R);
}

function segment(a, b) {
  var dx = b.x - a.x;
  var dy = b.y - a.y;
  var dist = Math.sqrt(dx * dx + dy * dy);
  var step = Math.max(1, R / 2);
  var n = Math.ceil(dist / step);
  for (var i = 1; i <= n; i++) {
    var t = i / n;
    g.fillCircle(a.x + dx * t, a.y + dy * t, R);
  }
}

function redraw() {
  clearCanvas();
  setPen();
  strokes.forEach(function (s) {
    var p = s.pts;
    if (!p.length) return;
    dot(p[0].x, p[0].y);
    for (var i = 1; i < p.length; i++) segment(p[i - 1], p[i]);
  });
  dirty = true;
}

function drawTouch(zone, xy) {
  lastTouch = Date.now();

  if (cur) {
    cur.expire = lastTouch + FADE_MS;
    cur = null;
  }

  cur = { pts: [], expire: 0 };
  strokes.push(cur);

  setPen();
  dot(xy.x, xy.y);
  cur.pts.push({ x: xy.x, y: xy.y });
  dirty = true;
}

function drawDrag(e) {
  lastTouch = Date.now();
  if (!cur) {
    cur = { pts: [], expire: 0 };
    strokes.push(cur);
  }
  var p = cur.pts;
  var last = p[p.length - 1];
  if (!last) {
    setPen();
    dot(e.x, e.y);
  } else {
    if (last.x === e.x && last.y === e.y) return;
    setPen();
    segment(last, { x: e.x, y: e.y });
  }
  p.push({ x: e.x, y: e.y });
  dirty = true;
}

function drawTick() {
  var now = Date.now();

  if (cur && now - lastTouch > TOUCH_TIMEOUT) {
    cur.expire = lastTouch + FADE_MS;
    cur = null;
  }

  var before = strokes.length;
  strokes = strokes.filter(function (s) {
    return s.expire === 0 || s.expire > now;
  });
  if (strokes.length !== before) redraw();

  if (dirty) {
    dirty = false;
    g.flip();
  }
}

function clearDrawing() {
  strokes = [];
  cur = null;
  redraw();
  dirty = false;
  g.flip();
}

function startDraw() {
  Bangle.removeAllListeners();
  clearBtnWatch();

  strokes   = [];
  cur       = null;
  lastTouch = 0;
  dirty     = false;

  clearCanvas();
  g.flip();

  Bangle.on("touch", drawTouch);
  Bangle.on("drag",  drawDrag);

  tick = setInterval(drawTick, FLIP_MS);

  installButton(clearDrawing);
}


/* =====================================================================
 *  Toy 2 : Ripple Wave
 * ===================================================================== */

var SPEED       = 2;     // pixels per frame - how fast the ripples expand
var INTENSITY   = 1.0;   // initial brightness multiplier (0 ... 1)
var FADE_TIME   = 2000;  // milliseconds until a ripple completely fades
var FRAME_RATE  = 30;    // animation frames per second
var MAX_RIPPLES = 20;    // maximum number of simultaneous ripples
var WAVE_COUNT  = 3;     // how many concentric circles per ripple
var WAVE_SPACE  = 6;     // pixels between each concentric circle

var BASE_COLOR = [1, 0.5, 0];
var BG_COLOR   = [1, 1, 1];

var ripples = [];

function createRipple(x, y) {
  ripples.push({
    x: x,
    y: y,
    radius: 0,
    birthTime: getTime()
  });
  if (ripples.length > MAX_RIPPLES) ripples.shift();
}

function updateRipples() {
  var now = getTime();
  ripples = ripples.filter(function (r) {
    var ageMs = (now - r.birthTime) * 1000;
    if (ageMs >= FADE_TIME) return false;
    r.radius += SPEED;
    if (r.radius > 350) return false;
    return true;
  });
}

function drawRipples() {
  g.setColor(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2]);
  g.fillRect(0, 0, g.getWidth() - 1, g.getHeight() - 1);

  var now = getTime();
  for (var i = 0; i < ripples.length; i++) {
    var r = ripples[i];
    var ageMs = (now - r.birthTime) * 1000;
    var fade = 1 - (ageMs / FADE_TIME);
    if (fade < 0) fade = 0;

    for (var w = 0; w < WAVE_COUNT; w++) {
      var rWave = r.radius - w * WAVE_SPACE;
      if (rWave <= 0) continue;

      var waveFade = fade * (1 - w / WAVE_COUNT);
      if (waveFade < 0) waveFade = 0;

      g.setColor(BASE_COLOR[0] * INTENSITY * waveFade,
                 BASE_COLOR[1] * INTENSITY * waveFade,
                 BASE_COLOR[2] * INTENSITY * waveFade);
      g.drawCircle(r.x, r.y, rWave);
    }
  }

  g.flip();
}

function animateRipples() {
  updateRipples();
  drawRipples();
}

function rippleTouch(button, xy) {
  createRipple(xy.x, xy.y);
}

function startRipple() {
  Bangle.removeAllListeners();
  clearBtnWatch();

  ripples = [];

  g.setColor(BG_COLOR[0], BG_COLOR[1], BG_COLOR[2]);
  g.fillRect(0, 0, g.getWidth() - 1, g.getHeight() - 1);
  g.flip();

  Bangle.on("touch", rippleTouch);

  animInterval = setInterval(animateRipples, 1000 / FRAME_RATE);

  installButton(null);
}


/* =====================================================================
 *  Selector
 * ===================================================================== */

var MENU_ITEMS = [
  { name: "Draw",        run: startDraw   },
  { name: "Ripple Wave", run: startRipple }
];
var MENU_TOP = 40;

function menuRowHeight() {
  return Math.floor((g.getHeight() - MENU_TOP - 24) / MENU_ITEMS.length);
}

function drawSelector() {
  var w = g.getWidth(), h = g.getHeight();
  var rowH = menuRowHeight();
  var i, y;

  g.clear();
  g.setColor(0, 0, 0);
  g.setFontAlign(0, -1);
  g.setFont("6x8", 2);
  g.drawString("Toybox", w / 2, 8);

  g.setFontAlign(0, 0);
  for (i = 0; i < MENU_ITEMS.length; i++) {
    y = MENU_TOP + i * rowH;
    g.setColor(0, 0, 0);
    g.drawRect(6, y, w - 7, y + rowH - 8);
    g.drawString(MENU_ITEMS[i].name, w / 2, y + (rowH - 8) / 2);
  }

  g.setFont("6x8", 1);
  g.setFontAlign(0, -1);
  g.drawString("hold BTN to quit", w / 2, h - 12);
  g.flip();
}

function selectorTouch(zone, xy) {
  if (xy.y < MENU_TOP) return;
  var rowH = menuRowHeight();
  var idx  = Math.floor((xy.y - MENU_TOP) / rowH);
  if (idx >= MENU_ITEMS.length) idx = MENU_ITEMS.length - 1;

  MENU_ITEMS[idx].run();
}

function showSelector() {
  stopTimers();
  clearBtnWatch();
  Bangle.removeAllListeners();

  drawSelector();
  Bangle.on("touch", selectorTouch);
  installButton(null);
}

showSelector();