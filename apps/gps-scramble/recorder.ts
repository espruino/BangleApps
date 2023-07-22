((recorders: Recorders) => {
	// @ts-ignore helper
	const __assign = Object.assign;

	const pacific = { lat: -4.21, lon: -146.25 };

	// @ts-ignore index signature
	const gpsRecorder = recorders.gps;
	if (!gpsRecorder) return;

	// @ts-ignore index signature
	recorders.gpsScramble = () => {
		const gps = gpsRecorder();
		let offset: undefined | [number, number];

		return {
			...gps,
			name: "GPS (scramble)",
			getValues: () => {
				const values = gps.getValues() as string[];

				if (!values[0]!.length) {
					// no change
				} else if (offset) {
					values[0] = (Number(values[0]) + offset[0]).toFixed(6);
					values[1] = (Number(values[1]) + offset[1]).toFixed(6);
				} else {
					offset = [
						pacific.lat - Number(values[0]),
						pacific.lon - Number(values[1]),
					];
					values[0] = "" + pacific.lat;
					values[1] = "" + pacific.lon;
				}

				return values;
			},
		};
	};
})
