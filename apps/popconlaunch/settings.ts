(function(back) {
	const menu = {
		'': {'title': 'Popcon'},
		'< Back': back,
		'Reset app popularities': () => {
			const S = require("Storage");
			S.erase("popcon.cache.json");

			const info: AppInfo & { cacheBuster?: boolean } = S.readJSON("popcon.info", true);
			info.cacheBuster = !info.cacheBuster;
			S.writeJSON("popcon.info", info);

			E.showMessage("Popcon reset", "Done");
		},
	};

	E.showMenu(menu);
}) satisfies SettingsFunc
