(() => {
	Bangle.on('charging', (charging) => {
		if (charging) {
			Bangle.buzz();
		}
		Bangle.drawWidgets(); // re-layout widgets
		g.flip();
	});

	const chargingIcon = {
		width: 16,
		height: 16,
		bpp: 1,
		transparent: 0,
		buffer: require("heatshrink").decompress(atob("gGAAIMBwEDAIMAg4BB/EP+ABBj/ggABB4EBAIIXBgABB"))
	}

	function draw() {
		g.reset();
		g.setColor("#FD0");
		g.setFontVector(16);
		//if (Bangle.isCharging()) {
		// g.drawImage(chargingIcon, this.x /* + 2 */ , this.y);
		g.drawString('X',this.x,this.y)
		//}
	}

	WIDGETS.chargingStatus = {
		area: 'tr',
		width: 20,
		draw: draw,
	};



})();