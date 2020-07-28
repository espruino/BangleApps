///////////////////////////
// This file should contain exactly one function, which shows the app's settings
/**
 * @param {function} back Use back() to return to settings menu
 */
(function (back) {
	const SETTINGS_FILE = "nitemode.settings.json";
	const settings = storage.readJSON("setting.json", 1);

	// initialize with default settings...
	let s = {
		niteMode: false,
		timeout: 5,
		brightness: 0.1,
		wakeOnFaceUp: false,
		wakeOnTouch: false,
		daySettings: {
			timeout: settings.timeout,
			brightness: settings.brightness,
			wakeOnFaceUp: settings.wakeOnFaceUp,
			wakeOnTouch: settings.wakeOnTouch,
		},
	};
	// ...and overwrite them with any saved values
	// This way saved values are preserved if a new version adds more settings
	const storage = require("Storage");
	const saved = storage.readJSON(SETTINGS_FILE, 1) || {};
	for (const key in saved) {
		s[key] = saved[key];
	}

	// creates a function to safe a specific setting, e.g.  save('color')(1)
	function save(key) {
		return function (value) {
			s[key] = value;
			storage.write(SETTINGS_FILE, s);
		};
	}
	const menu = {
		"": { title: "Nite Mode" },
		"< Back": back,
		Timeout: {
			value: s.timeout,
			min: 0,
			max: 60,
			step: 5,
			onchange: save("timeout"),
		},
		"LCD Brightness": {
			value: s.brightness,
			min: 0.1,
			max: 1,
			step: 0.1,
			onchange: save("brightness"),
		},
		"Wake on FaceUp": {
			value: s.wakeOnFaceUp,
			format: boolFormat,
			onchange: save("wakeOnFaceUp"),
		},
		"Wake on Touch": {
			value: s.wakeOnTouch,
			format: boolFormat,
			onchange: save("wakeOnTouch"),
		},
	};

	E.showMenu(menu);
});
