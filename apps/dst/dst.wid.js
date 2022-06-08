(() => {

	function dayNumber(y, m, d) {
		var ans;
		if (m < 2) {
			y--;
			m+=12;
		}
		ans = (y/100)|0;
		ans = 365*y + (y>>2) - ans + (ans>>2) + 30*m + (((3*m+3)/5)|0) + d - 719530;
		return ans;
	};
	
	// y is the year
	// other_offset is the timezone offset of the other change (e.g. the offset in force before this change)
	// data is the dst_start or dst_end from the dst settings
	function dstChangeTime(y, other_offset, data) {
		var m = data.month;
		var ans;
		if (data.dow_number == 4) { // last X of this month? Work backwards from 1st of next month.
			if (++m > 11) {
				y++;
				m-=12;
			}
		}
		ans = dayNumber(y, m, 1); // ans % 7 is 0 for THU; (ans + 4) % 7 is 0 for SUN
		if (data.dow_number == 4) {
			ans -= 7 - (7 - ((ans + 4) % 7) + data.dow) % 7;
		} else {
			ans += 7 * data.dow_number + (14 + data.dow - ((ans + 4) % 7)) % 7;
		}
		if (data.day_offset) {
			ans -= 7 - ((7 + data.day_offset - data.dow) % 7);
		}
		// Now - the GMT of the time of day the change happens
	}




	WIDGETS["DST"] = {
		area: "tr",
		width: 24,
		draw: draw
	};

})();
