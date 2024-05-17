const storage = require("Storage");

const SETTINGS_FILE: string = "folderlaunch.json";

const DEFAULT_CONFIG: Config = {
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
}

/**
 * Recursively remove all apps from a folder
 *
 * @param folder the folder to clean
 * @return the folder with all apps removed
 */
function clearFolder(folder: Folder): Folder {
    for (let childName in folder.folders)
        folder.folders[childName] = clearFolder(folder.folders[childName]!);
    folder.apps = [];
    return folder;
}

/**
 * Clean and save the configuration.
 *
 * Assume that:
 *  - All installed apps have an appInfo entry
 *  - References to nonexistent folders have been removed from appInfo
 * And therefore we do not need to do this ourselves.
 * Note: It is not a real problem if the assumptions are not true. If this was called by getConfig, the assumptions are already taken care of. If this was called somewhere else, they will be taken care of the next time getConfig is called.
 *
 * Perform the following cleanup:
 *  - Remove appInfo entries for nonexistent apps, to prevent irrelevant data invisible to the user from accumulating
 *
 * @param config the configuration to be cleaned
 * @return the cleaned configuration
 */
function cleanAndSave(config: Config): Config {
    // Get the list of installed apps
    let infoFiles: Array<string> = storage.list(/\.info$/);
    let installedAppIds: Array<string> = [];
    for (let infoFile of infoFiles)
        installedAppIds.push(((storage.readJSON(infoFile, true) || {}) as AppInfo).id);

    // Remove nonexistent apps from appInfo
    let toRemove: Array<string> = [];
    for (let appId in config.apps)
        if (!installedAppIds.includes(appId))
            toRemove.push(appId);
    for (let appId of toRemove)
        delete config.apps[appId];

    // Save and return
    storage.writeJSON(SETTINGS_FILE, config);
    return config;
}

/**
 * Comparator function to sort a list of app info files.
 * Copied and slightly modified (mainly to port to Typescript) from dtlaunch.
 *
 * @param a the first
 * @param b the second
 * @return negative if a should go first, positive if b should go first, zero if equivalent.
 */
let infoFileSorter = (a: string, b: string): number => {
    let aJson = storage.readJSON(a, false) as AppInfo;
    let bJson = storage.readJSON(b, false) as AppInfo;
    const n = (0 | aJson.sortorder!) - (0 | bJson.sortorder!);
    if (n) return n; // do sortorder first
    if (aJson.name < bJson.name) return -1;
    if (aJson.name > bJson.name) return 1;
    return 0;
}

export = {
    cleanAndSave: cleanAndSave,
    infoFileSorter: infoFileSorter,

    /**
     * Get the configuration for the launcher. Perform a cleanup if any new apps were installed or any apps refer to nonexistent folders.
     *
     * @param keepHidden if true, don't exclude apps that would otherwise be hidden
     * @return the loaded configuration
     */
    getConfig: (): Config => {
        let config = (storage.readJSON(SETTINGS_FILE, true) as Config | undefined) || DEFAULT_CONFIG;

        // We only need to load data from the filesystem if there is a change
        if (config.hash == storage.hash(/\.info$/)) {
            return config;
        }

        E.showMessage(/*LANG*/'Rebuilding cache...')
        config.rootFolder = clearFolder(config.rootFolder);
        let infoFiles: Array<string> = storage.list(/\.info$/);
        infoFiles.sort(infoFileSorter);

        for (let infoFile of infoFiles) {
            let app = storage.readJSON(infoFile, false) as AppInfo | undefined || ({} as AppInfo);

            // If the app is to be hidden by policy, exclude it completely
            if (
                (!config.showClocks && app.type == 'clock') ||
                (!config.showLaunchers && app.type == 'launch') ||
                (app.type == 'widget') ||
                (!app.src)
            ) {
                if (Object.keys(config.hidden).includes(app.id)) delete config.apps[app.id];
                continue;
            }

            // Creates the apps entry if it doesn't exist yet.
            if (!config.apps.hasOwnProperty(app.id)) {
                config.apps[app.id] = {
                    folder: [],
                    nagged: false
                };
            }

            // If the app is manually hidden, don't put it in a folder but still keep information about it
            if (config.hidden.includes(app.id)) continue;

            // Place apps in folders, deleting references to folders that no longer exist
            // Note: Relies on curFolder secretly being a reference rather than a copy
            let curFolder: Folder = config.rootFolder;
            let depth = 0;
            for (let folderName of config.apps[app.id]!.folder) {
                if (curFolder.folders.hasOwnProperty(folderName)) {
                    curFolder = curFolder.folders[folderName]!;
                    depth++;
                } else {
                    config.apps[app.id]!.folder = config.apps[app.id]!.folder.slice(0, depth);
                    break;
                }
            }
            curFolder.apps.push(app.id);
        }
        config.hash = storage.hash(/\.info$/);

        return cleanAndSave(config);
    }
}