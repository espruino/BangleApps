(() => {
	Bangle.on('charging', (charging) => {
		if (charging) {
			Bangle.buzz();
		}
		Bangle.drawWidgets(); // re-layout widgets
		g.flip();
	});

	function draw() {
		g.reset();
		//g.setColor("#FD0");
		//if (Bangle.isCharging()) {
		g.drawImage(atob("kEgwMB///34CB/8/AYv+AYX8AYd/AYP4AY3wAY3gAYXAAYcAEAOAAYgMBIQIPBAYX+gBGB/gDEgZDCAYcHAY0PAYUfAYxfHIYQDEOQX9AQI="), this.x, this.y);
		//g.drawString('X',this.x,this.y)
		//}
	}

	WIDGETS.chargingStatus = {
		area: 'tr',
		width: 32,
		draw: draw,
	};



})();