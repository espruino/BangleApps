{
  let drawTimeout;
  let extrasTimeout;
  let onLock;
  let onTap;
  let onTwist;
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
  let extrasShown = (!settings.hidewhenlocked) && (!Bangle.isLocked());
  let installedFonts = require('Storage').readJSON("contourclock-install.json") || {};
  if (installedFonts.n > 0) { //New install - check for unused font files
    settings.fontIndex = E.clip(settings.fontIndex, -installedFonts.n + 1, installedFonts.n - 1);
    require('Storage').writeJSON("contourclock.json", settings);
    for (let n = installedFonts.n;; n++) {
      if (require("Storage").read("contourclock-" + n + ".json") == undefined) break;
      require("Storage").erase("contourclock-" + n + ".json");
    }
    require("Storage").erase("contourclock-install.json");
  }
  let showExtras = function() { //show extras for a limited time
    drawExtras();
    if (extrasTimeout) clearTimeout(extrasTimeout);
    extrasTimeout = setTimeout(() => {
      extrasTimeout = undefined;
      hideExtras();
    }, 5000);
  };
  let drawExtras = function() { //draw date, day of the week and widgets
    let date = new Date();
    g.setFont("Teletext10x18Ascii").setFontAlign(0, 1);
    if (settings.weekday) g.drawString(require("locale").dow(date).toUpperCase(), g.getWidth() / 2, g.getHeight() - 18);
    if (settings.date) g.drawString(require('locale').date(date, 1), g.getWidth() / 2, g.getHeight());
    require("widget_utils").show();
    extrasShown = true;
  };
  let hideExtras = function() {
    if (extrasTimeout) clearTimeout(extrasTimeout);
    g.clearRect(0, 138, g.getWidth() - 1, 176);
    require("widget_utils").hide();
    extrasShown = false;
  };
  let draw = function() {
    let date = new Date();
    g.reset();
    if (extrasShown) drawExtras();
    else hideExtras();
    require('contourclock').drawClock(settings.fontIndex);
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      draw();
    }, 60000 - (Date.now() % 60000));
  };
  if (settings.hideWhenLocked) {
    onLock = locked => {
      if (!locked) {
        require("widget_utils").show();
        drawExtras();
      } else {
        require("widget_utils").hide();
        hideExtras();
      }
    };
    Bangle.on('lock', onLock);
    if (settings.tapToShow) Bangle.on('tap', showExtras);
    if (settings.twistToShow) Bangle.on('twist', showExtras);
  }
  Bangle.setUI({
    mode: "clock",
    remove: function() {
      Bangle.removeListener('lock', onLock);
      Bangle.removeListener('tap', showExtras);
      Bangle.removeListener('twist', showExtras);
      if (drawTimeout) clearTimeout(drawTimeout);
      if (extrasTimeout) clearTimeout(extrasTimeout);
      if (settings.hideWhenLocked) require("widget_utils").show();
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
}
