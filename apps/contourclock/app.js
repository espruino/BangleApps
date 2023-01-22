{
  const interval = 60000;
  let digits = [];
  let drawTimeout;
  let extrasTimeout;
  let fontName="";
  let settings = require('Storage').readJSON("contourclock.json", true) || {};
  if (settings.fontIndex==undefined) {
    settings.fontIndex=0;
    settings.widgets=true;
    settings.weekday=true;
    settings.hideWhenLocked=false;
    settings.tapToShow=false;
    settings.twistToShow=false;
    settings.date=true;    
    require('Storage').writeJSON("contourclock.json", settings);
  }
  let installedFonts = require('Storage').readJSON("contourclock-install.json") || {};
  if (installedFonts.n>0) { //New install - check for unused font files
    for (let n=installedFonts.n; ;n++) { 
      if (require("Storage").read("contourclock-"+n+".json")==undefined) break;
      require("Storage").erase("contourclock-"+n+".json");
    }
    require("Storage").erase("contourclock-install.json");
  }
  require("FontTeletext10x18Ascii").add(Graphics);

  let queueDraw = function() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(draw, interval - (Date.now() % interval));
  };
  let drawExtras = function() { //draw date, day of the week and widgets
    let date = new Date();
    g.setFont("Teletext10x18Ascii");
    if (settings.weekday) 
      g.setFontAlign(0,1).drawString(require("locale").dow(date).toUpperCase(),g.getWidth()/2,g.getHeight()-18);
    // Draw Date
    if (settings.date) 
      g.setFontAlign(0,1).drawString(require('locale').date(date,1),g.getWidth()/2,g.getHeight());
    require("widget_utils").show();
  };
  let hideExtras = function() {
    g.clearRect(0,138,g.getWidth()-1,176);
    require("widget_utils").hide();
  };
  let draw = function() {
    //drawTimeout = undefined;
    let date = new Date();
    print ("drawing time at:" +date.getHours()+":"+date.getMinutes()+":"+date.getSeconds());
    g.reset();
    if ((!settings.hideWhenLocked) || (!Bangle.isLocked())) drawExtras();
    else require("widget_utils").hide();
    require('contourclock').drawClock(settings.fontIndex);
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(draw, interval - (Date.now() % interval));
  };
  
  let onLock = locked => {
    if (!locked) {
      require("widget_utils").show();
      drawExtras();
    } else {
      require("widget_utils").hide();
      hideExtras();
    }
  };
  let onTap = d => {
    if (d.double) {
      drawExtras();
      if (extrasTimeout) clearTimeout(extrasTimeout);
      extrasTimeout = setTimeout(hideExtras, 5000);
    }
  };
  let onTwist = () => {
    drawExtras();
    if (extrasTimeout) clearTimeout(extrasTimeout);
    extrasTimeout = setTimeout(hideExtras, 5000);
  };
  if (settings.hideWhenLocked) {
    Bangle.on('lock', onLock);
    if (settings.tapToShow) Bangle.on('tap', onTap);
    if (settings.twistToShow) Bangle.on('twist', onTwist);
  }
  Bangle.setUI({mode:"clock", remove:function() {
    if (onLock) Bangle.removeListener('lock',onLock);
    if (onTap) Bangle.removeListener('tap', onTap);
    if (onTwist) Bangle.removeListener('twist',onTwist);
    if (drawTimeout) clearTimeout(drawTimeout);
    if (extrasTimeout) clearTimeout(extrasTimeout);
    if (settings.hideWhenLocked) require("widget_utils").show();
    g.reset();
    g.clear();
  }});
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  draw();
}
