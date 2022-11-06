(function (back) {
    const SETTINGS_FILE = "infoclk.json";
    const storage = require('Storage');

    let config = Object.assign({
        seconds: {
            // Displaying the seconds can reduce battery life because the CPU must wake up more often to update the display.
            // The seconds will be shown unless one of these conditions is enabled here, and currently true.
            hideLocked: false,  // Hide the seconds when the display is locked.
            hideBattery: 20,    // Hide the seconds when the battery is at or below a defined percentage.
            hideTime: true,     // Hide the seconds when between a certain period of time. Useful for when you are sleeping and don't need the seconds
            hideStart: 2200,    //    The time when the seconds are hidden: first 2 digits are hours on a 24 hour clock, last 2 are minutes
            hideEnd: 700,       //    The time when the seconds are shown again
            hideAlways: false,  // Always hide (never show) the seconds
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
            // 3 shortcuts to launch upon swiping:
            //    false = no shortcut
            //    '#LAUNCHER' = open the launcher
            //    any other string = name of app to open
            up: 'messages',       // Swipe up or swipe down, due to limitation of event handler
            left: '#LAUNCHER',
            right: '#LAUNCHER',
        },

        dayProgress: {
            // A progress bar representing how far through the day you are
            enabledLocked: true,    // Whether this bar is enabled when the watch is locked
            enabledUnlocked: false, // Whether the bar is enabled when the watch is unlocked
            color: [0, 0, 1],      // The color of the bar
            start: 700,            // The time of day that the bar starts filling
            end: 2200,              // The time of day that the bar becomes full
            reset: 300             // The time of day when the progress bar resets from full to empty
        },

        lowBattColor: {
            // The text can change color to indicate that the battery is low
            level: 20,        // The percentage where this happens
            color: [1, 0, 0]  // The color that the text changes to
        }
    }, storage.readJSON(SETTINGS_FILE));

    function saveSettings() {
        storage.writeJSON(SETTINGS_FILE, config);
    }

    function hourToString(hour) {
        if (storage.readJSON('setting.json')['12hour']) {
            if (hour == 0) return '12 AM';
            else if (hour < 12) return `${hour} AM`;
            else if (hour == 12) return '12 PM';
            else return `${hour - 12} PM`;
        } else return '' + hour;
    }

    // The menu for configuring when the seconds are shown
    function showSecondsMenu() {
        E.showMenu({
            '': {
                'title': 'Seconds display',
                'back': showMainMenu
            },
            'Show seconds': {
                value: !config.seconds.hideAlways,
                onchange: value => {
                    config.seconds.hideAlways = !value;
                    saveSettings();
                }
            },
            '...unless locked': {
                value: config.seconds.hideLocked,
                onchange: value => {
                    config.seconds.hideLocked = value;
                    saveSettings();
                }
            },
            '...unless battery below': {
                value: config.seconds.hideBattery,
                min: 0,
                max: 100,
                format: value => `${value}%`,
                onchange: value => {
                    config.seconds.hideBattery = value;
                    saveSettings();
                }
            },
            '...unless between these 2 times...': () => {
                E.showMenu({
                    '': {
                        'title': 'Hide seconds between',
                        'back': showSecondsMenu
                    },
                    'Enabled': {
                        value: config.seconds.hideTime,
                        onchange: value => {
                            config.seconds.hideTime = value;
                            saveSettings();
                        }
                    },
                    'Start hour': {
                        value: Math.floor(config.seconds.hideStart / 100),
                        format: hourToString,
                        min: 0,
                        max: 23,
                        wrap: true,
                        onchange: hour => {
                            minute = config.seconds.hideStart % 100;
                            config.seconds.hideStart = (100 * hour) + minute;
                            saveSettings();
                        }
                    },
                    'Start minute': {
                        value: config.seconds.hideStart % 100,
                        min: 0,
                        max: 59,
                        wrap: true,
                        onchange: minute => {
                            hour = Math.floor(config.seconds.hideStart / 100);
                            config.seconds.hideStart = (100 * hour) + minute;
                            saveSettings();
                        }
                    },
                    'End hour': {
                        value: Math.floor(config.seconds.hideEnd / 100),
                        format: hourToString,
                        min: 0,
                        max: 23,
                        wrap: true,
                        onchange: hour => {
                            minute = config.seconds.hideEnd % 100;
                            config.seconds.hideEnd = (100 * hour) + minute;
                            saveSettings();
                        }
                    },
                    'End minute': {
                        value: config.seconds.hideEnd % 100,
                        min: 0,
                        max: 59,
                        wrap: true,
                        onchange: minute => {
                            hour = Math.floor(config.seconds.hideEnd / 100);
                            config.seconds.hideEnd = (100 * hour) + minute;
                            saveSettings();
                        }
                    }
                });
            }
        });
    }

    // Available month/date separators
    const SEPARATORS = [
        { name: 'Slash', char: '/' },
        { name: 'Dash', char: '-' },
        { name: 'Space', char: ' ' },
        { name: 'Comma', char: ',' },
        { name: 'None', char: '' }
    ];

    // Available bottom row display options
    const BOTTOM_ROW_OPTIONS = [
        { name: 'Weather', val: 'weather' },
        { name: 'Step count', val: 'steps' },
        { name: 'Steps + BPM', val: 'health' },
        { name: 'Day progresss bar', val: 'progress' },
        { name: 'Nothing', val: false }
    ];

    // The menu for configuring which apps have shortcut icons
    function showShortcutMenu() {
        //Builds the shortcut options
        let shortcutOptions = [
            { name: 'Nothing', val: false },
            { name: 'Launcher', val: '#LAUNCHER' },
        ];

        let infoFiles = storage.list(/\.info$/).sort((a, b) => {
            if (a.name < b.name) return -1;
            else if (a.name > b.name) return 1;
            else return 0;
        });
        for (let infoFile of infoFiles) {
            let appInfo = storage.readJSON(infoFile);
            if (appInfo.src) shortcutOptions.push({
                name: appInfo.name,
                val: appInfo.id
            });
        }

        E.showMenu({
            '': {
                'title': 'Shortcuts',
                'back': showMainMenu
            },
            'Top first': {
                value: shortcutOptions.map(item => item.val).indexOf(config.shortcuts[0]),
                format: value => shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[0] = shortcutOptions[value].val;
                    saveSettings();
                }
            },
            'Top second': {
                value: shortcutOptions.map(item => item.val).indexOf(config.shortcuts[1]),
                format: value => shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[1] = shortcutOptions[value].val;
                    saveSettings();
                }
            },
            'Top third': {
                value: shortcutOptions.map(item => item.val).indexOf(config.shortcuts[2]),
                format: value => shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[2] = shortcutOptions[value].val;
                    saveSettings();
                }
            },
            'Top fourth': {
                value: shortcutOptions.map(item => item.val).indexOf(config.shortcuts[3]),
                format: value => shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[3] = shortcutOptions[value].val;
                    saveSettings();
                }
            },
            'Bottom first': {
                value: shortcutOptions.map(item => item.val).indexOf(config.shortcuts[4]),
                format: value => shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[4] = shortcutOptions[value].val;
                    saveSettings();
                }
            },
            'Bottom second': {
                value: shortcutOptions.map(item => item.val).indexOf(config.shortcuts[5]),
                format: value => shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[5] = shortcutOptions[value].val;
                    saveSettings();
                }
            },
            'Bottom third': {
                value: shortcutOptions.map(item => item.val).indexOf(config.shortcuts[6]),
                format: value => shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[6] = shortcutOptions[value].val;
                    saveSettings();
                }
            },
            'Bottom fourth': {
                value: shortcutOptions.map(item => item.val).indexOf(config.shortcuts[7]),
                format: value => shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[7] = shortcutOptions[value].val;
                    saveSettings();
                }
            },
            'Swipe up': {
                value: shortcutOptions.map(item => item.val).indexOf(config.swipe.up),
                format: value => shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.swipe.up = shortcutOptions[value].val;
                    saveSettings();
                }
            },
            'Swipe left': {
                value: shortcutOptions.map(item => item.val).indexOf(config.swipe.left),
                format: value => shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.swipe.left = shortcutOptions[value].val;
                    saveSettings();
                }
            },
            'Swipe right': {
                value: shortcutOptions.map(item => item.val).indexOf(config.swipe.right),
                format: value => shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.swipe.right = shortcutOptions[value].val;
                    saveSettings();
                }
            },
        });
    }

    const COLOR_OPTIONS = [
        { name: 'Black', val: [0, 0, 0] },
        { name: 'Blue', val: [0, 0, 1] },
        { name: 'Green', val: [0, 1, 0] },
        { name: 'Cyan', val: [0, 1, 1] },
        { name: 'Red', val: [1, 0, 0] },
        { name: 'Magenta', val: [1, 0, 1] },
        { name: 'Yellow', val: [1, 1, 0] },
        { name: 'White', val: [1, 1, 1] }
    ];

    // Workaround for being unable to use == on arrays: convert them into strings
    function colorString(color) {
        return `${color[0]} ${color[1]} ${color[2]}`;
    }

    //Shows the top level menu
    function showMainMenu() {
        E.showMenu({
            '': {
                'title': 'Informational Clock',
                'back': back
            },
            'Seconds display': showSecondsMenu,
            'Day of week format': {
                value: config.date.dayFullName,
                format: value => value ? 'Full name' : 'Abbreviation',
                onchange: value => {
                    config.date.dayFullName = value;
                    saveSettings();
                }
            },
            'Date format': () => {
                E.showMenu({
                    '': {
                        'title': 'Date format',
                        'back': showMainMenu,
                    },
                    'Order': {
                        value: config.date.mmdd,
                        format: value => value ? 'Month first' : 'Date first',
                        onchange: value => {
                            config.date.mmdd = value;
                            saveSettings();
                        }
                    },
                    'Separator': {
                        value: SEPARATORS.map(item => item.char).indexOf(config.date.separator),
                        format: value => SEPARATORS[value].name,
                        min: 0,
                        max: SEPARATORS.length - 1,
                        wrap: true,
                        onchange: value => {
                            config.date.separator = SEPARATORS[value].char;
                            saveSettings();
                        }
                    },
                    'Month format': {
                        // 0 = number only
                        // 1 = abbreviation
                        // 2 = full name
                        value: config.date.monthName ? (config.date.monthFullName ? 2 : 1) : 0,
                        format: value => ['Number', 'Abbreviation', 'Full name'][value],
                        min: 0,
                        max: 2,
                        wrap: true,
                        onchange: value => {
                            if (value == 0) config.date.monthName = false;
                            else {
                                config.date.monthName = true;
                                config.date.monthFullName = (value == 2);
                            }
                            saveSettings();
                        }
                    }
                });
            },
            'Bottom row': {
                value: BOTTOM_ROW_OPTIONS.map(item => item.val).indexOf(config.bottomLocked.display),
                format: value => BOTTOM_ROW_OPTIONS[value].name,
                min: 0,
                max: BOTTOM_ROW_OPTIONS.length - 1,
                wrap: true,
                onchange: value => {
                    config.bottomLocked.display = BOTTOM_ROW_OPTIONS[value].val;
                    saveSettings();
                }
            },
            'Shortcuts': showShortcutMenu,
            'Day progress': () => {
                E.showMenu({
                    '': {
                        'title': 'Day progress',
                        'back': showMainMenu
                    },
                    'Enable while locked': {
                        value: config.dayProgress.enabledLocked,
                        onchange: value => {
                            config.dayProgress.enableLocked = value;
                            saveSettings();
                        }
                    },
                    'Enable while unlocked': {
                        value: config.dayProgress.enabledUnlocked,
                        onchange: value => {
                            config.dayProgress.enabledUnlocked = value;
                            saveSettings();
                        }
                    },
                    'Color': {
                        value: COLOR_OPTIONS.map(item => colorString(item.val)).indexOf(colorString(config.dayProgress.color)),
                        format: value => COLOR_OPTIONS[value].name,
                        min: 0,
                        max: COLOR_OPTIONS.length - 1,
                        wrap: false,
                        onchange: value => {
                            config.dayProgress.color = COLOR_OPTIONS[value].val;
                            saveSettings();
                        }
                    },
                    'Start hour': {
                        value: Math.floor(config.dayProgress.start / 100),
                        format: hourToString,
                        min: 0,
                        max: 23,
                        wrap: true,
                        onchange: hour => {
                            minute = config.dayProgress.start % 100;
                            config.dayProgress.start = (100 * hour) + minute;
                            saveSettings();
                        }
                    },
                    'Start minute': {
                        value: config.dayProgress.start % 100,
                        min: 0,
                        max: 59,
                        wrap: true,
                        onchange: minute => {
                            hour = Math.floor(config.dayProgress.start / 100);
                            config.dayProgress.start = (100 * hour) + minute;
                            saveSettings();
                        }
                    },
                    'End hour': {
                        value: Math.floor(config.dayProgress.end / 100),
                        format: hourToString,
                        min: 0,
                        max: 23,
                        wrap: true,
                        onchange: hour => {
                            minute = config.dayProgress.end % 100;
                            config.dayProgress.end = (100 * hour) + minute;
                            saveSettings();
                        }
                    },
                    'End minute': {
                        value: config.dayProgress.end % 100,
                        min: 0,
                        max: 59,
                        wrap: true,
                        onchange: minute => {
                            hour = Math.floor(config.dayProgress.end / 100);
                            config.dayProgress.end = (100 * hour) + minute;
                            saveSettings();
                        }
                    },
                    'Reset hour': {
                        value: Math.floor(config.dayProgress.reset / 100),
                        format: hourToString,
                        min: 0,
                        max: 23,
                        wrap: true,
                        onchange: hour => {
                            minute = config.dayProgress.reset % 100;
                            config.dayProgress.reset = (100 * hour) + minute;
                            saveSettings();
                        }
                    },
                    'Reset minute': {
                        value: config.dayProgress.reset % 100,
                        min: 0,
                        max: 59,
                        wrap: true,
                        onchange: minute => {
                            hour = Math.floor(config.dayProgress.reset / 100);
                            config.dayProgress.reset = (100 * hour) + minute;
                            saveSettings();
                        }
                    }
                });
            },
            'Low battery color': () => {
                E.showMenu({
                    '': {
                        'title': 'Low battery color',
                        back: showMainMenu
                    },
                    'Low battery threshold': {
                        value: config.lowBattColor.level,
                        min: 0,
                        max: 100,
                        format: value => `${value}%`,
                        onchange: value => {
                            config.lowBattColor.level = value;
                            saveSettings();
                        }
                    },
                    'Color': {
                        value: COLOR_OPTIONS.map(item => colorString(item.val)).indexOf(colorString(config.lowBattColor.color)),
                        format: value => COLOR_OPTIONS[value].name,
                        min: 0,
                        max: COLOR_OPTIONS.length - 1,
                        wrap: false,
                        onchange: value => {
                            config.lowBattColor.color = COLOR_OPTIONS[value].val;
                            saveSettings();
                        }
                    }
                });
            },
        });
    }

    showMainMenu();
});