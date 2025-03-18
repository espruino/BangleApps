var pal1color = new Uint16Array([g.theme.bg,0xFFC0],0,1);
var pal2color = new Uint16Array([g.theme.bg,g.theme.fg],0,1);
var buf1 = Graphics.createArrayBuffer(128,128,1,{msb:true});
var buf2 = Graphics.createArrayBuffer(80,40,1,{msb:true});
var intervalRef;
var bearing=0; // always point north
var heading = 0;
var oldHeading = 0;
var candraw = false;
var isCalibrating = false;
var CALIBDATA = require("Storage").readJSON("magnav.json",1)||null;

function flip1(x,y) {
  g.drawImage({width:128,height:128,bpp:1,buffer:buf1.buffer, palette:pal1color},x,y);
  buf1.clear();
}

function flip2(x,y) {
 g.drawImage({width:80,height:40,bpp:1,buffer:buf2.buffer, palette:pal2color},x,y);
 buf2.clear();
}

/*
function radians(d) {
  return (d*Math.PI) / 180;
}
*/

// takes 32ms
function drawCompass(hd) {
  if(!candraw) return;
  if (Math.abs(hd - oldHeading) < 2) return 0;
  hd=hd*Math.PI/180;
  var p = [0, 1.1071, Math.PI/4, 2.8198, 3.4633, 7*Math.PI/4 , 5.1760];

  // using polar cordinates, 64,64 is the offset from the 0,0 origin
  var poly = [
    64+60*Math.sin(hd+p[0]),       64-60*Math.cos(hd+p[0]),
    64+44.7214*Math.sin(hd+p[1]),  64-44.7214*Math.cos(hd+p[1]),
    64+28.2843*Math.sin(hd+p[2]),  64-28.2843*Math.cos(hd+p[2]),
    64+63.2455*Math.sin(hd+p[3]),  64-63.2455*Math.cos(hd+p[3]),
    64+63.2455*Math.sin(hd+p[4]),  64-63.2455*Math.cos(hd+p[4]),
    64+28.2843*Math.sin(hd+p[5]),  64-28.2843*Math.cos(hd+p[5]),
    64+44.7214*Math.sin(hd+p[6]),  64-44.7214*Math.cos(hd+p[6])
  ];

  buf1.fillPoly(poly);
  flip1(56, 56);
}

// stops violent compass swings and wobbles, takes 3ms
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

// takes approx 7ms
function tiltfixread(O,S){
  //var start = Date.now();
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

function reading(m) {
  var d = tiltfixread(CALIBDATA.offset,CALIBDATA.scale);
  heading = newHeading(d,heading);
  var dir = bearing - heading;
  if (dir < 0) dir += 360;
  if (dir > 360) dir -= 360;
  drawCompass(dir);  // we want compass to show us where to go
  oldHeading = dir;
  buf2.setColor(1);
  buf2.setFontAlign(-1,-1);
  buf2.setFont("Vector",38);
  var course = Math.round(heading);
  var cs = course.toString();
  cs = course<10?"00"+cs : course<100 ?"0"+cs : cs;
  buf2.drawString(cs,0,0);
  flip2(90, 200);
}

function calibrate(){
  var max={x:-32000, y:-32000, z:-32000},
      min={x:32000, y:32000, z:32000};
  function onMag(m) {
      max.x = m.x>max.x?m.x:max.x;
      max.y = m.y>max.y?m.y:max.y;
      max.z = m.z>max.z?m.z:max.z;
      min.x = m.x<min.x?m.x:min.x;
      min.y = m.y<min.y?m.y:min.y;
      min.z = m.z<min.z?m.z:min.z;
  }
  Bangle.on('mag', onMag);
  Bangle.setCompassPower(1, "app");
  return new Promise((resolve) => {
     setTimeout(()=>{
       Bangle.removeListener('mag', onMag);
       var offset = {x:(max.x+min.x)/2,y:(max.y+min.y)/2,z:(max.z+min.z)/2};
       var delta  = {x:(max.x-min.x)/2,y:(max.y-min.y)/2,z:(max.z-min.z)/2};
       var avg = (delta.x+delta.y+delta.z)/3;
       var scale = {x:avg/delta.x, y:avg/delta.y, z:avg/delta.z};
       resolve({offset:offset,scale:scale});
     },30000);
  });
}

function docalibrate(e,first){
  const title = "Calibrate";
  const msg = "takes 30 seconds";
  function action(b){
    if (b) {
      buf1.setColor(1);
      buf1.setFont("Vector", 20);
      buf1.setFontAlign(0,-1);
      buf1.drawString("Figure 8s",64, 0);
      buf1.drawString("to",64, 40);
      buf1.drawString("Calibrate",64, 80);
      flip1(56,56);

      calibrate().then((r)=>{
        isCalibrating = false;
        require("Storage").write("magnav.json",r);
        Bangle.buzz();
        CALIBDATA = r;
        startdraw();
        setButtons();
      });
    } else {
      startdraw();
      setTimeout(setButtons,1000);
    }
  }

  if (first === undefined) first = false;

  stopdraw();
  clearWatch();
  isCalibrating = true;

  if (first)
    E.showAlert(msg,title).then(action.bind(null,true));
  else
    E.showPrompt(msg,{title:title,buttons:{"Start":true,"Cancel":false}}).then(action);
}

function startdraw(){
  Bangle.setCompassPower(1, "app");

  g.clear();
  g.setColor(1,1,1);
  Bangle.drawWidgets();
  candraw = true;
  if (intervalRef) clearInterval(intervalRef);
  intervalRef = setInterval(reading,200);
}

function stopdraw() {
  candraw=false;

  Bangle.setCompassPower(0, "app");
  if (intervalRef) {
    clearInterval(intervalRef);
    intervalRef = undefined;
  }
}

function setButtons(){
  setWatch(()=>{load();}, BTN1, {repeat:false,edge:"falling"});
  setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
  setWatch(docalibrate, BTN3, {repeat:false,edge:"falling"});
}

Bangle.on('lcdPower',function(on) {
  if (isCalibrating) return;
  if (on) {
    startdraw();
  } else {
    stopdraw();
  }
});

Bangle.loadWidgets();
setButtons();

Bangle.setLCDPower(1);
if (CALIBDATA) startdraw(); else docalibrate({},true);
