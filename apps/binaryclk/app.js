var settings = Object.assign({
	fullscreen: true,
	hidesq: false,
	showdate: true,
	showbat: true,
}, require('Storage').readJSON("binaryclk.json", true) || {});

var gap = 4;
var mgn = 24;
var sq = 33;

if (settings.fullscreen) {
	gap = 8;
	mgn = 0;
	sq = 34;
}

var pos = sq + gap;

function drawbat() {
	var bat = E.getBattery();
	if (bat < 20) {
		g.setColor('#FF0000');
	} else if (bat < 40) {
		g.setColor('#FFA500');
	} else {
		g.setColor('#00FF00');
	}
	g.fillRect(Math.floor(mgn/2) + gap + 2 * pos, mgn + gap, Math.floor(mgn/2) + gap + 2 * pos + Math.floor(bat * sq / 100), mgn + gap + sq);
}

function drawbatrect() {
	if (g.theme.dark) {
		g.setColor(-1);
	} else {
		g.setColor(1);
	}
	g.drawRect(Math.floor(mgn/2) + gap + 2 * pos, mgn + gap, Math.floor(mgn/2) + gap + 2 * pos + sq, mgn + gap + sq);
}

function draw() {
	let i = 0;
	var dt = new Date();
	var h = dt.getHours();
	var m = dt.getMinutes();
	var d = dt.getDate();
	var day = dt.toString().substring(0,3);
	const t = [];

	t[0] = Math.floor(h/10);
	t[1] = Math.floor(h%10);
	t[2] = Math.floor(m/10);
	t[3] = Math.floor(m%10);

	g.reset();
	g.clearRect(Bangle.appRect);

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
		g.clearRect(Math.floor(mgn/2), mgn, Math.floor(mgn/2) + pos, mgn + c1sqhide * pos);
		g.clearRect(Math.floor(mgn/2) + 2 * pos + gap, mgn, Math.floor(mgn/2) + 3 * pos, mgn + c3sqhide * pos);
	}

	if (settings.showdate) {
		g.setColor(-1).fillRect(Math.floor(mgn/2) + gap, mgn + gap, Math.floor(mgn/2) + gap + sq, mgn + gap + sq);
		g.setColor('#FF0000').fillRect(Math.floor(mgn/2) + gap, mgn + gap, Math.floor(mgn/2) + gap + sq, mgn + gap + 12);
		g.setFontAlign(0, -1);
		g.setFont("Vector",12);
		g.setColor(-1).drawString(day, Math.ceil(mgn/2) + gap + Math.ceil(sq/2) + 1, mgn + gap + 1);
		g.setFontAlign(0, 1);
		g.setFont("Vector",20);
		g.setColor(1).drawString(d, Math.ceil(mgn/2) + gap + Math.ceil(sq/2) + 1, mgn + gap + sq + 2);
		if (g.theme.dark) {
			g.setColor(-1);
		} else {
			g.setColor(1);
			g.drawLine(Math.floor(mgn/2) + gap, mgn + gap + 13, Math.floor(mgn/2) + gap + sq, mgn + gap + 13);
		}
		g.drawRect(Math.floor(mgn/2) + gap, mgn + gap, Math.floor(mgn/2) + gap + sq, mgn + gap + sq);
	}

	if (settings.showbat) {
		drawbat();
		drawbatrect();
	}
}

g.clear();
draw();
setInterval(draw, 60000);
Bangle.setUI("clock");
if (!settings.fullscreen) {
	Bangle.loadWidgets();
	Bangle.drawWidgets();
}

Bangle.on('charging', function(charging) {
	if(charging) Bangle.buzz();
});