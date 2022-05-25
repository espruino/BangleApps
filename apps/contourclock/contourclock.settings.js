(function(back) {
  Bangle.removeAllListeners('drag');
  Bangle.setUI("");
  var settings = require('Storage').readJSON('contourclock.json', true) || {};
  if (settings.fontIndex==undefined) {
     settings.fontIndex=0;
    require('Storage').writeJSON("myapp.json", settings);
  }
  savedIndex=settings.fontIndex;
  saveListener = setWatch(function() {          //save changes and return to settings menu
    require('Storage').writeJSON('contourclock.json', settings);
    Bangle.removeAllListeners('swipe');
    Bangle.removeAllListeners('lock');
    clearWatch(saveListener);
    g.clear();
    back();
  }, BTN, { repeat:false, edge:'falling' });
  lockListener = Bangle.on('lock', function () { //discard changes and return to clock
    settings.fontIndex=savedIndex;
    require('Storage').writeJSON('contourclock.json', settings);
    Bangle.removeAllListeners('swipe');
    Bangle.removeAllListeners('lock');
    clearWatch(saveListener);
    g.clear();
    load();
  });
  swipeListener = Bangle.on('swipe', function (direction) {
    var fontName = require('contourclock').drawClock(settings.fontIndex+direction);
    if (fontName) {
      settings.fontIndex+=direction;
      g.clearRect(0,0,g.getWidth()-1,16);
      g.setFont('6x8:2x2').setFontAlign(0,-1).drawString(fontName,g.getWidth()/2,0);
    } else {
      require('contourclock').drawClock(settings.fontIndex);
    }
  });
  g.reset();
  g.clear();
  g.setFont('6x8:2x2').setFontAlign(0,-1);
  g.drawString(require('contourclock').drawClock(settings.fontIndex),g.getWidth()/2,0);
  g.drawString('Swipe - change',g.getWidth()/2,g.getHeight()-36);
  g.drawString('BTN - save',g.getWidth()/2,g.getHeight()-18);
})
