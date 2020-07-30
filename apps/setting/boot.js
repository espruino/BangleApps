(() => {
  var settings = require('Storage').readJSON('setting.json', true);
  if (!settings) return;
  if (settings.options) Bangle.setOptions(settings.options);
  if (settings.brightness && settings.brightness!=1) Bangle.setLCDBrightness(settings.brightness);
  if (settings.passkey!==undefined && settings.passkey.length==6) NRF.setSecurity({passkey:settings.passkey, mitm:1, display:1});
  if (settings.whitelist) NRF.on('connect', function(addr) { if (!settings.whitelist.includes(addr)) NRF.disconnect(); });
  delete settings;
})()
