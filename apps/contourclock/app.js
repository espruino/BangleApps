{
  let digits = [];
  let drawTimeout;
  let fontName="";
  let settings = require('Storage').readJSON("contourclock.json", true) || {};
  if (settings.fontIndex==undefined) {
    settings.fontIndex=0;
    require('Storage').writeJSON("myapp.json", settings);
  }

  let queueDraw = function() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      draw();
      queueDraw();
    }, 60000 - (Date.now() % 60000));
  };

  let draw = function() {
    var date = new Date();
    // Draw day of the week
    g.reset();
    g.setFont("Teletext10x18Ascii");
    g.clearRect(0,138,g.getWidth()-1,176);
    g.setFontAlign(0,1).drawString(require("locale").dow(date).toUpperCase(),g.getWidth()/2,g.getHeight()-18);
    // Draw Date
    g.setFontAlign(0,1).drawString(require('locale').date(new Date(),1),g.getWidth()/2,g.getHeight());
    require('contourclock').drawClock(settings.fontIndex);
  };

  require("FontTeletext10x18Ascii").add(Graphics);
  g.clear();
  draw();
  Bangle.setUI({mode:"clock", remove:function() {
    if (drawTimeout) clearTimeout(drawTimeout);
    require("widget_utils").show();
    g.reset();
    g.clear();
  }});
  Bangle.loadWidgets();
  require("widget_utils").swipeOn();
  //Bangle.drawWidgets();
  queueDraw();
}
