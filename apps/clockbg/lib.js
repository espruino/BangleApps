let settings = Object.assign({
  style : "randomcolor",
  colors : ["#F00","#0F0","#00F"]
},require("Storage").readJSON("clockbg.json")||{});
if (settings.style=="image")
  settings.img = require("Storage").read(settings.fn);
if (settings.style=="randomcolor") {
  settings.style = "color";
  var n = (0|(Math.random()*settings.colors.length)) % settings.colors.length;
  settings.color = settings.colors[n];
}

// Fill a rectangle with the current background style, rect = {x,y,w,h}
// eg require("clockbg").fillRect({x:10,y:10,w:50,h:50})
//    require("clockbg").fillRect(Bangle.appRect)
exports.fillRect = function(rect,y,x2,y2) {
  if ("object"!=typeof rect) rect = {x:rect,y:y,w:1+x2-rect,h:1+y2-y};
  if (settings.img) {
    g.setClipRect(rect.x, rect.y, rect.x+rect.w-1, rect.y+rect.h-1).drawImage(settings.img).setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
  } else if (settings.style == "color") {
    g.setBgColor(settings.color).clearRect(rect);
  } else {
    console.log("clockbg: No background set!");
    g.setBgColor(g.theme.bg).clearRect(rect);
  }
};

