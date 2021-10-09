(function() {
  let s = require('Storage').readJSON('mywelcome.json', 1) || {};
  if (!s.welcomed) {
    setTimeout(() => {
      require('Storage').write('mywelcome.json', {welcomed: true})
      load('mywelcome.app.js')
    })
  }
})()
