(back => {
	const SETTINGS_FILE = "promenu.settings.json";

	const storage = require("Storage")
	const settings = (storage.readJSON(SETTINGS_FILE, true) || {}) as PromenuSettings;
	settings.naturalScroll ??= false;
	settings.wrapAround ??= true;

	const save = () => {
		storage.writeJSON(SETTINGS_FILE, settings);
	};

	const menu: Menu = {
		"": { "title": "Promenu" },
		"< Back": back,
		/*LANG*/"Natural Scroll": {
			value: !!settings.naturalScroll,
			onchange: (v: boolean) => {
				settings.naturalScroll = v;
				save();
			}
		},
		/*LANG*/"Wrap Around": {
			value: !!settings.wrapAround,
			onchange: (v: boolean) => {
				settings.wrapAround = v;
				save();
			}
		}
	};

	E.showMenu(menu);
}) satisfies SettingsFunc
