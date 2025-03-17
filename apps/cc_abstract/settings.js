(function(back) {
  const defaultSettings = {
    loadWidgets    : false,
    textAboveHands : false,
    shortHrHand    : false,
    show24HourMode : false
  }
  let settings = Object.assign(defaultSettings, require('Storage').readJSON('cc_clock24.json',1) || {});

  const save = () => require('Storage').write('cc_clock24.json', settings);

  const appMenu = {
    '': {title: 'cc_clock24'}, '< Back': back,
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
    /*LANG*/'Show 24 hour mode': {
      value : !!settings.show24HourMode,
      onchange : v => { settings.show24HourMode=v; save();}
    },
  };

  E.showMenu(appMenu);
})
