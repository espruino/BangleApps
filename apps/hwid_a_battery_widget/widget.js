(function(){
	const intervalLow	= 60000; // update time when not charging
	const intervalHigh = 2000; // update time when charging
	var old_l;

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
	var s = 29;
	var x = this.x, y = this.y;
	const l = E.getBattery();
	let xl = x+4+l*(s-12)/100;
	if (l != old_l){ // Delete the old value from screen
		old_l = l;
		let xl_old = x+4+old_l*(s-12)/100;
		g.setColor(COLORS.white);
		// g.fillRect(x+2,y+5,x+s-6,y+18);
		g.fillRect(x,y,xl+4,y+16+3); //Clear
		g.setFontAlign(0,0);
		g.setFont('Vector',16);
		g.drawString(old_l, x + 14, y + 10);
		g.fillRect(x+4,y+14+3,xl_old,y+16+3); // charging bar
	}

	g.setColor(levelColor(l));
	g.fillRect(x+4,y+14+3,xl,y+16+3); // charging bar
	g.fillRect((x+4+100*(s-12)/100)-1,y+14+3,x+4+100*(s-12)/100,y+16+3); // charging bar "full mark"
	// Show percentage
	g.setColor(COLORS.black);
	g.setFontAlign(0,0);
	g.setFont('Vector',16);
	g.drawString(l, x + 14, y + 10);

	if (Bangle.isCharging()) changeInterval(id, intervalHigh);
		else					 changeInterval(id, intervalLow);
	}

	Bangle.on('charging',function(charging) { draw(); });
	var id = setInterval(()=>WIDGETS["wid_a_battery_widget"].draw(), intervalLow);

	WIDGETS["wid_a_battery_widget"]={area:"tr",width:30,draw:draw};
})();
