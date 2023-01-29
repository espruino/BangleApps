(function(back) {
  Bangle.setUI("");
  var settings = require('Storage').readJSON('contourclock.json', true) || {};
  if (settings.fontIndex==undefined) {
    settings.fontIndex=0;
    settings.widgets=true;
    settings.weekday=true;
    settings.date=true;
    settings.hideWhenLocked=false;
    settings.tapToShow=false;
    settings.twistToShow=false;
    require('Storage').writeJSON("contourclock.json", settings);
  }
  function mainMenu() {
    E.showMenu({
      "" : { "title" : "ContourClock" },
      "< Back" : () => back(),
      'Widgets': {
        value: (settings.widgets !== undefined ? settings.widgets : true),
        onchange : v => {settings.widgets=v; require('Storage').writeJSON('contourclock.json', settings);}
      },
      'Weekday': {
        value: (settings.weekday !== undefined ? settings.weekday : true),
        onchange : v => {settings.weekday=v; require('Storage').writeJSON('contourclock.json', settings);}
      },
      'Date': {
        value: (settings.date !== undefined ? settings.date : true),
        onchange : v => {settings.date=v; require('Storage').writeJSON('contourclock.json', settings);}
      },
      'Hide widgets, weekday and date when locked': {
        value: (settings.hideWhenLocked !== undefined ? settings.hideWhenLocked : false),
        onchange : v => {settings.hideWhenLocked=v; require('Storage').writeJSON('contourclock.json', settings);}
      },
      'Tap to show': {
        value: (settings.tapToShow !== undefined ? settings.tapToShow : false),
        onchange : v => {settings.tapToShow=v; require('Storage').writeJSON('contourclock.json', settings);}
      },
      'Twist to show': {
        value: (settings.twistToShow !== undefined ? settings.twistToShow : false),
        onchange : v => {settings.twistToShow=v; require('Storage').writeJSON('contourclock.json', settings);}
      },
      'set Font': () => fontMenu() 
    });
  }
  function fontMenu() {
    Bangle.setUI("");
    savedIndex=settings.fontIndex;
    saveListener = setWatch(function() {          //save changes and return to settings menu
      require('Storage').writeJSON('contourclock.json', settings);
      Bangle.removeAllListeners('swipe');
      Bangle.removeAllListeners('lock');
      mainMenu();
    }, BTN, { repeat:false, edge:'falling' });
    lockListener = Bangle.on('lock', function () { //discard changes and return to clock
      settings.fontIndex=savedIndex;
      require('Storage').writeJSON('contourclock.json', settings);
      Bangle.removeAllListeners('swipe');
      Bangle.removeAllListeners('lock');
      mainMenu();
    });
    swipeListener = Bangle.on('swipe', function (direction) {
      var fontName = require('contourclock').drawClock(settings.fontIndex+direction);
      if (fontName) {
        settings.fontIndex+=direction;
        g.clearRect(0,g.getHeight()-36,g.getWidth()-1,g.getHeight()-36+16);
        g.setFont('6x8:2x2').setFontAlign(0,-1).drawString(fontName,g.getWidth()/2,g.getHeight()-36);
      } else {
        require('contourclock').drawClock(settings.fontIndex);
      }
    });
    g.reset();
    g.clearRect(0,24,g.getWidth()-1,g.getHeight()-1);
    g.setFont('6x8:2x2').setFontAlign(0,-1);
    g.drawString(require('contourclock').drawClock(settings.fontIndex),g.getWidth()/2,g.getHeight()-36);
    g.drawString('Button to save',g.getWidth()/2,g.getHeight()-18);
  }
  mainMenu();
})
