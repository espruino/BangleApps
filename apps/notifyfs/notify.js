let oldg;
let id = null;

/**
 * See notify/notify.js
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
   size : int // height of notification, default 120 (max)
   title : string // optional title
   id // optional notification ID, used with hide()
   src : string // optional source name
   body : string // optional body text
   icon : string // optional icon (image string)
   render function(y) // function callback to render
 }
*/
exports.show = function(options) {
  if (oldg) g=oldg;
  options = options||{};
  if (options.on===undefined) options.on=true;
  id = ("id" in options)?options.id:null;
  let size = options.size||120;
  if (size>120) {size=120}
  Bangle.setLCDMode("direct");
  let x = 0,
    y = 0,
    w = 240,
    h = 240;
  // clear screen
  g.clear(1);
  // top bar
  if (options.title||options.src) {
    y=40;h=size;
    const title = options.title || options.src
    g.setColor(0x39C7).fillRect(x, y, x+w-1, y+30);
    g.setColor(-1).setFontAlign(-1, -1, 0).setFont("6x8", 3);
    g.drawString(title.trim().substring(0, 13), x+5, y+3);
    if (options.title && options.src) {
      g.setColor(-1).setFontAlign(1, 1, 0).setFont("6x8", 2);
      // above drawing area, but we are fullscreen
      g.drawString(options.src.substring(0, 10), x+235, y-32);
    }
    y += 30;h -= 30;
  }
  if (options.icon) {
    let i = options.icon, iw,ih;
    if ("string"==typeof i) {iw=i.charCodeAt(0); ih=i.charCodeAt(1)}
    else {iw=i[0]; ih=i[1]}
    const iy=y ? (y+4) : (h-ih)/2; // show below title bar if present, otherwise center vertically
    g.drawImage(i, x+4,iy);
    x += iw+4;w -= iw+4;
  }
  // body text
  if (options.body) {
    const maxRows = Math.floor((h-4)/16), // font=2*(6x8)
      maxChars = Math.floor((w-4)/12),
      text=fitWords(options.body, maxRows, maxChars);
    g.setColor(-1).setFont("6x8", 2).setFontAlign(-1, -1, 0).drawString(text, x+4, y+4);
  }

  if (options.render) {
    const area={x:x, y:y, w:w, h:h}
    options.render(area);
  }

  if (options.on) Bangle.setLCDPower(1); // light up
  Bangle.on("touch", exports.hide);
  // Create a fake graphics to hide draw attempts
  oldg = g;
  g = Graphics.createArrayBuffer(8,8,1);
  g.flip = function() {};
};

/**
 options = {
   id // optional, only hide if current notification has this ID
 }
 */
exports.hide = function(options) {
  options = options||{};
  if ("id" in options && options.id!==id) return;
  id = null;
  g=oldg;
  oldg = undefined;
  Bangle.removeListener("touch", exports.hide);
  g.clear();
  Bangle.drawWidgets();
  // flipping the screen off then on often triggers a redraw - it may not!
  Bangle.setLCDPower(0);
  Bangle.setLCDPower(1);
  // hack for E.showMenu/showAlert/showPrompt - can force a redraw by faking next/back
  if (Bangle.btnWatches) {
    global["\xff"].watches[Bangle.btnWatches[0]].callback();
    global["\xff"].watches[Bangle.btnWatches[1]].callback();
  }
};
