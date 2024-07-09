type PowerUsage = {
	usage: number,
	hrsLeft: number,
	batt: number, // battery percentage
};

type PowerUsageModule = {
	get: () => PowerUsage,
};

exports.get = (): PowerUsage => {
		const pwr = E.getPowerUsage();
		const batt = E.getBattery();
		let usage = 0;
		for(const key in pwr.device){
			if(!/^(LCD|LED)/.test(key))
				usage += pwr.device[key];
		}

		// 175mAh, scaled based on battery (batt/100), scaled down based on usage
		const hrsLeft = 175000 * batt / (100 * usage);

		return {
			usage,
			hrsLeft,
			batt,
		};
};
