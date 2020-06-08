var pos = 0;

/**
 options = {
   on : bool // turn screen on, default true
   size : int // height of notification, default 80 (max)
   title : string // optional title
   src : string // optional source name
   body : string // optional body text
   icon : string // optional icon (image string)
   render function(y) // function callback to render
 }
*/
exports.show = function(options) {
  options = options||{};
  if (options.on===undefined) options.on=true;
  var h = options.size||80;
  var oldMode = Bangle.getLCDMode();
  // TODO: throw exception if double-buffered?

  Bangle.setLCDMode("direct");
  var y = 320-h;
  var x = 4;
  g.setClipRect(0, y, 239, 319);
  // clear area
  g.setColor(0).fillRect(0, y+1, 239, 317);
  // border
  g.setColor(0x39C7).fillRect(0, 318, 239, 319);
  // top bar
  var top = 0;
  if (options.title) {
    g.setColor(0x39C7).fillRect(0, y, 239, y+20);
    g.setColor(-1).setFontAlign(-1, -1, 0).setFont("6x8", 2);
    g.drawString(options.title.trim().substring(0, 13), 25, y+3);
    y+=20;
  }
  if (options.src) {
    g.setColor(-1).setFontAlign(1, -1, 0).setFont("6x8", 1);
    g.drawString(options.src.substring(0, 10), 215, 322-h);
  }
  if (options.icon) {
    let i = options.icon;
    g.drawImage(i, x,y+4);
    if ("string"==typeof i) x += i.charCodeAt(0);
    else x += i[0];
  }
  // body text
  if (options.body) {
    var body = options.body;
    const maxChars = Math.floor((300-x)/8);
    var limit = maxChars;
    let row = 1;
    let words = body.trim().replace("\n", " ").split(" ");
    body = "";
    for (var i = 0; i < words.length; i++) {
      if (body.length + words[i].length + 1 > limit) {
        if (row>=5) {
          body += "...";
          break;
        }
        body += "\n " + words[i];
        row++;
        limit += maxChars;
        if (row==5) limit -= 4;
      } else {
        body += " " + words[i];
      }
    }
    g.setColor(-1).setFont("6x8", 1).setFontAlign(-1, -1, 0).drawString(body, x-4, y+4);
  }

  if (options.render) options.render(320 - h);

  if (options.on) Bangle.setLCDPower(1); // light up
  Bangle.setLCDMode(oldMode); // clears cliprect

  function anim() {
    pos -= 2;
    if (pos < -h) {
      pos = -h;
    }
    Bangle.setLCDOffset(pos);
    if (pos > -h) setTimeout(anim, 15);
  }
  anim();
  Bangle.on("touch", exports.hide);
}

exports.hide = function() {
  Bangle.removeListener("touch", exports.hide);
  function anim() {
    pos += 4;
    if (pos > 0) pos = 0;
    Bangle.setLCDOffset(pos);
    if (pos < 0) setTimeout(anim, 10);
  }
  anim();
}
