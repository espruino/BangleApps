(function (back) {
    const loader = require('folderlaunch-configLoad.js');
    const storage = require('Storage');
    const textinput = require('textinput');

    let config: Config = loader.getConfig();
    let changed: boolean = false;

    let hiddenAppsMenu = () => {
        let menu: Menu = {
            '': {
                'title': 'Hide?',
                'back': showMainMenu
            }
        }

        let onchange = (value: boolean, appId: string) => {
            if (value && !config.hidden.includes(appId)) // Hiding, not already hidden
                config.hidden.push(appId);
            else if (!value && config.hidden.includes(appId)) // Unhiding, already hidden
                config.hidden = config.hidden.filter(item => item != appId)
            changed = true;
        }
        onchange    // Do nothing, but stop typescript from yelling at me for this function being unused. It gets used by eval. I know eval is evil, but the menus are a bit limited.

        for (let app in config.apps) {
            let appInfo = storage.readJSON(app + '.info', false) as AppInfo;
            menu[appInfo.name] = {
                value: config.hidden.includes(app),
                onchange: eval(`(value) => { onchange(value, "${app}"); }`)
            }
        }

        E.showMenu(menu);
    };

    let getAppInfo = (id: string): AppInfo => {
        return storage.readJSON(id + '.info', false) as AppInfo;
    }

    let showFolderMenu = (path: Array<string>) => {
        let folder: Folder = config.rootFolder;
        for (let folderName of path)
            try {
                folder = folder.folders[folderName]!;
            } catch {
                E.showAlert(/*LANG*/'BUG: Nonexistent folder ' + path);
            }

        let back = () => {
            if (path.length) {
                path.pop();
                showFolderMenu(path);
            } else showMainMenu();
        };

        let menu: Menu = {
            '': {
                'title': path.length ? path[path.length - 1]! : /*LANG*/ 'Root folder',
                'back': back
            },
            /*LANG*/'New subfolder': () => {
                textinput.input({ text: '' }).then((result: string) => {
                    if (result && !Object.keys(folder.folders).includes(result)) {
                        folder.folders[result] = {
                            folders: {},
                            apps: []
                        };
                        changed = true;
                        path.push(result);
                        showFolderMenu(path);
                    } else {
                        E.showAlert(/*LANG*/'No folder created').then(() => {
                            showFolderMenu(path);
                        })
                    }
                });
            },
            /*LANG*/'Move app here': () => {
                let menu: Menu = {
                    '': {
                        'title': /*LANG*/'Select app',
                        'back': () => {
                            showFolderMenu(path);
                        }
                    }
                };

                let mover = (appId: string) => {
                    // Delete app from old folder
                    let folder: Folder = config.rootFolder;
                    for (let folderName of config.apps[appId]!.folder)
                        folder = folder.folders[folderName]!;
                    folder.apps = folder.apps.filter((item: string) => item != appId);

                    // Change folder in app info, .slice is to force a copy rather than a reference
                    config.apps[appId]!.folder = path.slice();

                    // Place app in new folder (here)
                    folder = config.rootFolder;
                    for (let folderName of path)
                        folder = folder.folders[folderName]!;
                    folder.apps.push(appId);

                    // Mark changed and refresh menu
                    changed = true;
                    showFolderMenu(path);
                };
                mover;

                E.showMessage(/*LANG*/'Loading apps...');
                for (
                    let appId of Object.keys(config.apps)               // All known apps
                        .filter(item => !folder.apps.includes(item))    // Filter out ones already in this folder
                        .map(item => item + '.info')                    // Convert to .info files
                        .sort(loader.infoFileSorter)                    // Sort the info files using infoFileSorter
                        .map(item => item.split('.info')[0])            // Back to app ids
                ) {
                    menu[getAppInfo(appId).name] = eval(`() => { mover("${appId}"); }`);
                }

                E.showMenu(menu);
            }
        };

        let switchToFolder = (subfolder: string) => {
            path.push(subfolder);
            showFolderMenu(path);
        };
        switchToFolder;

        for (let subfolder of Object.keys(folder.folders)) {
            menu[subfolder] = eval(`() => { switchToFolder("${subfolder}") }`);
        }

        if (folder.apps.length) menu[/*LANG*/'View apps'] = () => {
            let menu: Menu = {
                '': {
                    'title': path[path.length - 1]!,
                    'back': () => { showFolderMenu(path); }
                }
            }
            for (let appId of folder.apps) {
                menu[(storage.readJSON(appId + '.info', false) as AppInfo).name] = () => { };
            }
            E.showMenu(menu);
        }

        if (path.length) menu[/*LANG*/'Delete folder'] = () => {
            // Cache apps for changing the folder reference
            let apps: Array<string> = folder.apps;
            let subfolders = folder.folders;

            // Move up to the parent folder
            let toDelete: string = path.pop()!;
            folder = config.rootFolder;
            for (let folderName of path)
                folder = folder.folders[folderName]!;

            // Move all apps and folders to the parent folder, then delete this one
            for (let appId of apps) {
                config.apps[appId]!.folder.pop();
                folder.apps.push(appId);
            }
            for (let subfolder of Object.keys(subfolders))
                folder.folders[subfolder] = subfolders[subfolder]!;
            delete folder.folders[toDelete];

            // Mark as modified and go back
            changed = true;
            showFolderMenu(path);
        }

        E.showMenu(menu);
    };

    let save = () => {
        if (changed) {
            E.showMessage(/*LANG*/'Saving...');
            config.hash = 0;    // Invalidate the cache so changes to hidden apps or folders actually get reflected
            loader.cleanAndSave(config);
            changed = false; // So we don't do it again on exit
        }
    };

    E.on('kill', save);

    let showMainMenu = () => {
        E.showMenu({
            '': {
                'title': 'Folder launcher',
                'back': () => {
                    save();
                    back();
                }
            },
            'Show clocks': {
                value: !!config.showClocks,
                onchange: (value: boolean) => {
                    config.showClocks = value;
                    changed = true;
                }
            },
            'Show launchers': {
                value: !!config.showLaunchers,
                onchange: (value: boolean) => {
                    config.showLaunchers = value;
                    changed = true;
                }
            },
            'Disable vibration': {
                value: !!config.disableVibration,
                onchange: (value: boolean) => {
                    config.disableVibration = value;
                    changed = true;
                }
            },
            'Hidden apps': hiddenAppsMenu,
            'Display': () => {
                E.showMenu({
                    '': {
                        'title': 'Display',
                        'back': showMainMenu
                    },
                    'Rows': {
                        value: config.display.rows,
                        min: 1,
                        onchange: value => {
                            config.display.rows = value;
                            changed = true;
                        }
                    },
                    'Show icons?': {
                        value: config.display.icon,
                        onchange: value => {
                            config.display.icon = value;
                            changed = true;
                        }
                    },
                    'Font size': {
                        value: config.display.font as any,
                        min: 0,
                        format: (value: any) => (value ? value : 'Icon only'),
                        onchange: (value: any) => {
                            config.display.font = value;
                            changed = true;
                        }
                    }
                });
            },
            'Timeout': {
                value: config.timeout,
                format: value => value ? `${value / 1000} sec` : 'None',
                min: 0,
                step: 1000,
                onchange: value => {
                    config.timeout = value;
                    changed = true;
                }
            },
            'Folder management': () => {
                showFolderMenu([]);
            }
        });
    };
    showMainMenu();
} satisfies SettingsFunc);