(() => {
	Bangle.on('charging', (charging) => {
		if (charging) {
			Bangle.buzz();
		}
		Bangle.drawWidgets(); // re-layout widgets
		g.flip();
	});

	const icon = require("heatshrink").decompress(atob("kEgwMB///34CB/8/AYv+AYX8AYd/AYP4AY3wAY3gAYXAAYcAEAOAAYgMBIQIPBAYX+gBGB/gDEgZDCAYcHAY0PAYUfAYxfHIYQDEOQX9AQI="))

	function draw() {
		g.reset();
		g.setColor("#FD0");
		//g.setFont("Vector", 26);
		//if (Bangle.isCharging()) {
		g.drawImage(icon, this.x, this.y);
		//g.drawString('PWR', this.x, this.y)
		//}
	}

	WIDGETS.chargingStatus = {
		area: 'tr',
		width: 32,
		draw: draw,
	};



})();