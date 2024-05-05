(function(back) {
  const defaultSettings = {
    loadWidgets    : false,
    textAboveHands : false,
    shortHrHand    : false
  }
  let settings = Object.assign(defaultSettings, require('Storage').readJSON('andark.json',1)||{});

  const save = () => require('Storage').write('andark.json', settings);

  const appMenu = {
    '': {title: 'andark'}, '< Back': back,
    /*LANG*/'Load widgets': {
      value : !!settings.loadWidgets,
      onchange : v => { settings.loadWidgets=v; save();}
    },
    /*LANG*/'Text above hands': {
      value : !!settings.textAboveHands,
      onchange : v => { settings.textAboveHands=v; save();}
    },
    /*LANG*/'Short hour hand': {
      value : !!settings.shortHrHand,
      onchange : v => { settings.shortHrHand=v; save();}
    },
  };

  E.showMenu(appMenu);
});
