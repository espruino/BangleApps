(() => {
  var settings = require('Storage').readJSON('setting.json', true);
  if (!settings) return;
  if (settings.options) Bangle.setOptions(settings.options);
  if (settings.brightness && settings.brightness!=1) Bangle.setLCDBrightness(settings.brightness);
})()
