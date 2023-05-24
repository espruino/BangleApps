(function (back) {
    var menu = {
        '': { 'title': 'Popcon' },
        '< Back': back,
        'Reset app popularities': function () {
            var S = require("Storage");
            S.erase("popcon.cache.json");
            var info = S.readJSON("popcon.info", true);
            info.cacheBuster = !info.cacheBuster;
            S.writeJSON("popcon.info", info);
            E.showMessage("Popcon reset", "Done");
        },
    };
    E.showMenu(menu);
});
