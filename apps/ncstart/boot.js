(function() {
  let s = require('Storage').readJSON('setting.json', 1) || {}
  if (!s.welcomed && require('Storage').read('ncstart.app.js')) {
    setTimeout(() => {
      s.welcomed = true
      require('Storage').write('setting.json', s)
      load('ncstart.app.js')
    })
  }
})()
