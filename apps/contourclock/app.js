{
  let drawTimeout;
  let extrasTimer=0;
  let settings = require('Storage').readJSON("contourclock.json", true) || {};
  if (settings.fontIndex == undefined) {
    settings.fontIndex = 0;
    settings.widgets = true;
    settings.weekday = true;
    settings.hideWhenLocked = false;
    settings.tapToShow = false;
    settings.twistToShow = false;
    settings.date = true;
    require('Storage').writeJSON("contourclock.json", settings);
  }
  require("FontTeletext10x18Ascii").add(Graphics);
  let installedFonts = require('Storage').readJSON("contourclock-install.json") || {};
  // New install - check for unused font files. This should probably be handled by the installer instead
  if (installedFonts.n > 0) { 
    settings.fontIndex = E.clip(settings.fontIndex, -installedFonts.n + 1, installedFonts.n - 1);
    require('Storage').writeJSON("contourclock.json", settings);
    for (let n = installedFonts.n;; n++) {
      if (require("Storage").read("contourclock-" + n + ".json") == undefined) break;
      require("Storage").erase("contourclock-" + n + ".json");
    }
    require("Storage").erase("contourclock-install.json");
  }
  let onLock = function(locked) {if (!locked) showExtras();};
  let showExtras = function() { //show extras for 5s
    drawExtras();
    extrasTimer = 5000-60000-(Date.now()%60000);
    if (extrasTimer<0) {  //schedule next redraw early to hide extras
      if (drawTimeout) clearTimeout(drawTimeout);
      drawTimeout = setTimeout(function() {
        drawTimeout = undefined;
        draw();
      }, 5000);
    }
  };
  let hideExtras = function() {
    g.reset();
    g.clearRect(0, 138, g.getWidth() - 1, 176);
    if (settings.widgets) require("widget_utils").hide();
  };
  let drawExtras = function() { //draw date, day of the week and widgets
    let date = new Date();
    g.reset();
    g.clearRect(0, 138, g.getWidth() - 1, 176);
    g.setFont("Teletext10x18Ascii").setFontAlign(0, 1);
    if (settings.weekday) g.drawString(require("locale").dow(date).toUpperCase(), g.getWidth() / 2, g.getHeight() - 18);
    if (settings.date) g.drawString(require('locale').date(date, 1), g.getWidth() / 2, g.getHeight());
    if (settings.widgets) require("widget_utils").show();
  };
  let draw = function() {
    if (extrasTimer>0) { //schedule next draw early to remove extras
      drawTimeout = setTimeout(function() {
        drawTimeout = undefined;
        draw();
      }, extrasTimer);
      extrasTimer=0;
    } else {
      if (settings.hideWhenLocked) hideExtras();
      drawTimeout = setTimeout(function() {
        drawTimeout = undefined;
        draw();
      }, 60000 - (Date.now() % 60000));
    }
    g.reset();
    if (!settings.hideWhenLocked) drawExtras();
    require('contourclock').drawClock(settings.fontIndex);
  };
  if (settings.hideWhenLocked) {
    Bangle.on('lock', onLock);
    if (settings.tapToShow) Bangle.on('tap', showExtras);
    if (settings.twistToShow) Bangle.on('twist', showExtras);
  }
  Bangle.setUI({
    mode: "clock",
    remove: function() {
      if (settings.hideWhenLocked) {
        Bangle.removeListener('lock', onLock);
        if (settings.tapToShow) Bangle.removeListener('tap', showExtras);
        if (settings.twistToShow) Bangle.removeListener('twist', showExtras);
      }
      if (drawTimeout) {
        clearTimeout(drawTimeout);
        drawTimeout = undefined;
      }
      if (settings.hideWhenLocked && settings.widgets) require("widget_utils").show();
      g.reset();
      g.clear();
    }
  });
  g.clear();
  if (settings.widgets) {
    Bangle.loadWidgets();
    Bangle.drawWidgets();
  }
  draw();
  if (!settings.hideWhenLocked || !Bangle.isLocked()) showExtras();
}
