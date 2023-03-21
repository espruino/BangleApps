// Screenlock Widget

(() => {
	function draw() {
		// Draw icon.
		g.reset();
		g.drawImage(atob("GBiDAkkkkiSSSUkkkkkkiSSSSSUkkkkiSSf/ySSUkkkSSf///ySSkkiST/ySf+SQUkiST+SST+SAUkSSfySSSfwACkSSfySSSewACiSSfySSSWwAASSSfySSSGwAASSSfySSQGwAASST///+222AASST///2222AASST//+A222AASST//wAG22AASST/+AAA22AASST/2wAG22AAUST+22A222ACkiT222A222ACkiSG22A22wAUkkQA22222ACkkkiAG222wAUkkkkSAAAAASkkkkkkSQACSkkkg=="),scrlock.x,scrlock.y);
	}

	// add widget.
	WIDGETS.widscrlock={
		area:"tr",
		width: 24,
		draw:draw // Draw widget.
	};

	var scrlock = WIDGETS.widscrlock;

	function restoreTimeout(){
		// Restore LCDTimeout settings.
		Bangle.setLCDTimeout(options.lockTimeout / 1000);
	}

	var options = [];
	Bangle.on('touch', function(button, xy) {
		if(xy.x>=scrlock.x && xy.x<=scrlock.x+23 && xy.y>=scrlock.y && xy.y<=scrlock.y+23) {
			options = Bangle.getOptions(); // Store current Timeout settings.
			Bangle.setLCDTimeout(0.1); // Lock screen.
			setTimeout(restoreTimeout, 1000);
		}
	});
})();
