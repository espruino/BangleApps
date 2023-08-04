(() => {
    if(!Bangle.prependListener){
        type Event<T> = T extends `#on${infer Evt}` ? Evt : never;

        Bangle.prependListener = function(
            evt: Event<keyof BangleEvents>,
            listener: () => void
        ){
            // move our drag to the start of the event listener array
            const handlers = (Bangle as BangleEvents)[`#on${evt}`]

            if(handlers && typeof handlers !== "function"){
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

            const centreY = this.height / 2;
            const circleGapY = 30;

            g
                .setFontAlign(0, 0)
                .setFont("Vector:20");

            this.drawCtrl(this.width / 4 - 10,   centreY - circleGapY, "<");
            this.drawCtrl(this.width / 2,        centreY - circleGapY, "@");
            this.drawCtrl(this.width * 3/4 + 10, centreY - circleGapY, ">");

            this.drawCtrl(this.width / 3,   centreY + circleGapY, "-");
            this.drawCtrl(this.width * 2/3, centreY + circleGapY, "+");
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
		NoConn,
		Idle,
		TopDrag,
		IgnoreCurrent,
		Active,
	}
	let state = State.NoConn;
	let startY = 0;
    let overlay: Overlay | undefined;
    let touchDown = false;

	const onDrag = (e => {
        const dragDistance = 30;

        if (e.b === 0) touchDown = false;

		switch (state) {
			case State.NoConn:
				break;

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
                        activate();
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

                        overlay!.setBottom(g.getHeight() - dist);
                    }
                }else if(e.b === 0 && startY > dragDistance){
                    deactivate();
                }
                break;
		}
        if(e.b) touchDown = true;
	}) satisfies DragCallback;

    const onTouch = ((_btn, _xy) => {
        // TODO: button presses
    }) satisfies TouchCallback;

    const activate = () => {
        state = State.Active;
        startY = 0;
        Bangle.prependListener("touch", onTouch);
        Bangle.buzz(20);
        overlay!.setBottom(g.getHeight());
    };

    const deactivate = () => {
        Bangle.removeListener("touch", onTouch);
        state = State.Idle;
        overlay?.hide();
    };

    Bangle.prependListener("drag", onDrag);

	const redraw = () => setTimeout(Bangle.drawWidgets, 10);

	const connected = NRF.getSecurityStatus().connected;
	WIDGETS["hid"] = {
		area: "tr",
		sortorder: -20,
		draw: function() {
			if(this.width === 0) return;
			g.drawImage(
				state === State.Active
				? require("heatshrink").decompress(atob("jEYxH+AEfH44XXAAYXXDKIXZDYp3pC/6KHUMwWHC/4XvUy4YGdqoA/AFoA=="))
				: require("heatshrink").decompress(atob("jEYxH+AEcdjoXXAAYXXDKIXZDYp3pC/6KHUMwWHC/4XvUy4YGdqoA/AFoA==")),
				this.x! + 2,
				this.y! + 2
			);
		},
		width: connected ? 24 : 0,
	};

	state = connected ? State.Idle : State.NoConn;

	// @ts-ignore
	delete connected;

	NRF.on("connect", () => {
		WIDGETS["hid"]!.width = 24;
		state = State.Idle;
		redraw();
	});
	NRF.on("disconnect", () => {
		WIDGETS["hid"]!.width = 0;
		state = State.NoConn;
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

    const hid = {
		next: () => /*DEBUG ? console.log("next") : */ sendHid(0x01),
		prev: () => /*DEBUG ? console.log("prev") : */ sendHid(0x02),
		toggle: () => /*DEBUG ? console.log("toggle") : */ sendHid(0x10),
		up: () => /*DEBUG ? console.log("up") : */ sendHid(0x40),
		down: () => /*DEBUG ? console.log("down") : */ sendHid(0x80),
    };
})()
