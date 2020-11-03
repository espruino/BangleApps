//dapgo 20201103
//var enable/disable file writing.
//vars reduce writing to logfile.
!function () {
	"use strict";
	var v_enable_logfile=1; //0 disabled
	var v_write_once_every=15; // write once in every x times	
	const t = {
		STOP: 63488,
		PAUSE: 65504,
		RUN: 2016
	};
	function n(t, n, r) {
		g.setColor(0),
		g.fillRect(n - 60, r, n + 60, r + 30),
		g.setColor(65535),
		g.drawString(t, n, r)
	}
	function r(r) {
		var e;
		g.setFontVector(30),
		g.setFontAlign(0, -1, 0),
		n((r.distance / 1e3).toFixed(2), 60, 55),
		n(function (t) {
			const n = Math.round(t),
			r = Math.floor(n / 3600),
			e = Math.floor(n / 60) % 60,
			a = n % 60;
			return (r ? r + ":" : "") + ("0" + e).substr(-2) + ":" + ("0" + a).substr(-2)
		}
			(r.duration), 180, 55),
		n(function (t) {
			if (t < .1667)
				return "__'__\"";
			const n = Math.round(1e3 / t),
			r = Math.floor(n / 60),
			e = n % 60;
			return ("0" + r).substr(-2) + "'" + ("0" + e).substr(-2) + '"'
		}
			(r.speed), 60, 115),
		n(r.hr.toFixed(0), 180, 115),
		n(r.steps.toFixed(0), 60, 175),
		n(r.cadence.toFixed(0), 180, 175),
		g.setFont("6x8", 2),
		g.setColor(r.gpsValid ? 2016 : 63488),
		g.fillRect(0, 216, 80, 240),
		g.setColor(0),
		g.drawString("GPS", 40, 220),
		g.setColor(65535),
		g.fillRect(80, 216, 160, 240),
		g.setColor(0),
		g.drawString(("0" + (e = new Date).getHours()).substr(-2) + ":" + ("0" + e.getMinutes()).substr(-2), 120, 220),
		g.setColor(t[r.status]),
		g.fillRect(160, 216, 240, 240),
		g.setColor(0),
		g.drawString(r.status, 200, 220)
	}
	function e(t) {
		g.clear(),
		g.setColor(50712),
		g.setFont("6x8", 2),
		g.setFontAlign(0, -1, 0),
		g.drawString("DIST (KM)", 60, 32),
		g.drawString("TIME", 180, 32),
		g.drawString("PACE", 60, 92),
		g.drawString("HEART", 180, 92),
		g.drawString("STEPS", 60, 152),
		g.drawString("CADENCE", 180, 152),
		r(t),
		Bangle.drawWidgets()
	}
	var a;
	function o(t) {
		t.status === a.Stopped && function (t) {
			//new if to avoid so many files
			if (v_enable_logfile==1) {	
				const n = (new Date).toISOString().replace(/[-:]/g, ""),
				r = `banglerun_${n.substr(2,6)}_${n.substr(9,6)}`;
				//bug? always a newfile even if empty if never gets GPS 
				t.file = require("Storage").open(r, "w"),
				t.file.write(["Timestamp", "Latitude", "Longitude", "Altitude", "Duration", "Distance", "Heartrate", "Steps"].join(","))
			}
		}
		(t),
		t.status === a.Running ? t.status = a.Paused : t.status = a.Running,
		r(t)
	}
	!function (t) {
		t.Stopped = "STOP",
		t.Paused = "PAUSE",
		t.Running = "RUN"
	}
	(a || (a = {}));
	function s(t) {
		const n = t.indexOf(".") - 2;
		return (parseInt(t.substr(0, n)) + parseFloat(t.substr(n)) / 60) * Math.PI / 180
	}
	const i = {
		fix: NaN,
		lat: NaN,
		lon: NaN,
		alt: NaN,
		vel: NaN,
		dop: NaN,
		gpsValid: !1,
		x: NaN,
		y: NaN,
		z: NaN,
		v: NaN,
		t: NaN,
		dt: NaN,
		pError: NaN,
		vError: NaN,
		hr: 60,
		hrError: 100,
		file: null,
		drawing: !1,
		status: a.Stopped,
		duration: 0,
		distance: 0,
		speed: 0,
		steps: 0,
		cadence: 0
	};
	var d;	
	//20201101 new variables
	var v_count_bef_write; // var counter of times before writing to file	
	d = i,
	Bangle.on("GPS-raw", t => function (t, n) {
		const e = n.split(",");
		switch (e[0].substr(3, 3)) {
		case "GGA":
			t.lat = s(e[2]) * ("N" === e[3] ? 1 : -1),
			t.lon = s(e[4]) * ("E" === e[5] ? 1 : -1),
			t.alt = parseFloat(e[9]);
			break;
		case "VTG":
			t.vel = parseFloat(e[7]) / 3.6;
			break;
		case "GSA":
			t.fix = parseInt(e[2]),
			t.dop = parseFloat(e[15]);
			break;
		case "GLL":
			t.gpsValid = 3 === t.fix && t.dop <= 5,
			function (t) {
				const n = Date.now(),
				r = (n - t.t) / 1e3;
				if (t.t = n, t.dt += r, t.status === a.Running && (t.duration += r), !t.gpsValid)
					return;
				const e = 6371008.8 + t.alt,
				o = e * Math.cos(t.lat) * Math.cos(t.lon),
				s = e * Math.cos(t.lat) * Math.sin(t.lon),
				i = e * Math.sin(t.lat),
				d = t.vel;
				if (!t.x)
					return t.x = o, t.y = s, t.z = i, t.v = d, t.pError = 2.5 * t.dop, void(t.vError = .05 * t.dop);
				const u = o - t.x,
				l = s - t.y,
				g = i - t.z,
				c = d - t.v,
				p = Math.sqrt(u * u + l * l + g * g),
				f = Math.abs(c);
				t.pError += t.v * t.dt,
				t.dt = 0;
				const N = p + 2.5 * t.dop,
				h = f + .05 * t.dop,
				S = t.pError / (t.pError + N),
				E = t.vError / (t.vError + h);
				t.x += u * S,
				t.y += l * S,
				t.z += g * S,
				t.v += c * E,
				t.pError += (N - t.pError) * S,
				t.vError += (h - t.vError) * E;
				const w = Math.sqrt(t.x * t.x + t.y * t.y + t.z * t.z);
				t.lat = 180 * Math.asin(t.z / w) / Math.PI,
				t.lon = 180 * Math.atan2(t.y, t.x) / Math.PI || 0,
				t.alt = w - 6371008.8,
				t.status === a.Running && (t.distance += p * S, t.speed = t.distance / t.duration || 0, t.cadence = 60 * t.steps / t.duration || 0)
			}
			(t),
			r(t),
			t.gpsValid && t.status === a.Running && function (t) {
			//writes to logfile only when ther is GPS signal
			//20201101 avoid so much writing write only 1/x i.e 1/10				
				if (isNaN(v_count_bef_write)) v_count_bef_write=0;
				v_count_bef_write=v_count_bef_write+1;								
				if (v_count_bef_write>v_write_once_every) v_count_bef_write=0;
				  else if (v_count_bef_write<v_write_once_every) return;	
                    //write to log file only when....				  
					 else if (v_enable_logfile==1) {									
					t.file.write("\n"),
					t.file.write([Date.now().toFixed(0), t.lat.toFixed(6), t.lon.toFixed(6), t.alt.toFixed(2), t.duration.toFixed(0), t.distance.toFixed(2), t.hr.toFixed(0), t.steps.toFixed(0)].join(","));
					}									
			}
			(t)
		}
	}
		(d, t)),
	Bangle.setGPSPower(1),
	function (t) {
		Bangle.on("HRM", n => function (t, n) {
			if (0 === n.confidence)
				return;
			const r = n.bpm - t.hr,
			e = Math.abs(r) + 101 - n.confidence,
			a = t.hrError / (t.hrError + e);
			t.hr += r * a,
			t.hrError += (e - t.hrError) * a
		}
			(t, n)),
		Bangle.setHRMPower(1)
	}
	(i),
	function (t) {
		Bangle.on("step", () => function (t) {
			t.status === a.Running && (t.steps += 1)
		}
			(t))
	}
	(i),
	function (t) {
		Bangle.loadWidgets(),
		Bangle.on("lcdPower", n => {
			t.drawing = n,
			n && e(t)
		}),
		e(t)
	}
	(i),
	setWatch(() => o(i), BTN1, {
		repeat: !0,
		edge: "falling"
	}),
	setWatch(() => function (t) {
		t.status === a.Paused && function (t) {
			t.duration = 0,
			t.distance = 0,
			t.speed = 0,
			t.steps = 0,
			t.cadence = 0
		}
		(t),
		t.status === a.Running ? t.status = a.Paused : t.status = a.Stopped,
		r(t)
	}
		(i), BTN3, {
		repeat: !0,
		edge: "falling"
	})
}
();