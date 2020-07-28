const storage = require("Storage");
let niteModeSettings = storage.readJSON("nitemode.settings.json", 1) || {};

function setNiteMode(niteMode) {
	let settings = storage.readJSON("setting.json", 1);

	if (niteMode) {
		settings.timeout = niteModeSettings.timeout;
		settings.brightness = niteModeSettings.brightness;
		settings.options.wakeOnFaceUp = niteModeSettings.wakeOnFaceUp;
		settings.options.wakeOnTouch = niteModeSettings.wakeOnTouch;
	} else {
		settings.timeout = niteModeSettings.daySettings.timeout;
		settings.brightness = niteModeSettings.daySettings.brightness;
		settings.options.wakeOnFaceUp = niteModeSettings.daySettings.wakeOnFaceUp;
		settings.options.wakeOnTouch = niteModeSettings.daySettings.wakeOnTouch;
	}
	storage.write("setting.json", settings);
	Bangle.setOptions(settings.options);
}

function doTheThing() {
	niteModeSettings.niteMode = !niteModeSettings.niteMode;
	storage.write("nitemode.settings.json", niteModeSettings);

	g.clear();
	g.setColor(0xf800);
	if (niteModeSettings.niteMode) {
		g.drawString(
			"NiteMode enabled!\n\n You may close the app.",
			g.getWidth() / 2,
			g.getHeight() / 2
		);
	} else {
		g.drawString(
			"NiteMode Disabled!\n\n You may close the app.",
			g.getWidth() / 2,
			g.getHeight() / 2
		);
	}
	setNiteMode(niteModeSettings.niteMode);
}

g.setFontAlign(0, 0);
g.flip();

doTheThing();
