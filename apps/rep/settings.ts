(back => {
	const SETTINGS_FILE = "rep.setting.json";

	const storage = require("Storage")
	const settings = (storage.readJSON(SETTINGS_FILE, true) || {}) as RepSettings;
	settings.record ??= false;
	settings.recordStopOnExit ??= false;
	settings.stepMs ??= 5 * 1000;

	const save = () => {
		storage.writeJSON(SETTINGS_FILE, settings);
	};

	const menu: Menu = {
		"": { "title": "Rep" },
		"< Back": back,
		/*LANG*/"Fwd/back seconds": {
			value: settings.stepMs / 1000,
			min: 1,
			max: 60,
			step: 1,
			format: (v: number) => `${v}s`,
			onchange: (v: number) => {
				settings.stepMs = v * 1000;
				save();
			},
		},
	};

	if (global["WIDGETS"] && WIDGETS["recorder"]) {
		menu[/*LANG*/"Record activity"] = {
			value: !!settings.record,
			onchange: (v: boolean) => {
				settings.record = v;
				save();
			}
		};
		menu[/*LANG*/"Stop record on exit"] = {
			value: !!settings.recordStopOnExit,
			onchange: (v: boolean) => {
				settings.recordStopOnExit = v;
				save();
			}
		};
	}

	E.showMenu(menu);
}) satisfies SettingsFunc
