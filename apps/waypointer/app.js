var pal_by = new Uint16Array([0x0000,0xFFC0],0,1); // black, yellow
var pal_bw = new Uint16Array([0x0000,0xffff],0,1);  // black, white
var pal_bb = new Uint16Array([0x0000,0x07ff],0,1); // black, blue

// having 3 2 color pallette keeps the memory requirement lower
var buf1 = Graphics.createArrayBuffer(160,160,1, {msb:true});
var buf2 = Graphics.createArrayBuffer(80,40,1, {msb:true});
var arrow_img = require("heatshrink").decompress(atob("lEowIPMjAEDngEDvwED/4DCgP/wAEBgf/4AEBg//8AEBh//+AEBj///AEBn///gEBv///wmCAAImCAAIoBFggE/AkaaEABo="));

function flip1(x,y) {
  g.drawImage({width:160,height:160,bpp:1,buffer:buf1.buffer, palette:pal_by},x,y);
  buf1.clear();
}

function flip2_bw(x,y) {
  g.drawImage({width:80,height:40,bpp:1,buffer:buf2.buffer, palette:pal_bw},x,y);
  buf2.clear();
}

function flip2_bb(x,y) {
  g.drawImage({width:80,height:40,bpp:1,buffer:buf2.buffer, palette:pal_bb},x,y);
  buf2.clear();
}

var candraw = true;
var wp_bearing = 0;
var direction = 0;
var wpindex=0;
var loc = require("locale");
var selected = false;

var previous = {
  bs: '',
  dst: '',
  wp_name: '',
  course: 0,
  selected: false,
};

// clear the attributes that control the display refresh
function clear_previous() {
  previous.bs = '-';
  previous.dst = '-';
  previous.wp_name = '-';
  previous.course = -999;
}

function drawCompass(course) {
  if(!candraw) return;
  if (Math.abs(previous.course - course) < 9) return; // reduce number of draws due to compass jitter
  previous.course = course;
  
  buf1.setColor(1);
  buf1.fillCircle(80,80,79,79);
  buf1.setColor(0);
  buf1.fillCircle(80,80,69,69);
  buf1.setColor(1);
  buf1.drawImage(arrow_img, 80, 80, {scale:3,  rotate:radians(course)} );
  flip1(40, 30);
}

/***** COMPASS CODE ***********/

var heading = 0;
function newHeading(m,h){ 
    var s = Math.abs(m - h);
    var delta = (m>h)?1:-1;
    if (s>=180){s=360-s; delta = -delta;} 
    if (s<2) return h;
    var hd = h + delta*(1 + Math.round(s/5));
    if (hd<0) hd+=360;
    if (hd>360)hd-= 360;
    return hd;
}

var CALIBDATA = require("Storage").readJSON("magnav.json",1)||null;

function tiltfixread(O,S){
  var start = Date.now();
  var m = Bangle.getCompass();
  var g = Bangle.getAccel();
  m.dx =(m.x-O.x)*S.x; m.dy=(m.y-O.y)*S.y; m.dz=(m.z-O.z)*S.z;
  var d = Math.atan2(-m.dx,m.dy)*180/Math.PI;
  if (d<0) d+=360;
  var phi = Math.atan(-g.x/-g.z);
  var cosphi = Math.cos(phi), sinphi = Math.sin(phi);
  var theta = Math.atan(-g.y/(-g.x*sinphi-g.z*cosphi));
  var costheta = Math.cos(theta), sintheta = Math.sin(theta);
  var xh = m.dy*costheta + m.dx*sinphi*sintheta + m.dz*cosphi*sintheta;
  var yh = m.dz*sinphi - m.dx*cosphi;
  var psi = Math.atan2(yh,xh)*180/Math.PI;
  if (psi<0) psi+=360;
  return psi;
}

// Note actual mag is 360-m, error in firmware
function read_compass() {
  var d = tiltfixread(CALIBDATA.offset,CALIBDATA.scale);
  heading = newHeading(d,heading);
  direction = wp_bearing - heading;
  if (direction < 0) direction += 360;
  if (direction > 360) direction -= 360;
  drawCompass(direction);
}


/***** END Compass ***********/

var speed = 0;
var satellites = 0;
var wp;
var dist=0;

function radians(a) {
  return a*Math.PI/180;
}

function degrees(a) {
  var d = a*180/Math.PI;
  return (d+360)%360;
}

function bearing(a,b){
  var delta = radians(b.lon-a.lon);
  var alat = radians(a.lat);
  var blat = radians(b.lat);
  var y = Math.sin(delta) * Math.cos(blat);
  var x = Math.cos(alat)*Math.sin(blat) -
        Math.sin(alat)*Math.cos(blat)*Math.cos(delta);
  return Math.round(degrees(Math.atan2(y, x)));
}

function distance(a,b){
  var x = radians(a.lon-b.lon) * Math.cos(radians((a.lat+b.lat)/2));
  var y = radians(b.lat-a.lat);
  return Math.round(Math.sqrt(x*x + y*y) * 6371000);
}


function drawN(){
  buf2.setFont("Vector",24);
  var bs = wp_bearing.toString();
  bs = wp_bearing<10?"00"+bs : wp_bearing<100 ?"0"+bs : bs;
  var dst = loc.distance(dist);
  
  // -1=left (default), 0=center, 1=right
  
  // show distance on the left
  if (previous.dst !== dst) {
    previous.dst = dst
    buf2.setColor(1);
    buf2.setFontAlign(-1,-1);
    buf2.setFont("Vector", 20);
    buf2.drawString(dst,0,0);
    flip2_bw(0, 200);
  }
  
  // bearing, place in middle at bottom of compass
  if (previous.bs !== bs) {
    previous.bs = bs;
    buf2.setColor(1);
    buf2.setFontAlign(0, -1);
    buf2.setFont("Vector",38);
    buf2.drawString(bs,40,0);
    flip2_bw(80, 200);
  }

  // waypoint name on right
  if (previous.wp_name !== wp.name || previous.selected !== selected) {
    previous.selected = selected;
    buf2.setColor(1);
    buf2.setFontAlign(1,-1);     // right, bottom
    buf2.setFont("Vector", 20);
    buf2.drawString(wp.name, 80, 0);

    if (selected)
      flip2_bw(160, 200);
    else
      flip2_bb(160, 200);
  }
}

var savedfix;

function onGPS(fix) {
  savedfix = fix;
  if (fix!==undefined){
    satellites = fix.satellites;
  }
  
  if (candraw) {
    if (fix!==undefined && fix.fix==1){
      dist = distance(fix,wp);
      if (isNaN(dist)) dist = 0;
      wp_bearing = bearing(fix,wp);
      if (isNaN(wp_bearing)) wp_bearing = 0;
      drawN();
    }
  }
}

var intervalRef;

function stopdraw() {
  candraw=false;
  prev_course = -1;
  if(intervalRef) {clearInterval(intervalRef);}
}

function startTimers() {
  candraw=true;
  intervalRefSec = setInterval(function() {
    read_compass();
  }, 500);
}

function drawAll(){
  g.setColor(1,1,1);
  drawN();
  drawCompass(direction);
}

function startdraw(){
  g.clear();
  Bangle.drawWidgets();
  startTimers();
  candraw=true;
  drawAll();
}

function setButtons(){
  setWatch(nextwp.bind(null,-1), BTN1, {repeat:true,edge:"falling"});
  setWatch(doselect, BTN2, {repeat:true,edge:"falling"});
  setWatch(nextwp.bind(null,1), BTN3, {repeat:true,edge:"falling"});
}
 
Bangle.on('lcdPower',function(on) {
  if (on) {
    clear_previous();
    startdraw();
  } else {
    stopdraw();
  }
});

var waypoints = require("Storage").readJSON("waypoints.json")||[{name:"NONE"}];
wp=waypoints[0];

function nextwp(inc){
  if (!selected) return;
  wpindex+=inc;
  if (wpindex>=waypoints.length) wpindex=0;
  if (wpindex<0) wpindex = waypoints.length-1;
  wp = waypoints[wpindex];
  drawN();
}

function doselect(){
  if (selected && wpindex!=0 && waypoints[wpindex].lat===undefined && savedfix.fix) {
     waypoints[wpindex] ={name:"@"+wp.name, lat:savedfix.lat, lon:savedfix.lon};
     wp = waypoints[wpindex];
     require("Storage").writeJSON("waypoints.json", waypoints);
  }
  selected=!selected;
  drawN();
}

Bangle.on('kill',()=>{
  Bangle.setCompassPower(0);
  Bangle.setGPSPower(0);
});

g.clear();
Bangle.setLCDBrightness(1);
Bangle.loadWidgets();
Bangle.drawWidgets();
// load widgets can turn off GPS
Bangle.setGPSPower(1);
Bangle.setCompassPower(1);
drawAll();
startTimers();
Bangle.on('GPS', onGPS);
setButtons();
