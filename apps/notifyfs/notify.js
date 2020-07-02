var pos = 0;
var oldg;

/**
 options = {
   on : bool // turn screen on, default true
   size : int // height of notification, default 120 (max)
   title : string // optional title
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
  var h = options.size||120;
  Bangle.setLCDMode("direct");
  var y = 40;
  var x = 4;
  // clear area
  g.clear(1);
  // top bar
  var top = 0;
  if (options.title) {
    g.setColor(0x39C7).fillRect(0, y, 239, y+30);
    g.setColor(-1).setFontAlign(-1, -1, 0).setFont("6x8", 3);
    g.drawString(options.title.trim().substring(0, 13), 5, y+3);
    y+=30;
  }
  if (options.src) {
    g.setColor(-1).setFontAlign(1, 1, 0).setFont("6x8", 2);
    g.drawString(options.src.substring(0, 10), 235, y-32);
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
    const maxChars = Math.floor((300-x)/16);
    var limit = maxChars;
    let row = 1;
    let words = body.trim().replace("\n", " ").split(" ");
    body = "";
    for (var i = 0; i < words.length; i++) {
      if (body.length + words[i].length + 1 > limit) {
        if (row>=8) {
          body += "...";
          break;
        }
        body += "\n " + words[i];
        row++;
        limit += maxChars;
        if (row==8) limit -= 4;
      } else {
        body += " " + words[i];
      }
    }
    g.setColor(-1).setFont("6x8", 2).setFontAlign(-1, -1, 0).drawString(body, x-4, y+4);
  }

  if (options.render) options.render(320 - h);

  if (options.on) Bangle.setLCDPower(1); // light up
  Bangle.on("touch", exports.hide);
  // Create a fake graphics to hide draw attempts
  oldg = g;
  g = Graphics.createArrayBuffer(8,8,1);
  g.flip = function() {};
};

exports.hide = function() {
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
