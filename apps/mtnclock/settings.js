(function(back) {
  var STORAGE = require('Storage')

  var FILE = "mtnclock.json";

  // Load settings
  var SETTINGS  = Object.assign({
    // default values
    showWidgets: false,
		rows: []
  }, STORAGE.readJSON(FILE, true) || {});

  function writeSettings() {
    STORAGE.writeJSON(FILE, SETTINGS);
  }

	let showingClockinfos = false;
	let clockinfosSettings = [];
	let clockinfos = require("clock_info").load();

  // Show the menu
  let menu = {
    "" : { "title" : "Mountain Clock" },
    "< Back" : () => back(),
    'Show widgets': {
      value: !!SETTINGS.showWidgets,  // !! converts undefined to false
      onchange: (value) => {
        SETTINGS.showWidgets = value;
        writeSettings();
      }
    },
		'Edit Clockinfos': () => {
			showingClockinfos = true;
			drawClockinfoSettings();
		},
  };

	E.showMenu(menu);

	function drawClockinfoSettings() {
		Bangle.setUI(undefined);
		require("widget_utils").hide();
		g.clear();
		g.setColor(g.theme.fg);
		g.setFont("Vector", py(10)).setFontAlign(-1, -1).drawString("<Back", px(2), py(9));
		g.drawRect(1, 1, px(33), px(25)-1);
		g.setFont("Vector", py(10)).setFontAlign(0, -1).drawString("-", px(50), py(9));
		g.drawRect(px(33), 1, px(67), px(25)-1);
		g.setFont("Vector", py(10)).setFontAlign(0, -1).drawString("+", px(83), py(9));
		g.drawRect(px(67), 1, px(100)-1, px(25)-1);

		SETTINGS.rows.forEach(function(row, r) {
			addClockinfo(r)
		});
	}

	function addClockinfo(r) {
		let dr = SETTINGS.rows[r];
		// Check if the saved clockinfo indices still exist
		let ma = (dr && dr.menuA && clockinfos[dr.menuA]) ? dr.menuA : 0;
		let mb = (ma && dr && dr.menuB && clockinfos[ma].items[dr.menuB]) ? dr.menuB : 0;
		clockinfosSettings[r] = require("clock_info").addInteractive(clockinfos, {
			x : 2, y: py((r+1)*25)+1, w: px(100)-4, h: py(25)-2,
			menuA: ma,
			menuB: mb,
			draw : (itm, info, options) => {
				g.reset().clearRect(options.x-1, options.y, options.x+options.w+1, options.y+options.h);
				if (options.focus) g.drawRect(options.x-1, options.y, options.x+options.w+1, options.y+options.h);
				g.setFont("Vector", py(10)).setFontAlign(-1, 0).drawString(info.text, options.x, options.y+options.h/2);
			}
		});
	}

	function saveClockinfos() {
		SETTINGS.rows = [];
		clockinfosSettings.forEach(function(row, r) {
			SETTINGS.rows[r] = {
				menuA: row.menuA,
				menuB: row.menuB
			}
			row.remove();
		});
		console.log(JSON.stringify(SETTINGS));
		writeSettings();
	}

	//scale x, y coords to screen
	function px(x) {
		return x*g.getWidth()/100;
	}

	function py(y) {
		return y*g.getHeight()/100;
	}

	function checkTouchBack(xy) {
		return xy.x <= px(33) && xy.y < py(25);
	}

	function checkTouchMinus(xy) {
		return xy.x > px(33) && xy.x < px(67) && xy.y < px(25);
	}

	function checkTouchPlus(xy) {
		return xy.x >= px(67) && xy.y < px(25);
	}

	Bangle.on('touch', function(b, xy) {
		if (!showingClockinfos) return;
		// Bangle.js 2 supports long touch (type 2)
		// On other devices, any touch will show the settings
		if (checkTouchBack(xy)) {
			showingClockinfos = false;
			saveClockinfos();
			// call setWeather after a timeout because for some reason a clockinfo
			//  can still draw for a little bit despite calling remove() on it
			setTimeout(() => {
				Bangle.setUI({
					mode: "custom",
					back: back,
				});
				require("widget_utils").show();
				E.showMenu(menu);
			}, 100);
		} else if (checkTouchMinus(xy) && clockinfosSettings.length > 0) {
			let cl = clockinfosSettings[clockinfosSettings.length - 1];
			cl.remove();
			g.reset().clearRect(cl.x, cl.y, cl.x+cl.w-2, cl.y+cl.h-1);
			clockinfosSettings.pop();
		} else if (checkTouchPlus(xy) && clockinfosSettings.length < 3) {
			addClockinfo(clockinfosSettings.length)
		}
	});
})
