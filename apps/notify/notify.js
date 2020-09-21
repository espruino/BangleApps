let pos = 0;
let id = null;

/**
 * Fit text into area, trying to insert newlines between words
 * Appends "..." if more text was present but didn't fit
 *
 * @param {string} text
 * @param {number} rows  Maximum number of rows
 * @param {number} width Maximum line length, in characters
 */
function fitWords(text,rows,width) {
  // We never need more than rows*width characters anyway, split by any whitespace
  const words = text.trim().substr(0,rows*width).split(/\s+/);
  let row=1,len=0,limit=width;
  let result = "";
  for (let word of words) {
    // len==0 means first word of row, after that we also add a space
    if ((len?len+1:0)+word.length > limit) {
      if (row>=rows) {
        result += "...";
        break;
      }
      result += "\n";
      len=0;
      row++;
      if (row===rows) limit -= 3; // last row needs space for "..."
    }
    result += (len?" ":"") + word;
    len += (len?1:0) + word.length;
  }
  return result;
}

/**
 options = {
   on : bool // turn screen on, default true
   size : int // height of notification, default 80 (max)
   title : string // optional title
   id // optional notification ID, used with hide()
   src : string // optional source name
   body : string // optional body text
   icon : string // optional icon (image string)
   render function(y) // function callback to render
 }
*/
/*
  The screen is 240x240px, but has a 240x320 buffer, used like this:
  0,0: top-left                ...   239,0: top-right
      [Normal screen contents: lines 0-239]
  239,0: bottom-left           ...   239,239: bottom-right
      [Usually off-screen: lines 240-319]
  319,0: last line in buffer   ...   319,239: last pixel in buffer

  When moving the display area, the buffer wraps around

  So we draw notifications at the end of the buffer,
  then shift the display down to show them without touching regular content.
  Apps don't know about this, so can just keep updating the usual display area.

  For example, a size 40 notification:
  - Draws in bottom 40 buffer lines (279-319)
  - Shifts display down by 40px
  Display now shows buffer lines 279-319,0-199
  Apps/widgets keep drawing to buffer line 0-239 like nothing happened
 */
exports.show = function(options) {
  options = options || {};
  if (options.on===undefined) options.on = true;
  id = ("id" in options)?options.id:null;
  let size = options.size || 80;
  if (size>80) {size = 80}
  const oldMode = Bangle.getLCDMode();
  // TODO: throw exception if double-buffered?
  // TODO: throw exception if size>80?

  Bangle.setLCDMode("direct");
  // drawing area
  let x = 0,
    y = 320-size,
    w = 240,
    h = size,
    b = y+h-1, r = x+w-1; // bottom,right
  g.setClipRect(x,y, r,b);
  // clear area
  g.setColor(0).fillRect(x,y, r,b);
  // bottom border
  g.setColor(0x39C7).fillRect(0,b-1, r,b);
  b -= 2;h -= 2;
  // title bar
  if (options.title || options.src) {
    g.setColor(0x39C7).fillRect(x,y, r,y+20);
    const title = options.title||options.src;
    g.setColor(-1).setFontAlign(-1, -1, 0).setFont("6x8", 2);
    g.drawString(title.trim().substring(0, 13), x+25,y+3);
    if (options.title && options.src) {
      g.setFont("6x8", 1);
      g.drawString(options.src.substring(0, 10), x+215,y+5);
    }
    y += 20;h -= 20;
  }
  if (options.icon) {
    let i = options.icon, iw;
    g.drawImage(i, x,y+4);
    if ("string"==typeof i) {iw = i.charCodeAt(0)}
    else {iw = i[0]}
    x += iw;w -= iw;
  }
  // body text
  if (options.body) {
    const maxRows=Math.floor((h-4)/8), // font=6x8
      maxChars=Math.floor(w/6)-2,
      text=fitWords(options.body, maxRows, maxChars);
    g.setColor(-1).setFont("6x8", 1).setFontAlign(-1, -1, 0).drawString(text, x+6,y+4);
  }

  if (options.render) {
    options.render({x:x, y:y, w:w, h:h});
  }

  if (options.on) Bangle.setLCDPower(1); // light up
  Bangle.setLCDMode(oldMode); // clears cliprect

  function anim() {
    pos -= 2;
    if (pos < -size) {
      pos = -size;
    }
    Bangle.setLCDOffset(pos);
    if (pos > -size) setTimeout(anim, 15);
  }
  anim();
  Bangle.on("touch", exports.hide);
}

/**
 options = {
   id // optional, only hide if current notification has this ID
 }
*/
exports.hide = function(options) {
  options = options||{};
  if ("id" in options && options.id!==id) return;
  id = null;
  Bangle.removeListener("touch", exports.hide);
  function anim() {
    pos += 4;
    if (pos > 0) pos = 0;
    Bangle.setLCDOffset(pos);
    if (pos < 0) setTimeout(anim, 10);
  }
  anim();
}
