(function(back) {
    const SETTINGS_FILE = "line_dash.setting.json";

    // initialize with default settings...
    const storage = require('Storage')
    let settings = {
      showLock: true,
      showMinute: true,
      distanceUnit: "km",
      showDistance: true,
      strideLength: 0.8,
      showSteps: true,
      showBattery: true,
      showHrm: true,
      showBaro: true,
      baroCalib: 1,
      baroRefQnh: 1013.25,
      altUnit: "m",
      liveHrm: true,
      liveHrmInterval: 2,
      hrDecade: 40,
    };
    let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
    for (const key in saved_settings) {
      settings[key] = saved_settings[key]
    }

    function save() {
      storage.write(SETTINGS_FILE, settings)
    }

    // Raw one-shot sensor reading, taken when the menu opens. The sea-level
    // entry calibrates against it: factor = entered QNH / raw reading.
    let baroRaw = 0;

    function renderMenu() {
    E.showMenu({
      '': { 'title': 'Line Dash' },
      '< Back': back,
      'Show Lock': {
        value: settings.showLock,
        onchange: () => {
          settings.showLock = !settings.showLock;
          save();
        },
      },
      'Show Minute': {
        value: settings.showMinute,
        onchange: () => {
          settings.showMinute = !settings.showMinute;
          save();
        },
      },
      'Distance Unit': {
        value: settings.distanceUnit === "mi" ? 1 : 0,
        min: 0, max: 1,
        format: v => v ? "mi" : "km",
        onchange: (v) => {
          settings.distanceUnit = v ? "mi" : "km";
          save();
        },
      },
      'Show Distance': {
        value: settings.showDistance,
        onchange: () => {
          settings.showDistance = !settings.showDistance;
          save();
        },
      },
      'Stride (m)': {
        value: Math.round((settings.strideLength - 0.4) / 0.05),
        min: 0, max: 16,
        format: v => (0.4 + v * 0.05).toFixed(2),
        onchange: (v) => {
          settings.strideLength = 0.4 + v * 0.05;
          save();
        },
      },
      'Show Steps': {
        value: settings.showSteps,
        onchange: () => {
          settings.showSteps = !settings.showSteps;
          save();
        },
      },
      'Show Battery': {
        value: settings.showBattery,
        onchange: () => {
          settings.showBattery = !settings.showBattery;
          save();
        },
      },
      'Show Heart Rate': {
        value: settings.showHrm,
        onchange: () => {
          settings.showHrm = !settings.showHrm;
          save();
        },
      },
      'Show Barometer': {
        value: settings.showBaro !== false,
        onchange: () => {
          settings.showBaro = settings.showBaro === false;
          save();
        },
      },
      'Sea level (hPa)': {
        value: baroRaw > 0 ? Math.round(baroRaw * (settings.baroCalib || 1) * 2) / 2 : 1013,
        min: 950, max: 1050, step: 0.5,
        format: v => baroRaw > 0 ? v.toFixed(1) : "wait...",
        onchange: (v) => {
          if (baroRaw > 0) {
            settings.baroCalib = v / baroRaw;
            // Also the altimeter reference: altitude is derived from how far
            // the raw pressure has fallen below this sea-level value
            settings.baroRefQnh = v;
            save();
          }
        },
      },
      'Altitude Unit': {
        value: settings.altUnit === "ft" ? 1 : 0,
        min: 0, max: 1,
        format: v => v ? "ft" : "m",
        onchange: (v) => {
          settings.altUnit = v ? "ft" : "m";
          save();
        },
      },
      'Live HR Updates': {
        value: settings.liveHrm,
        onchange: () => {
          settings.liveHrm = !settings.liveHrm;
          save();
        },
      },
      'Live HR Interval': {
        value: Math.max(0, [2, 5, 15, 30, 60, 90, 120].indexOf(settings.liveHrmInterval)),
        min: 0, max: 6,
        format: v => [2, 5, 15, 30, 60, 90, 120][v] + "s",
        onchange: (v) => {
          settings.liveHrmInterval = [2, 5, 15, 30, 60, 90, 120][v];
          save();
        },
      },
      'HR Age Decade': {
        value: Math.max(0, [20, 30, 40, 50, 60, 70, 80].indexOf(settings.hrDecade)),
        min: 0, max: 6,
        format: v => [20, 30, 40, 50, 60, 70, 80][v] + "s",
        onchange: (v) => {
          settings.hrDecade = [20, 30, 40, 50, 60, 70, 80][v];
          save();
        },
      }
    });
    }
    renderMenu();

    // Fetch the raw reading, then re-render so the sea-level entry shows the
    // current calibrated value instead of "wait..."
    if (typeof Bangle.getPressure === 'function') {
      Bangle.getPressure().then(d => {
        if (d && d.pressure) {
          baroRaw = d.pressure;
          renderMenu();
        }
      }).catch(() => {});
    }
  })
