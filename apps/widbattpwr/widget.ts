(() => {
	const intervalLow  = 60000;
	const intervalHigh = 2000;
	const width = 30;
	const height = 24;
	let showPct = false;

	const powerColour = (pwr: number) =>
		pwr >= 23000
			? "#f00" // red, e.g. GPS ~20k
			: pwr > 2000
			? "#fc0" // yellow, e.g. CPU ~1k, HRM ~700
			: "#0f0"; // green: ok

	const drawBar = (x: number, y: number, batt: number) =>
		g.fillRect(x+1, y+height-3, x+1+(width-2)*batt/100, y+height-1);

	const drawString = (x: number, y: number, txt: string) =>
		g.drawString(txt, x + 14, y + 10);

	function draw(this: Widget) {
		let x = this.x!;
		let y = this.y!;

		const { usage, hrsLeft, batt } = require("power_usage").get();
		const pwrColour = powerColour(usage);

		g.reset()
			.setBgColor(g.theme.bg)
			.clearRect(x, y, x + width - 1, y + height - 1);

		g.setColor(g.theme.fg);
		drawBar(x, y, 100);
		g.setColor(pwrColour);
		drawBar(x, y, batt);

		g.setFontAlign(0, 0);
		g.setFont("Vector", 16);
		{
			let txt;
			if(showPct || Bangle.isCharging()){
				txt = `${batt}%`;
			}else{
				const days = hrsLeft / 24;
				txt = days >= 1 ? `${Math.round(Math.min(days, 99))}d` : `${Math.round(hrsLeft)}h`;
			}

			// draw time remaining, then shade it based on batt %
			const txth = 14;
			g.setColor(g.theme.fg);
			g.setClipRect(x, y, x + width, y + txth);
			drawString(x, y, txt);

			g.setColor(pwrColour);
			g.setClipRect(x, y + txth * (1 - batt / 100), x + width, y + txth);
			drawString(x, y, txt);
		}
	}

	const id = setInterval(() => {
		const w = WIDGETS["battpwr"]!;
		w.draw(w);
	}, intervalLow);

	Bangle.on("charging", charging => {
		changeInterval(id, charging ? intervalHigh : intervalLow);
	});

	Bangle.on("touch", (_btn, xy) => {
		if(WIDGETS["back"] || !xy) return;

		const oversize = 5;
		const w = WIDGETS["battpwr"]!;
		const { x, y } = xy;

		if(w.x! - oversize <= x && x < w.x! + width + oversize
		&& w.y! - oversize <= y && y < w.y! + height + oversize)
		{
			E.stopEventPropagation && E.stopEventPropagation();

			showPct = true;
			setTimeout(() => (showPct = false, w.draw(w)), 1000);
			w.draw(w);
		}
	});

	WIDGETS["battpwr"] = { area: "tr", width, draw };
})();
