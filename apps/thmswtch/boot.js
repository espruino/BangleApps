(function dm() {
	function selectRightMode(lt, dt, at) {
		if (at < lt && at < dt) {
			return "lightT";
		} else if (at > lt && at < dt) {
			return "darkT";
		} else if (at > lt && at > dt) {
			return "lightN";
		}
	}

	function setDarkTheme() {
		if (!g.theme.dark) {
			upd({
				fg: cl("#fff"), bg: cl("#000"),
				fg2: cl("#fff"), bg2: cl("#004"),
				fgH: cl("#fff"), bgH: cl("#00f"),
				dark: true
			});
		}
	}

	function setLightTheme() {
		if (g.theme.dark) {
			upd({
				fg: cl("#000"), bg: cl("#fff"),
				fg2: cl("#000"), bg2: cl("#cff"),
				fgH: cl("#000"), bgH: cl("#0ff"),
				dark: false
			});
		}
	}
	function fixTime(h, m) {
		if (h.toString().length < 2) {
			h = "0" + h.toString();
		}
		if (m.toString().length < 2) {
			m = "0" + m.toString();
		}
		return h.toString() + ":" + m.toString();
	}
	function calculateSunTimes() {
		var location = require("Storage").readJSON("mylocation.json", 1) || {};
		location.lat = location.lat || 51.5072;
		location.lon = location.lon || 0.1276; // London
		date = new Date(Date.now());
		var times = SunCalc.getTimes(date, location.lat, location.lon);
		sunrise = fixTime(times.sunrise.getHours(), times.sunrise.getMinutes());
		sunset = fixTime(times.sunset.getHours(), times.sunset.getMinutes());
		/* do we want to re-calculate this every day? Or we just assume
		that 'show' will get called once a day? */
	}
	function cl(x) { return g.setColor(x).getColor(); }
	function upd(th) {
		g.theme = th;
		let settings = storage.readJSON('setting.json', 1)
		settings.theme = th;
		storage.write('setting.json', settings);
		delete g.reset;
		g._reset = g.reset;
		g.reset = function (n) { return g._reset().setColor(th.fg).setBgColor(th.bg); };
		g.clear = function (n) { if (n) g.reset(); return g.clearRect(0, 0, g.getWidth(), g.getHeight()); };
		g.clear(1);
	}
	try {
		if (Bangle.dmTimeout) clearTimeout(Bangle.dmTimeout); // so the app can eval() this file to apply changes right away
		delete Bangle.dmTimeout;
	} catch (e) {
		print("Bangle.dmTimeout does not exist");
	}
	const SETTINGS_FILE = "themeSwitch.json";
	const storage = require("Storage");
	var sunrise, sunset, date;
	var SunCalc = require("suncalc"); // from modules folder
	let bSettings = storage.readJSON(SETTINGS_FILE, true) || {};
	const now = new Date();
	let hr = now.getHours() + (now.getMinutes() / 60) + (now.getSeconds() / 3600); // current (decimal) hour
	let dmH = parseFloat(bSettings.darkModeAt.split(":")[0]);
	let dmM = parseFloat(bSettings.darkModeAt.split(":")[1]);
	let lmH = parseFloat(bSettings.lightModeAt.split(":")[0]);
	let lmM = parseFloat(bSettings.lightModeAt.split(":")[1]);
	print("reading switch timeslots.....");
	let dmDec = parseFloat(dmH) + parseFloat(dmM) / parseFloat(60);
	let lmDec = parseFloat(lmH) + parseFloat(lmM) / parseFloat(60);
	let targetMode = selectRightMode(parseFloat(lmDec), parseFloat(dmDec), parseFloat(hr));
	let nextH, nextM;
	if (targetMode === "lightT" || targetMode === "lightN") {
		nextH = lmH;
		nextM = lmM;
	} else {
		nextH = dmH;
		nextM = dmM;
	}
	let nextDecH = parseFloat(nextH) + parseFloat(nextM) / parseFloat(60);
	let t = 3600000 * (nextDecH - hr); // timeout in milliseconds
	if (t < 0) { t += 86400000; } // scheduled for tomorrow: add a day
	/* update theme mode at the correct time. */
	Bangle.dmTimeout = setTimeout(() => {
		if (bSettings.darkMode !== 0) {
			if (targetMode === "lightT" || targetMode === "lightN") {
				setLightTheme();
			} else {
				setDarkTheme();
			}
			Bangle.loadWidgets();
			Bangle.drawWidgets();
			setTimeout(load, 20);
			if (bSettings.darkModeBySun !== 0) {
				calculateSunTimes();
				bSettings.lightModeAt = sunrise;
				bSettings.darkModeAt = sunset;
				storage.writeJSON(SETTINGS_FILE, bSettings);
			}
			dm(); // schedule next update
		}
	}, t);
})();
