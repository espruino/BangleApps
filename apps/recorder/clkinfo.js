(function () {
	const recimg = () =>
		atob("GBiBAAAAABwAAD4MAH8eAH8OAH8AAD4QABx8AAD8AAH+AAE+AAM/AAN7wAN4wAB4AAB8AAD8AADOAAHGAAOHAAMDAAIBAAAAAAAAAA==");

	const pauseimg = () =>
		atob("GBiBAAAAAAAAAAAAAAAAAAHDgAPnwAPjwAPnwAPnwAPnwAPnwAPnwAPnwAPnwAPnwAPnwAPnwAPjwAPnwAHDgAAAAAAAAAAAAAAAAA==");

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
