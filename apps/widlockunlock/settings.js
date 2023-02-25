"use strict";
(function (back) {
    var storage = require('Storage');
    var filename = 'lockunlock.settings.json';
    var settings = Object.assign(storage.readJSON(filename, true) || {}, { location: "tl" });
    var save = function () {
        return storage.writeJSON(filename, settings);
    };
    var locations = ["tl", "tr"];
    var menu = {
        '': { 'title': 'Lock/Unlock' },
        '< Back': back,
        'Location': {
            value: (function () {
                var i = locations.indexOf(settings.location);
                return i < 0 ? 0 : i;
            })(),
            min: 0,
            max: locations.length - 1,
            wrap: true,
            format: function (v) { return locations[v]; },
            onchange: function (v) {
                settings.location = locations[v];
                save();
            },
        },
    };
    E.showMenu(menu);
});
