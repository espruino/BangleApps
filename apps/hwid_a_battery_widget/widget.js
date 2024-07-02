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

	function draw(_self, pwrOverride, battOvr) {
		let x = this.x;
		let	y = this.y;
		if (x != null && y != null) {
			g.reset();
			g.setBgColor(COLORS.white);
			g.clearRect(old_x, old_y, old_x + width, old_y + height - 1);

			const l = battOvr != null ? battOvr : E.getBattery();

			// Charging bar
			g.setColor(levelColor(l));
			const xl = x+1+(width - 1)*l/100;
			g.fillRect(x+1,y+height-3,xl,y+height-1);

			// Show percentage
			g.setFontAlign(0,0);
			g.setFont('Vector',16);
			this.drawText(l, pwrOverride);
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
		drawText = function(batt, pwrOverride) {
			const pwr = E.getPowerUsage();
			let total = 0;
			for(const key in pwr.device){
				if(!/^(LCD|LED)/.test(key))
					total += pwr.device[key];
			}
			const u = pwrOverride == null ? total : pwrOverride;

			const hrs = 200000 / u;
			const days = hrs / 24;
			const txt = days >= 1 ? `${Math.round(days)}d` : `${Math.round(hrs)}h`;

			// draw time left, then shade it based on batt %
			const th = 14;
			g.setColor(COLORS.black);
			g.setClipRect(this.x, this.y, this.x + width, this.y + th);
			drawString.call(this, txt);

			g.setClipRect(this.x, this.y + th * (1 - batt / 100), this.x + width, this.y + th);
			if(u >= 23000)
				g.setColor("#f00"); // red, e.g. GPS ~20k
			else if(u > 2000)
				g.setColor("#fc0"); // yellow, e.g. CPU ~1k, HRM ~700
			else
				g.setColor("#0f0"); // green: ok
			drawString.call(this, txt);
		};
	}else{
		drawText = function(batt) {
			g.setColor(COLORS.black);
			drawString.call(this, batt);
		};
	}

	const d = () => WIDGETS["hwid_a_battery_widget"].draw();
	Bangle.on('charging', d);
	var id = setInterval(d, intervalLow);
	var width = 30;
	var height = 24;

	WIDGETS["hwid_a_battery_widget"]={area:"tr",width,draw,drawText};
})();
