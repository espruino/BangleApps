const storage = require("Storage");

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
}

function doTheThing() {
	let niteModeSettings = storage.readJSON("nitemode.settings.json", 1) || {};

	niteModeSettings.niteMode = !niteModeSettings.niteMode;
	storage.write("nitemode.settings.json", niteModeSettings);

	g.clear();
	g.setFont("8x12", 2);
	g.setColor(0xf800);
	g.drawString(
		"NiteMode enabled! You may close the app.",
		g.getWidth() / 2,
		g.getHeight() / 2
	);
	setNiteMode(niteModeSettings.niteMode);
}

require("Font8x12").add(Graphics);
g.setFontAlign(0, 0);
g.flip();

doTheThing();
