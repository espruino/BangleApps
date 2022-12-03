{
  let digits = [];
  let drawTimeout;
  let fontName="";
  let settings = require('Storage').readJSON("contourclock.json", true) || {};
  if (settings.fontIndex==undefined) {
    settings.fontIndex=0;
    settings.widgets=true;
    settings.hide=false;
    settings.weekday=true;
    settings.hideWhenLocked=false;
    settings.date=true;    require('Storage').writeJSON("myapp.json", settings);
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
    if ((!settings.hideWhenLocked) || (!Bangle.isLocked())) {
      // Draw day of the week
      g.setFont("Teletext10x18Ascii");
      g.clearRect(0,138,g.getWidth()-1,176);
      if (settings.weekday) g.setFontAlign(0,1).drawString(require("locale").dow(date).toUpperCase(),g.getWidth()/2,g.getHeight()-18);
      // Draw Date
      if (settings.date) g.setFontAlign(0,1).drawString(require('locale').date(new Date(),1),g.getWidth()/2,g.getHeight());
    }
    require('contourclock').drawClock(settings.fontIndex);
  };
  
  require("FontTeletext10x18Ascii").add(Graphics);
  g.clear();
  
  draw();
  if (settings.hideWhenLocked) Bangle.on('lock', function (locked) {
    if (!locked) require("widget_utils").show();
    else {
      g.clear();
      if (settings.hide) require("widget_utils").swipeOn();
      else require("widget_utils").hide();
    }
    draw();
  });
  Bangle.setUI({mode:"clock", remove:function() {
    if (drawTimeout) clearTimeout(drawTimeout);
    if (settings.widgets && settings.hide) require("widget_utils").show();
    g.reset();
    g.clear();
  }});
  if (settings.widgets) {
    Bangle.loadWidgets();
    if (settings.hide) require("widget_utils").swipeOn();
    else Bangle.drawWidgets();
  }
  queueDraw();
}
