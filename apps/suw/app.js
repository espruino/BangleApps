var SunCalc = require("https://raw.githubusercontent.com/mourner/suncalc/master/suncalc.js");
const LOCATION_FILE = "mylocation.json";
let location;

const big = g.getWidth()>200;
const timeFontSize = big?6:5;
const dateFontSize = big?3:2;
const locationFontSize = 2;
const sunFontSize = 2;
const tideFontSize = 1;
const font = "6x8";

const xyCenter = g.getWidth() / 2;
const yposTime = xyCenter*0.7;
const yposDate = xyCenter*1.1;
const yposSunrise = xyCenter*1.5;
//const yposSunset = xyCenter*1.4;
const yposLat = xyCenter*1.7;
const yposLon = xyCenter*1.9;
//const yposTide1 = xyCenter*1.6;
//const yposTide2 = xyCenter*1.7;
//const yposTide3 = xyCenter*1.8;
//const yposTide4 = xyCenter*1.9;

var sunImg = require("heatshrink").decompress(atob("j0ewIIFhgDCmADC4ACBgYCBjEMg0AuEAnEA8EB4EBx/GB4N/wAVB/4GBj/+AYP//gKC+EH5//5+fn//nwOGgEH/4hBh4KBEIPggEGn8YHIVwHII9Bg0DgIWBLJoADA=="));


// Check settings for what type our clock should be
var is12Hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"];

// requires the myLocation app
function loadLocation() {
  location = require("Storage").readJSON(LOCATION_FILE,1)||{};
  location.lat = location.lat||51.5072;
  location.lon = location.lon||0.1276;
  location.location = location.location||"London";
}

// this is from Pastel - perhaps not needed
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

//  g.setFont(font, timeFontSize);
  g.setFont("Vector",66); // vector font, 80px  
  g.drawString(`${hours}:${minutes}`, xyCenter, yposTime, true);
//  g.setFont(font, tideFontSize);
//  g.drawString(meridian, xyCenter + 102, yposTime + 10, true);

  // draw Day, name of month, Date
  var date = [da[0], da[2], da[1], da[3].substr(-2)].join(" ");
  g.setFont(font, dateFontSize);

  g.drawString(date, xyCenter, yposDate, true);

// recalc sunrise / sunset every hour - needs putting in correct place
//  if (drawCount % 60 == 0)
  updateSunRiseSunSet(new Date(), location.lat, location.lon);
//  drawCount++;

  // draw sunrise
  g.setFont(font, sunFontSize);
  g.drawString(sunRise+"   "+sunSet , xyCenter, yposSunrise, true);
//  g.drawString("Sunset "+sunSet, xyCenter, yposSunset, true);

  // draw sun icon
  g.drawImage(sunImg, xyCenter-15, xyCenter+17);

 // draw location
  g.setFont(font, locationFontSize);
  var latitude = location.lat;
  latitude = Math.round(latitude * 100) / 100;
  var longitude = location.lon;
  longitude = Math.round(longitude * 100) / 100;
  g.drawString("Lat "+latitude, xyCenter, yposLat, true);
  g.drawString("Lon "+longitude, xyCenter, yposLon, true);

  
  // draw tides
//  g.setFont(font, tideFontSize);
//  g.drawString("High tide 0017 5.58m", xyCenter, yposTide1, true);

//  g.setFont(font, tideFontSize);
//  g.drawString("Low tide 0651 2.25m", xyCenter, yposTide2, true);
  
//  g.setFont(font, tideFontSize);
//  g.drawString("High tide 1302 5.44m", xyCenter, yposTide3, true);
  
//  g.setFont(font, tideFontSize);
//  g.drawString("Low tide 1931 2.26m", xyCenter, yposTide4, true);

  

  queueDraw();
}

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
