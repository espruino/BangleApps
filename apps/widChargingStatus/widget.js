(() => {
	const icon = require("heatshrink").decompress(atob("kEggIEBoAIC4ADFgIDCgYDDwADBg4DGh4DGj4DCn4DD/4gBv4DEBgP//4PBAYUB//+GQIDE/hDCAYf4AY3wAYXgAYxfHIYQDEOQUCAQI"));

	function draw() {
		g.reset();
		if (Bangle.isCharging()) {
			g.setColor("#FD0");
			g.drawImage(icon, this.x, this.y + 1, {
				scale: 0.6875
			});
		}
	}

	WIDGETS.chargingStatus = {
		area: 'tr',
		width: 22,
		draw: draw,
	};

	Bangle.on('charging', (charging) => {
		if (charging) {
			Bangle.buzz();
			WIDGETS.chargingStatus.width = 22;
		} else {
			WIDGETS.chargingStatus.width = 0;
		}
		Bangle.drawWidgets(); // re-layout widgets
		g.flip();
	});
})();