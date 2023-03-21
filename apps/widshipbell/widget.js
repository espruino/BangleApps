(() => {
	const strength = Object.assign({
		strength: 1,
	}, require('Storage').readJSON("widshipbell.json", true) || {}).strength;

	function replaceAll(target, search, replacement) {
		return target.split(search).join(replacement);
	}

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
				pattern = '.. .. .. ..';
			} else if (strikeHour === 0 && currentMinute === 30) {
				pattern = '.';
			} else if (strikeHour === 1 && currentMinute === 0) {
				pattern = '..';
			} else if (strikeHour === 1 && currentMinute === 30) {
				pattern = '.. .';
			} else if (strikeHour === 2 && currentMinute === 0) {
				pattern = '.. ..';
			} else if (strikeHour === 2 && currentMinute === 30) {
				pattern = '.. .. .';
			} else if (strikeHour === 3 && currentMinute === 0) {
				pattern = '.. .. ..';
			} else if (strikeHour === 3 && currentMinute === 30) {
				pattern = '.. .. .. .';
			}
			pattern = replaceAll(pattern, ' ', '    '); // 4x pause
			pattern = replaceAll(pattern, '.', '. '); // pause between bells
			if (strength === 2) { // strong selected
				pattern = replaceAll(pattern, '.', ':');
			}
			require("buzz").pattern(pattern);
		}

		const etaSecond = etaMinute*60-currentSecond;
		setTimeout(check, etaSecond*1000);
	}

	if (strength !== 0) {
		check();
	}
})();
