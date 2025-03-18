type Folder = {
    folders: {                      // name: folder pairs of all nested folders
        [key: string]: Folder
    },
    apps: Array<string>             // List of ids of all apps in this folder
};

type FolderList = Array<string>;

type Config = {
    showClocks: boolean,            // Whether clocks are shown
    showLaunchers: boolean,         // Whether launchers are shown
    disableVibration: boolean,      // Whether vibration is disabled
    hidden: Array<string>,          // IDs of apps to explicitly hide
    display: {
        rows: number,               // Display an X by X grid of apps
        icon: boolean,              // Whether to show icons
        font: number                // Which font to use for the name, or false to not show the name
    },
    timeout: number,                // How many ms before returning to the clock, or zero to never return
    rootFolder: Folder,             // The top level folder, first displayed when opened
    apps: {                         // Saved info for each app
        [key: string]: {
            folder: FolderList,     // Folder path
            nagged: boolean         // Whether the app's fast launch setting was configured
        }
    },
    hash: number                    // Hash of .info files
};

type GridEntry = {                  // An entry in the grid displayed on-screen
    type: 'app' | 'folder' | 'empty',   // Which type of item is in this space
    id: string                      // The id of that item
}