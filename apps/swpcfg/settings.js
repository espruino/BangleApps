(function(back) {
  const FILE = 'swpcfg.json';
  const DEFAULTS = {
    scrolldir: 0,
    swipedir: 0,
  };

  let settings = {};

  let loadSettings = function() {
    settings = require('Storage').readJSON(FILE, 1) || DEFAULTS;
  };

  let saveSettings = function(settings) {
    require('Storage').write(FILE, settings);
  };

  const scrollDirections = [/*LANG*/"Natural",/*LANG*/"Reverse"], swipeDirections = scrollDirections;

  const showMenu = function() {
    const menu = {
      '': { 'title': 'Swipe Settings' },
      '< Back': () => {
        back();
      },
      /*LANG*/'Scroll Direction': {
        value: 0|settings.scrolldir,
        min: 0,
        max: scrollDirections.length-1,
        format: v=> scrollDirections[v],
        onchange: v => {
          settings.scrolldir = 0 | v;
          saveSettings(settings);
        }
      },
      /*LANG*/'Swipe Direction': {
        value: 0|settings.swipedir,
        min: 0,
        max: swipeDirections.length-1,
        format: v=> swipeDirections[v],
        onchange: v => {
          settings.swipedir = 0 | v;
          saveSettings(settings);
        }
      }
    };

    E.showMenu(menu);
  };
  
  loadSettings();
  showMenu();
})
