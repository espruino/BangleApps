(function (back) {
    var menu = {
        '': { 'title': 'Popcon' },
        '< Back': back,
        'Reset app popularities': function () {
            require("Storage").erase("popcon.cache.json");
            E.showMessage("Popcon reset", "Done");
        },
    };
    E.showMenu(menu);
});
