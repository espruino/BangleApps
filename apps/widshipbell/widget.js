(() => {
	var settings = Object.assign({
		enabled: true,
	}, require('Storage').readJSON("widshipbell.json", true) || {});

	function check() {
		const now = new Date();
		const currentMinute = now.getMinutes();
		const currentSecond = now.getSeconds();
		const etaMinute = 30-(currentMinute % 30);

		if (etaMinute === 30 && currentSecond === 0) {
			const strikeHour = now.getHours() % 4;
			// buzz now
			let pattern='';
			if (strikeHour === 0 && currentMinute == 0) {
				pattern = '..  ..  ..  ..';
			} else if (strikeHour === 0 && currentMinute == 30) {
				pattern = '.';
			} else if (strikeHour === 1 && currentMinute == 0) {
				pattern = '..';
			} else if (strikeHour === 1 && currentMinute == 30) {
				pattern = '..  .';
			} else if (strikeHour === 2 && currentMinute == 0) {
				pattern = '..  ..';
			} else if (strikeHour === 2 && currentMinute == 30) {
				pattern = '..  ..  .';
			} else if (strikeHour === 3 && currentMinute == 0) {
				pattern = '..  ..  ..';
			} else if (strikeHour === 3 && currentMinute == 30) {
				pattern = '..  ..  ..  .';
			}
			require("buzz").pattern(pattern);
		}

		const etaSecond = etaMinute*60-currentSecond;
		setTimeout(check, etaSecond*1000);
	}

	if (settings.enabled === true) {
		check();
	}
})();
