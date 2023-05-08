(() => {
	const settings: Settings = require('Storage').readJSON('setting.json', true) || { HID: false } as Settings;
	if (settings.HID !== "kbmedia") {
		console.log("widhid: can't enable, HID setting isn't \"kbmedia\"");
		return;
	}

	let start = {x:0,y:0}, end = {x:0,y:0};
	let dragging = false;
	let activeTimeout: number | undefined;

	Bangle.on("swipe", (_lr, ud) => {
		if(ud! > 0){
			listen();
			Bangle.buzz();
		}
	});

	Bangle.on('drag', e => {
		if(!activeTimeout) return;

		if(!dragging){
			dragging = true;
			start.x = e.x;
			start.y = e.y;
			return;
		}

		const released = e.b === 0;
		if(released){
			const dx = end.x - start.x;
			const dy = end.y - start.y;

			if(Math.abs(dy) < 10){
				if(dx > 40) next();
				else if(dx < 40) prev();
			}else if(Math.abs(dx) < 10){
				if(dy > 40) down();
				else if(dy < 40) up();
			}else if(dx === 0 && dy === 0){
				toggle();
			}
			Bangle.buzz(); // feedback event sent

			listen(); // had an event, keep listening for more
			return;
		}

		end.x = e.x;
		end.y = e.y;
	});

	const listen = () => {
		suspendOthers();

		const wasActive = !!activeTimeout;

		clearTimeout(activeTimeout);
		activeTimeout = setTimeout(() => {
			activeTimeout = undefined;
			resumeOthers();
			redraw();
		}, 5000);

		if(!wasActive) redraw();
	};

	WIDGETS["hid"] = {
		area: "tr",
		sortorder: -20,
		draw: function() {
			g.drawImage(
				activeTimeout
				? require("heatshrink").decompress(atob("mEwxH+AH4A/AH4A/AG8gkAvvAAYvvGVIvIGcwvMGMQv/F/4vTGpQvmNJAvqBggvtAEQv/F/4v/F/4nbFIYvlFooAHF1wvgFxwvfFx4v/Fz4v/F/4v/F/4wfFzwvwGBwugGBouiGBYukGJAtnAH4A/AH4A/ACIA=="))
				: require("heatshrink").decompress(atob("mEwxH+AH4A/AH4A/AG9lsovvAAYvvGVIvIGcwvMGMQv/F/4vTGpQvmNJAvqBggvtAEQv/F/4v/F/4nbFIYvlFooAHF1wvgFxwvfFx4v/Fz4v/F/4v/F/4wfFzwvwGBwugGBouiGBYukGJAtnAH4A/AH4A/ACIA==")),
				this.x! + 2,
				this.y! + 2
			);
		},
		width: 24,
	};

	const redraw = () => setTimeout(Bangle.drawWidgets, 50);

	NRF.on("connect", () => {
		WIDGETS["hid"]!.width = 24;
		redraw();
	});
	NRF.on("disconnect", () => {
		WIDGETS["hid"]!.width = 0;
		redraw();
	});

	const sendHid = (code: number) => {
		NRF.sendHIDReport(
			[1, code],
			() => NRF.sendHIDReport([1, 0]),
		);
	};

	const next = () => sendHid(0x01);
	const prev = () => sendHid(0x02);
	const toggle = () => sendHid(0x10);
	const up = () => sendHid(0x40);
	const down = () => sendHid(0x80);

	const suspendOthers = () => {
		const swipeHandler = (Bangle as {swipeHandler?: () => void}).swipeHandler;
		if(swipeHandler)
			Bangle.removeListener("swipe", swipeHandler); // swiperclocklaunch
	};
	const resumeOthers = () => {
		const swipeHandler = (Bangle as {swipeHandler?: () => void}).swipeHandler;
		if(swipeHandler)
			Bangle.on("swipe", swipeHandler);
	};
})()
