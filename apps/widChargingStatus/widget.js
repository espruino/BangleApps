(() => {
	Bangle.on('charging', (charging) => {
		if (charging) {
			Bangle.buzz();
		}
		Bangle.drawWidgets(); // re-layout widgets
		g.flip();
	});

	const chargingIcon = {
		width: 32,
		height: 32,
		bpp: 1,
		transparent: 1,
		buffer: require("heatshrink").decompress(atob("///34CB/8/AYv+AYX8AYd/AYP4AY3wAY3gAYXAAYcAEAOAAYgMBHwYDC/0AgIyBAYkDIYQDDg4DGh4DCj4DGL45DCAYhyC/oCBA="))
	}

	function draw() {
		g.reset();
		g.setColor("#FD0");
		//if (Bangle.isCharging()) {
		g.drawImage(chargingIcon, this.x /* + 2 */ , this.y);
		//g.drawString('X',this.x,this.y)
		//}
	}

	WIDGETS.chargingStatus = {
		area: 'tr',
		width: 32,
		draw: draw,
	};



})();