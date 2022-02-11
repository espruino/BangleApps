var digits = [];
var drawTimeout;
var fontName="";
var settings = require('Storage').readJSON("contourclock.json", true) || {};
if (settings.fontIndex==undefined) {
  settings.fontIndex=0;
  require('Storage').writeJSON("myapp.json", settings);
}

function draw() {
  var date = new Date();
  // Draw day of the week
  g.setFont("Teletext10x18Ascii");
  g.clearRect(0,138,g.getWidth()-1,176);
  g.setFontAlign(0,1).drawString(require("locale").dow(date).toUpperCase(),g.getWidth()/2,g.getHeight()-18);
  // Draw Date
  g.setFontAlign(0,1).drawString(require('locale').date(new Date(),1),g.getWidth()/2,g.getHeight());
  require('contourclock').drawClock(settings.fontIndex);
}

require("FontTeletext10x18Ascii").add(Graphics);
Bangle.setUI("clock");
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
draw();
setTimeout(function() {
  setInterval(draw,60000);
}, 60000 - Date.now() % 60000);
