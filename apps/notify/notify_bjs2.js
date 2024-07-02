let pos = 0, size = 0;
let id = null;
let hideCallback = undefined;
let overlayImage = undefined;

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
   render : function(y) // function callback to render
   bgColor : int/string // optional background color (default black)
   titleBgColor : int/string // optional background color for title (default black)
   onHide : function() // callback when notification is hidden
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
  let w = g.getWidth();
  let text = [];
  size = options.size;
  if (options.body) {
    const bh = (size || 80) - 20,
          maxRows=Math.floor((bh-4)/8), // font=6x8
          maxChars=Math.floor(w/6)-2;
    text=fitWords(options.body, maxRows, maxChars);
    // set size based on newlines
    if (!size) size = 28 + (text.match(/\n/g).length+1)*8;
  } else size = 20;
  if (size>80) size = 80;

  let gg = Graphics.createArrayBuffer(w,size,16);
  gg.setBgColor(g.theme.bg);
  overlayImage = { width : gg.getWidth(), height : gg.getHeight(), bpp : 16, buffer:gg.buffer };

  // drawing area
  let x = 0,
    y = 0,
    h = size,
    b = y+h-1, r = x+w-1; // bottom,right
  // clear area
  if (options.bgColor!==undefined) gg.setBgColor(options.bgColor);
  gg.clearRect(x,y, r,b);
  // title bar
  if (options.title || options.src) {
    gg.setColor("titleBgColor" in options ? options.titleBgColor : g.theme.dark ? 0x1 : 0x39C7).fillRect(x,y, r,y+20);
    const title = options.title||options.src;
    gg.setColor(g.theme.fg).setFontAlign(-1, -1, 0).setFont("6x8", 2);
    gg.drawString(title.trim().substring(0, 13), x+25,y+3);
    if (options.title && options.src) {
      gg.setFont("6x8", 1).setFontAlign(1, 1, 0);
      gg.drawString(options.src.substring(0, 10), gg.getWidth()-23,y+18);
    }
  }
  y += 20; h -= 20;
  if (options.icon) {
    let i = options.icon, iw;
    gg.drawImage(i, x,y+4);
    if ("string"==typeof i) iw = i.charCodeAt(0);
    else iw = i[0];
    x += iw;w -= iw;
  }
  // body text
  if (options.body) {
    gg.setColor(g.theme.fg).setFont("6x8", 1).setFontAlign(-1, -1, 0).drawString(text, x+6,y+4);
  }

  if (options.render) {
    options.render({x:x, y:y, w:w, h:h});
  }

  if (options.on && !(require('Storage').readJSON('setting.json',1)||{}).quiet) {
    Bangle.setLCDPower(1); // light up
  }


  function anim() {
    pos -= 2;
    if (pos < -size) {
      pos = -size;
    }
    Bangle.setLCDOverlay(overlayImage,0,-(pos+size));
    if (pos > -size) setTimeout(anim, 15);
  }
  anim();
  Bangle.on("touch", exports.hide);
  if (options.onHide)
    hideCallback = options.onHide;
};

/**
 options = {
   id // optional, only hide if current notification has this ID
 }
*/
exports.hide = function(options) {
  options = options||{};
  if ("id" in options && options.id!==id) return;
  if (hideCallback) hideCallback({id:id});
  hideCallback = undefined;
  id = null;
  Bangle.removeListener("touch", exports.hide);
  E.stopEventPropagation && E.stopEventPropagation();
  function anim() {
    pos += 4;
    if (pos > 0) {
      pos = 0;
      overlayImage = undefined;
      Bangle.setLCDOverlay();
    } else
      Bangle.setLCDOverlay(overlayImage,0,-(pos+size));
    if (pos < 0) setTimeout(anim, 10);
  }
  anim();
};
