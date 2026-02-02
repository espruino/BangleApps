(() => {
	"ram";

	const enum State {
		Asleep,
		Active,
		Connected
	}

	const getState = () => {
		const status = NRF.getSecurityStatus();

		if (status.connected) return State.Connected;
		if (status.advertising) return State.Active;
		return State.Asleep;
	};
	let state = getState();

	const width = () => state > State.Asleep ? 15 : 0;

	const update = (newState: State) => {
		state = newState;
		WIDGETS["bluetooth"]!.width = width();
		setTimeout(Bangle.drawWidgets, 50); // no need for .bind()
	};

	type DarkTheme = `${boolean}`;
	const colours: {
		[key in State.Active | State.Connected]: {
			[key in DarkTheme]: ColorResolvable
		}
	} = {
		[State.Active]: {
			false: "#000",
			true: "#fff",
		},
		[State.Connected]: {
			false: "#00f",
			true: "#0ff",
		},
	};

	WIDGETS["bluetooth"] = {
		area: "tl",
		sortorder: -1,
		draw: function() {
			// sometimes this can change without us getting an event
			state = getState();

			if (state == State.Asleep)
				return;

			g
				.reset()
				.setColor(colours[state][g.theme.dark as unknown as `${boolean}`])
				.drawImage(
					atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="),
					this.x! + 2,
					this.y! + 2
				);
		},
		width: width(),
	};

	NRF.on("connect", update.bind(null, State.Connected));
	NRF.on("disconnect", update.bind(null, State.Active));

	const origWake = NRF.wake;
	const origSleep = NRF.sleep;

	NRF.wake = function() {
		update(State.Active);
		return origWake.apply(this, arguments);
	};

	NRF.sleep = function() {
		update(State.Asleep);
		return origSleep.apply(this, arguments);
	};
})();
