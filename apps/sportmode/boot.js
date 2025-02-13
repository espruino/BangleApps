{
  const settings = Object.assign({
    mode: -1,
  }, require('Storage').readJSON("sportmode.json", true) || {});

  Bangle.setOptions({hrmSportMode: settings.mode});
}
