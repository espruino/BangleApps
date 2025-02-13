var storage = require("Storage");
var SETTINGS_FILE = "folderlaunch.json";
var DEFAULT_CONFIG = {
    showClocks: false,
    showLaunchers: false,
    disableVibration: false,
    hidden: [],
    display: {
        rows: 2,
        icon: true,
        font: 12
    },
    timeout: 30000,
    rootFolder: {
        folders: {},
        apps: []
    },
    apps: {},
    hash: 0
};
function clearFolder(folder) {
    for (var childName in folder.folders)
        folder.folders[childName] = clearFolder(folder.folders[childName]);
    folder.apps = [];
    return folder;
}
function cleanAndSave(config) {
    var infoFiles = storage.list(/\.info$/);
    var installedAppIds = [];
    for (var _i = 0, infoFiles_1 = infoFiles; _i < infoFiles_1.length; _i++) {
        var infoFile = infoFiles_1[_i];
        installedAppIds.push((storage.readJSON(infoFile, true) || {}).id);
    }
    var toRemove = [];
    for (var appId in config.apps)
        if (!installedAppIds.includes(appId))
            toRemove.push(appId);
    for (var _a = 0, toRemove_1 = toRemove; _a < toRemove_1.length; _a++) {
        var appId = toRemove_1[_a];
        delete config.apps[appId];
    }
    storage.writeJSON(SETTINGS_FILE, config);
    return config;
}
var infoFileSorter = function (a, b) {
    var aJson = storage.readJSON(a, false);
    var bJson = storage.readJSON(b, false);
    var n = (0 | aJson.sortorder) - (0 | bJson.sortorder);
    if (n)
        return n;
    if (aJson.name < bJson.name)
        return -1;
    if (aJson.name > bJson.name)
        return 1;
    return 0;
};
module.exports = {
    cleanAndSave: cleanAndSave,
    infoFileSorter: infoFileSorter,
    getConfig: function () {
        var config = storage.readJSON(SETTINGS_FILE, true) || DEFAULT_CONFIG;
        if (config.hash == storage.hash(/\.info$/)) {
            return config;
        }
        E.showMessage('Rebuilding cache...');
        config.rootFolder = clearFolder(config.rootFolder);
        var infoFiles = storage.list(/\.info$/);
        infoFiles.sort(infoFileSorter);
        for (var _i = 0, infoFiles_2 = infoFiles; _i < infoFiles_2.length; _i++) {
            var infoFile = infoFiles_2[_i];
            var app_1 = storage.readJSON(infoFile, false) || {};
            if ((!config.showClocks && app_1.type == 'clock') ||
                (!config.showLaunchers && app_1.type == 'launch') ||
                (app_1.type == 'widget') ||
                (!app_1.src)) {
                if (Object.keys(config.hidden).includes(app_1.id))
                    delete config.apps[app_1.id];
                continue;
            }
            if (!config.apps.hasOwnProperty(app_1.id)) {
                config.apps[app_1.id] = {
                    folder: [],
                    nagged: false
                };
            }
            if (config.hidden.includes(app_1.id))
                continue;
            var curFolder = config.rootFolder;
            var depth = 0;
            for (var _a = 0, _b = config.apps[app_1.id].folder; _a < _b.length; _a++) {
                var folderName = _b[_a];
                if (curFolder.folders.hasOwnProperty(folderName)) {
                    curFolder = curFolder.folders[folderName];
                    depth++;
                }
                else {
                    config.apps[app_1.id].folder = config.apps[app_1.id].folder.slice(0, depth);
                    break;
                }
            }
            curFolder.apps.push(app_1.id);
        }
        config.hash = storage.hash(/\.info$/);
        return cleanAndSave(config);
    }
};
