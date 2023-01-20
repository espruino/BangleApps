(function() {
    var FILE = 'backswipe.json';
    // Mode can be 'blacklist', 'whitelist', 'on' or 'disabled'
    // Apps is an array of app names, where all the apps that are there are either blocked or allowed, depending on the mode
    var DEFAULTS = {
        'mode': 'blacklist',
        'apps': []
    };

    var settings = {};
    
    var loadSettings = function() {
        var settings = require('Storage').readJSON(FILE, 1) || DEFAULTS;
        return settings;
    }

    var saveSettings = function(settings) {
        require('Storage').write(FILE, settings);
    }

    var getApps = function() {
        var apps = require('Storage').list(/\.info$/).map(app => {
            return app.replace('.info', '');
        });
        return apps;
    }

    var getSettings = function() {
        var settings = loadSettings();
        return {
            mode: settings.mode,
            apps: settings.apps,
        };
    }

    var showMenu = function() {
        var settings = getSettings();
        var menu = {
            '': { 'title': 'Backswipe' },
            '< Back': () => {
                load();
                E.showMenu();
            },
            'Mode': {
                value: settings.mode,
                format: v => v,
                onchange: v => {
                    settings.mode = v;
                },
                options: ['blacklist', 'whitelist', 'on', 'disabled']
            },
            'App List': {
                value: '',
                format: v => v,
                onchange: v => {
                    showAppSubMenu();
                }
            }
        };
        
        E.showMenu(menu);
    }

    var showAppSubMenu = function() {
        var menu = {
            '': { 'title': 'Backswipe' },
            '< Back': () => {
                showMenu();
            },
            'Add App': () => {
                showAppList();
            }
        };
        settings.apps.forEach(app => {
            menu[app.app] = () => {
                settings.apps.splice(settings.apps.indexOf(app), 1);
            }
            saveSettings(settings);
        });
        E.showMenu(menu);
    }

    var showAppList = function() {
        var apps = getApps();
        var menu = {
            '': { 'title': 'Backswipe' },
            '< Back': () => {
                showMenu();
            }
        };
        apps.forEach(app => {
            menu[app] = () => {
                settings.apps.push(app);
                saveSettings(settings);
                showAppSubMenu();
            }
        });
        E.showMenu(menu);
    }

    loadSettings();
    showMenu();
})