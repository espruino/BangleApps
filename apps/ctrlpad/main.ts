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
				/*bpp*/4,
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
			this.g2
				.reset()
				.setColor(g.theme.bg)
				.fillRect(0, 0, this.width, this.height)
				.setColor(colour.on.bg)
				.drawRect(0, 0, this.width - 1, this.height - 1)
				.drawRect(1, 1, this.width - 2, this.height - 2);
		}
	}

	type ControlCallback = (tap: boolean) => boolean | number;
	type Control = {
		x: number,
		y: number,
		fg: ColorResolvable,
		bg: ColorResolvable,
		text: string,
		cb: ControlCallback,
	};

	const colour = {
		on: {
			fg: "#fff",
			bg: "#00a",
		},
		off: {
			fg: "#000",
			bg: "#bbb",
		},
	} as const;

	type FiveOf<X> = [X, X, X, X, X];
	type ControlTemplate = { text: string, cb: ControlCallback };

	class Controls {
		controls: FiveOf<Control>;

		constructor(g: Graphics, controls: FiveOf<ControlTemplate>) {
			// const connected = NRF.getSecurityStatus().connected;
			// if (0&&connected) {
			// 	// TODO
			// 	return [
			// 		{ text: "<", cb: hid.next },
			// 		{ text: "@", cb: hid.toggle },
			// 		{ text: ">", cb: hid.prev },
			// 		{ text: "-", cb: hid.down },
			// 		{ text: "+", cb: hid.up },
			// 	];
			// }

			const height = g.getHeight();
			const centreY = height / 2;
			const circleGapY = 30;
			const width = g.getWidth();

			this.controls = [
				{ x: width / 4 - 10,   y: centreY - circleGapY },
				{ x: width / 2,        y: centreY - circleGapY },
				{ x: width * 3/4 + 10, y: centreY - circleGapY },
				{ x: width / 3,        y: centreY + circleGapY },
				{ x: width * 2/3,      y: centreY + circleGapY },
			].map((xy, i) => {
				const ctrl = xy as Control;
				const from = controls[i]!;
				ctrl.text = from.text;
				ctrl.cb = from.cb;
				Object.assign(ctrl, from.cb(false) ? colour.on : colour.off);
				return ctrl;
			}) as FiveOf<Control>;
		}

		draw(g: Graphics, single?: Control): void {
			g
				.setFontAlign(0, 0)
				.setFont("4x6:3" as any);

			for(const ctrl of single ? [single] : this.controls){
				g
					.setColor(ctrl.bg)
					.fillCircle(ctrl.x, ctrl.y, 23)
					.setColor(ctrl.fg)
					.drawString(ctrl.text, ctrl.x, ctrl.y);
			}
		}

		hitTest(x: number, y: number): Control | undefined {
			let dist = Infinity;
			let closest;

			for(const ctrl of this.controls){
				const dx = x-ctrl.x;
				const dy = y-ctrl.y;
				const d = Math.sqrt(dx*dx + dy*dy);
				if(d < dist){
					dist = d;
					closest = ctrl;
				}
			}

			return dist < 30 ? closest : undefined;
		}
	}

	const enum State {
		Idle,
		TopDrag,
		IgnoreCurrent,
		Active,
	}
	type UI = { overlay: Overlay, ctrls: Controls };
	let state = State.Idle;
	let startY = 0;
	let startedUpDrag = false;
	let upDragAnim: IntervalId | undefined;
	let ui: undefined | UI;
	let touchDown = false;

	const initUI = () => {
		if (ui) return;

		const controls: FiveOf<ControlTemplate> = [
			{
				text: "BLE",
				cb: tap => {
					const on = NRF.getSecurityStatus().advertising;
					if(tap){
						if(on) NRF.sleep();
						else NRF.wake();
					}
					return on !== tap; // on ^ tap
				}
			},
			{
				text: "DnD",
				cb: tap => {
					let on;
					if((on = !!origBuzz)){
						if(tap){
							Bangle.buzz = origBuzz;
							origBuzz = undefined;
						}
					}else{
						if(tap){
							origBuzz = Bangle.buzz;
							Bangle.buzz = () => Promise.resolve();
							setTimeout(() => {
								if(!origBuzz) return;
								Bangle.buzz = origBuzz;
								origBuzz = undefined;
							}, 1000 * 60 * 10);
						}
					}
					return on !== tap; // on ^ tap
				}
			},
			{
				text: "HRM",
				cb: tap => {
					const id = "widhid";
					const hrm = (Bangle as any)._PWR?.HRM as undefined | Array<string> ;
					const off = !hrm || hrm.indexOf(id) === -1;
					if(off){
						if(tap)
							Bangle.setHRMPower(1, id);
					}else if(tap){
						Bangle.setHRMPower(0, id);
					}
					return !off !== tap; // on ^ tap
				}
			},
			{
				text: "clk",
				cb: tap => {
					if (tap) Bangle.showClock(), terminateUI();
					return true;
				},
			},
			{
				text: "lch",
				cb: tap => {
					if (tap) Bangle.showLauncher(), terminateUI();
					return true;
				},
			},
		];

		const overlay = new Overlay();
		ui = {
			overlay,
			ctrls: new Controls(overlay.g2, controls),
		};
		ui.ctrls.draw(ui.overlay.g2);
	};

	const terminateUI = () => {
		state = State.Idle;
		ui?.overlay.hide();
		ui = undefined;
	};

	const onSwipe = () => {
		switch (state) {
			case State.Idle:
			case State.IgnoreCurrent:
				return;

			case State.TopDrag:
			case State.Active:
				E.stopEventPropagation?.();
		}
	};
	Bangle.prependListener('swipe', onSwipe);

	const onDrag = (e => {
		const dragDistance = 30;

		if (e.b === 0) touchDown = startedUpDrag = false;

		switch (state) {
			case State.IgnoreCurrent:
				if(e.b === 0)
					state = State.Idle;
				break;

			case State.Idle:
				if(e.b && !touchDown){ // no need to check Bangle.CLKINFO_FOCUS
					if(e.y <= 40){
						state = State.TopDrag
						startY = e.y;
						E.stopEventPropagation?.();
						//console.log("  topdrag detected, starting @ " + startY);
					}else{
						//console.log("  ignoring this drag (too low @ " + e.y + ")");
						state = State.IgnoreCurrent;
					}
				}
				break;

			case State.TopDrag:
				if(e.b === 0){
					//console.log("topdrag stopped, distance: " + (e.y - startY));
					if(e.y > startY + dragDistance){
						//console.log("activating");
						initUI();
						state = State.Active;
						startY = 0;
						Bangle.prependListener("touch", onTouch);
						Bangle.buzz(20);
						ui!.overlay.setBottom(g.getHeight());
					}else{
						//console.log("returning to idle");
						terminateUI();
						break; // skip stopEventPropagation
					}
				}else{
					// partial drag, show UI feedback:
					const dragOffset = 32;

					initUI();
					ui!.overlay.setBottom(e.y - dragOffset);
				}
				E.stopEventPropagation?.();
				break;

			case State.Active:
				//console.log("stolen drag handling, do whatever here");
				E.stopEventPropagation?.();
				if(e.b){
					if(!touchDown){
						startY = e.y;
					}else if(startY){
						const dist = Math.max(0, startY - e.y);

						if (startedUpDrag || (startedUpDrag = dist > 10)) // ignore small drags
							ui!.overlay.setBottom(g.getHeight() - dist);
					}
				}else if(e.b === 0){
					if((startY - e.y) > dragDistance){
						let bottom = g.getHeight() - Math.max(0, startY - e.y);

						if (upDragAnim) clearInterval(upDragAnim);
						upDragAnim = setInterval(() => {
							if (!ui || bottom <= 0) {
								clearInterval(upDragAnim!);
								upDragAnim = undefined;
								terminateUI();
								return;
							}
							ui.overlay.setBottom(bottom);
							bottom -= 30;
						}, 50)

						Bangle.removeListener("touch", onTouch);
						state = State.Idle;
					}else{
						ui!.overlay.setBottom(g.getHeight());
					}
				}
				break;
		}
		if(e.b) touchDown = true;
	}) satisfies DragCallback;

	const onTouch = ((_btn, xy) => {
		if(!ui || !xy) return;

		const top = g.getHeight() - ui.overlay.height; // assumed anchored to bottom
		const left = (g.getWidth() - ui.overlay.width) / 2; // more assumptions

		const ctrl = ui.ctrls.hitTest(xy.x - left, xy.y - top);
		if(ctrl){
			onCtrlTap(ctrl, ui);
			E.stopEventPropagation?.();
		}
	}) satisfies TouchCallback;

	let origBuzz: undefined | (() => Promise<void>);
	const onCtrlTap = (ctrl: Control, ui: UI) => {
		Bangle.buzz(20);

		const col = ctrl.cb(true) ? colour.on : colour.off;
		ctrl.fg = col.fg;
		ctrl.bg = col.bg;
		//console.log("hit on " + ctrl.text + ", col: " + ctrl.fg);

		ui.ctrls.draw(ui.overlay.g2, ctrl);
	};

	Bangle.prependListener("drag", onDrag);
	Bangle.on("lock", terminateUI);


	/*
	const settings = require("Storage").readJSON("setting.json", true) as Settings || ({ HID: false } as Settings);
	const haveMedia = settings.HID === "kbmedia";
	// @ts-ignore
	delete settings;

	const sendHid = (code: number) => {
		try{
			NRF.sendHIDReport(
				[1, code],
				() => NRF.sendHIDReport([1, 0]),
			);
		}catch(e){
			console.log("sendHIDReport:", e);
		}
	};

	const hid = haveMedia ? {
		next: () => sendHid(0x01),
		prev: () => sendHid(0x02),
		toggle: () => sendHid(0x10),
		up: () => sendHid(0x40),
		down: () => sendHid(0x80),
	} : null;
	*/
})()
