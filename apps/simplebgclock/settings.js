(function(back) {
  const SETTINGS_FILE = "simplebgclock.json";
  let settings = Object.assign({
    ypos : 88
  }, require('Storage').readJSON(SETTINGS_FILE, 1) || {});

  function save() {
    require('Storage').write(SETTINGS_FILE, settings);
  }

  var positions = {
    /*Lang*/"Top" : 36,
    /*Lang*/"Middle" : 88,
    /*Lang*/"Bottom" : 140,
  };

  E.showMenu({
    '': { 'title': 'Simple Bg Clock' },
    /*LANG*/'< Back': back,
    /*LANG*/'Position': {
      value: Math.max(0,Object.values(positions).indexOf(88)),
      min: 0, max: positions.length - 1,
      format: v => Object.keys(positions)[v],
      onchange: v => {
        settings.ypos = Object.values(positions)[v];
        save();
      }
    }
  });
});
