(() => {
    var settings = require('Storage').readJSON('setting.json', true);
    if (settings != undefined) {
        Bangle.setOptions(settings.options);
    }
})()
