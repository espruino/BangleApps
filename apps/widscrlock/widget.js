// Screenlock Widget

(() => {
	var widX = 0;
	var widY = 0;
	function draw() {
		// Draw icon.
		g.reset();
		widX = this.x;
		widY = this.y;
		g.drawImage(atob("GBiDAkkkkiSSSUkkkkkkiSSSSSUkkkkiSSSSSSSUkkkSSSSSSSSSkkiSSSf/ySSSUkiSSf///ySAUkSSSfwAPyQASkSST+AAB+AACiSST+AAB2AACSSST+AAA2AAASSST+AAA2AAASSSf//+22wAASSSf//222wAASSSf/+A22wAASSSf/wAG2wAASSSf+wAG2wACUSST2wAG2AACkSSS22A22AASkiSQG222wAAUkiSAAG2wAACUkkSAAAAAAASkkkiSAAAAASUkkkkiSAAASUkkkkkkiSSSUkkkg=="),widX,widY);
	}

	// add widget.
	WIDGETS.widscrlock={
		area:"tr",
		width: 24,
		draw:draw // Draw widget.
	};

	setInterval(()=>WIDGETS.widscrlock.draw(), 60000);

	function restoreTimeout(){
		// Restore LCDTimeout settings.
		Bangle.setLCDTimeout(options.lockTimeout / 1000);
	}

	var options = [];
	Bangle.on('touch', function(button, xy) {
		if(xy.x>=widX && xy.x<=widX+23 && xy.y>=widY && xy.y<=widY+23) {
			options = Bangle.getOptions(); // Store current Timeout settings.
			Bangle.setLCDTimeout(0.1); // Lock screen.
			setTimeout(restoreTimeout, 1000);
		}
	});
})();
