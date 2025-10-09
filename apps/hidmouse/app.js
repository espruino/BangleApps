const mouse = require("ble_hid_mouse");
const SENSITIVITY = 3;

// x, y, *wheel: -127 ..= 127
const send = (x, y, btn, wheel, hwheel, cb) => {
	"ram";
	if(btn == null) btn = 0;
	if(wheel == null) wheel = 0;
	if(hwheel == null) hwheel = 0;

	try{
		NRF.sendHIDReport([btn, x, y, wheel, hwheel, 0, 0, 0], function() {
			"ram";
			try{
				NRF.sendHIDReport([0, 0, 0, 0, 0, 0, 0, 0], function() {
					"ram";
					if(cb) cb();
				});
			}catch(e){
				if(cb) cb();
			}
		});
	}catch(e){
		if(cb) cb();
	}
};

const tap = () => {
	send(0, 0, mouse.BUTTONS.LEFT);
};

const initBLE = () => {
	NRF.setSecurity({addr_cycle_s: 1000 * 30});
	NRF.setServices(undefined, { hid: mouse.report });
};

const queue = {
	dx: 0,
	dy: 0,
	flushing: false,
};

const flushQueue = () => {
	if(queue.flushing) return;
	queue.flushing = true;

	const dx = queue.dx;
	const dy = queue.dy;
	queue.dx = 0;
	queue.dy = 0;

	send(dx, dy, null, null, null, () => {
		queue.flushing = false;
	});
};

const draw = () => {
	const W = Bangle.appRect.w;
	const H = Bangle.appRect.h;

  g.clear();

	const img = require("Storage").read("hidmouse.img");
  if (img) g.drawImage(img, W/2, H/2 - 20, {center: true});

  g
		.setFont("6x8", 2)
		.setColor(1, 1, 1)
		.setFontAlign(0,  -1,  0);

  const connected = NRF.getSecurityStatus().connected;
  g.drawString(connected ? "Connected" : "Disconnected",  W/2,  H/2 + 40);
};

Bangle.on("drag", e => { // e: x, y, dx, dy, b
	"ram";
	queue.dx += e.dx * SENSITIVITY;
	queue.dy += e.dy * SENSITIVITY;
	flushQueue();
});

Bangle.on("tap", tap);

setWatch(tap, BTN, { edge: "rising", repeat: true, debounce: 50 });

initBLE();

NRF.on('connect', draw);
NRF.on('disconnect', draw);
draw();
