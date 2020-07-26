(function (back) {
	const storage = require("Storage");
	const settings = storage.readJSON("setting.json", 1);

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

	function save(key) {
		return function (value) {
			s[key] = value;
			storage.write("nitemode.settings.json", s);
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
