const big = g.getWidth()>200;
// Font for primary time and date
const primaryTimeFontSize = big?6:5;
const primaryDateFontSize = big?3:2;
require("Font5x9Numeric7Seg").add(Graphics);
require("FontTeletext10x18Ascii").add(Graphics);

// Font for single secondary time
const secondaryTimeFontSize = 4; 
const secondaryTimeZoneFontSize = 2;

// Font / columns for multiple secondary times
const secondaryRowColFontSize = 2;
const xcol1 = 10;
const xcol2 = g.getWidth() - xcol1;

const font = "6x8";

/* TODO: we could totally use 'Layout' here and
avoid a whole bunch of hard-coded offsets */

const xyCenter = g.getWidth() / 2;
const xyCenterSeconds = xyCenter + (big ? 85 : 68);
const yAmPm = xyCenter - (big ? 70 : 48);
const yposTime = big ? 70 : 55;
const yposTime2 = yposTime + (big ? 100 : 60);
const yposDate = big ? 135 : 95;
const yposWorld = big ? 170 : 120;

const OFFSET_TIME_ZONE = 0;
const OFFSET_HOURS = 1;

var PosInterval = 0; 

var offsets = require("Storage").readJSON("hworldclock.settings.json") || [];

//=======Sun
setting = require("Storage").readJSON("setting.json",1);
E.setTimeZone(setting.timezone); // timezone = 1 for MEZ, = 2 for MESZ
SunCalc = require("hsuncalc.js");
const LOCATION_FILE = "mylocation.json";
var rise = "07:00";
var set	= "20:00";
var pos	 = {altitude: 20, azimuth: 135};
var noonpos = {altitude: 37, azimuth: 180};
//=======Sun

var ampm = "AM";

// TESTING CODE
// Used to test offset array values during development.
// Uncomment to override secondary offsets value
/*
const mockOffsets = {
	zeroOffsets: [],
	oneOffset: [["UTC", 0]],
	twoOffsets: [
		["Tokyo", 9],
		["UTC", 0],
	],
	 fourOffsets: [
		["Tokyo", 9],
		["UTC", 0],
		["Denver", -7],
		["Miami", -5],
	],
};*/

// Uncomment one at a time to test various offsets array scenarios
//offsets = mockOffsets.zeroOffsets; // should render nothing below primary time
//offsets = mockOffsets.oneOffset; // should render larger in two rows
//offsets = mockOffsets.twoOffsets; // should render two in columns
//offsets = mockOffsets.fourOffsets; // should render in columns

// END TESTING CODE

// Check settings for what type our clock should be
var _12hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"]||false;

// timeout used to update every minute
var drawTimeout;
var drawTimeoutSeconds;
var secondsTimeout;

g.setBgColor(g.theme.bg);

// schedule a draw for the next minute
function queueDraw() {
	if (drawTimeout) clearTimeout(drawTimeout);
		drawTimeout = setTimeout(function() {
		drawTimeout = undefined;
		draw();
	}, 60000 - (Date.now() % 60000));
}

// schedule a draw for the next second
function queueDrawSeconds() {
	if (drawTimeoutSeconds) clearTimeout(drawTimeoutSeconds);
		drawTimeoutSeconds = setTimeout(function() {
		drawTimeoutSeconds = undefined;
		drawSeconds();
		//console.log("TO: " + secondsTimeout);
	}, secondsTimeout - (Date.now() % secondsTimeout));
}

function doublenum(x) {
	return x < 10 ? "0" + x : "" + x;
}

function getCurrentTimeFromOffset(dt, offset) {
	return new Date(dt.getTime() + offset * 60 * 60 * 1000);
}

function updatePos() {
	coord = require("Storage").readJSON(LOCATION_FILE,1)|| {"lat":53.3,"lon":10.1,"location":"Pattensen"};
	pos = SunCalc.getPosition(Date.now(), coord.lat, coord.lon);	
	times = SunCalc.getTimes(Date.now(), coord.lat, coord.lon);
	rise = times.sunrise.toString().split(" ")[4].substr(0,5);
	set	= times.sunset.toString().split(" ")[4].substr(0,5);
	noonpos = SunCalc.getPosition(times.solarNoon, coord.lat, coord.lon);
}


function drawSeconds() {
	// get date
	var d = new Date();
	var da = d.toString().split(" ");

	// default draw styles
	g.reset();
	g.setBgColor(g.theme.bg);

	// drawSting centered
	g.setFontAlign(0, 0);

	// draw time
	var time = da[4].split(":");
	var seconds = time[2];

	g.setFont("5x9Numeric7Seg",primaryTimeFontSize - 3);
	if (g.theme.dark) {
		g.setColor("#22ff05");
	} else {
		g.setColor(g.theme.fg);
	}
	//console.log("---");
	//console.log(seconds);
	if (Bangle.isLocked()) seconds = seconds.slice(0, -1) + ':::'; // we use :: as the font does not have an x
	//console.log(seconds);
	g.drawString(`${seconds}`, xyCenterSeconds, yposTime+14, true); 
	queueDrawSeconds();

}

function draw() {
	// get date
	var d = new Date();
	var da = d.toString().split(" ");

	// default draw styles
	g.reset();
	g.setBgColor(g.theme.bg);

	// drawSting centered
	g.setFontAlign(0, 0);

	// draw time
	var time = da[4].split(":");
	var hours = time[0],
	minutes = time[1];
	
	
	if (_12hour){
		//do 12 hour stuff
		if (hours > 12) {
			ampm = "PM";
			hours = hours - 12;	
			if (hours < 10) hours = doublenum(hours);	
		} else {
			ampm = "AM";	 
		}	 
	}	

	//g.setFont(font, primaryTimeFontSize);
	g.setFont("5x9Numeric7Seg",primaryTimeFontSize);
	if (g.theme.dark) {
		g.setColor("#22ff05");
	} else {
		g.setColor(g.theme.fg);
	}
	g.drawString(`${hours}:${minutes}`, xyCenter-10, yposTime, true);
	
	// am / PM ?
	if (_12hour){
	//do 12 hour stuff
		//var ampm = require("locale").medidian(new Date()); Not working
		g.setFont("Vector", 17);
		g.drawString(ampm, xyCenterSeconds, yAmPm, true);
	}	

	drawSeconds(); // To make sure...
	
	// draw Day, name of month, Date	
	//DATE
	var localDate = require("locale").date(new Date(), 1);
	localDate = localDate.substring(0, localDate.length - 5);
	g.setFont("Vector", 17);
	g.drawString(require("locale").dow(new Date(), 1).toUpperCase() + ", " + localDate, xyCenter, yposDate, true);

	g.setFont(font, primaryDateFontSize);
	// set gmt to UTC+0
	var gmt = new Date(d.getTime() + d.getTimezoneOffset() * 60 * 1000);

	// Loop through offset(s) and render
	offsets.forEach((offset, index) => {
	dx = getCurrentTimeFromOffset(gmt, offset[OFFSET_HOURS]);
	hours = doublenum(dx.getHours());
	minutes = doublenum(dx.getMinutes());


	if (offsets.length === 1) {
		var date = [require("locale").dow(new Date(), 1), require("locale").date(new Date(), 1)];	
		// For a single secondary timezone, draw it bigger and drop time zone to second line
		const xOffset = 30;
		g.setFont(font, secondaryTimeFontSize);
		g.drawString(`${hours}:${minutes}`, xyCenter, yposTime2, true);
		g.setFont(font, secondaryTimeZoneFontSize);
		g.drawString(offset[OFFSET_TIME_ZONE], xyCenter, yposTime2 + 30, true);

		// draw Day, name of month, Date
		g.setFont(font, secondaryTimeZoneFontSize);
		g.drawString(date, xyCenter, yposDate, true);
	} else if (index < 3) {
		// For > 1 extra timezones, render as columns / rows
		g.setFont(font, secondaryRowColFontSize);
		g.setFontAlign(-1, 0);
		g.drawString(
			offset[OFFSET_TIME_ZONE],
			xcol1,
			yposWorld + index * 15,
			true
		);
		g.setFontAlign(1, 0);
		g.drawString(`${hours}:${minutes}`, xcol2, yposWorld + index * 15, true);
	}
	});

	g.setFontAlign(-1, 0);
	g.setFont("Vector",12);
	g.drawString(`^${rise}`, 10, 3 + yposWorld + 3 * 15, true); // draw riseset
	g.setFontAlign(1, 0);
	g.drawString(`v${set}`, xcol2, 3 + yposWorld + 3 * 15, true); // draw riseset

	queueDraw();
	queueDrawSeconds();
}

// clean app screen
g.clear();

// Show launcher when button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();


// draw immediately at first, queue update
draw();


if (!Bangle.isLocked())  { // Initial state
		if (PosInterval != 0) clearInterval(PosInterval);
		PosInterval = setInterval(updatePos, 60*10E3);	// refesh every 10 mins

		secondsTimeout =  1000;		
		if (drawTimeout) clearTimeout(drawTimeout);
		if (drawTimeoutSeconds) clearTimeout(drawTimeoutSeconds);
		drawTimeout = undefined;
		drawTimeoutSeconds = undefined;
		
		draw(); // draw immediately, queue redraw
		updatePos();
  }else{
		secondsTimeout = 10 * 1000;	  
		if (drawTimeout) clearTimeout(drawTimeout);
		if (drawTimeoutSeconds) clearTimeout(drawTimeoutSeconds);
		drawTimeout = undefined;
		drawTimeoutSeconds = undefined;

		if (PosInterval != 0) clearInterval(PosInterval);
		PosInterval = setInterval(updatePos, 60*60E3);	// refesh every 60 mins
		draw(); // draw immediately, queue redraw
		updatePos();
  }
 




Bangle.on('lock',on=>{
  if (!on) { // UNlocked

		if (PosInterval != 0) clearInterval(PosInterval);
		PosInterval = setInterval(updatePos, 60*10E3);	// refesh every 10 mins

		secondsTimeout =  1000;
		if (drawTimeout) clearTimeout(drawTimeout);
		if (drawTimeoutSeconds) clearTimeout(drawTimeoutSeconds);
		drawTimeout = undefined;
		drawTimeoutSeconds = undefined;

		draw(); // draw immediately, queue redraw
		updatePos();
  }else{  // locked

		secondsTimeout = 10 * 1000;
		if (drawTimeout) clearTimeout(drawTimeout);
		if (drawTimeoutSeconds) clearTimeout(drawTimeoutSeconds);
		drawTimeout = undefined;
		drawTimeoutSeconds = undefined;

		if (PosInterval != 0) clearInterval(PosInterval);
		PosInterval = setInterval(updatePos, 60*60E3);	// refesh every 60 mins
		draw(); // draw immediately, queue redraw		
		updatePos();
  }
 });