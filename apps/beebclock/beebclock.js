/* jshint esversion: 6 */
// Beebclock
// © 2020, Tom Gidden
// https://github.com/tomgidden

const storage = require("Storage");
const filename = 'beebjson';
var timeout;

require('FontTeletext10x18Ascii').add(Graphics);

// Double height text
Graphics.prototype.drawStringDH = function (txt, px, py, align, gw) {
  let g2 = Graphics.createArrayBuffer(gw,18,1,{msb:true});
  g2.setFontTeletext10x18Ascii();
  let w = g2.stringWidth(txt);
  let c = (w+3)>>2;
  g2.drawString(txt);
  let img = {width:w,height:1,transparent:0,buffer:new ArrayBuffer(c)};
  let a = new Uint8Array(img.buffer);

  let x;
  switch (align) {
    case 'C': x = px + (gw - w)/2; break;
    case 'R': x = gw - w + px; break;
    default: x = px;
  }

  for (var y=0;y<18;y++) {
    a.set(new Uint8Array(g2.buffer,gw*y/8,c));
    this.drawImage(img,x,py+y*2);
    this.drawImage(img,x,py+1+y*2);
  }
};

// Fill rectangle rotated around the centre
Graphics.prototype.fillRotRect = function (sina, cosa, cx, cy, x0, x1, y0, y1) {
  let fn = Math.ceil;
  return this.fillPoly([
    fn(cx - x0*cosa + y0*sina), fn(cy - x0*sina - y0*cosa),
    fn(cx - x1*cosa + y0*sina), fn(cy - x1*sina - y0*cosa),
    fn(cx - x1*cosa + y1*sina), fn(cy - x1*sina - y1*cosa),
    fn(cx - x0*cosa + y1*sina), fn(cy - x0*sina - y1*cosa)
  ]);
};

// Draw a line from r1,a to r2,a relative to cx+cy
Graphics.prototype.drawRotLine = function (sina, cosa, cx, cy, r1, r2) {
  return this.drawLine(
    cx + r1*sina, cy - r1*cosa,
    cx + r2*sina, cy - r2*cosa
  );
};

// Display modes
//
// 0: full-screen
// 1: with widgets
// 2: centred on Bangle (v.1), no widgets or time/date
// 3: centred with time above
// 4: centred with date above
// 5: centred with time and date above
let mode;

// R1, R2:   Outer and inner radii of hour marks
// RC1, RC2: Outer and inner radii of hub
// CX, CY:   Centre location, relative to buffer (not screen, necessarily)
// HW2, MW2: Half-width of hour and minute hand
// HR, MR:   Length of hour and minute hand, relative to CX,CY
// M:        Half-width of gap in hour marks
// HSCALE:   Half-width of hour mark as function(0<h<13)
let R1, R2, RC1, RC2, CX, CY, HW2, MW2, HR, MR, M, HSCALE;

// Screen size
const GW = g.getWidth();
const GH = g.getHeight();

// Top margin: the gap taken from the top of the buffer, except when
// in mode 0 (full screen)
let TM;

// Buffer image.  undefined means it needs regenerating
let faceImg;

// with_seconds flag determines whether the face is updated every
// second or every minute, and to draw the hand or not.
let with_seconds = true;

// Display flags, determined from `mode` by setMode()
let with_widgets = false;
let with_digital_time = true;
let with_digital_date = true;

// Create offscreen buffer for the once-per-minute face draw
const G1 = Graphics.createArrayBuffer(g.getWidth(), g.getHeight(), 1, {msb:true});

// Precalculate sin/cos for the hour marks.  Might be premature
// optimisation, but might as well.
let ss = [], cs = [];
for (let h=1; h<=12; h++) {
  const a = Math.PI * h / 6;
  ss[h] = Math.sin(a);
  cs[h] = Math.cos(a);
}

// Draw the face with hour and minute hand.  Ideally, we'd separate
// the face from the hands and double-buffer, but memory is limited,
// so we buffer once and minute, and draw the second hand dynamically
// (with a bit of flicker)
const drawFace = (G) => {
  //const fw = R1 * 2;
  //const fh = R1 * 2;
  //const fw2 = R1;
  //const fh2 = R1;
  let hs = [];

  // Wipe the image and start with white
  G.clear();
  G.setColor(1,1,1);

  // Draw the hour marks.
  for (let h=1; h<=12; h++) {
    hs[h] = HSCALE(h);
    G.fillRotRect(ss[h], cs[h], CX, CY, -hs[h], hs[h], R2, R1);

  }

  // Draw the hub
  G.fillCircle(CX, CY, RC1);

  // Black
  G.setColor(0,0,0);

  // Clear the centre of the hub
  G.fillCircle(CX, CY, RC2);

  // Draw the gap in the hour marks
  for (let h=1; h<=12; h++) {
    G.fillRotRect(ss[h], cs[h], CX, CY, -M, M, R2-1, R1+1);
  }

  // Back to white for future draw operations
  G.setColor(1,1,1);

  // While the buffer remains full-screen, we may trim out the
  // bottom of the image so we can shift the whole thing down for
  // widgets.
  const img = {width:GW,height:GH-TM,buffer:G.buffer};
  return img;
};

let hours, minutes, seconds, date;

// Schedule event for calling at the start of the next second
const inOneSecond = (cb) => {
  let now = new Date();
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(function() {
    timeout = undefined;
    cb();
  }, 1000 - now.getMilliseconds());
};

// Schedule event for calling at the start of the next minute
const inOneMinute = (cb) => {
  let now = new Date();
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(function() {
    timeout = undefined;
    cb();
  }, 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()));
};

// Draw a fat hour/minute hand
const drawHand = (G, a, w2, r1, r2) =>
  G.fillRotRect(Math.sin(a), Math.cos(a), CX, CY, -w2, w2, r1, r2);

// Redraw function
const drawAll = (force) => {
  let now = new Date();

  if (!faceImg) force = true;

  let face_changed = force;
  //let date_changed = false;

  tmp = hours;
  hours = now.getHours();
  if (tmp !== hours)
    face_changed = true;

  tmp = minutes;
  minutes = now.getMinutes();
  if (tmp !== minutes)
    face_changed = true;

  // If the face has been updated and/or needs a redraw,
  // face_changed is true.

  let time_changed = face_changed;

  // If the screen needs an update, regardless of whether the face
  // needs a redraw, time_changed is true.

  if (with_seconds) {
    // If we're going by second, we always need an update.
    seconds = now.getSeconds();
    time_changed = true;
  }

  if (with_digital_date) {
    // See if the date has changed.  If it has, then we need a
    // full-blown redraw of the screen and the face, plus text.
    tmp = date;
    date = now.getDate();
    if (tmp !== date) {
      //date_changed = true;
      face_changed = true; // Should have changed anyway with hour/minute rollover
    }
  }

  if (face_changed) {
    // Redraw the face and hands onto the buffer G1.
    faceImg = drawFace(G1);
    drawHand(G1, Math.PI*hours/6, HW2, RC1, HR);
    drawHand(G1, Math.PI*minutes/30, MW2, RC1, MR);
  }

  // Has the time updated?  If so, we'll need to draw something.
  if (time_changed) {

    // Are we adding text?
    if (with_digital_date || with_digital_time) {

      // Construct the date/time text to add above the face
      let d = now.toString();
      let da = d.toString().split(" ");
      let txt;

      if (with_digital_time) {
        txt = da[4].substr(0, 5);
        if (with_digital_date)
          G1.drawStringDH(txt+',', 24, 0, 'L', GW);
        else
          G1.drawStringDH(txt, 0, 0, 'C', GW);
      }

      if (with_digital_date) {
        let txt = [da[0], da[1], da[2]].join(" ");
        if (with_digital_time)
          G1.drawStringDH(txt, -24, 0, 'R', GW);
        else
          G1.drawStringDH(txt, 0, 0, 'C', GW);
      }
    }

    // If the time has updated, we need to _at least_ draw the
    // image to the screen.
    g.setColor(1,1,1);
    g.drawImage({width:GW,
      height:GH-TM,
      buffer:G1.buffer}, 0, TM);

    // and possibly add the second hand
    if (with_seconds) {
      let a = 2.0 * Math.PI * seconds / 60.0;
      g.drawRotLine(Math.sin(a), Math.cos(a), CX, CY+TM, RC1, R1);
    }

    // And draw widgets if we're in that mode
    if (with_widgets)
      Bangle.drawWidgets();
  }

  // Schedule to repeat this.  A `setTimeout(1000)` isn't good
  // enough, as all the above might've taken some milliseconds and
  // we don't want to drift.
  if (with_seconds)
    inOneSecond(drawAll);
  else
    inOneMinute(drawAll);
};

const setButtons = () => {
  // Show launcher when button pressed
  Bangle.setUI("clockupdown", btn=> {
    if (btn==0) changeSeconds();
    if (btn==1) { ++mode; setMode(); drawAll(true); }
  });
};

// Load display parameters based on `mode`
const setMode = () => {
  // Normalize mode to 0 <= mode <= 5
  mode = (6+mode) % 6;

  // [R1, R2, RC1, RC2, HW2, MW3, HR, MR, M, HSCALE] =
  const scales = [
    [120, 84, 17,   12.4, 4.6,  2.2, 8, 2, 1,    h => (3.0 + Math.ceil(h/1.5)) ],
    [102, 70, 14.6, 10.7, 3.88, 1.8, 8, 2, 1,    h => (2.4 + Math.ceil(h/1.6)) ],
  ];

  if (mode < 3) {
    // Face without time/date text.  Might have widgets though.
    with_digital_time = with_digital_date = false;
    with_widgets = (mode == 1);
  }
  else {
    // Face with time/date text, but no widgets
    with_digital_time = (mode-2)&1;
    with_digital_date = (mode-2)&2;
    with_widgets = false;
  }

  // Destructure the array to the global display parameters
  let arr = scales[mode > 0 ? 1 : 0];
  R1 = arr[0];
  R2 = arr[1];
  RC1 = arr[2];
  RC2 = arr[3];
  HW2 = arr[4];
  MW2 = arr[5];
  HR = R2 - arr[6];
  MR = R1 - arr[7];
  M = arr[8];
  HSCALE = arr[9];
  TM = with_widgets ? 36 : 0;

  CX = GW/2;
  CY = R1;

  // If we're in the small-face + text regime, we're going to buffer
  // the full screen but draw the clock face further down to give
  // space for the text.
  //
  // Compare with modes 0 (full-screen) and 1 (with_widgets==true)
  // where the face is drawn at the top of the buffer, but drawn
  // lower down the screen (so CY doesn't move)
  if (mode > 1) {
    CY += 36;
  }

  // We only don't bother redrawing the face from modes 2 to 5, as
  // they're the same.
  if (!faceImg || mode<3) {
    faceImg = undefined;
  }

  // Store the settings for next time
  try {
    storage.writeJSON(filename, [mode,with_seconds]);
  } catch (e) {
    console.log(e);
  }

  // Clear the screen: we need to make sure all parts are cleaned off.
  g.clear();
};

const changeSeconds = () => {
  with_seconds = !with_seconds;
  drawAll(true);
};

Bangle.loadWidgets();
// widgets are drawn in drawAll()

// Restore mode
try {
  conf = storage.readJSON(filename);
  mode = conf[0];
  with_seconds = conf[1];
} catch (e) {
  console.log(e);
  mode = 1;
}

setButtons();
setMode();
drawAll();

Bangle.on('lcdPower', (on) => {
  if (on) {
    drawAll();
  } else {
    if (timeout) clearTimeout(timeout);
    timeout = undefined;
  }
});
