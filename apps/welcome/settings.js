(function(back) {
  let settings = require('Storage').readJSON('welcome.json', 1)
    || require('Storage').readJSON('setting.json', 1) || {}
  E.showMenu({
    '': { 'title': 'Welcome App' },
    'Run next boot': {
      value: !settings.welcomed,
      onchange: v => require('Storage').write('welcome.json', {welcomed: !v}),
    },
    'Run Now': () => load('welcome.app.js'),
    'Turn off & run next': () => {
      require('Storage').write('welcome.json', {welcomed: false});
      Bangle.setLocked(true); // fix for pre-2v11 firmware that can accidentally leave touchscreen on
      if (Bangle.softOff()) Bangle.softOff(); else Bangle.off();
    },
    '< Back': back,
  })
})
