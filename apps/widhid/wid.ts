(() => {
	const settings = require("Storage").readJSON("setting.json", true) as Settings || ({ HID: false } as Settings);
	if (settings.HID !== "kbmedia") {
		console.log("widhid: can't enable, HID setting isn't \"kbmedia\"");
		return;
	}
	// @ts-expect-error espruino-specific delete
	delete settings;

	let anchor = {x:0,y:0};
	let start = {x:0,y:0};
	let dragging = false;
	let activeTimeout: TimeoutId | undefined;
	let waitForRelease = true;

	const onSwipe = ((_lr, ud) => {
		// do these checks in order of cheapness
		if(ud! > 0 && !activeTimeout && !(Bangle as BangleExt).CLKINFO_FOCUS){
			listen();
			Bangle.buzz(20);
		}
	}) satisfies SwipeCallback;

	const onDrag = (e => {
		// Espruino/35c8cb9be11
		E.stopEventPropagation && E.stopEventPropagation();

		if(e.b === 0){
			// released
			const wasDragging = dragging;
			dragging = false;

			if(waitForRelease){
				waitForRelease = false;
				return;
			}

			if(!wasDragging // i.e. tap
			|| (Math.abs(e.x - anchor.x) < 2 && Math.abs(e.y - anchor.y) < 2))
			{
				toggle();
				onEvent();
				return;
			}
		}
		if(waitForRelease) return;

		if(e.b && !dragging){
			dragging = true;
			setStart(e);
			Object.assign(anchor, start);
			return;
		}

		const dx = e.x - start.x;
		const dy = e.y - start.y;

		if(Math.abs(dy) > 25 && Math.abs(dx) > 25){
			// diagonal, ignore
			setStart(e);
			return;
		}

		// had a drag in a single axis
		if(dx > 40){       next(); onEvent(); waitForRelease = true; }
		else if(dx < -40){ prev(); onEvent(); waitForRelease = true; }
		else if(dy > 30){  down(); onEvent(); setStart(e); }
		else if(dy < -30){ up();   onEvent(); setStart(e); }
	}) satisfies DragCallback;

	const setStart = ({ x, y }: { x: number, y: number }) => {
		start.x = x;
		start.y = y;
	};

	const onEvent = () => {
		Bangle.buzz(20); // feedback event sent
		listen(); // had an event, keep listening for more
	};

	const listen = () => {
		const wasActive = !!activeTimeout;
		if(!wasActive){
			waitForRelease = true; // wait for first touch up before accepting gestures

			Bangle.on("drag", onDrag);

			// move our drag to the start of the event listener array
			const dragHandlers = (Bangle as BangleEvents)["#ondrag"]

			if(dragHandlers && typeof dragHandlers !== "function"){
				(Bangle as BangleEvents)["#ondrag"] = [onDrag as undefined | typeof onDrag].concat(
					dragHandlers.filter((f: unknown) => f !== onDrag)
				);
			}

			redraw();
		}

		if(activeTimeout) clearTimeout(activeTimeout);
		activeTimeout = setTimeout(() => {
			activeTimeout = undefined;

			Bangle.removeListener("drag", onDrag);

			redraw();
		}, 3000);
	};

	const redraw = () => setTimeout(Bangle.drawWidgets, 50);

	const connected = NRF.getSecurityStatus().connected;
	WIDGETS["hid"] = {
		area: "tr",
		sortorder: -20,
		draw: function() {
			if(this.width === 0) return;
			g.drawImage(
				activeTimeout
				? require("heatshrink").decompress(atob("jEYxH+AEfH44XXAAYXXDKIXZDYp3pC/6KHUMwWHC/4XvUy4YGdqoA/AFoA=="))
				: require("heatshrink").decompress(atob("jEYxH+AEcdjoXXAAYXXDKIXZDYp3pC/6KHUMwWHC/4XvUy4YGdqoA/AFoA==")),
				this.x! + 2,
				this.y! + 2
			);
		},
		width: connected ? 24 : 0,
	};

	if(connected)
		Bangle.on("swipe", onSwipe);
	// @ts-expect-error espruino-specific delete
	delete connected;

	NRF.on("connect", () => {
		WIDGETS["hid"]!.width = 24;
		Bangle.on("swipe", onSwipe);
		redraw();
	});
	NRF.on("disconnect", () => {
		WIDGETS["hid"]!.width = 0;
		Bangle.removeListener("swipe", onSwipe);
		redraw();
	});

	//const DEBUG = true;
	const sendHid = (code: number) => {
		//if(DEBUG) return;
		try{
			NRF.sendHIDReport(
				[1, code],
				() => NRF.sendHIDReport([1, 0]),
			);
		}catch(e){
			console.log("sendHIDReport:", e);
		}
	};

	const next = () => /*DEBUG ? console.log("next") : */ sendHid(0x01);
	const prev = () => /*DEBUG ? console.log("prev") : */ sendHid(0x02);
	const toggle = () => /*DEBUG ? console.log("toggle") : */ sendHid(0x10);
	const up = () => /*DEBUG ? console.log("up") : */ sendHid(0x40);
	const down = () => /*DEBUG ? console.log("down") : */ sendHid(0x80);
})()
