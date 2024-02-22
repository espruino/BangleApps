var settings = Object.assign({
  fullscreen: false,
}, require('Storage').readJSON("binaryclk.json", true) || {});

function draw() {
	var dt = new Date();
	var h = dt.getHours(), m = dt.getMinutes();
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
				g.fillRect(mgn/2 + gap + c * pos, mgn + gap + i * pos, mgn/2 + gap + c * pos + sq, mgn + gap + i * pos + sq);
			} else {
				g.drawRect(mgn/2 + gap + c * pos, mgn + gap + i * pos, mgn/2 + gap + c * pos + sq, mgn + gap + i * pos + sq);
			}
		}
		i++;
	}
	g.clearRect(mgn/2 + gap, mgn + gap, mgn/2 + gap + sq, mgn + 2 * gap + 2 * sq);
	g.clearRect(mgn/2 + 3 * gap + 2 * sq, mgn + gap, mgn/2 + 3 * gap + 3 * sq, mgn + gap + sq);
}

g.clear();
draw();
var secondInterval = setInterval(draw, 60000);
Bangle.setUI("clock");
if (!settings.fullscreen) {
	Bangle.loadWidgets();
	Bangle.drawWidgets();
} 
