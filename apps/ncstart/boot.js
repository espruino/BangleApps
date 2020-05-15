(function() {
  let s = require('Storage').readJSON('ncstart.json', 1) || {};
  if (!s.welcomed) {
    setTimeout(() => {
      require('Storage').write('ncstart.json', {welcomed: true})
      load('ncstart.app.js')
    })
  }
})()
