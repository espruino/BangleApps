const SETTINGS_PATH = 'pomoplus.json';
const storage = require("Storage");

(function (back) {
    let settings = storage.readJSON(SETTINGS_PATH);
    if (!settings) {
        settings = {
            workTime: 1500000,                  //Work for 25 minutes
            shortBreak: 300000,                 //5 minute short break
            longBreak: 900000,                  //15 minute long break
            numShortBreaks: 3,                  //3 short breaks for every long break
            pausedTimerExpireTime: 21600000,    //If the timer was left paused for >6 hours, reset it on next launch
            showClock: false,                   //Show clock after start/resume
            widget: false,                      //If a widget is added in the future, whether the user wants it
        };
    }

    function save() {
        storage.writeJSON(SETTINGS_PATH, settings);
    }

    const menu = {
        '': { 'title': 'Pomodoro Plus' },
        '< Back': back,
        'Work time': {
            value: settings.workTime,
            step: 60000,    //1 minute
            min: 60000,
            // max: 10800000,
            // wrap: true,
            onchange: function (value) {
                settings.workTime = value;
                save();
            },
            format: function (value) {
                return '' + (value / 60000) + 'm'
            }
        },
        'Short break time': {
            value: settings.shortBreak,
            step: 60000,
            min: 60000,
            // max: 10800000,
            // wrap: true,
            onchange: function (value) {
                settings.shortBreak = value;
                save();
            },
            format: function (value) {
                return '' + (value / 60000) + 'm'
            }
        },
        '# Short breaks': {
            value: settings.numShortBreaks,
            step: 1,
            min: 0,
            // max: 10800000,
            // wrap: true,
            onchange: function (value) {
                settings.numShortBreaks = value;
                save();
            }
        },
        'Long break time': {
            value: settings.longBreak,
            step: 60000,
            min: 60000,
            // max: 10800000,
            // wrap: true,
            onchange: function (value) {
                settings.longBreak = value;
                save();
            },
            format: function (value) {
                return '' + (value / 60000) + 'm'
            }
        },
        'Timer expiration': {
            value: settings.pausedTimerExpireTime,
            step: 900000,   //15 minutes
            min: 0,
            // max: 10800000,
            // wrap: true,
            onchange: function (value) {
                settings.pausedTimerExpireTime = value;
                save();
            },
            format: function (value) {
                if (value == 0) return "Off"
                else return `${Math.floor(value / 3600000)}h ${(value % 3600000) / 60000}m`
            }
        },
        'Show clock': {
            value: settings.showClock,
            onchange: function(value) {
                settings.showClock = value;
                save();
            },
        },
    };
    E.showMenu(menu)
})
