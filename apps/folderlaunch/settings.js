(function (back) {
    var loader = require('folderlaunch-configLoad.js');
    var storage = require('Storage');
    var textinput = require('textinput');
    var config = loader.getConfig();
    var changed = false;
    var hiddenAppsMenu = function () {
        var menu = {
            '': {
                'title': 'Hide?',
                'back': showMainMenu
            }
        };
        var onchange = function (value, appId) {
            if (value && !config.hidden.includes(appId))
                config.hidden.push(appId);
            else if (!value && config.hidden.includes(appId))
                config.hidden = config.hidden.filter(function (item) { return item != appId; });
            changed = true;
        };
        onchange;
        for (var app_1 in config.apps) {
            var appInfo = storage.readJSON(app_1 + '.info', false);
            menu[appInfo.name] = {
                value: config.hidden.includes(app_1),
                onchange: eval("(value) => { onchange(value, \"".concat(app_1, "\"); }"))
            };
        }
        E.showMenu(menu);
    };
    var getAppInfo = function (id) {
        return storage.readJSON(id + '.info', false);
    };
    var showFolderMenu = function (path) {
        var folder = config.rootFolder;
        for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
            var folderName = path_1[_i];
            try {
                folder = folder.folders[folderName];
            }
            catch (_a) {
                E.showAlert('BUG: Nonexistent folder ' + path);
            }
        }
        var back = function () {
            if (path.length) {
                path.pop();
                showFolderMenu(path);
            }
            else
                showMainMenu();
        };
        var menu = {
            '': {
                'title': path.length ? path[path.length - 1] : 'Root folder',
                'back': back
            },
            'New subfolder': function () {
                textinput.input({ text: '' }).then(function (result) {
                    if (result && !Object.keys(folder.folders).includes(result)) {
                        folder.folders[result] = {
                            folders: {},
                            apps: []
                        };
                        changed = true;
                        path.push(result);
                        showFolderMenu(path);
                    }
                    else {
                        E.showAlert('No folder created').then(function () {
                            showFolderMenu(path);
                        });
                    }
                });
            },
            'Move app here': function () {
                var menu = {
                    '': {
                        'title': 'Select app',
                        'back': function () {
                            showFolderMenu(path);
                        }
                    }
                };
                var mover = function (appId) {
                    var folder = config.rootFolder;
                    for (var _i = 0, _a = config.apps[appId].folder; _i < _a.length; _i++) {
                        var folderName = _a[_i];
                        folder = folder.folders[folderName];
                    }
                    folder.apps = folder.apps.filter(function (item) { return item != appId; });
                    config.apps[appId].folder = path.slice();
                    folder = config.rootFolder;
                    for (var _b = 0, path_2 = path; _b < path_2.length; _b++) {
                        var folderName = path_2[_b];
                        folder = folder.folders[folderName];
                    }
                    folder.apps.push(appId);
                    changed = true;
                    showFolderMenu(path);
                };
                mover;
                E.showMessage('Loading apps...');
                for (var _i = 0, _a = Object.keys(config.apps)
                    .filter(function (item) { return !folder.apps.includes(item); })
                    .map(function (item) { return item + '.info'; })
                    .sort(loader.infoFileSorter)
                    .map(function (item) { return item.split('.info')[0]; }); _i < _a.length; _i++) {
                    var appId = _a[_i];
                    menu[getAppInfo(appId).name] = eval("() => { mover(\"".concat(appId, "\"); }"));
                }
                E.showMenu(menu);
            }
        };
        var switchToFolder = function (subfolder) {
            path.push(subfolder);
            showFolderMenu(path);
        };
        switchToFolder;
        for (var _b = 0, _c = Object.keys(folder.folders); _b < _c.length; _b++) {
            var subfolder = _c[_b];
            menu[subfolder] = eval("() => { switchToFolder(\"".concat(subfolder, "\") }"));
        }
        if (folder.apps.length)
            menu['View apps'] = function () {
                var menu = {
                    '': {
                        'title': path[path.length - 1],
                        'back': function () { showFolderMenu(path); }
                    }
                };
                for (var _i = 0, _a = folder.apps; _i < _a.length; _i++) {
                    var appId = _a[_i];
                    menu[storage.readJSON(appId + '.info', false).name] = function () { };
                }
                E.showMenu(menu);
            };
        if (path.length)
            menu['Delete folder'] = function () {
                var apps = folder.apps;
                var subfolders = folder.folders;
                var toDelete = path.pop();
                folder = config.rootFolder;
                for (var _i = 0, path_3 = path; _i < path_3.length; _i++) {
                    var folderName = path_3[_i];
                    folder = folder.folders[folderName];
                }
                for (var _a = 0, apps_1 = apps; _a < apps_1.length; _a++) {
                    var appId = apps_1[_a];
                    config.apps[appId].folder.pop();
                    folder.apps.push(appId);
                }
                for (var _b = 0, _c = Object.keys(subfolders); _b < _c.length; _b++) {
                    var subfolder = _c[_b];
                    folder.folders[subfolder] = subfolders[subfolder];
                }
                delete folder.folders[toDelete];
                changed = true;
                showFolderMenu(path);
            };
        E.showMenu(menu);
    };
    var save = function () {
        if (changed) {
            E.showMessage('Saving...');
            config.hash = 0;
            loader.cleanAndSave(config);
            changed = false;
        }
    };
    E.on('kill', save);
    var showMainMenu = function () {
        E.showMenu({
            '': {
                'title': 'Folder launcher',
                'back': function () {
                    save();
                    back();
                }
            },
            'Show clocks': {
                value: !!config.showClocks,
                onchange: function (value) {
                    config.showClocks = value;
                    changed = true;
                }
            },
            'Show launchers': {
                value: !!config.showLaunchers,
                onchange: function (value) {
                    config.showLaunchers = value;
                    changed = true;
                }
            },
            'Disable vibration': {
                value: !!config.disableVibration,
                onchange: function (value) {
                    config.disableVibration = value;
                    changed = true;
                }
            },
            'Hidden apps': hiddenAppsMenu,
            'Display': function () {
                E.showMenu({
                    '': {
                        'title': 'Display',
                        'back': showMainMenu
                    },
                    'Rows': {
                        value: config.display.rows,
                        min: 1,
                        onchange: function (value) {
                            config.display.rows = value;
                            changed = true;
                        }
                    },
                    'Show icons?': {
                        value: config.display.icon,
                        onchange: function (value) {
                            config.display.icon = value;
                            changed = true;
                        }
                    },
                    'Font size': {
                        value: config.display.font,
                        min: 0,
                        format: function (value) { return (value ? value : 'Icon only'); },
                        onchange: function (value) {
                            config.display.font = value;
                            changed = true;
                        }
                    }
                });
            },
            'Timeout': {
                value: config.timeout,
                format: function (value) { return value ? "".concat(value / 1000, " sec") : 'None'; },
                min: 0,
                step: 1000,
                onchange: function (value) {
                    config.timeout = value;
                    changed = true;
                }
            },
            'Folder management': function () {
                showFolderMenu([]);
            }
        });
    };
    showMainMenu();
})
