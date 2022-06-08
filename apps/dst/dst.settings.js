(function(back) {

	// USE LOCALE IN PRODUCTION (I want to test on the IDE, so I'll do it this way for now)
	var dows = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
	var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

	var settings = Object.assign({
		has_dst: true,
		dst_size: 1,
		dst_start: {
			day_offset: 0,	// "on", "Fri before"
			dow_number: 4,	// "1st", "2nd", "3rd", "4th", "last"
			dow: 0,			// "Sun", "Mon", ...
			month: 2,
			at: 2
		},
		dst_end: {
			day_offset: 0,
			dow_number: 4,
			dow: 0,
			month: 9,
			at: 3
		}
	}, require("Storage").readJSON("dst.json", true) || {});
	
	var dst_start_end = {
		is_start: true,
		day_offset: 0,
		dow_number: 0,
		dow: 0,
		month: 0,
		at: 0
	};
	
	function writeSettings() {
		require('Storage').writeJSON("dst.json", settings);
	}
	
	function writeSubMenuSettings() {
		if (dst_start_end.is_start) {
			settings.dst_start.day_offset = dst_start_end.day_offset;
			settings.dst_start.dow_number = dst_start_end.dow_number;
			settings.dst_start.dow = dst_start_end.dow;
			settings.dst_start.month = dst_start_end.month;
			settings.dst_start.at = dst_start_end.at;
		} else {
			settings.dst_end.day_offset = dst_start_end.day_offset;
			settings.dst_end.dow_number = dst_start_end.dow_number;
			settings.dst_end.dow = dst_start_end.dow;
			settings.dst_end.month = dst_start_end.month;
			settings.dst_end.at = dst_start_end.at;
		}
		writeSettings();
	}
	
	function hoursToString(h) {
		return (h|0) + ':' + (6*h)%6 + (60*h)%10;
	}
	
	function getDSTStartEndMenu(start) {
		dst_start_end.is_start = start;
		if (start) {
			dst_start_end.day_offset = settings.dst_start.day_offset;
			dst_start_end.dow_number = settings.dst_start.dow_number;
			dst_start_end.dow = settings.dst_start.dow;
			dst_start_end.month = settings.dst_start.month;
			dst_start_end.at = settings.dst_start.at;
		} else {
			dst_start_end.day_offset = settings.dst_end.day_offset;
			dst_start_end.dow_number = settings.dst_end.dow_number;
			dst_start_end.dow = settings.dst_end.dow;
			dst_start_end.month = settings.dst_end.month;
			dst_start_end.at = settings.dst_end.at;
		}
		return {
			"": {
				"Title": start ? "DST Start" : "DST End"
			},
			"< Back": () => E.showMenu(dstMenu),
			"Change" : {
				value: dst_start_end.day_offset,
				format: v => (v == 0) ? "on" : dows[v-1] + " before",
				min: 0,
				max: 7,
				onchange: v => {
					dst_start_end.day_offset = v;
					writeSubMenuSettings();
				}
			},
			"the" : {
				value: dst_start_end.dow_number,
				format: v => ["1st","2nd","3rd","4th","last"][v],
				min: 0,
				max: 4,
				onchange: v => {
					dst_start_end.dow_number = v
					writeSubMenuSettings();
				}
			},
			" -" : {
				value: dst_start_end.dow,
				format: v => dows[v],
				min:0,
				max:6,
				onchange: v => {
					dst_start_end.dow = v
					writeSubMenuSettings();
				}
			},
			"of": {
				value: dst_start_end.month,
				format: v => months[v],
				min: 0,
				max: 11,
				onchange: v => {
					dst_start_end.month = v
					writeSubMenuSettings();
				}
			},
			"at": {
				value: dst_start_end.at,
				format: v => hoursToString(v),
				min: 0,
				max: 23,
				onchange: v => {
					dst_start_end.at = v
					writeSubMenuSettings();
				}
			}
		}
	}
			
	var dstMenu = {
		"": {
			"Title": "Daylight Savings"
		},
		"< Back": () => back(),
		"Enabled": {
			value: settings.has_dst,
			format: v => v ? 'Yes' : 'No',
			onchange: v => {
				settings.has_dst = v;
				writeSettings();
			}
		},
		"Amount": {
			value: settings.dst_size,
			format: v => (v >= 0 ? '+' + hoursToString(v): '-' + hoursToString(-v)),
			min: -1,
			max: 1,
			step: 0.5,
			onchange: v=> {
				settings.dst_size = v;
				writeSettings();
			}
		},
		"DST Start": () => E.showMenu(getDSTStartEndMenu(true)),
		"DST End": () => E.showMenu(getDSTStartEndMenu(false))
	};
	
	E.showMenu(dstMenu);

});
