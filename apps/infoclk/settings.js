(function (back) {
    const SETTINGS_FILE = "infoclk.json";
    const storage = require('Storage');

    let config = require('infoclk-config.js').getConfig();

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

  let minute; // Is used in onchange functions. Defined here to appease the linter.
  let hour; // Is used in onchange functions. Defined here to appease the linter.

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
            },
            '...unconditionally when unlocked': {
                value: config.seconds.forceWhenUnlocked,
                format: value => ['No', 'First or second stage', 'Second stage only'][value],
                onchange: value => {
                    config.seconds.forceWhenUnlocked = value;
                    saveSettings();
                },
                min: 0,
                max: 2,
                step: 1,
                wrap: false
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
        { name: 'Bar', val: 'progress' },
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
                format: value => (value == -1) ? 'Unknown app!' : shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[0] = shortcutOptions[value].val;
                    config.fastLoad.shortcuts[0] = false;
                    saveSettings();
                }
            },
            'Top second': {
                value: shortcutOptions.map(item => item.val).indexOf(config.shortcuts[1]),
                format: value => (value == -1) ? 'Unknown app!' : shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[1] = shortcutOptions[value].val;
                    config.fastLoad.shortcuts[1] = false;
                    saveSettings();
                }
            },
            'Top third': {
                value: shortcutOptions.map(item => item.val).indexOf(config.shortcuts[2]),
                format: value => (value == -1) ? 'Unknown app!' : shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[2] = shortcutOptions[value].val;
                    config.fastLoad.shortcuts[2] = false;
                    saveSettings();
                }
            },
            'Top fourth': {
                value: shortcutOptions.map(item => item.val).indexOf(config.shortcuts[3]),
                format: value => (value == -1) ? 'Unknown app!' : shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[3] = shortcutOptions[value].val;
                    config.fastLoad.shortcuts[3] = false;
                    saveSettings();
                }
            },
            'Bottom first': {
                value: shortcutOptions.map(item => item.val).indexOf(config.shortcuts[4]),
                format: value => (value == -1) ? 'Unknown app!' : shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[4] = shortcutOptions[value].val;
                    config.fastLoad.shortcuts[4] = false;
                    saveSettings();
                }
            },
            'Bottom second': {
                value: shortcutOptions.map(item => item.val).indexOf(config.shortcuts[5]),
                format: value => (value == -1) ? 'Unknown app!' : shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[5] = shortcutOptions[value].val;
                    config.fastLoad.shortcuts[5] = false;
                    saveSettings();
                }
            },
            'Bottom third': {
                value: shortcutOptions.map(item => item.val).indexOf(config.shortcuts[6]),
                format: value => (value == -1) ? 'Unknown app!' : shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[6] = shortcutOptions[value].val;
                    config.fastLoad.shortcuts[6] = false;
                    saveSettings();
                }
            },
            'Bottom fourth': {
                value: shortcutOptions.map(item => item.val).indexOf(config.shortcuts[7]),
                format: value => (value == -1) ? 'Unknown app!' : shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.shortcuts[7] = shortcutOptions[value].val;
                    config.fastLoad.shortcuts[7] = false;
                    saveSettings();
                }
            },
            'Swipe up': {
                value: shortcutOptions.map(item => item.val).indexOf(config.swipe.up),
                format: value => (value == -1) ? 'Unknown app!' : shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.swipe.up = shortcutOptions[value].val;
                    config.fastLoad.swipe.up = false;
                    saveSettings();
                }
            },
            'Swipe down': {
                value: shortcutOptions.map(item => item.val).indexOf(config.swipe.down),
                format: value => (value == -1) ? 'Unknown app!' : shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.swipe.down = shortcutOptions[value].val;
                    config.fastLoad.swipe.down = false;
                    saveSettings();
                }
            },
            'Swipe left': {
                value: shortcutOptions.map(item => item.val).indexOf(config.swipe.left),
                format: value => (value == -1) ? 'Unknown app!' : shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.swipe.left = shortcutOptions[value].val;
                    config.fastLoad.swipe.left = false;
                    saveSettings();
                }
            },
            'Swipe right': {
                value: shortcutOptions.map(item => item.val).indexOf(config.swipe.right),
                format: value => (value == -1) ? 'Unknown app!' : shortcutOptions[value].name,
                min: 0,
                max: shortcutOptions.length - 1,
                wrap: false,
                onchange: value => {
                    config.swipe.right = shortcutOptions[value].val;
                    config.fastLoad.swipe.right = false;
                    saveSettings();
                }
            }
        });
    }

    // The menu for configuring which apps can be fast loaded
    function showFastLoadMenu() {
        E.showMenu();
        E.showAlert(/*LANG*/"WARNING! Only enable fast loading for apps that use widgets.").then(() => {
            E.showMenu({
                '': {
                    'title': 'Shortcuts',
                    'back': showMainMenu
                },
                'Top first': {
                    value: config.fastLoad.shortcuts[0],
                    format: value => value ? 'Fast' : 'Slow',
                    onchange: value => {
                        config.fastLoad.shortcuts[0] = value;
                        saveSettings();
                    }
                },
                'Top second': {
                    value: config.fastLoad.shortcuts[1],
                    format: value => value ? 'Fast' : 'Slow',
                    onchange: value => {
                        config.fastLoad.shortcuts[1] = value;
                        saveSettings();
                    }
                },
                'Top third': {
                    value: config.fastLoad.shortcuts[2],
                    format: value => value ? 'Fast' : 'Slow',
                    onchange: value => {
                        config.fastLoad.shortcuts[2] = value;
                        saveSettings();
                    }
                },
                'Top fourth': {
                    value: config.fastLoad.shortcuts[3],
                    format: value => value ? 'Fast' : 'Slow',
                    onchange: value => {
                        config.fastLoad.shortcuts[3] = value;
                        saveSettings();
                    }
                },
                'Bottom first': {
                    value: config.fastLoad.shortcuts[4],
                    format: value => value ? 'Fast' : 'Slow',
                    onchange: value => {
                        config.fastLoad.shortcuts[4] = value;
                        saveSettings();
                    }
                },
                'Bottom second': {
                    value: config.fastLoad.shortcuts[5],
                    format: value => value ? 'Fast' : 'Slow',
                    onchange: value => {
                        config.fastLoad.shortcuts[5] = value;
                        saveSettings();
                    }
                },
                'Bottom third': {
                    value: config.fastLoad.shortcuts[6],
                    format: value => value ? 'Fast' : 'Slow',
                    onchange: value => {
                        config.fastLoad.shortcuts[6] = value;
                        saveSettings();
                    }
                },
                'Bottom fourth': {
                    value: config.fastLoad.shortcuts[7],
                    format: value => value ? 'Fast' : 'Slow',
                    onchange: value => {
                        config.fastLoad.shortcuts[7] = value;
                        saveSettings();
                    }
                },
                'Swipe up': {
                    value: config.fastLoad.swipe.up,
                    format: value => value ? 'Fast' : 'Slow',
                    onchange: value => {
                        config.fastLoad.swipe.up = value;
                        saveSettings();
                    }
                },
                'Swipe down': {
                    value: config.fastLoad.swipe.down,
                    format: value => value ? 'Fast' : 'Slow',
                    onchange: value => {
                        config.fastLoad.swipe.down = value;
                        saveSettings();
                    }
                },
                'Swipe left': {
                    value: config.fastLoad.swipe.left,
                    format: value => value ? 'Fast' : 'Slow',
                    onchange: value => {
                        config.fastLoad.swipe.left = value;
                        saveSettings();
                    }
                },
                'Swipe right': {
                    value: config.fastLoad.swipe.right,
                    format: value => value ? 'Fast' : 'Slow',
                    onchange: value => {
                        config.fastLoad.swipe.right = value;
                        saveSettings();
                    }
                }
            });
        })
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

    const BAR_MODE_OPTIONS = [
        { name: 'None', val: 'off' },
        { name: 'Day progress only', val: 'dayProgress' },
        { name: 'Calendar only', val: 'calendar' },
        { name: 'Split', val: 'split' }
    ];

    // Workaround for being unable to use == on arrays: convert them into strings
    function colorString(color) {
        return `${color[0]} ${color[1]} ${color[2]}`;
    }

    //Menu to configure the bar
    function showBarMenu() {
        E.showMenu({
            '': {
                'title': 'Bar',
                'back': showMainMenu
            },
            'Enable while locked': {
                value: config.bar.enabledLocked,
                onchange: value => {
                    config.bar.enableLocked = value;
                    saveSettings();
                }
            },
            'Enable while unlocked': {
                value: config.bar.enabledUnlocked,
                onchange: value => {
                    config.bar.enabledUnlocked = value;
                    saveSettings();
                }
            },
            'Mode': {
                value: BAR_MODE_OPTIONS.map(item => item.val).indexOf(config.bar.type),
                format: value => BAR_MODE_OPTIONS[value].name,
                onchange: value => {
                    config.bar.type = BAR_MODE_OPTIONS[value].val;
                    saveSettings();
                },
                min: 0,
                max: BAR_MODE_OPTIONS.length - 1,
                wrap: true
            },
            'Day progress': () => {
                E.showMenu({
                    '': {
                        'title': 'Day progress',
                        'back': showBarMenu
                    },
                    'Color': {
                        value: COLOR_OPTIONS.map(item => colorString(item.val)).indexOf(colorString(config.bar.dayProgress.color)),
                        format: value => COLOR_OPTIONS[value].name,
                        min: 0,
                        max: COLOR_OPTIONS.length - 1,
                        wrap: false,
                        onchange: value => {
                            config.bar.dayProgress.color = COLOR_OPTIONS[value].val;
                            saveSettings();
                        }
                    },
                    'Start hour': {
                        value: Math.floor(config.bar.dayProgress.start / 100),
                        format: hourToString,
                        min: 0,
                        max: 23,
                        wrap: true,
                        onchange: hour => {
                            minute = config.bar.dayProgress.start % 100;
                            config.bar.dayProgress.start = (100 * hour) + minute;
                            saveSettings();
                        }
                    },
                    'Start minute': {
                        value: config.bar.dayProgress.start % 100,
                        min: 0,
                        max: 59,
                        wrap: true,
                        onchange: minute => {
                            hour = Math.floor(config.bar.dayProgress.start / 100);
                            config.bar.dayProgress.start = (100 * hour) + minute;
                            saveSettings();
                        }
                    },
                    'End hour': {
                        value: Math.floor(config.bar.dayProgress.end / 100),
                        format: hourToString,
                        min: 0,
                        max: 23,
                        wrap: true,
                        onchange: hour => {
                            minute = config.bar.dayProgress.end % 100;
                            config.bar.dayProgress.end = (100 * hour) + minute;
                            saveSettings();
                        }
                    },
                    'End minute': {
                        value: config.bar.dayProgress.end % 100,
                        min: 0,
                        max: 59,
                        wrap: true,
                        onchange: minute => {
                            hour = Math.floor(config.bar.dayProgress.end / 100);
                            config.bar.dayProgress.end = (100 * hour) + minute;
                            saveSettings();
                        }
                    },
                    'Reset hour': {
                        value: Math.floor(config.bar.dayProgress.reset / 100),
                        format: hourToString,
                        min: 0,
                        max: 23,
                        wrap: true,
                        onchange: hour => {
                            minute = config.bar.dayProgress.reset % 100;
                            config.bar.dayProgress.reset = (100 * hour) + minute;
                            saveSettings();
                        }
                    },
                    'Reset minute': {
                        value: config.bar.dayProgress.reset % 100,
                        min: 0,
                        max: 59,
                        wrap: true,
                        onchange: minute => {
                            hour = Math.floor(config.bar.dayProgress.reset / 100);
                            config.bar.dayProgress.reset = (100 * hour) + minute;
                            saveSettings();
                        }
                    }
                });
            },
            'Calendar bar': () => {
                E.showMenu({
                    '': {
                        'title': 'Calendar bar',
                        'back': showBarMenu
                    },
                    'Look ahead duration': {
                        value: config.bar.calendar.duration,
                        format: value => {
                            let hours = value / 3600;
                            let minutes = (value % 3600) / 60;
                            let seconds = value % 60;

                            let result = (hours == 0) ? '' : `${hours} hr`;
                            if (minutes != 0) {
                                if (result == '') result = `${minutes} min`;
                                else result += `, ${minutes} min`;
                            }
                            if (seconds != 0) {
                                if (result == '') result = `${seconds} sec`;
                                else result += `, ${seconds} sec`;
                            }
                            return result;
                        },
                        onchange: value => {
                            config.bar.calendar.duration = value;
                            saveSettings();
                        },
                        min: 900,
                        max: 86400,
                        step: 900
                    },
                    'Pipe color': {
                        value: COLOR_OPTIONS.map(color => colorString(color.val)).indexOf(colorString(config.bar.calendar.pipeColor)),
                        format: value => COLOR_OPTIONS[value].name,
                        onchange: value => {
                            config.bar.calendar.pipeColor = COLOR_OPTIONS[value].val;
                            saveSettings();
                        },
                        min: 0,
                        max: COLOR_OPTIONS.length - 1,
                        wrap: true
                    },
                    'Default color': {
                        value: COLOR_OPTIONS.map(color => colorString(color.val)).indexOf(colorString(config.bar.calendar.defaultColor)),
                        format: value => COLOR_OPTIONS[value].name,
                        onchange: value => {
                            config.bar.calendar.defaultColor = COLOR_OPTIONS[value].val;
                            saveSettings();
                        },
                        min: 0,
                        max: COLOR_OPTIONS.length - 1,
                        wrap: true
                    }
                });
            }
        });
    }

    //Shows the top level menu
    function showMainMenu() {
        E.showMenu({
            '': {
                'title': 'Informational Clock',
                'back': back
            },
            'Dual stage unlock': {
                value: config.dualStageUnlock,
                format: value => (value == 0) ? "Off" : `${value} taps`,
                min: 0,
                step: 1,
                onchange: value => {
                    config.dualStageUnlock = value;
                    saveSettings();
                }
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
            'Fast load shortcuts': showFastLoadMenu,
            'Bar': showBarMenu,
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
})
