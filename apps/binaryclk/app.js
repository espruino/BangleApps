var settings = Object.assign({
	fullscreen: false,
	hidesq: false,
	showdate: false,
}, require('Storage').readJSON("binaryclk.json", true) || {});

function draw() {

	var dt = new Date();
	var h = dt.getHours(), m = dt.getMinutes(), d = dt.getDate();
	const t = [];

	t[0] = Math.floor(h/10);
	t[1] = Math.floor(h%10);
	t[2] = Math.floor(m/10);
	t[3] = Math.floor(m%10);

	g.reset();
	g.clearRect(Bangle.appRect);

	let i = 0;
	var gap = 8;
	var mgn = 20;

	if (settings.fullscreen) {
		gap = 12;
		mgn = 0;
	}

	const sq = 29;
	var pos = sq + gap;

	for (let r = 3; r >= 0; r--) {
		for (let c = 0; c < 4; c++) {
			if (t[c] & Math.pow(2, r)) {
				g.fillRect(Math.floor(mgn/2) + gap + c * pos, mgn + gap + i * pos, Math.floor(mgn/2) + gap + c * pos + sq, mgn + gap + i * pos + sq);
			} else {
				g.drawRect(Math.floor(mgn/2) + gap + c * pos, mgn + gap + i * pos, Math.floor(mgn/2) + gap + c * pos + sq, mgn + gap + i * pos + sq);
			}
		}
		i++;
	}

	var c1sqhide = 0;
	var c3sqhide = 0;

	if (settings.hidesq) {
		c1sqhide = 2;
		c3sqhide = 1;
	}

	if (settings.hidesq) {
		g.clearRect(Math.floor(mgn/2), mgn, Math.floor(mgn/2) + pos, mgn + c1sqhide * pos);
		g.clearRect(Math.floor(mgn/2) + 2 * pos + gap, mgn, Math.floor(mgn/2) + 3 * pos, mgn + c3sqhide * pos);
	}
	if (settings.showdate) {
		g.setFontAlign(0, 0);
		g.setFont("Vector",20);
		g.drawRect(Math.floor(mgn/2) + gap, mgn + gap, Math.floor(mgn/2) + gap + sq, mgn + gap + sq);
		g.drawString(d, Math.ceil(mgn/2) + gap + Math.ceil(sq/2) + 1, mgn + gap + Math.ceil(sq/2) + 1);
	}
}

g.clear();
draw();
/*var secondInterval =*/ setInterval(draw, 60000);
Bangle.setUI("clock");
if (!settings.fullscreen) {
	Bangle.loadWidgets();
	Bangle.drawWidgets();
} 
