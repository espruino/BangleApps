(function() {
  let s = require('Storage').readJSON('welcome2.json', 1) || {};
  if (!s.welcomed) {
    setTimeout(() => {
      require('Storage').write('welcome2.json', {welcomed: true})
      load('welcome2.app.js')
    })
  }
})()
