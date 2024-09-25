(function(back) {
  let settings = require('Storage').readJSON('mywelcome.json', 1)
    || require('Storage').readJSON('setting.json', 1) || {}
  E.showMenu({
    '': { 'title': 'Welcome App' },
    'Run next boot': {
      value: !settings.welcomed,
      onchange: v => require('Storage').write('mywelcome.json', {welcomed: !v}),
    },
    'Run Now': () => load('mywelcome.app.js'),
    'Turn off & run next': () => {
      require('Storage').write('mywelcome.json', {welcomed: false});
      Bangle.off();
    },
    '< Back': back,
  })
})
