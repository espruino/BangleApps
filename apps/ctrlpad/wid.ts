(() => {
	if(!Bangle.prependListener){
		type Event<T> = T extends `#on${infer Evt}` ? Evt : never;

		Bangle.prependListener = function(
			evt: Event<keyof BangleEvents>,
			listener: () => void
		){
			// move our drag to the start of the event listener array
			const handlers = (Bangle as BangleEvents)[`#on${evt}`]

			if(!handlers){
				Bangle.on(evt as any, listener);
			}else{
				if(typeof handlers === "function"){
					// get Bangle to convert to array
					Bangle.on(evt as any, listener);
				}

				// shuffle array
				(Bangle as BangleEvents)[`#on${evt}`] = [listener as any].concat(
					(handlers as Array<any>).filter((f: unknown) => f !== listener)
				);
			}
		};
	}

	type Control = {
		text: string,
		cb: () => void,
	};

	class Overlay {
		g2: Graphics;
		width: number;
		height: number;

		constructor() {
			// x padding: 10 each side
			// y top: 24, y bottom: 10
			this.width = g.getWidth() - 10 * 2;
			this.height = g.getHeight() - 24 - 10;

			this.g2 = Graphics.createArrayBuffer(
				this.width,
				this.height,
				/*bpp*/1,
				{ msb: true }
			);

			this.renderG2();
		}

		setBottom(bottom: number): void {
			const { g2 } = this;
			const y = bottom - this.height;

			Bangle.setLCDOverlay(g2, 10, y - 10);
		}

		hide(): void {
			Bangle.setLCDOverlay();
		}

		renderG2(): void {
			const g = this.g2;

			g
				.reset()
				.clearRect(0, 0, this.width, this.height)
				.drawRect(0, 0, this.width - 1, this.height - 1)
				.drawRect(1, 1, this.width - 2, this.height - 2);

			g
				.setFontAlign(0, 0)
				.setFont("Vector:20");

			this.drawCtrls();
		}

		drawCtrls(): void {
			const centreY = this.height / 2;
			const circleGapY = 30;

			const controls = getControls();

			this.drawCtrl(this.width / 4 - 10,   centreY - circleGapY, controls[0].text);
			this.drawCtrl(this.width / 2,        centreY - circleGapY, controls[1].text);
			this.drawCtrl(this.width * 3/4 + 10, centreY - circleGapY, controls[2].text);

			this.drawCtrl(this.width / 3,   centreY + circleGapY, controls[3].text);
			this.drawCtrl(this.width * 2/3, centreY + circleGapY, controls[4].text);
		}

		drawCtrl(x: number, y: number, label: string): void {
			const g = this.g2;

			g
			.setColor("#fff")
			.fillCircle(x, y, 23)
			.setColor("#000")
			.drawString(label, x, y);
		}
	}

	const settings = require("Storage").readJSON("setting.json", true) as Settings || ({ HID: false } as Settings);
	if (settings.HID !== "kbmedia") {
		console.log("widhid: can't enable, HID setting isn't \"kbmedia\"");
		return;
	}
	// @ts-ignore
	delete settings;

	const enum State {
		Idle,
		TopDrag,
		IgnoreCurrent,
		Active,
	}
	let state = State.Idle;
	let startY = 0;
	let startedUpDrag = false;
	let upDragAnim: IntervalId | undefined;
	let overlay: Overlay | undefined;
	let touchDown = false;

	type Controls = [Control, Control, Control, Control, Control];
	const getControls = (): Controls => {
		const connected = NRF.getSecurityStatus().connected;

		if (connected) {
			return [
				{ text: "<", cb: hid.next },
				{ text: "@", cb: hid.toggle },
				{ text: ">", cb: hid.prev },
				{ text: "-", cb: hid.down },
				{ text: "+", cb: hid.up },
			];
		}
		return [
			{ text: "a", cb: () => {} },
			{ text: "b", cb: () => {} },
			{ text: "c", cb: () => {} },
			{ text: "d", cb: () => {} },
			{ text: "e", cb: () => {} },
		];
	};

	const onDrag = (e => {
		const dragDistance = 30;

		if (e.b === 0) touchDown = startedUpDrag = false;

		switch (state) {
			case State.IgnoreCurrent:
				if(e.b === 0){
					state = State.Idle;
					overlay = undefined;
				}
				break;

			case State.Idle:
				if(e.b && !touchDown){ // no need to check Bangle.CLKINFO_FOCUS
					if(e.y <= 40){
						state = State.TopDrag
						startY = e.y;
						console.log("  topdrag detected, starting @ " + startY);
					}else{
						console.log("  ignoring this drag (too low @ " + e.y + ")");
						state = State.IgnoreCurrent;
						overlay = undefined
					}
				}
				break;

			case State.TopDrag:
				if(e.b === 0){
					console.log("topdrag stopped, distance: " + (e.y - startY));
					if(e.y > startY + dragDistance){
						console.log("activating");
						state = State.Active;
						startY = 0;
						Bangle.prependListener("touch", onTouch);
						Bangle.buzz(20);
						overlay!.setBottom(g.getHeight());
						break;
					}
					console.log("returning to idle");
					state = State.Idle;
					overlay?.hide();
					overlay = undefined;
				}else{
					// partial drag, show UI feedback:
					const dragOffset = 32;

					if (!overlay) overlay = new Overlay();
					overlay.setBottom(e.y - dragOffset);
				}
				break;

			case State.Active:
				console.log("stolen drag handling, do whatever here");
				E.stopEventPropagation?.();
				if(e.b){
					if(!touchDown){
						startY = e.y;
					}else if(startY){
						const dist = Math.max(0, startY - e.y);

						if (startedUpDrag || (startedUpDrag = dist > 10)) // ignore small drags
							overlay!.setBottom(g.getHeight() - dist);
					}
				}else if(e.b === 0 && startY > dragDistance){
					let bottom = g.getHeight() - Math.max(0, startY - e.y);

					if (upDragAnim) clearInterval(upDragAnim);
					upDragAnim = setInterval(() => {
						if (!overlay || bottom <= 0) {
							clearInterval(upDragAnim!);
							upDragAnim = undefined;
							overlay?.hide();
							overlay = undefined;
							return;
						}
						overlay?.setBottom(bottom);
						bottom -= 10;
					}, 50)

					Bangle.removeListener("touch", onTouch);
					state = State.Idle;
				}
				break;
		}
		if(e.b) touchDown = true;
	}) satisfies DragCallback;

	const onTouch = ((_btn, _xy) => {
		// TODO: button presses
	}) satisfies TouchCallback;

	Bangle.prependListener("drag", onDrag);

	WIDGETS["hid"] = {
		area: "tr",
		sortorder: -20,
		draw: () => {},
		width: 0,
	};

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

	const hid = {
		next: () => sendHid(0x01),
		prev: () => sendHid(0x02),
		toggle: () => sendHid(0x10),
		up: () => sendHid(0x40),
		down: () => sendHid(0x80),
	};
})()
