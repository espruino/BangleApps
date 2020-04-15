(function() {
  let s = require('Storage').readJSON('ncstart.settings.json', 1)
    || require('Storage').readJSON('setting.json', 1)
    || {welcomed: true} // do NOT run if global settings are also absent
  if (!s.welcomed && require('Storage').read('ncstart.app.js')) {
    setTimeout(() => {
      s.welcomed = true
      require('Storage').write('ncstart.settings.json', s)
      load('ncstart.app.js')
    })
  }
})()
