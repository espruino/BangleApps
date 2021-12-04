(() => {
	Bangle.on('charging', (charging) => {
		if (charging) {
			Bangle.buzz();
		}
		Bangle.drawWidgets(); // re-layout widgets
		g.flip();
	});
	WIDGETS["chargingStatus"] = {
		area: 'tr',
		width: 32,
		draw() {
			g.reset();
			//if (Bangle.isCharging()) {
			g.drawString("X", this.x, this.y);
				//g.setColor('#0f0').drawImage(atob("EBCBAf9//3/+f/x//P/4//gH8A/wD+Af/x//P/4//n/+//7/"), this.x, this.y);
			//}
		},
	};
})();