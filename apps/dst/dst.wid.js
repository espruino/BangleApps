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
		ans = 365*y + (y>>2) - ans + (ans>>2) + 30*m + (((3*m+6)/5)|0) + d - 719531;
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
		ans -= data.day_offset;
		// Now - the GMT of the time of day the change happens
		ans = (ans * 86400) + (data.at - other_offset) * 3600;
// console.log("DST change second : " + ans);
		return ans * 1000;
	}
	
	function setCurrentEffectiveTimezone(tz) {
		var settings = require("Storage").readJSON("setting.json");
		if (settings) {
			if (settings.timezone != tz) {
				//
				// NB  I MAY NEED TO CALL reset() IN ORDER THAT THE NEW "TIMEZONE" TAKE EFFECT
				// ===========================================================================
				//
				settings.timezone = tz;
				require("Storage").writeJSON("setting.json", settings);
			}
		}
	}
	
	function updateNextDstChange(settings) {
		if (settings.has_dst) {
			var now = new Date();
			var start = dstChangeTime(now.getFullYear(), settings.tz, settings.dst_start);
			var end = dstChangeTime(now.getFullYear(), settings.tz + settings.dst_size, settings.dst_end);
			if (start <= now.getTime()) {
				if (end <= now.getTime()) {
					// Both changes have happened for this year
					if (start < end) {
						// The start of DST is earlier than the end, so next change is a start of DST
						next_dst_change = { millis: dstChangeTime(now.getFullYear()+1, settings.tz, settings.dst_start), offset: settings.tz + settings.dst_size, is_start: true };
						setEffectiveTimezone(settings.tz);
					} else {
						// The end of DST is earlier than the start, so the next change is an end of DST
						next_dst_change = { millis: dstChangeTime(now.getFullYear()+1, settings.tz + settings.dst_size, settings.dst_end), offset: settings.tz, is_start: false };
						setEffectiveTimezone(settings.tz + settings.dst_size);
					}
				} else {
					next_dst_change = { millis: end, offset: settings.tz, is_start: false };
					setEffectiveTimezone(settings.tz + settings.dst_size);
				}
			} else {
				next_dst_change = { millis: start, offset: settings.tz + settings.dst_size, is_start: true };
				setEffectiveTimezone(settings.tz);
			}
			next_dst_change.show_icon = settings.show_icon;
// console.log("Next DST change : " + JSON.stringify(next_dst_change));
		} else {
			next_dst_change = undefined;
		}
	}

	// Update the cached information we keep
	function doUpdate() {
		var settings = require("Storage").readJSON("dst.json");
		if (settings) {
			var now = new Date();
			updateNextDstChange(settings);
		} else {
			next_dst_change = undefined;
		}
		rescheduleCheckForDSTChange();
	}
	
	function update() {
		doUpdate();
		draw();
	}
	
	function clear() {
		if (this.width) {
			this.width = 0;
			Bangle.drawWidgets();
		}
	}
	
	function draw() {
// console.log("draw()");
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
// console.log("Checking for DST change");
		if (next_dst_change) {
			rescheduleCheckForDSTChange();
			if (getTime() > next_dst_change.millis) {
				var dstSettings = require("Storage").readJSON("dst.json");
				if (dstSettings) {
					updateNextDstChange(dstSettings);
					setEffectiveTimezone(next_dst_change.offset);
				} else {
					next_dst_change = undefined;
				}
				draw();
			}
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

// console.log("Registering DST widget");

	WIDGETS["dst"] = {
		area: "tl",
		width: 0,
		draw: draw
	};		

	doUpdate();

})();
