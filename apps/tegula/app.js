// Tegula - Digital Art Clock for Bangle.js 2
// The 176x176 px screen is divided into 11 x 11 square tiles of 16 px.
// The tiles show a random Lohse square without gaps, and HH above MM in a 4x5-tile
// digit font as black tiles. Digit tiles are drawn smaller than their cell, so a frame
// in the color of the square underneath separates them (see README.md).
// New image (square, palette, colors) on every start, every ART_MIN minutes and on swipe up.
//
// While the watch is unlocked:
// - the bottom right tile blinks
// - swipe right shows DD/MM, swipe left shows MM/SS (until the screen locks)
// - swipe up shows a new image
// - double tap bottom left switches the flash light on (until the next tap)
// - swipe down shows the widgets (only with FAST_LOAD)
//
// Lohse square as a Cayley table of the cyclic group Z_N:
//   tile (column c, row r) = color (a[r] + c) mod N, a position on the color wheel
// a is a permutation of 0..N-1 with a[0] = 0, every jump a[r+1] - a[r] lies in 2..N-2
// (mod N), also the jump a[0] - a[N-1] from the last row back to the first:
//   Latin:             a is a permutation, every row is a cyclic shift
//   diagonals differ:  no jump is +1 or -1
//   torus:             all of this also holds when tiling across the edges
{
  const FAST_LOAD = true;       // widgets on swipe down and fast loading (false: neither)
  const N = 11;                 // grid size: 11 x 11 tiles, two rows of 5-tile digits + 1 row
  const ART_MIN = 60;           // new image every 60 minutes (a divisor of 1440)
  const GAP = 4;                // gap between digit tiles in px (0 to 4): a frame of GAP/2 px

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

  const A = new Uint8Array(N);       // jump sequence: color of the first tile in each row
  const P = new Uint16Array(2 * N);  // palette twice, P[k] = P[k + N]: no % while drawing
  const T = new Uint16Array(N);      // digit tiles: bit c of T[r] set if tile (column c, row r) is one

  let key;              // color wheel of the current image (one of PALETTES)
  let slot;             // time slot of the current image (ART_MIN)
  let drawTimeout, blinkInterval;
  let view = 0;         // -1: DD/MM, 0: HH/MM, 1: MM/SS
  let blink = false;    // bottom right tile is inverted
  let light = false;    // flash light is on
  let saved;            // timeouts to restore after the flash light
  let lastTap = 0;      // time of the last tap bottom left

  // Jump sequence a[0..N-1] with a[0] = 0: a random a[0] would only rotate the colors once
  // more, which the random start color in palette() already does. Each further value is
  // drawn uniformly from the unused values, except predecessor +-1. No backtracking: at
  // most 2 values are excluded per step, so dead ends can only occur in the last 2 steps,
  // then restart. Local variables: faster lookups than in the enclosing scope.
  const jumps = () => {
    "ram";
    const rnd = Math.random, a = A, n = N, r = new Uint8Array(n - 1);  // r: unused values
    let i, j, m, c, x, up, dn, used;
    for (;;) {
      for (m = 0; m < n - 1; m++) r[m] = m + 1;   // 1..N-1 unused, m of them
      c = a[0] = 0; used = 1;
      for (i = 1; i < n; i++) {
        up = c + 1; if (up === n) up = 0;
        dn = c - 1; if (dn < 0) dn = n - 1;
        // only neighbors of c left: dead end
        if (m < 3 && m === ((used >> up & 1) ^ 1) + ((used >> dn & 1) ^ 1)) break;
        do { j = (rnd() * m) | 0; x = r[j]; } while (x === up || x === dn);
        r[j] = r[--m];                            // remove x, the last unused value takes its place
        a[i] = c = x; used |= 1 << x;
      }
      if (i === n && c > 1 && c < n - 1) return;  // jump back to a[0] = 0 valid too (torus)
    }
  };

  // N colors evenly spaced on the wheel of the K key colors, random start color and
  // direction. Position p in units of 1/N key color: integer, hence exact.
  // With K = N = 11, every image shows the 11 key colors, without interpolation.
  const palette = () => {
    const n = N, C = key, K = C.length / 3, W = K * n, s = Math.random() < 0.5 ? K : W - K;
    let k, i0, i1, f, p = ((Math.random() * K) | 0) * n;
    for (k = 0; k < n; k++) {
      i0 = (p / n) | 0; f = (p - i0 * n) / n;
      i1 = i0 === K - 1 ? 0 : 3 * i0 + 3; i0 *= 3;
      P[k] = P[k + n] = g.toColor(
        (C[i0] + (C[i1] - C[i0]) * f) / 255,
        (C[i0 + 1] + (C[i1 + 1] - C[i0 + 1]) * f) / 255,
        (C[i0 + 2] + (C[i1 + 2] - C[i0 + 2]) * f) / 255);
      p += s; if (p >= W) p -= W;
    }
  };

  // Time slot of the date: changes every ART_MIN minutes (local time)
  const slotOf = d => d.getDate() * 1440 + ((d.getHours() * 60 + d.getMinutes()) / ART_MIN | 0);

  // New image: color palette (1 to 3 at random), Lohse square and colors
  const newArt = d => {
    key = PALETTES[(Math.random() * PALETTES.length) | 0];
    jumps();
    palette();
    slot = slotOf(d);
  };

  // Tile (column c, row r): the whole cell in its color, a digit tile in black on top,
  // shrunk by the gap. The gap is transparent: it shows the color of the cell.
  const tile = (c, r, digit) => {
    const x = c * S, y = r * S;
    g.setColor(P[A[r] + c]).fillRect(x, y, x + S - 1, y + S - 1);
    if (digit) g.setColor(0).fillRect(x + G0, y + G0, x + G1, y + G1);
  };

  // All tiles: the Lohse square without gaps, the digit tiles in black.
  // Local copies of the constants: faster lookups than in the enclosing scope.
  const drawTiles = () => {
    "ram";
    const G = g.reset(), p = P, a = A, t = T, n = N, s = S, s1 = S - 1, g0 = G0, g1 = G1;
    let r, c, k, x, y, bits;
    for (r = 0, y = 0; r < n; r++, y += s) {
      k = a[r]; bits = t[r];
      for (c = 0, x = 0; c < n; c++, x += s) {
        G.setColor(p[k + c]).fillRect(x, y, x + s1, y + s1);
        if (bits & 1) G.setColor(0).fillRect(x + g0, y + g0, x + g1, y + g1);
        bits >>= 1;
      }
    }
  };

  // Bottom right tile: a digit tile or not. Swapped while blinking
  const drawCorner = () => {
    if (light) return;
    const k = N - 1;
    g.reset();
    tile(k, k, ((T[k] >> k & 1) === 1) !== blink);
  };

  const draw = () => {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;

    // Flash light: white screen, nothing else
    if (light) {
      g.reset().setColor("#fff").fillRect(0, 0, 175, 175);
      return;
    }

    // New image when the time slot changes (every ART_MIN minutes)
    const d = new Date();
    if (slotOf(d) !== slot) newArt(d);

    // First number in the upper half, second number in the lower half
    const v = view < 0 ? [d.getDate(), d.getMonth() + 1] :
              view > 0 ? [d.getMinutes(), d.getSeconds()] :
                         [d.getHours(), d.getMinutes()];
    const digits = [v[0] / 10 | 0, v[0] % 10, v[1] / 10 | 0, v[1] % 10];

    // Digit tiles: 4x5 tiles per digit, 1 tile between the digits and between HH and MM.
    // Columns 1 + 4 + 1 + 4 + 1 = 11: digit i starts in column 1 + 5 * (i % 2).
    // Rows 5 + 1 + 5 = 11 (no margin): digit i starts in row 6 * (i >> 1).
    T.fill(0);
    digits.forEach((dig, i) => {
      const c0 = 1 + 5 * (i % 2), r0 = 6 * (i >> 1);
      for (let y = 0; y < 5; y++) T[r0 + y] |= FONT[5 * dig + y] << c0;
    });
    drawTiles();
    if (blink) drawCorner();

    // Redraw at the start of the next minute (MM/SS: next second)
    const t = view > 0 ? 1000 : 60000;
    drawTimeout = setTimeout(() => { drawTimeout = undefined; draw(); }, t - Date.now() % t);
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

  // Locked: flash light off, back to HH/MM. Unlocked: blink every 500 ms
  const onLock = locked => {
    if (blinkInterval) clearInterval(blinkInterval);
    blinkInterval = undefined;
    blink = !locked;
    if (locked) {
      lightOff();
      view = 0;
    } else {
      blinkInterval = setInterval(() => { blink = !blink; drawCorner(); }, 500);
    }
    draw();
  };

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
      newArt(new Date());
      draw();
    }
  };

  // Clock mode: the button starts the launcher. With FAST_LOAD, remove() cleans up on
  // unload (fast loading). Without it, the launcher is loaded with a full reset.
  Bangle.setUI({ mode: "clock", remove: FAST_LOAD ? () => {
    Bangle.removeListener("lock", onLock);
    Bangle.removeListener("touch", onTouch);
    Bangle.removeListener("swipe", onSwipe);
    if (drawTimeout) clearTimeout(drawTimeout);
    if (blinkInterval) clearInterval(blinkInterval);
    drawTimeout = blinkInterval = undefined;
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
  Bangle.prependListener("swipe", onSwipe);   // before the widget_utils handler
  onLock(Bangle.isLocked());                  // blink if unlocked, then draw (first image)
}
