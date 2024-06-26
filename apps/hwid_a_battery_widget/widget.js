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

	function draw(_self, uu) {
		let x = this.x;
		let	y = this.y;
		if (x != null && y != null) {
			g.reset();
			g.setBgColor(COLORS.white);
			g.clearRect(old_x, old_y, old_x + width, old_y + height);

			const l = E.getBattery(); // debug: Math.floor(Math.random() * 101);
			let s = width - 1;
			let xl = x+4+l*(s-12)/100;

			// Charging bar
			g.setColor(levelColor(l));
			g.fillRect(x+4,y+14+3,xl,y+16+3);

			// Show percentage
			g.setFontAlign(0,0);
			g.setFont('Vector',16);
			this.drawText(l, uu);
		}
		old_x = this.x;
		old_y = this.y;

		if (Bangle.isCharging()) changeInterval(id, intervalHigh);
		else changeInterval(id, intervalLow);
	}

	const drawString = function(l) {
		g.drawString(l, this.x + 14, this.y + 10);
	};
	let drawText;

	if(E.getPowerUsage){
		drawText = function(l, uu) {
			const u = uu == null ? E.getPowerUsage().total : uu;

			// text colour is based off power usage
			// colour height is based off time left, higher = more

			g.setColor(COLORS.black);
			drawString.call(this, l);

			if(u >= 23000)
				g.setColor("#f00"); // red, e.g. GPS ~20k
			else if(u > 2000)
				g.setColor("#fc0"); // yellow, e.g. CPU ~1k, HRM ~700
			else
				g.setColor("#0f0"); // green: ok

			const hrs = 200000 / u;
			const days = hrs / 24;
			const dayPercent = Math.min(days / 16, 1);
			const th = g.getFontHeight();

			g.setClipRect(this.x, this.y + dayPercent * th, this.x + width, this.y + th);

			drawString.call(this, l);
		};
	}else{
		drawText = function(l) {
			g.setColor(COLORS.black);
			drawString.call(this, l);
		};
	}

	const d = () => WIDGETS["hwid_a_battery_widget"].draw();
	Bangle.on('charging', d);
	var id = setInterval(d, intervalLow);
	var width = 30;
	var height = 19;

	WIDGETS["hwid_a_battery_widget"]={area:"tr",width,draw,drawText};
})();
