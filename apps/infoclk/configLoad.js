const storage = require("Storage");

const SETTINGS_FILE = "infoclk.json";

let defaultConfig = {
    dualStageUnlock: 0,

    seconds: {
        // Displaying the seconds can reduce battery life because the CPU must wake up more often to update the display.
        // The seconds will be shown unless one of these conditions is enabled here, and currently true.
        hideLocked: false,  // Hide the seconds when the display is locked.
        hideBattery: 20,    // Hide the seconds when the battery is at or below a defined percentage.
        hideTime: true,     // Hide the seconds when between a certain period of time. Useful for when you are sleeping and don't need the seconds
        hideStart: 2200,    //    The time when the seconds are hidden: first 2 digits are hours on a 24 hour clock, last 2 are minutes
        hideEnd: 700,       //    The time when the seconds are shown again
        hideAlways: false,  // Always hide (never show) the seconds
        forceWhenUnlocked: 1, // Force the seconds to be displayed when the watch is unlocked, no matter the other settings. 0 = never, 1 = first or second stage unlock, 2 = second stage unlock only
    },

    date: {
        // Settings related to the display of the date
        mmdd: true,           // If true, display the month first. If false, display the date first.
        separator: '-',       // The character that goes between the month and date
        monthName: false,     // If false, display the month as a number. If true, display the name.
        monthFullName: false, //    If displaying the name: If false, display an abbreviation. If true, display a full name.
        dayFullName: false,   // If false, display the day of the week's abbreviation. If true, display the full name.
    },

    bottomLocked: {
        display: 'weather'    // What to display in the bottom row when locked:
        //    'weather': The current temperature and weather description
        //    'steps': Step count
        //    'health': Step count and bpm
        //    'progress': Day progress bar
        //    false: Nothing
    },

    shortcuts: [
        //8 shortcuts, displayed in the bottom half of the screen (2 rows of 4 shortcuts) when unlocked
        //    false = no shortcut
        //    '#LAUNCHER' = open the launcher
        //    any other string = name of app to open
        'stlap', 'keytimer', 'pomoplus', 'alarm',
        'rpnsci', 'calendar', 'torch', 'weather'
    ],

    swipe: {
        // 4 shortcuts to launch upon swiping:
        //    false = no shortcut
        //    '#LAUNCHER' = open the launcher
        //    any other string = name of app to open
        up: 'messageui',       // Swipe up or swipe down, due to limitation of event handler
        down: 'messageui',
        left: '#LAUNCHER',
        right: '#LAUNCHER',
    },

    fastLoad: {
        shortcuts: [
            false, false, false, false,
            false, false, false, false
        ],
        swipe: {
            up: false,
            down: false,
            left: false,
            right: false
        }
    },

    bar: {
        enabledLocked: true,    // Whether this bar is enabled when the watch is locked
        enabledUnlocked: false, // Whether the bar is enabled when the watch is unlocked
        type: 'split',          // off = no bar, dayProgress = day progress bar, calendar = calendar bar, split = both

        dayProgress: {          // A progress bar representing how far through the day you are
            color: [0, 0, 1],   // The color of the bar
            start: 700,         // The time of day that the bar starts filling
            end: 2200,          // The time of day that the bar becomes full
            reset: 300          // The time of day when the progress bar resets from full to empty
        },

        calendar: {
            duration: 10800,
            pipeColor: [1, 1, 1],
            defaultColor: [0, 0, 1]
        },
    },

    lowBattColor: {
        // The text can change color to indicate that the battery is low
        level: 20,        // The percentage where this happens
        color: [1, 0, 0]  // The color that the text changes to
    }
}

let storedConfig = storage.readJSON(SETTINGS_FILE, true) || {};

// Ugly slow workaround because object.constructor doesn't exist on Bangle
function isDictionary(object) {
    return JSON.stringify(object)[0] == '{';
}

/** Merge two objects recursively. (Object.assign() cannot be used here because it is NOT recursive.)
 * Any key that is in one object but not the other will be included as is.
 * Any key that is in both objects, but whose value is not a dictionary in both objects, will have the version in overlay included.
 * Any key that whose value is a dictionary in both properties will have its result be set to a recursive call to merge.
 */
function merge(overlay, base) {
    let result = base;

    for (const objectKey in overlay) {
        if (!Object.keys(base).includes(objectKey)) result[objectKey] = overlay[objectKey];     // If the key isn't there, add it
        else if (isDictionary(base[objectKey]) && isDictionary(overlay[objectKey]))             // If the key is a dictionary in both, do recursive call
            result[objectKey] = merge(overlay[objectKey], base[objectKey]);
        else result[objectKey] = overlay[objectKey];                                            // Otherwise, override
    }

    return result;
}

exports.getConfig = () => {
    return merge(storedConfig, defaultConfig);
};