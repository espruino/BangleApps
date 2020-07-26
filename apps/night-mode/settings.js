// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function (back) {
	const storage = require("Storage");
	let settings = storage.readJSON("setting.json", 1);

	const NIGHTMODE_SETTINGS_FILE = "nightmode.settings.json";

	// initialize with default settings...
	let s = {
		nightMode: false,
		timeout: 5,
		brightness: 0.1,
		wakeOnFaceUp: false,
		wakeOnTouch: false,
	};
	// ...and overwrite them with any saved values
	// This way saved values are preserved if a new version adds more settings
	const saved = storage.readJSON(NIGHTMODE_SETTINGS_FILE, 1) || {};
	for (const key in saved) {
		s[key] = saved[key];
	}

	// creates a function to save a specific setting, e.g.  save('color')(1)
	function save(key) {
		return function (value) {
			s[key] = value;
			storage.write(NIGHTMODE_SETTINGS_FILE, s);
		};
	}

	function updateSettings() {
		storage.write("setting.json", settings);
	}

	function updateOptions() {
		updateSettings();
		Bangle.setOptions(settings.options);
	}

	const menu = {
		"": { title: "Night Mode" },
		"< Back": back,
		"Night Mode": {
			value: s.nightMode,
			format: boolFormat,
			onchange: save("nightMode"),
		},
		Timeout: {
			value: s.timeout,
			min: 0,
			max: 60,
			step: 5,
			onchange: (v) => {
				settings.timeout = 0 | v;
				save("timeout");
				updateSettings();
				Bangle.setLCDTimeout(settings.timeout);
			},
		},
		"LCD Brightness": {
			value: s.brightness,
			min: 0.1,
			max: 1,
			step: 0.1,
			onchange: (v) => {
				settings.brightness = v || 1;
				save("brightness");
				updateSettings();
				Bangle.setLCDBrightness(settings.brightness);
			},
		},
		"Wake on FaceUp": {
			value: s.wakeOnFaceUp,
			format: boolFormat,
			onchange: () => {
				settings.options.wakeOnFaceUp = !settings.options.wakeOnFaceUp;
				save("wakeOnFaceUp");
				updateOptions();
			},
		},
		"Wake on Touch": {
			value: s.wakeOnTouch,
			format: boolFormat,
			onchange: () => {
				settings.options.wakeOnTouch = !settings.options.wakeOnTouch;
				save("wakeOnTouch");
				updateOptions();
			},
		},
	};
	E.showMenu(menu);
});
