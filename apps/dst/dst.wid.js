(() => {

    var next_dst_change = undefined;
	var check_timeout = undefined;

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
	// other_offset is the timezone offset (in hours) of the other change (e.g. the offset in force before this change)
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
		ans = (ans * 86400) + (data.at - other_offset) * 3600;
		// NB we set the time of the change to 999ms *before* the time it's technically due to happen
console.log("DST change second : " + ans);
		return (ans * 1000) - 999;
	}
	
	function updateNextDstChange(settings) {
		var now = new Date();
		var start = dstChangeTime(now.getFullYear(), settings.tz, settings.dst_start);
		var end = dstChangeTime(now.getFullYear(), settings.tz + settings.dst_size, settings.dst_end);
		// Since the time of the change is 999ms before the technical time, we add 1000ms to the "current" time. Helps with race conditions...
		if (start < now.getTime() + 1000) {
			if (end < now.getTime() + 1000) {
				// Both changes have happened for this year
				if (start < end) {
					// The start of DST is earlier than the end, so next change is a start of DST
					next_dst_change = { millis: dstChangeTime(now.getFullYear()+1, settings.tz, settings.dst_start), offset: settings.tz + settings.dst_size, is_start: true };
				} else {
					// The end of DST is earlier than the start, so the next change is an end of DST
					next_dst_change = { millis: dstChangeTime(now.getFullYear()+1, settings.tz + settings.dst_size, settings.dst_end), offset: settings.tz, is_start: false };
				}
			} else {
				next_dst_change = { millis: end, offset: settings.tz, is_start: false };
			}
		} else {
			next_dst_change = { millis: start, offset: settings.tz + settings.dst_size, is_start: true };
		}
		next_dst_change.show_icon = settings.show_icon;
console.log("Next DST change : " + next_dst_change);
	}

	// Update the cached information we keep
	function update() {
		var settings = require("Storage").readJSON("dst.json");
		if (settings) {
			var now = new Date();
			updateNextDstChange(settings);
		} else {
			next_dst_change = undefined;
		}
		rescheduleCheckForDSTChange();
		draw();
	}
	
	function clear() {
		if (this.width) {
			this.width = 0;
			Bangle.drawWidgets();
		}
	}
	
	function draw() {
console.log("draw()");
		if (next_dst_change) {
			if ((next_dst_change.is_start) || (!next_dst_change.show_icon)) {
				clear();
			} else {
				if (this.width) {
					g.drawImage(
						{
							width : 24, height : 24, bpp : 1, palette: new Uint16Array([g.theme.bg, g.theme.fg]),
							buffer : atob("AAAAAAAAPAAAIgAAIQAAIQAAIQAAIQAAIngAPIQAAIAAAPAAAAwAAAQAAIX8AHggAAAgAAAgAAAgAAAgAAAgAAAgAAAAAAAA")
						}, this.x, this.y
					);
				} else {
					this.width = 24;
					Bangle.drawWidgets();
				}
			}
		} else {
			clear();
		}
	}

    function checkForDSTChange() {
console.log("Checking for DST change");
		if (next_dst_change) {
			if (getTime() > next_dst_change.millis) {
				var dstSettings = require("Storage").readJSON("dst.json");
				if (dstSettings) {
					var settings = require("Storage").readJSON("settings.json");
					if (settings) {
						settings.timezone = next_dst_change.offset;
						require("Storage").writeJSON("settings.json");
					}
					updateNextDstChange(dstSettings);
				} else {
					next_dst_change = undefined;
				}
				draw();
			}
			rescheduleCheckForDSTChange();
		}
	}
	
	function rescheduleCheckForDSTChange() {
		if (check_timeout) clearTimeout(check_timeout);
		check_timeout = undefined;
		if (next_dst_change) {
			check_timeout = setTimeout( function() {
				check_timeout = undefined;
				checkForDSTChange();
			}, (next_dst_change.millis - getTime()) % 14400000 + 500); // Check every 4 hours.
		}
	}

    if (!WIDGETS["DST"]) {
console.log("Registering DST widget");
		WIDGETS["DST"] = {
			area: "tl",
			width: 24,
			draw: draw
		};		
		check_timeout = setTimeout(update, 500); // Give 500ms for things to settle
	}

})();
