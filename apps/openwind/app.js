OW_CHAR_UUID = '0000cc91-0000-1000-8000-00805f9b34fb';
require("Font7x11Numeric7Seg").add(Graphics);
gatt = {};
cx = g.getWidth()/2;
cy = 24+(g.getHeight()-24)/2;
w = (g.getWidth()-24)/2;

gps_course = {};

var settings = require("Storage").readJSON('openwind.json', 1) || {};

i = 0;
hullpoly = [];
for (y=-1; y<=1; y+=0.1) {
  hullpoly[i++] = cx - (y<0 ? 1+y*0.15 : (Math.sqrt(1-0.7*y*y)-Math.sqrt(0.3))/(1-Math.sqrt(0.3)))*w*0.3;
  hullpoly[i++] = cy - y*w*0.7;
}
for (y=1; y>=-1; y-=0.1) {
  hullpoly[i++] = cx + (y<0 ? 1+y*0.15 : (Math.sqrt(1-0.7*y*y)-Math.sqrt(0.3))/(1-Math.sqrt(0.3)))*w*0.3;
  hullpoly[i++] = cy - y*w*0.7;
}

function wind_updated(ev) {
  if (ev.target.uuid == "0xcc91") {
    awa = 180-ev.target.value.getInt16(1, true)*0.1;
    aws = ev.target.value.getInt16(3, true)*0.01;
//    console.log(awa, aws);
    if (gps_course.spd > 0) {
      wv = { // wind vector
        lon: Math.sin(Math.PI*awa/180)*aws,
        lat: Math.cos(Math.PI*awa/180)*aws
      };
      twv = { lon: wv.lon+gps_course.lon, lat: wv.lat+gps_course.lat  };
      tws = Math.sqrt(Math.pow(twv.lon,2)+Math.pow(twv.lat, 2));
      twa = Math.atan2(twv.lat, twv.lon)*180/Math.PI;
      if (twa<0) twa += 360;
    }
    else { 
      tws = -1;
      twa = 0;
    }
    draw_compass(awa,aws,twa,tws);
  }
}

function draw_compass(awa, aws, twa, tws) {
  g.clearRect(0, 24, g.getWidth()-1, g.getHeight()-1);
  fh = w*0.15;
  g.setColor(0, 0, 1).fillPoly(hullpoly);
  g.setFontVector(fh).setColor(1, 1, 1);
  g.setFontAlign(0, 0, 0).drawString("0", cx, 24+fh/2);
  g.setFontAlign(0, 0, 1).drawString("90", g.getWidth()-12-fh, cy);
  g.setFontAlign(0, 0, 2).drawString("180", cx, g.getHeight()-fh/2);
  g.setFontAlign(0, 0, 3).drawString("270", 12+fh/2, cy);
  for (i=0; i<4; ++i) {
    a = i*Math.PI/2+Math.PI/4;
    g.drawLineAA(cx+Math.cos(a)*w*0.85, cy+Math.sin(a)*w*0.85, cx+Math.cos(a)*w*0.99, cy+Math.sin(a)*w*0.99);
  }
  g.setColor(0, 1, 0).fillCircle(cx+Math.sin(Math.PI*awa/180)*w*0.9, cy+Math.cos(Math.PI*awa/180)*w*0.9, w*0.1);
  if (tws>0) g.setColor(1, 0, 0).fillCircle(cx+Math.sin(Math.PI*twa/180)*w*0.9, cy+Math.cos(Math.PI*twa/180)*w*0.9, w*0.1);
  g.setColor(0, 1, 0).setFont("7x11Numeric7Seg",w*0.06);
  g.setFontAlign(0, 0, 0).drawString(aws.toFixed(1), cx, cy-0.32*w);
  if (tws>0) g.setColor(1, 0, 0).drawString(tws.toFixed(1), cx, cy+0.32*w);
}

function parseDevice(d) {
  device = d;
  console.log("Found device");
 device.gatt.connect().then(function(ga) {
  console.log("Connected");
   gatt = ga;
  return ga.getPrimaryService("cc90");
}).then(function(s) {
  return s.getCharacteristic("cc91");
}).then(function(c) {
  c.on('characteristicvaluechanged', (event)=>wind_updated(event));
  return c.startNotifications();
}).then(function() {
  console.log("Done!");
}).catch(function(e) {
  console.log("ERROR"+e);
});}

function connection_setup() {
  NRF.setScan();
  NRF.setScan(parseDevice, { filters: [{services:["cc90"]}], timeout: 2000});
  console.log("Scanning for OW sensor");
}

if (settings.truewind) {
  Bangle.on('GPS',function(fix) {
    if (fix.fix && fix.satellites>3 && fix.speed>2) { // only uses fixes w/ more than 3 sats and speed > 2kph
      gps_course = 
        { lon: Math.sin(Math.PI*fix.course/180)*fix.speed/1.852,
          lat: Math.cos(Math.PI*fix.course/180)*fix.speed/1.852,
          spd: fix.speed,
          crs: fix.course
        };
    }
    else gps_course.spd = -1;
  });
  Bangle.setGPSPower(1, "app");
}

Bangle.loadWidgets();
Bangle.drawWidgets();
draw_compass(0, 0, 0, 0);
connection_setup();
