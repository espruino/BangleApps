(() => {
	Bangle.on('charging', (charging) => {
		if (charging) {
			Bangle.buzz();
		}
		Bangle.drawWidgets(); // re-layout widgets
		g.flip();
	});

	const icon = require("heatshrink").decompress(atob("kEggIEBoAIC4ADFgIDCgYDDwADBg4DGh4DGj4DCn4DD/4gBv4DEBgP//4PBAYUB//+GQIDE/hDCAYf4AY3wAYXgAYxfHIYQDEOQUCAQI"));

	function draw() {
		g.reset();
		g.setColor("#FD0");
		//if (Bangle.isCharging()) {
		g.drawImage(icon, this.x, this.y + 2, {
			scale: 0.8125
		});
		//}
	}

	WIDGETS.chargingStatus = {
		area: 'tr',
		width: 26,
		draw: draw,
	};



})();