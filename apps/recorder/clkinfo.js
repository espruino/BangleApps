(function () {
	const recimg = () =>
		require("heatshrink").decompress(atob("jEYxH+AHHCAAgVQ4fDCwYFCCpotFDQgZJCxYYLCxgYCOJgALFygwHLpphJIyJIFC9O72oXU3m02h3UC4O7U6m7FwhIQIwwwPCxJhMCwSNEDBm83hbBCxQZEDQQUCIhIZIAAO1UAwAzA="));

	const pauseimg = () => ({
		palette: new Uint16Array([0, g.theme.fg]),
		buffer: require("heatshrink").decompress(atob("jEYxH+AH4Am64ABAxQWLCIYGGC6AHEF9QX/C/4X/C64HEF8YRDAxQA/AEQA=")),
		width: 16,
		height: 20,
	});

	return {
		name: "Bangle",
		items: WIDGETS["recorder"] ? [
			{
				name: "Toggle",
				get: () => WIDGETS["recorder"].isRecording() ? {
					text: "Recording",
					short: "rec",
					img: recimg(),
				} : {
					text: "Paused",
					short: "paused",
					img: pauseimg(),
				},
				run: () => {
					const w = WIDGETS["recorder"];
					Bangle.buzz();
					w.setRecording(!w.isRecording(), { force: "append" });
				},
				show: () => {},
				hide: () => {},
			},
		] : [],
	};
});
