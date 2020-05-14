(function() {
  let s = require('Storage').readJSON('welcome.json', 1) || {};
  if (!s.welcomed) {
    setTimeout(() => {
      require('Storage').write('welcome.json', {welcomed: true})
      load('welcome.app.js')
    })
  }
})()
