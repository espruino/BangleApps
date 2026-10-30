// Relational: Digital Art Clock for Bangle.js 2
// Version 0.01
//
// The clock shows the time over a random composition after the Relational Paintings of the Swiss
// Concrete artist Fritz Glarner. Each start makes one of over 1 billion possible images, though
// many differ only in small details. Swipe up shows a new image, swipe down the widgets; a double
// tap bottom left switches on a flashlight.
//
// The time is shown by the hour and minute hand of Simple Analog Clock (saclock), in black on top
// of the image. Its dial is left out, as it would cover the image; the hands are longer. A new
// image comes on every start (also after the launcher or any other app) and on swipe up. Only
// then is the whole screen drawn: afterwards, a change only redraws the box where it shows.
//
// While the watch is unlocked:
// - a black dot as wide as the hands runs round the edge and shows the seconds
// - the date shows below the center, on top of the hands, e.g. "Sun 11 Oct"; it turns from black
//   (at the unlock) to white and back every second, with the seconds dot
// - a black line at the right shrinks from full height to a point until the screen locks
// - swipe up shows a new image
// - double tap bottom left switches the flashlight on (until the next tap)
// - swipe down shows the widgets (only with FAST_LOAD)
//
// The image follows four rules; the code refers to them by number.
// 1. Split: the square is cut in two, and each part again, at most 5 times in a row: always
//    across its longer side (a square at random), at 32 to 68 % of that side, but so that every
//    side keeps 26 px. A part made by 2 or more cuts stays whole with a chance of 35 %.
//    Mostly 7 to 17 rectangles.
// 2. Slant: a line from a side to the opposite one divides every rectangle into two fields (right
//    trapezoids), mostly a wide one and a narrow band. It starts at p_A on the top side (and runs
//    down) or on the left side (and runs to the right): where the line of the rectangle above or
//    to the left ends, if one ends there at least m = 5 px from the corners. Else the side is
//    random, and p_A lies m + (L / 2 - m) u^4 from one of its ends, with L the length of the side
//    and u random from 0 to 1: mostly near the end. The line ends on the opposite side at
//    p_B = p_A + round(s tan a) or p_A - round(s tan a), but at least m from the corners; s is the
//    distance of the two sides, a is 5, 9, 14, 20 or 27 degrees.
// 3. Palette: colorful red, blue and yellow; neutral white, pale gray, gray and black.
// 4. Color: field by field in the order of the rectangles, first the one left of or above the
//    line, a color c at random in proportion to the weight
//        w(c) = W(c) * g * k * s * max(0, 1 - A(c) / Amax(c)),
//    and w(c) = 0 if a field it touches has c: never the same color side by side.
//    - g = 1.55 - h for colorful, 0.8 + 0.5 h for neutral colors; h is the height of the
//      field's center, 0 at the top, 1 at the bottom: colorful accents rather at the top
//    - k = 4 if the other field of the rectangle has the other kind of color (colorful or
//      neutral), else 1: the two fields of a rectangle mostly contrast
//    - s = 5 for colorful colors in the smaller field of a rectangle (the band), A / 5000 px in
//      the larger one (A its area), 1 for neutral colors: colorful as bands or large areas
//    - A(c) is the area colored c so far and Amax(c) the most that c should cover: no color
//      dominates. Black only in fields up to 400 px, as the hands are black.
//    If every weight is 0, the field is white.
// Not modeled: the brushwork that raking light reveals, and the alignment to the seat height.
{
  const FAST_LOAD = true;       // widgets on swipe down and fast loading (false: neither)
  const SIZE = 176;             // the screen: SIZE x SIZE px

  // Rule 1: split
  const MAX_DEPTH = 5;          // at most 5 cuts in a row: up to 32 rectangles
  const CUT_FROM = 0.32;        // a cut lies at 32 %
  const CUT_SPAN = 0.36;        //   to 32 + 36 = 68 % of the side
  const MIN_SIDE = 26;          // every side keeps at least 26 px
  const STOP_DEPTH = 2;         // a part made by 2 or more cuts stays whole
  const STOP_CHANCE = 0.35;     //   with this chance: some large rectangles

  // Rule 2: slant
  const CORNER = 5;             // m: a line ends at least 5 px from the corners
  const TAN = new Float32Array([5, 9, 14, 20, 27]                // tan a for the angles a in degrees
    .map(degrees => Math.tan(degrees * Math.PI / 180)));

  // Rules 3 and 4: the 7 colors, colorful first. The 3-bit screen shows red, blue, yellow and white
  // as they are: the purest colors it has. Grays it dithers in 2 x 2 px: pale gray with 3 of 4 px
  // white, gray with 2 of 4, black as dark gray with 1 of 4, so that it stands apart from the black
  // hands; each written as the mean of its pattern.
  //                                  red        blue       yellow     white      pale gray  gray       black
  const COLORS = new Uint16Array(["#ff0000", "#0000ff", "#ffff00", "#ffffff", "#c0c0c0", "#808080", "#404040"]
    .map(rgb => g.toColor(rgb)));                       // for g.setColor
  const WEIGHT = new Float32Array([0.2, 0.2, 0.18, 3.6, 2.5, 1, 1.6]);               // W(c)
  const WEIGHT_PER_PX = new Float32Array([0.3, 0.3, 0.3, 1, 1, 1, 0.02])  // Amax(c) as a share of the
    .map((share, c) => WEIGHT[c] / (share * SIZE * SIZE));               // screen, as W(c) / Amax(c)
  const COLORFUL = 3;           // colors 0 to 2 are colorful, 3 to 6 neutral
  const WHITE = 3, BLACK = 6;
  const CONTRAST = 4;           // k for the two fields of a rectangle if they contrast
  const BAND = 5;               // s for colorful colors in the band
  const LARGE_AREA = 5000;      //   and A / LARGE_AREA in the larger field
  const MAX_BLACK = 400;        // black only in fields up to 400 px (about 6 x 66 px)

  // The image. Rectangle r covers the px left[r] to right[r] - 1 and top[r] to bottom[r] - 1. The
  // rectangles are numbered in the order of the cuts, left before right and top before bottom: the
  // rectangles above and left of r come before it. Its line (rule 2) runs from the top to the
  // bottom side if vertical[r] is 1, else from the left to the right side: from lineStart[r] (x on
  // the top side, y on the left side) to lineEnd[r] (x on the bottom side, y on the right side).
  // Its first field lies left of or above the line, its second right of or below it; their colors
  // (rule 4) are indexes into COLORS. Its two fields meet at bottomSplit[r] on its bottom side (x)
  // and at rightSplit[r] on its right side (y).
  const MAX_RECTS = 1 << MAX_DEPTH;
  const left = new Uint8Array(MAX_RECTS), top = new Uint8Array(MAX_RECTS),
        right = new Uint8Array(MAX_RECTS), bottom = new Uint8Array(MAX_RECTS);
  const vertical = new Uint8Array(MAX_RECTS), lineStart = new Uint8Array(MAX_RECTS),
        lineEnd = new Uint8Array(MAX_RECTS);
  const bottomSplit = new Uint8Array(MAX_RECTS), rightSplit = new Uint8Array(MAX_RECTS);
  const firstColor = new Uint8Array(MAX_RECTS), secondColor = new Uint8Array(MAX_RECTS);
  const secondField = [];       // corners of the second field (x, y, x, y, ...) for g.fillPoly
  const weight = new Float32Array(7);   // W(c) * max(0, 1 - A(c) / Amax(c)) of rule 4, for each c
  let rectCount = 0;

  // Rule 1: cut the rectangle from (x0, y0) to (x1, y1) that depth cuts made, or keep it
  const split = (x0, y0, x1, y1, depth) => {
    "ram";
    const w = x1 - x0, h = y1 - y0, wide = w > h || (w === h && Math.random() < 0.5),
          side = wide ? w : h;   // the longer side, which the cut divides
    if (depth < MAX_DEPTH && side >= 2 * MIN_SIDE && (depth < STOP_DEPTH || Math.random() >= STOP_CHANCE)) {
      let at = side * (CUT_FROM + CUT_SPAN * Math.random()) + 0.5 | 0;   // rounded
      at = at < MIN_SIDE ? MIN_SIDE : at > side - MIN_SIDE ? side - MIN_SIDE : at;
      if (wide) {
        split(x0, y0, x0 + at, y1, depth + 1);
        split(x0 + at, y0, x1, y1, depth + 1);
      } else {
        split(x0, y0, x1, y0 + at, depth + 1);
        split(x0, y0 + at, x1, y1, depth + 1);
      }
    } else {
      left[rectCount] = x0; top[rectCount] = y0; right[rectCount] = x1; bottom[rectCount] = y1;
      rectCount++;
    }
  };

  // Rule 4: a color for a field, at random in proportion to w(c). excluded: bit mask of the colors
  // of the fields it touches; y: height of its center; area: A; partner: color of the other field
  // of the rectangle, -1 if that has none yet; band: 1 for the smaller field. As g, k and s only
  // depend on the kind of color, first the kind (colorful or neutral) in proportion to the sum of
  // its w(c), then a color of that kind.
  const pickColor = (excluded, y, area, partner, band) => {
    "ram";
    const w = weight, h = y / SIZE,
          colorfulFactor = (1.55 - h) * (partner >= COLORFUL ? CONTRAST : 1) * (band ? BAND : area / LARGE_AREA),
          neutralFactor = (0.8 + 0.5 * h) * (partner >= 0 && partner < COLORFUL ? CONTRAST : 1);
    if (area > MAX_BLACK) excluded |= 1 << BLACK;
    const colorful = colorfulFactor * ((excluded & 1 ? 0 : w[0]) + (excluded & 2 ? 0 : w[1]) +
                                       (excluded & 4 ? 0 : w[2])),
          neutral = neutralFactor * ((excluded & 8 ? 0 : w[3]) + (excluded & 16 ? 0 : w[4]) +
                                     (excluded & 32 ? 0 : w[5]) + (excluded & 64 ? 0 : w[6]));
    let x = Math.random() * (colorful + neutral), c;
    if (x < colorful) { x /= colorfulFactor; c = 0; } else { x = (x - colorful) / neutralFactor; c = COLORFUL; }
    for (; c < 7; c++) if (!(excluded & 1 << c) && (x -= w[c]) < 0) break;
    if (c === 7) c = WHITE;                                  // every weight is 0
    x = w[c] - area * WEIGHT_PER_PX[c];                     // A(c) grows
    w[c] = x > 0 ? x : 0;
    return c;
  };

  // Rules 2 and 4 for every rectangle r, in order: the lines and colors of the rectangles above and
  // left of r are known. A rectangle s above (left of) r ends where r begins, bottom[s] = top[r]
  // (right[s] = left[r]); indexOf finds it fast.
  const paint = () => {
    "ram";
    const bottoms = bottom.subarray(0, rectCount), rights = right.subarray(0, rectCount);
    let r, s, x0, y0, x1, y1, isVertical, from, to, start, end, u, middle, area, firstArea, first,
        topSplit, leftSplit, touchingFirst, touchingSecond, lo, hi, splitR, splitS;
    for (r = 0; r < rectCount; r++) {
      x0 = left[r]; y0 = top[r]; x1 = right[r]; y1 = bottom[r];

      // Rule 2: p_A where the line of a rectangle above (left of) r ends on its top (left) side,
      // else a random side from..to and p_A near one of its ends
      start = -1;
      if (y0) for (s = bottoms.indexOf(y0); s >= 0 && s < r && start < 0; s = bottoms.indexOf(y0, s + 1))
        if (vertical[s] && lineEnd[s] >= x0 + CORNER && lineEnd[s] <= x1 - CORNER) {
          start = lineEnd[s]; isVertical = 1;
        }
      if (x0) for (s = rights.indexOf(x0); s >= 0 && s < r && start < 0; s = rights.indexOf(x0, s + 1))
        if (!vertical[s] && lineEnd[s] >= y0 + CORNER && lineEnd[s] <= y1 - CORNER) {
          start = lineEnd[s]; isVertical = 0;
        }
      if (start < 0) isVertical = Math.random() < 0.5 ? 1 : 0;
      from = isVertical ? x0 : y0; to = isVertical ? x1 : y1;
      if (start < 0) {
        u = Math.random();
        u = CORNER + ((to - from) / 2 - CORNER) * u * u * u * u + 0.5 | 0;      // m + (L / 2 - m) u^4
        start = Math.random() < 0.5 ? from + u : to - u;
      }
      // p_B: round(s tan a) to either side, at least m from the corners
      end = (isVertical ? y1 - y0 : x1 - x0) * TAN[Math.random() * 5 | 0] + 0.5 | 0;
      end = Math.random() < 0.5 ? start + end : start - end;
      end = end < from + CORNER ? from + CORNER : end > to - CORNER ? to - CORNER : end;
      vertical[r] = isVertical; lineStart[r] = start; lineEnd[r] = end;
      secondField[r] = new Uint8Array(isVertical ? [start, y0, x1, y0, x1, y1, end, y1]
                                                 : [x0, start, x1, end, x1, y1, x0, y1]);
      // On the bottom (right) side, the first field ends here; a horizontal (vertical) line leaves
      // that whole side to the second field
      bottomSplit[r] = isVertical ? end : x0; rightSplit[r] = isVertical ? y0 : end;

      // Rule 4: the colors that touch the two fields of r. On the piece lo..hi of its top (left)
      // side that r shares with s, the first field of r lies before splitR and its second after
      // it; the fields of s meet at splitS. Fields touch where their parts overlap.
      topSplit = isVertical ? start : x1; leftSplit = isVertical ? y1 : start;
      touchingFirst = touchingSecond = 0;
      if (y0) for (s = bottoms.indexOf(y0); s >= 0 && s < r; s = bottoms.indexOf(y0, s + 1)) {
        lo = left[s]; hi = right[s];
        if (lo < x0) lo = x0;
        if (hi > x1) hi = x1;
        if (lo >= hi) continue;
        splitR = topSplit < lo ? lo : topSplit > hi ? hi : topSplit;
        splitS = bottomSplit[s];
        if (splitS < lo) splitS = lo; else if (splitS > hi) splitS = hi;
        if (splitR > lo)
          touchingFirst |= (splitS > lo ? 1 << firstColor[s] : 0) | (splitS < splitR ? 1 << secondColor[s] : 0);
        if (splitR < hi)
          touchingSecond |= (splitS < hi ? 1 << secondColor[s] : 0) | (splitS > splitR ? 1 << firstColor[s] : 0);
      }
      if (x0) for (s = rights.indexOf(x0); s >= 0 && s < r; s = rights.indexOf(x0, s + 1)) {
        lo = top[s]; hi = bottom[s];
        if (lo < y0) lo = y0;
        if (hi > y1) hi = y1;
        if (lo >= hi) continue;
        splitR = leftSplit < lo ? lo : leftSplit > hi ? hi : leftSplit;
        splitS = rightSplit[s];
        if (splitS < lo) splitS = lo; else if (splitS > hi) splitS = hi;
        if (splitR > lo)
          touchingFirst |= (splitS > lo ? 1 << firstColor[s] : 0) | (splitS < splitR ? 1 << secondColor[s] : 0);
        if (splitR < hi)
          touchingSecond |= (splitS < hi ? 1 << secondColor[s] : 0) | (splitS > splitR ? 1 << firstColor[s] : 0);
      }
      // The fields' areas and the heights of their centers: both in the middle for a vertical line
      middle = (start + end) / 2;
      area = (x1 - x0) * (y1 - y0);
      firstArea = isVertical ? (middle - x0) * (y1 - y0) : (middle - y0) * (x1 - x0);
      first = firstColor[r] = pickColor(touchingFirst, isVertical ? (y0 + y1) / 2 : (y0 + middle) / 2,
                                        firstArea, -1, firstArea * 2 < area);
      secondColor[r] = pickColor(touchingSecond | 1 << first, isVertical ? (y0 + y1) / 2 : (middle + y1) / 2,
                                 area - firstArea, first, firstArea * 2 >= area);
    }
  };

  // A new image after rules 1 to 4. Only on start and on swipe up. The same seed always gives the
  // same image: E.srand makes Math.random repeatable, newImage(1964) shows it again. Without seed,
  // a new random sequence: srand() puts the low and high 16 bits of the seed into the two halves of
  // Espruino's generator, | 0x10001 keeps both non-zero. Hardware noise (nRF5x, STM32 F1/F4) mixed
  // with the time in us.
  const newImage = seed => {
    E.srand((seed || (E.hwRand() ^ (Date.now() * 1000))) | 0x10001);
    rectCount = 0;
    split(0, 0, SIZE, SIZE, 0);
    weight.set(WEIGHT);                          // no color used yet
    paint();
  };

  // Draw the rectangles that reach into the box b (x0, y0, x1, y1): each in the color of its first
  // field, then its second field on top
  const drawImage = b => {
    "ram";
    const G = g, colors = COLORS, n = rectCount, x0 = b[0], y0 = b[1], x1 = b[2], y1 = b[3];
    let r;
    for (r = 0; r < n; r++)
      if (left[r] <= x1 && right[r] > x0 && top[r] <= y1 && bottom[r] > y0)
        G.setColor(colors[firstColor[r]]).fillRect(left[r], top[r], right[r] - 1, bottom[r] - 1)
         .setColor(colors[secondColor[r]]).fillPoly(secondField[r]);
  };

  // Hands as in Simple Analog Clock (saclock), sizes from its dial on the full screen. Without the
  // dial, the seconds dot runs where its ring was, and the hands reach up to that ring.
  const DIAL = 87;                      // outer radius of the dial: half the screen - 1
  const RING = 0.8 * DIAL;              // inner radius of the dial
  const HALF_WIDTH = (DIAL - RING) / 2; // half the width of a hand, radius of its round tip and of the dot: 8.7 px
  const HOUR_LENGTH = 30;               // in px, about half the minute hand
  const MINUTE_LENGTH = RING - HALF_WIDTH - 2;  // 59 px: its tip ends 2 px before the ring
  const DOT_ORBIT = DIAL - HALF_WIDTH;  // the seconds dot runs on this radius: 78 px, it fills the ring
  const CENTER = 88;                    // center of the hands, as in saclock: ceil((0 + 175) / 2)
  const MARGIN = HALF_WIDTH + 2;        // around hands and dot when redrawn: round ends, antialiasing, rounding
  const TAU = 2 * Math.PI;              // a full turn
  const DATE_FONT = "12x20";
  const DATE_TOP = CENTER + 28;         // top of the date: 20 px below the joint of the hands
  const DAYS = "SunMonTueWedThuFriSat", MONTHS = "JanFebMarAprMayJunJulAugSepOctNovDec";
  const LINE_LEFT = SIZE - 4;           // the lock countdown line is 4 px wide at the right edge

  // Without FAST_LOAD, the clock must not run with widgets that the previous app left in memory
  // when it fast loaded the clock. The boot loader and Fastload Utils only prevent this for clocks
  // whose code lacks "Bangle.loadWidgets", but this file contains it: reload from scratch, as the
  // boot loader does.
  if (!FAST_LOAD && global.WIDGETS) {
    load(global.__FILE__);
    throw "Relational: reload without widgets";
  }

  let updateTimeout;        // next update: unlocked the next second, else the next minute
  let locked = true;        // the screen is locked
  let flashlight = false;   // the flashlight is on
  let savedOptions;         // timeouts to restore after the flashlight
  let lastCornerTap = 0;    // time of the last tap bottom left
  let countdownStart;       // start of the lock countdown in ms: unlock or last touch

  // What the screen shows now, so that a change only redraws the box where it shows
  let shownMinute = -1;     // hands: minutes since midnight; -1: nothing drawn yet
  let shownSecond = -1;     // seconds dot (unlocked): the second; -1: no dot
  let shownHalfLine = 0;    // lock countdown line (unlocked): half its length in px; 0: no line
  let shownDate = "";       // date (unlocked): its text; "": no date
  let dateBox;              // the box the date covers: x0, y0, x1, y1
  let blinkStart = 0;       // second of the unlock: the date is black then, white a second later, and so on

  // Corners of a hand as in saclock: a rectangle of length px pointing up, turned clockwise by
  // angle around the center. Corner 2 (index 4, 5) is the tip, which gets a round end.
  const hand = (length, angle) => {
    const cos = Math.cos(angle), sin = Math.sin(angle),
          p = [-HALF_WIDTH, 0,  -HALF_WIDTH, -length,  0, -length,  HALF_WIDTH, -length,  HALF_WIDTH, 0];
    let i, x, y;
    for (i = 0; i < 10; i += 2) {
      x = p[i]; y = p[i + 1];
      p[i] = CENTER + x * cos - y * sin;
      p[i + 1] = CENTER + y * cos + x * sin;
    }
    return p;
  };
  const hourHand = minute => hand(HOUR_LENGTH, minute % 720 / 720 * TAU);    // minute: since midnight
  const minuteHand = minute => hand(MINUTE_LENGTH, minute % 60 / 60 * TAU);
  const dotCenter = second =>
    [CENTER + DOT_ORBIT * Math.sin(second / 60 * TAU), CENTER - DOT_ORBIT * Math.cos(second / 60 * TAU)];

  // The date, e.g. "Sun 11 Oct", and the box it covers (x0, y0, x1, y1), centered below the center
  const dateText = d =>
    DAYS.substr(3 * d.getDay(), 3) + " " + d.getDate() + " " + MONTHS.substr(3 * d.getMonth(), 3);
  const dateBoxOf = text => {
    const w = g.setFont(DATE_FONT).stringWidth(text), x0 = CENTER - (w >> 1);
    return [x0, DATE_TOP, x0 + w - 1, DATE_TOP + g.getFontHeight() - 1];
  };

  // The box (x0, y0, x1, y1) around the points p (x, y, x, y, ...) plus MARGIN, within the screen
  const boxAround = p => {
    let x0 = 999, y0 = 999, x1 = -999, y1 = -999, i;
    for (i = 0; i < p.length; i += 2) {
      x0 = Math.min(x0, p[i]); x1 = Math.max(x1, p[i]);
      y0 = Math.min(y0, p[i + 1]); y1 = Math.max(y1, p[i + 1]);
    }
    return [Math.max(0, Math.floor(x0 - MARGIN)), Math.max(0, Math.floor(y0 - MARGIN)),
            Math.min(SIZE - 1, Math.ceil(x1 + MARGIN)), Math.min(SIZE - 1, Math.ceil(y1 + MARGIN))];
  };

  // Redraw the box b (x0, y0, x1, y1): everything on the screen, clipped to b, from back to front:
  // image, hands and, while unlocked, date (black at the unlock, then white every other second),
  // lock countdown line and seconds dot. Nothing outside b changes. g.reset() would also reset the
  // clip rect: only here, before setting it.
  const redraw = b => {
    const G = g.reset().setClipRect(b[0], b[1], b[2], b[3]);
    let p;
    drawImage(b);
    G.setColor(0);
    p = hourHand(shownMinute); G.fillPolyAA(p).fillCircle(p[4], p[5], HALF_WIDTH);
    p = minuteHand(shownMinute); G.fillPolyAA(p).fillCircle(p[4], p[5], HALF_WIDTH);
    G.fillCircle(CENTER, CENTER, HALF_WIDTH);                   // joint of the hands
    if (shownDate) G.setColor((shownSecond - blinkStart) & 1 ? "#fff" : 0).setFont(DATE_FONT)
                    .drawString(shownDate, dateBox[0], dateBox[1]);
    if (shownHalfLine) G.setColor(0).fillRect(LINE_LEFT, CENTER - shownHalfLine, SIZE - 1, CENTER - 1 + shownHalfLine);
    if (shownSecond >= 0) { p = dotCenter(shownSecond); G.setColor(0).fillCircle(p[0], p[1], HALF_WIDTH); }
    G.setClipRect(0, 0, SIZE - 1, SIZE - 1);
  };

  // Half the length of the lock countdown line, centered on the center of the hands. It shrinks
  // from CENTER at the unlock or last touch to 0 at the lock, over the lock timeout of the system
  // (LCD Timeout); 0 if that is 0 (never locks).
  const countdownHalfLine = () => {
    const timeout = Bangle.getOptions().lockTimeout,                            // in ms
          remaining = Math.min(timeout, timeout - (Date.now() - countdownStart));  // ms to the lock
    return remaining > 0 ? Math.round(CENTER * remaining / timeout) : 0;
  };

  // Bring the screen up to date: every change redraws only the box around its old and new place.
  // full: the whole screen (start, new image, flashlight off). Then wait for the next second
  // (unlocked: dot and line) or minute (locked). Flashlight: white screen, nothing else.
  const update = full => {
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = undefined;
    if (flashlight) {
      g.reset().setColor("#fff").fillRect(0, 0, SIZE - 1, SIZE - 1);
      return;
    }
    const d = new Date(), minute = 60 * d.getHours() + d.getMinutes(),
          second = locked ? -1 : d.getSeconds(), halfLine = locked ? 0 : countdownHalfLine(),
          date = locked ? "" : dateText(d), boxes = [];
    if (shownMinute < 0) full = true;                       // nothing drawn yet
    if (minute !== shownMinute && !full)
      boxes.push(boxAround(hourHand(shownMinute).concat(hourHand(minute))),
                 boxAround(minuteHand(shownMinute).concat(minuteHand(minute))));
    if (second !== shownSecond)
      boxes.push(boxAround((shownSecond < 0 ? [] : dotCenter(shownSecond))
                           .concat(second < 0 ? [] : dotCenter(second))));
    if (halfLine !== shownHalfLine) {
      const longer = Math.max(halfLine, shownHalfLine);
      boxes.push([LINE_LEFT, CENTER - longer, SIZE - 1, CENTER - 1 + longer]);
    }
    if (date !== shownDate) {
      if (shownDate) boxes.push(dateBox);                   // the old box
      if (date) boxes.push(dateBox = dateBoxOf(date));      // the new one
    } else if (date && second !== shownSecond) boxes.push(dateBox);   // its color changes every second
    shownMinute = minute; shownSecond = second; shownHalfLine = halfLine; shownDate = date;
    if (full) redraw([0, 0, SIZE - 1, SIZE - 1]);
    else boxes.forEach(redraw);
    const step = locked ? 60000 : 1000;
    updateTimeout = setTimeout(() => { updateTimeout = undefined; update(); }, step - Date.now() % step);
  };

  // Flashlight on: white screen at full brightness, no timeout
  const flashlightOn = () => {
    const o = Bangle.getOptions();
    savedOptions = { backlightTimeout: o.backlightTimeout, lockTimeout: o.lockTimeout };
    flashlight = true;
    Bangle.setLCDTimeout(0);
    Bangle.setLCDBrightness(1);
    Bangle.setLCDPower(1);
    update();
  };

  // Flashlight off: restore timeouts and brightness. True if it was on: then the caller redraws
  // the whole screen.
  const flashlightOff = () => {
    if (!flashlight) return false;
    flashlight = false;
    Bangle.setOptions(savedOptions);
    const settings = require("Storage").readJSON("setting.json", 1) || {};
    Bangle.setLCDBrightness(settings.brightness === undefined ? 1 : settings.brightness);
    return true;
  };

  // Locked: flashlight off; date, line and dot go. Unlocked: lock countdown from now on; date,
  // line and dot come.
  const onLock = isLocked => {
    let full = false;
    locked = isLocked;
    if (isLocked) full = flashlightOff();
    else { countdownStart = Date.now(); blinkStart = new Date().getSeconds(); }
    update(full);
  };

  // Every touch (tap, swipe, drag) restarts the lock countdown, as it restarts the lock timer of
  // the firmware. A button press would too, but it opens the launcher (clock mode).
  const onDrag = () => { countdownStart = Date.now(); };

  // Any tap: flashlight off. Double tap bottom left: flashlight on
  const onTouch = (button, xy) => {
    if (flashlight) {
      flashlightOff();
      update(true);
      return;
    }
    const now = Date.now(), bottomLeft = xy.x < CENTER && xy.y > 132;
    if (bottomLeft && now - lastCornerTap < 500) {
      lastCornerTap = 0;
      flashlightOn();
    } else {
      lastCornerTap = bottomLeft ? now : 0;
    }
  };

  // Swipe up: new image. Swipes left and right do nothing. These swipes end here, in widget_utils
  // they would stop the auto-hide. While the widget bar is visible (offset above -24), swipe up
  // only hides it.
  const onSwipe = (leftRight, upDown) => {
    if (leftRight) {
      E.stopEventPropagation();
    } else if (upDown < 0 && !(FAST_LOAD && require("widget_utils").offset > -24)) {
      E.stopEventPropagation();
      if (flashlight) return;
      newImage();
      update(true);
    }
  };

  // Clock mode: the button starts the launcher. With FAST_LOAD, remove() cleans up on unload
  // (fast loading). Without it, the launcher is loaded with a full reset.
  Bangle.setUI({ mode: "clock", remove: FAST_LOAD ? () => {
    Bangle.removeListener("lock", onLock);
    Bangle.removeListener("touch", onTouch);
    Bangle.removeListener("swipe", onSwipe);
    Bangle.removeListener("drag", onDrag);
    if (updateTimeout) clearTimeout(updateTimeout);
    updateTimeout = undefined;
    flashlightOff();
    require("widget_utils").show();
  } : undefined });

  // Widgets stay hidden until swiped down
  if (FAST_LOAD) {
    Bangle.loadWidgets();
    require("widget_utils").swipeOn();
  }

  // First image and screen, and from then on the listeners. Until then a black screen; remove()
  // cancels it if the clock is left before. After an upload to RAM, the Web IDE waits only 2 s for
  // the prompt, which the watch prints once it has run the code above and is idle. So the image
  // only follows 0.5 s later, as it could hold up the prompt otherwise. The IDE would then report
  // "Prompt not detected - upload failed". Loaded from Storage (launcher, boot, load()), __FILE__
  // is set and the image follows at once.
  g.reset().setColor(0).fillRect(0, 0, SIZE - 1, SIZE - 1);
  updateTimeout = setTimeout(() => {
    updateTimeout = undefined;
    Bangle.on("lock", onLock);
    Bangle.on("touch", onTouch);
    Bangle.on("drag", onDrag);
    Bangle.prependListener("swipe", onSwipe); // before the widget_utils handler
    newImage();                               // first image
    onLock(Bangle.isLocked());                // draw all; date, line and dot if unlocked
  }, global.__FILE__ ? 0 : 500);
}
