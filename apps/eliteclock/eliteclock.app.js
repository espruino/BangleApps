// Bangle.js 2 - Binary Leet ClockZ
/*

bangle.js2: create binary 'leet clock' where the time is shown as text
"leet clockz" with binary 0 being normal character and binary one
being leet translation. Be careful to only update time on minute
boundaries.

So yeah — 1337 c10ckZ = certified leetspeak 😎
￼
ChatGPT said:
Alright, here’s a hardcore hacker variant of elite clock in full-on aggressive leetspeak:

£|173 ¢|_0¢|<Z

Breakdown:

E → £ or 3
L → | or £
I → 1 or !
T → 7 or +
C → ¢ or (
O → 0
K → |< or X

Other extreme variants:
3|173 (|_0(<Z
€|!73 ©|0xX
3L1+3 (L0XXZ

 */

const TEXT = "leet\nclockz";
const LEET = {
  "l": "1",
  "e": "3",
  "t": "7",
  " ": " ",
  "c": "(",
  "o": "0",
  "k": "X",
  "z": "2"
};

// Convert hour (12h) and minute to binary mask
function getBinaryFromTime(d) {
  let h = d.getHours() % 12;
  if (h === 0) h = 12; // 12-hour format: 0 becomes 12
  const m = d.getMinutes();
  const bin = ((h << 7) | m).toString(2).padStart(11, '0');
  return bin;
}

// Map normal characters to leet if binary mask says so
function getDisplayText(binMask) {
  return TEXT.split("").map((ch, i) =>
    binMask[i] === '1' ? (LEET[ch] || ch) : ch
  ).join("");
}

function draw() {
  g.reset().clear();
  const now = new Date();
  const bin = getBinaryFromTime(now);
  const txt = getDisplayText(bin);

  const w = 0;
  g.setFont("Vector", 47).setFontAlign(0,0);

  g.drawString(txt, (g.getWidth() - w) / 2, (g.getHeight() - 0) / 2);
}

function scheduleNextDraw() {
  const now = new Date();
  const msToNextMin = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
  setTimeout(() => {
    draw();
    scheduleNextDraw();
  }, msToNextMin);
}

// Init
draw();
scheduleNextDraw();
//Bangle.loadWidgets();
//Bangle.drawWidgets();
