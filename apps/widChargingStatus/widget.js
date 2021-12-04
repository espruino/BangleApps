(() => {
	Bangle.on('charging', (charging) => {
		if (charging) {
			Bangle.buzz();
		}
		Bangle.drawWidgets(); // re-layout widgets
		g.flip();
	});

	const chargingSymbol = {
		width: 16,
		height: 16,
		bpp: 1,
		transparent: 1,
		buffer: require("heatshrink").decompress(atob("/9/AIP+v/8AIP//ABBg/wh4BB8Ef/4BBn/+AIIXB/4BB"))
	};

	function draw() {
		g.reset();
		g.setColor("#FD0");
		//if (Bangle.isCharging()) {
		g.drawImage(chargingSymbol, this.x + 2, this.y);
		//}
	}

	WIDGETS.chargingStatus = {
		area: 'tr',
		width: 20,
		draw: draw,
	};



})();