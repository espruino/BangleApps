// The welcome app is special, and gets to use global settings
(function(back) {
  let settings = require('Storage').readJSON('setting.json', 1) || {}
  E.showMenu({
    '': { 'title': 'Welcome App' },
    'Run again': {
      value: !settings.welcomed,
      format: v => v ? 'Yes' : 'No',
      onchange: v => {
        settings.welcomed = v ? undefined : true
        require('Storage').write('setting.json', settings)
      },
    },
    '< Back': back,
  })
})
