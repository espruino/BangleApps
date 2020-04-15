// The welcome app is special, and gets to use global settings
(function(back) {
  let settings = require('Storage').readJSON('ncstart.settings.json', 1)
    || require('Storage').readJSON('setting.json', 1) || {}
  E.showMenu({
    '': { 'title': 'NCEU Startup' },
    'Run on Next Boot': {
      value: !settings.welcomed,
      format: v => v ? 'OK' : 'No',
      onchange: v => require('Storage').write('ncstart.settings.json', {welcomed: !v}),
    },
    'Run Now': () => load('ncstart.app.js'),
    '< Back': back,
  })
})
