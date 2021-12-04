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
			g.setColor("#FD0");     // on = amber

			//if (Bangle.isCharging()) {
			g.drawImage(atob("GBiBAAAAAAAAAAAAAA//8B//+BgYGBgYGBgYGBgYGBgYGBgYGB//+B//+BgYGBgYGBgYGBgYGBgYGBgYGB//+A//8AAAAAAAAAAAAA=="), this.x, 2+this.y);

		    //g.setColor('#0f0').drawImage(atob("EBCBAf9//3/+f/x//P/4//gH8A/wD+Af/x//P/4//n/+//7/"), this.x, this.y);
			//}
		},
	};
})();