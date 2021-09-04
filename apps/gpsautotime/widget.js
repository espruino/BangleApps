(() => {
	var lastTimeSet = 0;

	Bangle.on('GPS',function(fix) {
		if (fix.fix) {
			var curTime = fix.time.getTime()/1000;
			setTime(curTime);
			lastTimeSet = curTime;

			WIDGETS["gpsAutoTime"].draw(WIDGETS["gpsAutoTime"]);
		}
	});

	// add your widget
	WIDGETS["gpsAutoTime"]={
		area:"tl", // tl (top left), tr (top right), bl (bottom left), br (bottom right)
		width: 28, // width of the widget
		draw: function() {
			g.reset(); // reset the graphics context to defaults (color/font/etc)
			g.setFont("6x8");
			if ((getTime() - lastTimeSet) <= 60) {
				// time is uptodate
				g.setColor('#00ff00'); // green
			}
			g.drawString("auto", this.x, this.y);
			g.drawString("time", this.x, this.y+10);
		}
	};

	setInterval(function() {
		WIDGETS["gpsAutoTime"].draw(WIDGETS["gpsAutoTime"]);
	}, 1*60000); // update every minute
})()
