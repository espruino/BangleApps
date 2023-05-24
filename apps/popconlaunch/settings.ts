(function(back) {
	const menu = {
		'': {'title': 'Popcon'},
		'< Back': back,
		'Reset app popularities': () => {
			const S = require("Storage");
			S.erase("popcon.cache.json");

			const info: AppInfo & { cacheBuster?: boolean } = S.readJSON("popconlaunch.info", true);
			info.cacheBuster = !info.cacheBuster;
			S.writeJSON("popconlaunch.info", info);

			E.showMessage("Popcon reset", "Done");
		},
	};

	E.showMenu(menu);
}) satisfies SettingsFunc
