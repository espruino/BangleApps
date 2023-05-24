(function(back) {
	const menu = {
		'': {'title': 'Popcon'},
		'< Back': back,
		'Reset app popularities': () => {
			require("Storage").erase("popcon.cache.json");
			E.showMessage("Popcon reset", "Done");
		},
	};

	E.showMenu(menu);
}) satisfies SettingsFunc
