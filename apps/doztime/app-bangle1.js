// Positioning values for graphics buffers
const g_height = 80; // total graphics height
const g_x_off = 16; // position from left
const g_y_off = (240 - g_height)/2; // vertical center for graphics region
const g_width = 240 - 2 * g_x_off; // total graphics width
const g_height_d = 32; // height of date region
const g_y_off_d = 0; // y position of date region within graphics region
const spacing = 0; // space between date and time in graphics region
const g_y_off_t = g_y_off_d + g_height_d + spacing; // y position of time within graphics region
const g_height_t = 48; // height of time region

// Other vars
const A1 = [30,30,30,30,31,31,31,31,31,31,30,30];
const B1 = [30,30,30,30,30,31,31,31,31,31,30,30];
const B2 = [30,30,30,30,31,31,31,31,31,30,30,30];
const timeColour = "#ffffff";
const dateColours = ["#ff0000","#ffa500","#ffff00","#00b800","#0000ff","#ff00ff","#ff0080"];
const calen10 = {"size":32,"pt0":[32-g_x_off,16],"step":[20,0],"dx":-4.5,"dy":-4.5}; // positioning for usual calendar line
const calen7 = {"size":32,"pt0":[62-g_x_off,16],"step":[20,0],"dx":-4.5,"dy":-4.5}; // positioning for S-day calendar line
const time5 = {"size":48,"pt0":[64-g_x_off,24],"step":[30,0],"dx":-6.5,"dy":-6.5}; // positioning for lull time line
const time6 = {"size":48,"pt0":[48-g_x_off,24],"step":[30,0],"dx":-6.5,"dy":-6.5}; // positioning for twinkling time line
const baseYear = 11584;
const baseDate = Date(2020,11,21); // month values run from 0 to 11
let accum = new Date(baseDate.getTime());
let sequence = [];
let timeActiveUntil;
let addTimeDigit = false;
let dateFormat = false;
let lastX = 999999999;
let res = {};
let calenDef;
//var last_time_log = 0;

var drawtime_timeout;

// Date and time graphics buffers
var dateColour = "#ffffff"; // override later
var timeColour2 = timeColour;
var g_d = Graphics.createArrayBuffer(g_width,g_height_d,1,{'msb':true});
var g_t = Graphics.createArrayBuffer(g_width,g_height_t,1,{'msb':true});
// Set screen mode and function to write graphics buffers
Bangle.setLCDMode();
g.clear(); // start with blank screen
g.flip = function()
{
	g.setColor(dateColour);
	g.drawImage(
	{
		width:g_width,
		height:g_height_d,
		buffer:g_d.buffer
	}, g_x_off, g_y_off + g_y_off_d);
	g.setColor(timeColour2);
	g.drawImage(
	{
		width:g_width,
		height:g_height_t,
		buffer:g_t.buffer
	}, g_x_off, g_y_off + g_y_off_t);
};

setWatch(function(){ modeTime(); }, BTN1, {repeat:true} );
setWatch(function(){ Bangle.showLauncher(); }, BTN2, { repeat: false, edge: "falling" });
//setWatch(function(){ modeWeather(); }, BTN3, {repeat:true}); // TODO: `modeWeather` is not yet implemented.
setWatch(function(){ toggleTimeDigits(); }, BTN4, {repeat:true});
setWatch(function(){ toggleDateFormat(); }, BTN5, {repeat:true});

function buildSequence(targ){
	for(let i=0;i<targ.length;++i){
		sequence.push(new Date(accum.getTime()));
		accum.setDate(accum.getDate()+targ[i]);
	}
}
buildSequence(B2);
buildSequence(B2);
buildSequence(A1);
buildSequence(B1);
buildSequence(B2);
buildSequence(B2);
buildSequence(A1);
buildSequence(B1);
buildSequence(B2);
buildSequence(B2);
buildSequence(A1);
buildSequence(B1);
buildSequence(B2);

function getDate(dt){
	let index = sequence.findIndex(n => n > dt)-1;
	let year = baseYear+parseInt(index/12);
	let month = index % 12;
	let day = parseInt((dt-sequence[index])/86400000);
	let colour = dateColours[day % 6];
	if(day==30){ colour=dateColours[6]; }
	return({"year":year,"month":month,"day":day,"colour":colour});
}
function toggleTimeDigits(){
	addTimeDigit = !addTimeDigit;
	modeTime();
}
function toggleDateFormat(){
	dateFormat = !dateFormat;
	modeTime();
}
function formatDate(res,dateFormat){
	let yyyy = res.year.toString(12);
	calenDef = calen10;
	if(!dateFormat){ //ordinal format
		let mm = ("0"+(res.month+1).toString(12)).substr(-2);
		let dd = ("0"+(res.day+1).toString(12)).substr(-2);
		if(res.day==30){
			calenDef = calen7;
			let m = ((res.month+1).toString(12)).substr(-2);
			return(yyyy+"-"+"S"+m); // ordinal format
		}
		return(yyyy+"-"+mm+"-"+dd);
	}
	let m = res.month.toString(12); // cardinal format
	let w = parseInt(res.day/6);
	let d = res.day%6;
	//return(yyyy+"-"+res.month+"-"+w+"-"+d);
	return(yyyy+"-"+m+"-"+w+"-"+d);
}

function writeDozTime(text,def){
	//let pts = def.pts;
	let x=def.pt0[0];
	let y=def.pt0[1];
	g_t.clear();
	g_t.setFont("Vector",def.size);
	for(let i in text){
		if(text[i]=="a"){ g_t.setFontAlign(0,0,2); g_t.drawString("2",x+def.dx,y+def.dy); }
		else if(text[i]=="b"){ g_t.setFontAlign(0,0,2); g_t.drawString("3",x+def.dx,y+def.dy); }
		else{ g_t.setFontAlign(0,0,0); g_t.drawString(text[i],x,y); }
		x = x+def.step[0];
		y = y+def.step[1];
	}
}
function writeDozDate(text,def,colour){
	
	dateColour = colour;
	//let pts = def.pts;
	let x=def.pt0[0];
	let y=def.pt0[1];
	g_d.clear();
	g_d.setFont("Vector",def.size);
	for(let i in text){
		if(text[i]=="a"){ g_d.setFontAlign(0,0,2); g_d.drawString("2",x+def.dx,y+def.dy); }
		else if(text[i]=="b"){ g_d.setFontAlign(0,0,2); g_d.drawString("3",x+def.dx,y+def.dy); }
		else{ g_d.setFontAlign(0,0,0); g_d.drawString(text[i],x,y); }
		x = x+def.step[0];
		y = y+def.step[1];
	}
}

// Functions for time mode
function drawTime()
{
	let dt = new Date();
	let date = "";
	let timeDef;
	let x = 0;
	let time;
	let wait;
	dt.setDate(dt.getDate());
	if(addTimeDigit){
		x =
		10368*dt.getHours()+172.8*dt.getMinutes()+2.88*dt.getSeconds()+0.00288*dt.getMilliseconds();
		let msg = "00000"+Math.floor(x).toString(12);
		time = msg.substr(-5,3)+"."+msg.substr(-2);
		wait = 347*(1-(x%1));
		timeDef = time6;
	} else {
		x =
		864*dt.getHours()+14.4*dt.getMinutes()+0.24*dt.getSeconds()+0.00024*dt.getMilliseconds();
		let msg = "0000"+Math.floor(x).toString(12);
		time = msg.substr(-4,3)+"."+msg.substr(-1);
		wait = 4167*(1-(x%1));
		timeDef = time5;
	}
	if(lastX > x){ res = getDate(dt); } // calculate date once at start-up and once when turning over to a new day
	date = formatDate(res,dateFormat);
	if(dt<timeActiveUntil)
	{
		// Write to background buffers, then display on screen
		writeDozDate(date,calenDef,res.colour);
		writeDozTime(time,timeDef);
		g.flip();
		// Ready next interval
		drawtime_timeout = setTimeout(drawTime,wait);
	}
	else
	{
		// Clear screen
		g_d.clear();
		g_t.clear();
		g.flip();
	}
	lastX = x;
}
function modeTime()
{
	timeActiveUntil = new Date();
	timeActiveUntil.setDate(timeActiveUntil.getDate());
	timeActiveUntil.setSeconds(timeActiveUntil.getSeconds()+15);
	if (typeof drawtime_timeout !== 'undefined')
	{
		clearTimeout(drawtime_timeout);
	}
	drawTime();
}
Bangle.loadWidgets();
Bangle.drawWidgets();

// Functions for weather mode - TODO
//function drawWeather() {}
//function modeWeather() {}

// Start time on twist
Bangle.on('twist', function() {
	modeTime();
});

// Time fix with GPS
function fixTime() {
	Bangle.on("GPS",function cb(g) {
		Bangle.setGPSPower(0,"time");
		Bangle.removeListener("GPS",cb);
		if (g.time && (g.time.getFullYear()>=2000) &&
			(g.time.getFullYear()<=2200)) {
			// We have a GPS time. Set time
			setTime(g.time.getTime()/1000);
		}
	});
	Bangle.setGPSPower(1,"time");
	setTimeout(fixTime, 10*60*1000); // every 10 minutes
}
// Start time fixing with GPS on next 10 minute interval
setTimeout(fixTime, ((60-(new Date()).getMinutes()) % 10) * 60 * 1000);
