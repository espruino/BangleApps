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
		g.setColor("#FD0");
		//if (Bangle.isCharging()) {
		g.drawImage(atob("kEgxH+ACEACSIeMD/p1CDzwffH3wfbDwYf6DwgfZDwofgABAeeD74etH3yc+FCAfeDzAflDzIfEDzQfjDzYffH3wfCDzgfBCKAA="), this.x, this.y);
		//g.drawString('X',this.x,this.y)
		//}
	}

	WIDGETS.chargingStatus = {
		area: 'tr',
		width: 32,
		draw: draw,
	};



})();