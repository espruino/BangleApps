OW_CHAR_UUID = '0000cc91-0000-1000-8000-00805f9b34fb';
require("Font7x11Numeric7Seg").add(Graphics);
//var gatt = {};
var cx = g.getWidth()/2;
var cy = 24+(g.getHeight()-24)/2;
var w = (g.getWidth()-24)/2;
var gps_course = { spd: 0 };
//var course_marker_len = g.getWidth()/4;

var settings = require("Storage").readJSON('openwindsettings.json', 1) || {};

var pause_gps = false;

var i = 0;
var hullpoly = [];
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
    awa = settings.mount_angle+ev.target.value.getInt16(1, true)*0.1;
    if (awa<0) awa += 360;
    aws = ev.target.value.getInt16(3, true)*0.01;
    //console.log(awa, aws);
    if (gps_course.spd > 0) {
      wv = { // wind vector (in "earth" reference frame)
        vlon: Math.sin(Math.PI*(gps_course.course+(awa+180))/180)*aws,
        vlat: Math.cos(Math.PI*(gps_course.course+(awa+180))/180)*aws
      };
      twv = { vlon: wv.vlon+gps_course.vlon, vlat: wv.vlat+gps_course.vlat  };
      tws = Math.sqrt(Math.pow(twv.vlon,2)+Math.pow(twv.vlat, 2));
      twa = 180+Math.atan2(twv.vlon, twv.vlat)*180/Math.PI-gps_course.course;
      if (twa<0) twa += 360;
      if (twa>360) twa -=360;
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
  g.setFontVector(fh).setColor(g.theme.fg);
  g.setFontAlign(0, 0, 0).drawString("0", cx, 24+fh/2);
  g.setFontAlign(0, 0, 1).drawString("90", g.getWidth()-12-fh, cy);
  g.setFontAlign(0, 0, 2).drawString("180", cx, g.getHeight()-fh/2);
  g.setFontAlign(0, 0, 3).drawString("270", 12+fh/2, cy);
  for (i=0; i<4; ++i) {
    a = i*Math.PI/2+Math.PI/4;
    g.drawLineAA(cx+Math.cos(a)*w*0.85, cy+Math.sin(a)*w*0.85, cx+Math.cos(a)*w*0.99, cy+Math.sin(a)*w*0.99);
  }
  g.setColor(0, 1, 0).fillCircle(cx+Math.sin(Math.PI*awa/180)*w*0.9, cy-Math.cos(Math.PI*awa/180)*w*0.9, w*0.1);
  if (tws>0) g.setColor(1, 0, 0).fillCircle(cx+Math.sin(Math.PI*twa/180)*w*0.9, cy+Math.cos(Math.PI*twa/180)*w*0.9, w*0.1);
  g.setColor(0, 1, 0).setFont("7x11Numeric7Seg",w*0.06);
  g.setFontAlign(0, 0, 0).drawString(aws.toFixed(1), cx, cy-0.32*w);
  if (!pause_gps) {
    if (tws>0) g.setColor(1, 0, 0).drawString(tws.toFixed(1), cx, cy+0.32*w);
    if (settings.truewind && gps_course.spd!=-1) {
      spd = gps_course.spd/1.852;
      g.setColor(g.theme.fg).setFont("7x11Numeric7Seg", w*0.03).setFontAlign(-1, 1, 0).drawString(spd.toFixed(1), 1, g.getHeight()-1);
    }
  }
  if (pause_gps) g.setColor("#f00").drawImage(atob("DAwBEAKARAKQE4DwHkPqPRGKAEAA"),g.getWidth()-15, g.getHeight()-15);
}

function parseDevice(d) {
  device = d;
  console.log("Found device");
  device.gatt.connect().then(function(ga) {
    console.log("Connected");
    //gatt = ga;
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
        { vlon: Math.sin(Math.PI*fix.course/180)*fix.speed/1.852,
          vlat: Math.cos(Math.PI*fix.course/180)*fix.speed/1.852,
          lat: fix.lat,
          lon: fix.lon,
          spd: fix.speed,
          course: fix.course
        };
    }
    else gps_course.spd = -1;
  });
  Bangle.setGPSPower(1, "app");
}

if (settings.truewind) {
  Bangle.on("swipe", (d)=>{
    if (d==-1 && !pause_gps) {
      pause_gps = true;
      Bangle.setGPSPower(0);
      draw_compass(0, 0, 0, 0);
    }
    else if (d==1 && pause_gps) {
      pause_gps = false;
      Bangle.setGPSPower(1, "app");
      draw_compass(0, 0, 0, 0);
    }
  });
}
Bangle.loadWidgets();
Bangle.drawWidgets();
draw_compass(0, 0, 0, 0);
connection_setup();
