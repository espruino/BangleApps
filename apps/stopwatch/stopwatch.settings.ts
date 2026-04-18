type StopWatchConfig = {
	state: {
		total: number, // datetime
		start: number, // datetime
		current: number, // datetime
		running: boolean,
		laps: number[],
	},
	lapSupport: boolean,
};

(function(back) {
	const storage = require("Storage");
	const SETTINGS_FILE = "stopwatch.json";

	const cfg = storage.readJSON(SETTINGS_FILE, 1) as StopWatchConfig || {};

	function saveSettings() {
		storage.writeJSON(SETTINGS_FILE, cfg);
	}

	E.showMenu({
		"": { "title": "Stopwatch Config" },
		"< Back": back,
		"Lap Support": {
			value: !!cfg.lapSupport,
			onchange: (v: boolean) => {
				cfg.lapSupport = v;
				saveSettings();
			},
		},
	});
}) satisfies SettingsFunc;
