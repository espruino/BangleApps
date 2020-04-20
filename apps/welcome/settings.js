(function(back) {
  let settings = require('Storage').readJSON('welcome.json', 1)
    || require('Storage').readJSON('setting.json', 1) || {}
  E.showMenu({
    '': { 'title': 'Welcome App' },
    'Run on Next Boot': {
      value: !settings.welcomed,
      format: v => v ? 'OK' : 'No',
      onchange: v => require('Storage').write('welcome.json', {welcomed: !v}),
    },
    'Run Now': () => load('welcome.app.js'),
    '< Back': back,
  })
})
