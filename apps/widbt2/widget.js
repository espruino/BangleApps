(function(){
	"ram";

	// 0: asleep, 1: active, 2: connected
	let state = NRF.getSecurityStatus().connected
		? 2
		: 0; // could be active, assuming not here

	const width = () => state > 0 ? 15 : 0;

	const update = (newState) => {
		state = newState;
		WIDGETS.bluetooth.width = width();
		setTimeout(Bangle.drawWidgets, 50); // no need for .bind()
	};

	// { {key: State]: { boolean: string } }
	//                   ^ dark theme
	const colours = {
		1: { // active: white
			false: "#fff",
			true: "#fff",
		},
		2: { // connected: blue
			false: "#0ff",
			true: "#00f",
		},
	};

	WIDGETS.bluetooth = {
		area: "tl",
		sortorder: -1,
		draw: function() {
			if (state == 0)
				return;

			g.reset();

			g.setColor(colours[state][g.theme.dark]);

			g.drawImage(
				atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="),
				this.x + 2,
				this.y + 2
			);
		},
		width: width(),
	};

	NRF.on("connect", update.bind(null, 2));
	NRF.on("disconnect", update.bind(null, 1));

	let origWake = NRF.wake;
	let origSleep = NRF.sleep;

	NRF.wake = function() {
		update(1);
		return origWake.apply(this, arguments);
	};

	NRF.sleep = function() {
		update(0);
		return origSleep.apply(this, arguments);
	};
})();
