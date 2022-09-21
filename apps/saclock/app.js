Math.TAU = Math.PI*2; // the real circle constant

/**
 * Rotate points around origin
 *
 * @param points List of coordinates: [x1,y1, x2,y2, ...]
 * @param radians Angle by which to rotate
 */
function rotate(points, radians) {
  for(let i = 0; i<points.length; i += 2) {
    const x = points[i], y = points[i+1];
    points[i] = x*Math.cos(radians)-y*Math.sin(radians);
    points[i+1] = y*Math.cos(radians)+x*Math.sin(radians);
  }
}
/**
 * Move points
 *
 * @param points List of coordinates: [x1,y1, x2,y2, ...]
 * @param x Horizontal offset
 * @param y Vertical offset
 */
function move(points, x, y) {
  for(let i = 0; i<points.length; i += 2) {
    points[i] = points[i]+x;
    points[i+1] = points[i+1]+y;
  }
}

let clock = new (require("ClockFace"))({
  settingsFile: "saclock.settings.json",
  init: function() {
    // create a graphics buffer, and pre-draw the outer ring
    const bs = Math.min(Bangle.appRect.w, Bangle.appRect.h); // buffer size
    this.r = Math.min(Bangle.appRect.w, Bangle.appRect.h)/2; // outer radius
    this.buffer = Graphics.createArrayBuffer(bs, bs, 1, {msb: true});
    let buf = this.buffer;
    buf.fillCircle(this.r, this.r, this.r); // only fill this once: we only draw inside the inner ring
  },
  update: function(time) {
    // clear the inner circle, and draw
    const
      r = this.r, // outer radius
      c = r, // Center of buffer: the buffer is 2r x 2r, so the center is at (r,r)
      r2 = 0.8*r, // inner radius
      hw = (r-r2)/2, // *half* the hand width (we never use the full width)
      hl = 0.5*r2, // hour hand length
      hr = ((time.getHours()%12)+(time.getMinutes()/60))/12*Math.TAU, // hour hand rotation
      ml = 0.8*r2, // minute hand length
      mr = time.getMinutes()/60*Math.TAU, // minute hand rotation
      x = Math.floor((Bangle.appRect.x+Bangle.appRect.x2)/2), // "real" clock center, only
      y = Math.floor((Bangle.appRect.y+Bangle.appRect.y2)/2); // used for drawing buffer
    let buf = this.buffer;

    function drawHand(length, radians) {
      let hand = [ // just a rectangle
        0-hw, 0,
        0-hw, 0-length,
        0, 0-length, // extra point at the middle of the line: draw the tip here
        hw, 0-length,
        hw, 0,
      ];
      rotate(hand, radians);
      move(hand, c, c);
      buf.fillPolyAA(hand);
      buf.fillCircle(hand[4], hand[5], hw); // the tip
    }

    buf.setColor(g.theme.bg).fillCircle(c, c, r2); // clear inside
    buf.setColor(g.theme.fg);
    drawHand(hl, hr); // hour hand
    drawHand(ml, mr); // minute hand
    buf.fillCircle(c, c, Math.floor(hw)); // hands joiner
    g.drawImage({
      width: buf.getWidth(), height: buf.getHeight(),
      buffer: buf.buffer
    }, x, y, {rotate: 0}); // setting `rotate` centers the image on x,y
  },
});
clock.start();

// for debugging/screenshots
clock.test = function(hours, minutes) {
  this.draw({
    getHours: () => hours,
    getMinutes: () => minutes,
  });
};
