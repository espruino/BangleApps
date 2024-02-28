(function(){
	const intervalLow  = 60000; // update time when not charging
	const intervalHigh = 2000; // update time when charging

	var old_x = this.x;
	var old_y = this.y;


	let COLORS = {
		'white': g.theme.dark ? "#000" : "#fff",
		'black': g.theme.dark ? "#fff" : "#000",
		'charging': "#08f",
		'high': g.theme.dark ? "#fff" : "#000",
		'low': "#f00",
	};

	const levelColor = (l) => {
		if (Bangle.isCharging()) return COLORS.charging;
		if (l >= 30) return COLORS.high;
		return COLORS.low;
	};

	function draw() {
	var s = width - 1;
	var x = this.x;
	var	y = this.y;
	if (x !== undefined && y !== undefined) {
		g.setBgColor(COLORS.white);
		g.clearRect(old_x, old_y, old_x + width, old_y + height);

		const l = E.getBattery(); // debug: Math.floor(Math.random() * 101);
		let xl = x+4+l*(s-12)/100;

		g.setColor(levelColor(l));
		g.fillRect(x+4,y+14+3,xl,y+16+3); // charging bar
		// Show percentage
		g.setColor(COLORS.black);
		g.setFontAlign(0,0);
		g.setFont('Vector',16);
		g.drawString(l, x + 14, y + 10);

	}
		old_x = this.x;
		old_y = this.y;

	if (Bangle.isCharging()) changeInterval(id, intervalHigh);
		else					 changeInterval(id, intervalLow);
	}

	Bangle.on('charging',function(charging) { draw(); });
	var id = setInterval(()=>WIDGETS["hwid_a_battery_widget"].draw(), intervalLow);
	var width = 30;
	var height = 19;

	WIDGETS["hwid_a_battery_widget"]={area:"tr",width,draw:draw};
})();
