(function (back) {
    var menu = {
        '': { 'title': 'Popcon' },
        '< Back': back,
        'Reset app popularities': function () {
            var S = require("Storage");
            S.erase("popcon.cache.json");
            var info = S.readJSON("popconlaunch.info", true);
            info.cacheBuster = !info.cacheBuster;
            S.writeJSON("popconlaunch.info", info);
            E.showMessage("Popcon reset", "Done");
        },
    };
    E.showMenu(menu);
})
