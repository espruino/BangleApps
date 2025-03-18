/* sclock.app.js for Bangle2
Peter Bernschneider 30.12.2021
Update current latitude and longitude in My Location app
Update current Timezone in Settings app, menu item "System"
Update for summer time by incrementing Timezone += 1 */
const setting = require("Storage").readJSON("setting.json",1);
E.setTimeZone(setting.timezone); // timezone = 1 for MEZ, = 2 for MESZ
const SunCalc = require("suncalc.js");
const loc = require('locale');
const LOCATION_FILE = "mylocation.json";
const xyCenter = g.getWidth() / 2 + 3;
const yposTime =  60;
const yposDate = 100;
const yposRS   = 135;
const yposPos  = 160;
var rise = "07:00";
var set  = "20:00";
var pos     = {altitude: 20, azimuth: 135};
var noonpos = {altitude: 37, azimuth: 180};
let idTimeout = null;



function updatePos() {
  function radToDeg(pos) {
    return { // instead of mofidying suncalc
        azimuth:  Math.round((pos.azimuth / rad + 180) % 360),
        altitude: Math.round( pos.altitude / rad)
    };
  }
  const coord = require("Storage").readJSON(LOCATION_FILE,1)|| {"lat":53.3,"lon":10.1,"location":"Pattensen"};
  pos = radToDeg(SunCalc.getPosition(Date.now(), coord.lat, coord.lon));
  const times = SunCalc.getTimes(Date.now(), coord.lat, coord.lon);
  rise = times.sunrise.toString().split(" ")[4].substr(0,5);
  set  = times.sunset.toString().split(" ")[4].substr(0,5);
  noonpos = radToDeg(SunCalc.getPosition(times.solarNoon, coord.lat, coord.lon));
}

function drawSimpleClock() {
  var d = new Date(); // get date
  var da = d.toString().split(" ");
  g.clear();
  Bangle.drawWidgets();
  g.reset(); // default draw styles
  g.setFontAlign(0, 0); // drawSting centered

  var time = da[4].substr(0, 5); // draw time

  g.setFont("Vector",60);
  g.drawString(time, xyCenter, yposTime, true);

  var date = [loc.dow(new Date(),1), loc.date(d,1)].join(" "); // draw day of week, date
  g.setFont("Vector",24);
  g.drawString(date, xyCenter, yposDate, true);

  g.setFont("Vector",25);
  g.drawString(`${rise}  ${set}`, xyCenter, yposRS, true); // draw riseset
  g.drawImage(require("Storage").read("sunrise.img"), xyCenter-16, yposRS-16);

  g.setFont("Vector",21);
  g.drawString(`H${pos.altitude}/${noonpos.altitude} Az${pos.azimuth}`, xyCenter, yposPos, true); // draw sun pos

  let t = d.getSeconds()*1000 + d.getMilliseconds();
  idTimeout = setTimeout(drawSimpleClock, 60000 - t); // time till next minute
}

// special function to handle display switch on
Bangle.on('lcdPower', function(on){
  if (on) {
    drawSimpleClock();
  } else {
    if(idTimeout) {
      clearTimeout(idTimeout);
    }
  }
});

g.clear(); // clean app screen
Bangle.loadWidgets();
Bangle.drawWidgets();

setInterval(updatePos, 60*5E3);    // refesh every 5 mins

updatePos();
drawSimpleClock(); // draw now

setWatch(Bangle.showLauncher, BTN1, { repeat: false, edge: "falling" }); // Show launcher when button pressed
