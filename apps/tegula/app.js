// Tegula - Digital Art Clock for Bangle.js 2
// Version 0.02
//
// The 176x176 px screen is divided into 11 x 11 square tiles of 16 px.
// The tiles show a random Lohse square without gaps, and HH above MM in a 4x5-tile
// digit font as black tiles. Digit tiles are drawn smaller than their cell, so a border
// in the color of the square underneath separates them (see README.md).
// New image (square, palette, colors) on every start and on swipe up.
//
// While the watch is unlocked:
// - in all three views, all tiles turn pale (blended with white) for 2 s, then show their
//   own colors for 1 s, and so on; the digits stay black
// - a white line at the top shows the view: left DD/MM, middle HH/MM, right MM/SS
// - a white line at the right shrinks from full height to a point until the screen locks
// - swipe right shows DD/MM, swipe left shows MM/SS (until the screen locks)
// - swipe up shows a new image
// - double tap bottom left switches the flash light on (until the next tap)
// - swipe down shows the widgets (only with FAST_LOAD)
//
// Lohse square as a Cayley table of the cyclic group Z_N:
//   tile (column c, row r) = color (ROW_SHIFT[r] + c) mod N, a position on the color wheel
// ROW_SHIFT is a permutation of 0..N-1 with ROW_SHIFT[0] = 0, every step from one row to
// the next lies in 2..N-2 (mod N), also the step from the last row back to the first:
//   Latin:             ROW_SHIFT is a permutation, every row is a cyclic shift
//   diagonals differ:  no step is +1 or -1
//   torus:             all of this also holds when tiling across the edges
{
  const FAST_LOAD = true;       // widgets on swipe down and fast loading (false: neither)
  const N = 11;                 // grid size: 11 x 11 tiles, two rows of 5-tile digits + 1 row
  const GAP = 4;                // gap between digit tiles in px (0 to 4): a border of GAP/2 px
  const PULSE_PALE = 2000;      // unlocked: all tiles pale for 2 s,
  const PULSE_NORMAL = 1000;    //   then in their own colors for 1 s (both whole seconds)
  const LIGHTEN = 0.25;         // pale: blended with white by 0.25 (0.5: paler)

  // Without FAST_LOAD, the clock must not run with widgets that the previous app left in
  // memory when it fast loaded the clock. The boot loader and Fastload Utils only prevent
  // this for clocks whose code lacks "Bangle.loadWidgets", but this file contains it:
  // reload from scratch, as the boot loader does.
  if (!FAST_LOAD && global.WIDGETS) {
    load(global.__FILE__);
    throw "Tegula: reload without widgets";
  }

  // New random sequence on every start. srand() puts the low and high 16 bits of the
  // seed into the two halves of Espruino's generator, | 0x10001 keeps both non-zero.
  // Hardware noise (nRF5x, STM32 F1/F4) mixed with the time in µs.
  E.srand((E.hwRand() ^ (Date.now() * 1000)) | 0x10001);

  const S = 176 / N;            // tile size: 16 px
  const G0 = GAP >> 1;          // part of the gap left/above a digit tile, the rest right/below
  const G1 = G0 - GAP + S - 1;  // right/bottom edge of a digit tile within its cell
  const PULSE = PULSE_PALE + PULSE_NORMAL;  // one pulse: 3 s

  // 11-color wheels (RGB), interpolated to N colors
  const PALETTES = [
    // 1: sampled from a 12x12 square by Lohse (original), reduced to 11 colors
    new Uint8Array([
      254, 240,   0,  // yellow
      252, 170,   0,  // golden yellow
      246,  64,   0,  // red orange
      239,   0,  58,  // carmine
      119,   0, 121,  // purple
       62,  51, 141,  // blue violet
       26,  79, 160,  // blue
        0, 123, 136,  // teal
        0, 158,  50,  // green
      106, 197,  25,  // yellow green
      213, 237,   0   // lime
    ]),
    // 2: fully saturated HSV wheel (30° steps, spring green omitted)
    new Uint8Array([
      255, 255,   0,  // yellow      (60°)
      255, 128,   0,  // orange      (30°)
      255,   0,   0,  // red         (0°)
      255,   0, 128,  // rose        (330°)
      255,   0, 255,  // magenta     (300°)
      128,   0, 255,  // violet      (270°)
        0,   0, 255,  // blue        (240°)
        0, 128, 255,  // azure       (210°)
        0, 255, 255,  // cyan        (180°)
        0, 255,   0,  // green       (120°)
      128, 255,   0   // chartreuse  (90°)
    ]),
    // 3: measured from Lohse's 8x8 painting (1955/1969), reduced to 11 colors
    new Uint8Array([
      255, 220,  17,  // yellow
      251, 185,   3,  // golden yellow
      233,  77,  26,  // red orange
      222,  31,  82,  // carmine
      104,  61, 141,  // purple
       52,  85, 159,  // blue violet
       19, 105, 178,  // blue
       18, 126, 155,  // teal
       25, 141,  70,  // dark green
       23, 163,  41,  // green
      210, 215,   9   // lime
    ])
  ];

  // 4x5 digits as bit masks: row y of digit i is FONT[5 * i + y], bit x is column x.
  // Built from the strings below (five rows from top to bottom), which are freed afterwards.
  const FONT = new Uint8Array(50);
  [
    "1111 1001 1001 1001 1111", // 0
    "0001 0001 0001 0001 0001", // 1
    "1111 0001 1111 1000 1111", // 2
    "1111 0001 0111 0001 1111", // 3
    "1001 1001 1111 0001 0001", // 4
    "1111 1000 1111 0001 1111", // 5
    "1000 1000 1111 1001 1111", // 6
    "1111 0001 0001 0001 0001", // 7
    "1111 1001 1111 1001 1111", // 8
    "1111 1001 1111 0001 0001"  // 9
  ].forEach((f, i) => {
    for (let y = 0; y < 5; y++) for (let x = 0; x < 4; x++)
      if (f[y * 5 + x] === "1") FONT[5 * i + y] |= 1 << x;
  });

  // Image and screen state. A digit tile is a tile of a digit, drawn in black.
  const ROW_SHIFT = new Uint8Array(N);   // Lohse square: color of the first tile in row r,
                                         //   tile (c, r) has color ROW_SHIFT[r] + c (mod N)
  const COLORS = new Uint16Array(2 * N); // the N colors of the image, twice:
                                         //   COLORS[k] = COLORS[k + N], no % while drawing
  const PALE = new Uint16Array(2 * N);   // the same colors, blended with white for the pulse
  const FRAME = new Uint16Array(N);      // the digit tiles of the view, per row r:
                                         //   bit c of FRAME[r] set: tile (c, r) is a digit tile

  let key;              // color wheel of the current image (one of PALETTES)
  let drawTimeout;      // next redraw: unlocked or MM/SS next second, else next minute
  let view = 0;         // -1: DD/MM, 0: HH/MM, 1: MM/SS
  let locked = true;    // screen is locked
  let light = false;    // flash light is on
  let saved;            // timeouts to restore after the flash light
  let lastTap = 0;      // time of the last tap bottom left
  let pulseSince;       // start of the pulse in ms (a whole second), kept by the periodic redraws
  let countdownSince;   // start of the lock countdown in ms: unlock or last touch

  // New Lohse square: picks ROW_SHIFT, the color of the first tile in each row (rules at
  // the top). From there, each row runs once through the color wheel.
  // Row 0 starts with color 0: a random start would only rotate the colors, which
  // newColors() already does. Each further row takes a random unused color at a valid
  // step from the row above. No backtracking: only the 2 neighbors of the row above are
  // excluded, so a dead end can only occur in the last 2 rows. Then, or if the step from
  // the last row back to row 0 is invalid (torus), the whole square starts over.
  // Local variables: faster lookups than in the enclosing scope.
  const newSquare = () => {
    "ram";
    const n = N, rowShift = ROW_SHIFT, random = Math.random;
    const unused = new Uint8Array(n - 1);  // colors no row has used yet: unused[0..unusedCount-1]
    let unusedCount;

    // Valid step from color a to color b: b lies 2..N-2 positions further on the wheel, so
    // it is neither a itself nor a neighbor of a (+1 or -1)
    const isValidStep = (a, b) => {
      const step = (b - a + n) % n;
      return step >= 2 && step <= n - 2;
    };

    // Dead end: no unused color at a valid step from color, only its neighbors are left.
    // As color has just 2 neighbors, this needs at most 2 unused colors.
    const isDeadEnd = color => {
      if (unusedCount > 2) return false;
      for (let i = 0; i < unusedCount; i++) if (isValidStep(color, unused[i])) return false;
      return true;
    };

    // A random unused color at a valid step from color, drawn again until the step is
    // valid. It is used from now on: the last unused color takes its place.
    const takeNextColor = color => {
      let i;
      do { i = (random() * unusedCount) | 0; } while (!isValidStep(color, unused[i]));
      const next = unused[i];
      unused[i] = unused[--unusedCount];
      return next;
    };

    // One attempt, row by row. False at a dead end or if the step from the last row back
    // to row 0 is invalid.
    const fillRows = () => {
      for (let i = 0; i < n - 1; i++) unused[i] = i + 1;  // all colors except 0
      unusedCount = n - 1;
      let color = rowShift[0] = 0;                        // color of the row above
      for (let row = 1; row < n; row++) {
        if (isDeadEnd(color)) return false;
        color = rowShift[row] = takeNextColor(color);
      }
      return isValidStep(color, rowShift[0]);             // back to row 0 (torus)
    };

    while (!fillRows()) { /* start over */ }
  };

  // New COLORS: N colors evenly spaced on the wheel of the K key colors (key), random
  // start color and direction. Position p in units of 1/N key color: integer, hence exact.
  // With K = N = 11, every image shows the 11 key colors, without interpolation.
  // PALE: each color blended with white, once per image (16-bit, dithered when drawn).
  const newColors = () => {
    const n = N, C = key, K = C.length / 3, W = K * n, s = Math.random() < 0.5 ? K : W - K;
    let k, i0, i1, f, p = ((Math.random() * K) | 0) * n;
    for (k = 0; k < n; k++) {
      i0 = (p / n) | 0; f = (p - i0 * n) / n;
      i1 = i0 === K - 1 ? 0 : 3 * i0 + 3; i0 *= 3;
      COLORS[k] = COLORS[k + n] = g.toColor(
        (C[i0] + (C[i1] - C[i0]) * f) / 255,
        (C[i0 + 1] + (C[i1 + 1] - C[i0 + 1]) * f) / 255,
        (C[i0 + 2] + (C[i1 + 2] - C[i0 + 2]) * f) / 255);
      PALE[k] = PALE[k + n] = g.blendColor(COLORS[k], "#fff", LIGHTEN);
      p += s; if (p >= W) p -= W;
    }
  };

  // New image: color palette (1 to 3 at random), Lohse square and colors.
  // Only on start and on swipe up.
  const newArt = () => {
    key = PALETTES[(Math.random() * PALETTES.length) | 0];
    newSquare();
    newColors();
  };

  // All tiles: the Lohse square without gaps, the digit tiles in black. Each tile: the
  // whole cell in its color (pale: in its pale color), a digit tile in black on top, shrunk
  // by the gap. The gap is transparent: it shows the color of the cell.
  // Local copies of the constants: faster lookups than in the enclosing scope.
  const drawTiles = pale => {
    "ram";
    const G = g.reset(), colors = pale ? PALE : COLORS, rowShift = ROW_SHIFT, frame = FRAME,
          n = N, size = S, last = S - 1, g0 = G0, g1 = G1;  // last: last pixel of a cell
    let row, col, shift, x, y, digitTiles;
    for (row = 0, y = 0; row < n; row++, y += size) {
      shift = rowShift[row]; digitTiles = frame[row];  // bit 0: digit tile in this column
      for (col = 0, x = 0; col < n; col++, x += size) {
        G.setColor(colors[shift + col]).fillRect(x, y, x + last, y + last);
        if (digitTiles & 1) G.setColor(0).fillRect(x + g0, y + g0, x + g1, y + g1);
        digitTiles >>= 1;
      }
    }
  };

  // Pulse: while unlocked without flash light, in all three views, all tiles turn pale for
  // PULSE_PALE ms (their colors blended with white, PALE), then show their own colors for
  // PULSE_NORMAL ms, and so on. The black squares stay black. It starts pale at pulseSince,
  // the start rounded to a whole second: so it switches on whole seconds, with the redraw
  // every second while unlocked, and the first pale phase lasts 1.5 to 2.5 s.

  // Pale at this redraw? The periodic redraws come on whole seconds after pulseSince:
  // rounding to whole seconds absorbs the jitter of the timer.
  const pulsePale = () =>
    Math.round((Date.now() - pulseSince) / 1000) * 1000 % PULSE < PULSE_PALE;

  // Two white lines while unlocked, 4 px wide, drawn after all tiles: a line that shrinks
  // or moves leaves no trace.
  // - view, at the top: y = 0..3, over the third of the width that belongs to the view:
  //   DD/MM left (x 0..58), HH/MM middle (59..117), MM/SS right (118..175). It covers the
  //   top 2 px of the digit tiles below it (row 0, y = 2..13).
  // - lock countdown, at the right: x = 172..175, centered on y = 88. It shrinks from
  //   176 px at the unlock or last touch to a point at the lock, over the lock timeout of
  //   the system (LCD Timeout); none if that is 0 (never locks).
  const drawLines = () => {
    const x0 = 59 * (view + 1), x1 = Math.min(x0 + 58, 175),
          timeout = Bangle.getOptions().lockTimeout,   // in ms
          left = Math.min(timeout, timeout - (Date.now() - countdownSince)),  // ms to the lock
          h = left > 0 ? Math.round(88 * left / timeout) : 0;  // half the length of the line
    const G = g.reset().setColor("#fff").fillRect(x0, 0, x1, 3);
    if (h) G.fillRect(172, 88 - h, 175, 87 + h);
  };

  // Redraw. tick: periodic redraw (next second or minute), the pulse goes on; otherwise it
  // starts again, pale.
  const draw = tick => {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    if (!tick) pulseSince = Math.round(Date.now() / 1000) * 1000;

    // Flash light: white screen, nothing else
    if (light) {
      g.reset().setColor("#fff").fillRect(0, 0, 175, 175);
      return;
    }

    // First number in the upper half, second number in the lower half
    const d = new Date();
    const v = view < 0 ? [d.getDate(), d.getMonth() + 1] :
              view > 0 ? [d.getMinutes(), d.getSeconds()] :
                         [d.getHours(), d.getMinutes()];
    const digits = [v[0] / 10 | 0, v[0] % 10, v[1] / 10 | 0, v[1] % 10];

    // Digit tiles: 4x5 tiles per digit, 1 tile between the digits and between HH and MM.
    // Columns 1 + 4 + 1 + 4 + 1 = 11: digit i starts in column 1 + 5 * (i % 2).
    // Rows 5 + 1 + 5 = 11 (no margin): digit i starts in row 6 * (i >> 1).
    FRAME.fill(0);
    digits.forEach((dig, i) => {
      const c0 = 1 + 5 * (i % 2), r0 = 6 * (i >> 1);
      for (let y = 0; y < 5; y++) FRAME[r0 + y] |= FONT[5 * dig + y] << c0;
    });
    // Unlocked: tiles with the pulse, then the lines on top (draw() never gets here with the
    // flash light on). Locked: tiles in their own colors only.
    drawTiles(!locked && pulsePale());
    if (!locked) drawLines();

    // Redraw at the start of the next second (unlocked: pulse and lines; MM/SS: seconds),
    // otherwise at the start of the next minute
    const t = locked && view <= 0 ? 60000 : 1000;
    drawTimeout = setTimeout(() => { drawTimeout = undefined; draw(true); }, t - Date.now() % t);
  };

  // Flash light on: white screen at full brightness, no timeout
  const lightOn = () => {
    const o = Bangle.getOptions();
    saved = { backlightTimeout: o.backlightTimeout, lockTimeout: o.lockTimeout };
    light = true;
    Bangle.setLCDTimeout(0);
    Bangle.setLCDBrightness(1);
    Bangle.setLCDPower(1);
    draw();
  };

  // Flash light off: restore timeouts and brightness (the caller redraws)
  const lightOff = () => {
    if (!light) return;
    light = false;
    Bangle.setOptions(saved);
    const s = require("Storage").readJSON("setting.json", 1) || {};
    Bangle.setLCDBrightness(s.brightness === undefined ? 1 : s.brightness);
  };

  // Locked: flash light off, back to HH/MM, no lines (draw). Unlocked: lock countdown from
  // now on, pulse and lines (draw).
  const onLock = l => {
    locked = l;
    if (l) {
      lightOff();
      view = 0;
    } else {
      countdownSince = Date.now();
    }
    draw();
  };

  // Every touch (tap, swipe, drag) restarts the lock countdown, as it restarts the lock
  // timer of the firmware. A button press would too, but it opens the launcher (clock mode).
  const onDrag = () => { countdownSince = Date.now(); };

  // Any tap: flash light off. Double tap bottom left: flash light on
  const onTouch = (b, e) => {
    if (light) {
      lightOff();
      draw();
      return;
    }
    const now = Date.now(), bottomLeft = e.x < 88 && e.y > 132;
    if (bottomLeft && now - lastTap < 500) {
      lastTap = 0;
      lightOn();
    } else {
      lastTap = bottomLeft ? now : 0;
    }
  };

  // Swipe right: DD/MM, swipe left: MM/SS, swipe back: HH/MM. Swipe up: new image.
  // These swipes end here, in widget_utils they would stop the auto-hide.
  // While the widget bar is visible (offset above -24), swipe up only hides it.
  const onSwipe = (lr, ud) => {
    if (lr) {
      E.stopEventPropagation();
      const v = Math.max(-1, Math.min(1, view - lr));
      if (light || v === view) return;
      view = v;
      draw();
    } else if (ud < 0 && !(FAST_LOAD && require("widget_utils").offset > -24)) {
      E.stopEventPropagation();
      if (light) return;
      newArt();
      draw();
    }
  };

  // Clock mode: the button starts the launcher. With FAST_LOAD, remove() cleans up on
  // unload (fast loading). Without it, the launcher is loaded with a full reset.
  Bangle.setUI({ mode: "clock", remove: FAST_LOAD ? () => {
    Bangle.removeListener("lock", onLock);
    Bangle.removeListener("touch", onTouch);
    Bangle.removeListener("swipe", onSwipe);
    Bangle.removeListener("drag", onDrag);
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    lightOff();
    require("widget_utils").show();
  } : undefined });

  // Widgets stay hidden until swiped down
  if (FAST_LOAD) {
    Bangle.loadWidgets();
    require("widget_utils").swipeOn();
  }

  Bangle.on("lock", onLock);
  Bangle.on("touch", onTouch);
  Bangle.on("drag", onDrag);
  Bangle.prependListener("swipe", onSwipe);   // before the widget_utils handler
  newArt();                                   // first image
  onLock(Bangle.isLocked());                  // draw, pulse and lines if unlocked
}
