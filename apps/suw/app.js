var SunCalc = require("https://raw.githubusercontent.com/mourner/suncalc/master/suncalc.js");
const LOCATION_FILE = "mylocation.json";
let location;

// load tide times from settings file
var settings = Object.assign({
  // default values
  nextTideType: "high",
  nextTideHour: 0,
  nextTideMin: 0,
}, require('Storage').readJSON("suw.json", true) || {});

// flag to see if next tide time has crossed midnight and need to halt tide time swapping
var tideNextDay = false;

// assume next tide is 6h 12m later
var tide1h = settings.nextTideHour;
var tide1m = settings.nextTideMin;
var tide1type = settings.nextTideType;
var tide2m = tide1m +12;
if (tide2m > 59) {
  tide2m = tide2m - 60;
  var tide2h = tide1h + 7;
    }
else {
var tide2h = tide1h + 6;
}
if (tide2h > 23) {
  tide2h = tide2h - 24;
}
if (tide1type === "low ") {
  var tide2type = "high";
}
else {
  var tide2type = "low ";
}

// print(settings.nextTideHour,settings.nextTideMin,settings.nextTideType);
// print(tide2h);

const big = g.getWidth()>200;
const timeFontSize = big?6:5;
const dateFontSize = big?3:2;
//const locationFontSize = 2;
const sunFontSize = 2;
const tideFontSize = 1;
const font = "6x8";

const xyCenter = g.getWidth() / 2;
const yposTime = xyCenter*0.7;
const yposDate = xyCenter*1.1;
const yposSunrise = xyCenter*1.5;
const yposLat = xyCenter*1.7;
const yposLon = xyCenter*1.9;

let showSun = true;

var sunImg = require("heatshrink").decompress(atob("j0ewIIFhgDCmADC4ACBgYCBjEMg0AuEAnEA8EB4EBx/GB4N/wAVB/4GBj/+AYP//gKC+EH5//5+fn//nwOGgEH/4hBh4KBEIPggEGn8YHIVwHII9Bg0DgIWBLJoADA=="));

var seaImg = 
require("heatshrink").decompress(atob("kEgwRC/ABH8gE/4EDAgX/4f//gEDh//+H/AgcA/8Ah4EDE/4nXAH4A=="));

// Check settings for what type our clock should be
var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];


function numToString(num) {
  returnString = String(num);
  if (returnString.length === 1) {
    returnString = "0"+returnString;
  }
  return returnString;
}

// requires the myLocation app
function loadLocation() {
  location = require("Storage").readJSON(LOCATION_FILE,1)||{};
  location.lat = location.lat||51.5072;
  location.lon = location.lon||0.1276;
  location.location = location.location||"London";
}


// this is from Pastel - perhaps can be replaced with other function
function extractTime(d){
  var h = d.getHours(), m = d.getMinutes();
 return(("0"+h).substr(-2) + ":" + ("0"+m).substr(-2));
}


var sunRise = "00:00";
var sunSet = "00:00";

function updateSunRiseSunSet(now, lat, lon, line){
  // get today's sunlight times for lat/lon
  var times = SunCalc.getTimes(new Date(), lat, lon);

  // format sunrise time from the Date object
  sunRise = extractTime(times.sunrise);
  sunSet = extractTime(times.sunset);
}


// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

function draw() {
  // get date
  var d = new Date();
  var da = d.toString().split(" ");

  g.reset(); // default draw styles
  // drawSting centered
  g.setFontAlign(0, 0);

  // draw time
  var time = da[4].substr(0, 5).split(":");
  var hours = time[0],
    minutes = time[1];
  var meridian = "";
  if (is12Hour) {
    hours = parseInt(hours,10);
    meridian = "AM";
    if (hours == 0) {
      hours = 12;
      meridian = "AM";
    } else if (hours >= 12) {
      meridian = "PM";
      if (hours>12) hours -= 12;
    }
    hours = (" "+hours).substr(-2);
  }
  
  


  g.setFont("Vector",64); // vector font, 64px  
  g.drawString(`${hours}:${minutes}`, xyCenter, yposTime, true);

  // draw Day, name of month, Date
  var date = [da[0], da[2], da[1], da[3].substr(-2)].join(" ");
  g.setFont(font, dateFontSize);
  g.drawString(date, xyCenter, yposDate, true);

// recalc sunrise / sunset every hour - needs putting in correct place
//  if (drawCount % 60 == 0)
  updateSunRiseSunSet(new Date(), location.lat, location.lon);
//  drawCount++;


  
  // draw sunrise or tide times
  g.setFont(font, sunFontSize);
  if (showSun) {
    g.clearRect(0, xyCenter+17, 175, 175);
    g.drawString(sunRise+"   "+sunSet , xyCenter, yposSunrise, true);
    g.drawImage(sunImg, xyCenter-15, xyCenter+17);
    var latitude = location.lat;
    latitude = Math.round(latitude * 100) / 100;
    var longitude = location.lon;
    longitude = Math.round(longitude * 100) / 100;
    g.drawString("Lat "+latitude, xyCenter, yposLat, true);
    g.drawString("Lon "+longitude, xyCenter, yposLon, true);
  }
  else {
    var textTime = hours + minutes; // use this for making simple time comparisons
    var textNextTide = numToString(tide1h)+numToString(tide1m);
    print(textNextTide);
    if (Number(textTime) > Number(textNextTide) && (!tideNextDay)) {
      print("time swap needed");
      tide1h = tide2h;
      tide1m = tide2m;
      tide1type = tide2type;
      tide2m = tide2m +12;
      if (tide2m > 59) {
        tide2m = tide2m - 60;
        tide2h = tide2h + 7;
      }
      else {
        tide2h = tide2h + 6;
      }
      if (tide2h > 23) {
        tide2h = tide2h - 24;
      }
      if (tide2type === "low ") {
        tide2type = "high";
      }
      else {
        tide2type = "low ";
      }
      if (Number(textNextTide) < Number(textTime)) {
        tideNextDay = true;
      }
      else {
        tideNextDay = false;
      }

    }
    g.clearRect(0, xyCenter+17, 175, 175);
    g.drawString(numToString(tide1h)+numToString(tide1m)+"  "+numToString(tide2h)+numToString(tide2m) , xyCenter, 138, true);
    g.drawString(tide1type+"  "+tide2type , xyCenter, 156, true);
    g.drawImage(seaImg, xyCenter-16, xyCenter+17);
  }

//  print(tide1h,tide1m,tide1type,tide2h,tide2m,tide2type);
  queueDraw();
}

function toggleDisplay() {
  showSun = ! showSun;
  draw();
}

// adding this as it's not getting called at start
loadLocation();

Bangle.on('touch', () => toggleDisplay());

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

// clean app screen
g.clear();
// Show launcher when button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();

// draw now
draw();
