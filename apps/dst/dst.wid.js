(() => {

	// We cache information in next_dst_change.
	// next_dst_change = {millis: (the GMT millis since 1970 that the DST state next changes),
	//                    offset: (the timezone we will be in when that state changes, in hours),
	//                    is_start: (true if the change will be the start of DST, false if it will be the end),
	//                    show_icon: (true if we should show our little "dst" icon in the widget area when DST is in effect)
	//                   }
    var next_dst_change = undefined;
	var check_timeout = undefined;
	var dst_update_timeout = undefined;

	// Calculates the number of days since 1970 of the given date
	function dayNumber(y, m, d) {
		var ans;
		if (m < 2) {
			y--;
			m+=12;
		}
		ans = (y/100)|0;
		ans = 365*y + (y>>2) - ans + (ans>>2) + 30*m + (((3*m+6)/5)|0) + d - 719531;
		return ans;
	}
	
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
		ans = (ans * 86400) + (data.at - other_offset) * 3600;
		return ans * 1000;
	}

	// Set the effective timezone - may generate a mini reboot!
	function setCurrentEffectiveTimezone(tz) {
		var storage = require("Storage");
		var settings = storage.readJSON("setting.json");
		if (settings) {
			if (settings.timezone != tz) {
				settings.timezone = tz;
				storage.writeJSON("setting.json", settings);
				eval(storage.read("bootupdate.js")); // re-calculate the hash of the config files
				load(".bootcde"); // re-boot into the clock
			}
		}
	}

	// Update the values held in next_dst_change.
	// now is the current time
	// settings is the contents of the dst.json
	function updateNextDstChange(now, settings) {
		if (settings.has_dst) {
			var start = dstChangeTime(now.getFullYear(), settings.tz, settings.dst_start);
			var end = dstChangeTime(now.getFullYear(), settings.tz + settings.dst_size, settings.dst_end);
			if (start <= now.getTime()) {
				if (end <= now.getTime()) {
					// Both changes have happened for this year
					if (start < end) {
						// The start of DST is earlier than the end, so next change is a start of DST
						next_dst_change = { millis: dstChangeTime(now.getFullYear()+1, settings.tz, settings.dst_start), offset: settings.tz + settings.dst_size, is_start: true };
						setCurrentEffectiveTimezone(settings.tz);
					} else {
						// The end of DST is earlier than the start, so the next change is an end of DST
						next_dst_change = { millis: dstChangeTime(now.getFullYear()+1, settings.tz + settings.dst_size, settings.dst_end), offset: settings.tz, is_start: false };
						setCurrentEffectiveTimezone(settings.tz + settings.dst_size);
					}
				} else {
					next_dst_change = { millis: end, offset: settings.tz, is_start: false };
					setCurrentEffectiveTimezone(settings.tz + settings.dst_size);
				}
			} else {
				next_dst_change = { millis: start, offset: settings.tz + settings.dst_size, is_start: true };
				setCurrentEffectiveTimezone(settings.tz);
			}
			next_dst_change.show_icon = settings.show_icon;
		} else {
			next_dst_change = undefined;
		}
	}

	// Update the cached information we keep in next_dst_change
	function doUpdate() {
		var settings = require("Storage").readJSON("dst.json");
		var now = new Date();
		if (settings) {
			updateNextDstChange(now, settings);
			rescheduleCheckForDSTChange(now);
		} else {
			next_dst_change = undefined;
		}
	}

	// Update everything!
	function update() {
		doUpdate();
		draw();
	}

	// Called by draw() when we are not in DST
	function clear() {
		if (this.width) {
			this.width = 0;
			Bangle.drawWidgets();
		}
	}

	// draw, or erase, our little "dst" icon in the widgets area
	function draw() {
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

	// Called periodically to check to see if we have entered / exited DST
    function checkForDSTChange() {
		var now = new Date();
		if (next_dst_change) {
			if (now.getTime() >= next_dst_change.millis) {
				var dstSettings = require("Storage").readJSON("dst.json");
				if (dstSettings) {
					updateNextDstChange(now, dstSettings);
					rescheduleCheckForDSTChange(now);
					setCurrentEffectiveTimezone(next_dst_change.offset);
				} else {
					next_dst_change = undefined;
				}
				draw();
			} else {
				rescheduleCheckForDSTChange(now);
			}
		}
	}

	// Reschedule our check for entering / exiting DST
	function rescheduleCheckForDSTChange(now) {
		if (check_timeout) clearTimeout(check_timeout);
		check_timeout = undefined;
		if (next_dst_change) {
			check_timeout = setTimeout( function() {
				check_timeout = undefined;
				checkForDSTChange();
			}, (next_dst_change.millis - now.getTime()) % 14400000); // Check every 4 hours.
		}
	}

	// Called by our settings.js -- when the DST settings change, we want to ensure that the
	// information we cache is kept up-to-date, and that our effective timezone is correct
	function scheduleUpdate() {
		if (dst_update_timeout) clearTimeout(dst_update_timeout);
		dst_update_timeout = setTimeout( function() {
			dst_update_timeout = undefined;
			update();
		}, 60000);
	}

	// Register ourselves
	WIDGETS["dst"] = {
		area: "tl",
		width: 0,
		draw: draw,
		dstRulesUpdating: scheduleUpdate
	};

	// Update everything but the widget icon in the widget area
	doUpdate();

})();
