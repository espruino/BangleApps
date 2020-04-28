(function() {
  let s = require('Storage').readJSON('welcome.json', 1)
    || require('Storage').readJSON('setting.json', 1)
    || {welcomed: true} // do NOT run if global settings are also absent
  if (!s.welcomed && require('Storage').read('welcome.app.js')) {
    setTimeout(() => {
      s.welcomed = true
      require('Storage').write('welcome.json', {welcomed: "yes"})
      load('welcome.app.js')
    })
  }
})()
