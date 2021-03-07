var pal1color = new Uint16Array([0x0000,0xFFC0],0,1);
var pal2color = new Uint16Array([0x0000,0xffff],0,1);
var buf1 = Graphics.createArrayBuffer(160,160,1,{msb:true});
var buf2 = Graphics.createArrayBuffer(80,40,1,{msb:true});
var img = require("heatshrink").decompress(atob("lEowIPMjAEDngEDvwED/4DCgP/wAEBgf/4AEBg//8AEBh//+AEBj///AEBn///gEBv///wmCAAImCAAIoBFggE/AkaaEABo="));

var bearing=0; // always point north
var heading = 0;
var candraw = false;
var CALIBDATA = require("Storage").readJSON("magnav.json",1)||null;

Bangle.setLCDTimeout(30);

function flip1(x,y) {
 g.drawImage({width:160,height:160,bpp:1,buffer:buf1.buffer, palette:pal1color},x,y);
 buf1.clear();
}

function flip2(x,y) {
 g.drawImage({width:80,height:40,bpp:1,buffer:buf2.buffer, palette:pal2color},x,y);
 buf2.clear();
}

function radians(d) {
  return (d*Math.PI) / 180;
}

function drawCompass(course) {
  if(!candraw) return;

  buf1.setColor(1);
  buf1.fillCircle(80,80,79,79);
  buf1.setColor(0);
  buf1.fillCircle(80,80,69,69);
  buf1.setColor(1);
  buf1.drawImage(img, 80, 80, {scale:3,  rotate:radians(course)} );
  flip1(40, 30);
}

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
function reading() {
  var d = tiltfixread(CALIBDATA.offset,CALIBDATA.scale);
  heading = newHeading(d,heading);
  var dir = bearing - heading;
  if (dir < 0) dir += 360;
  if (dir > 360) dir -= 360;
  drawCompass(dir);  // we want compass to show us where to go
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
  var ref = setInterval(()=>{
      var m = Bangle.getCompass();
      max.x = m.x>max.x?m.x:max.x;
      max.y = m.y>max.y?m.y:max.y;
      max.z = m.z>max.z?m.z:max.z;
      min.x = m.x<min.x?m.x:min.x;
      min.y = m.y<min.y?m.y:min.y;
      min.z = m.z<min.z?m.z:min.z;
  }, 100);
  return new Promise((resolve) => {
     setTimeout(()=>{
       if(ref) clearInterval(ref);
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
      buf1.setFont("Vector", 30);
      buf1.setFontAlign(0,-1);
      buf1.drawString("Figure 8s",80, 40);
      buf1.drawString("to",80, 80);
      buf1.drawString("Calibrate",80, 120);
      flip1(40,40);

      calibrate().then((r)=>{
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
  if (first===undefined) first=false;
  stopdraw();
  clearWatch();
  if (first) 
    E.showAlert(msg,title).then(action.bind(null,true));
  else 
    E.showPrompt(msg,{title:title,buttons:{"Start":true,"Cancel":false}}).then(action);
}

var intervalRef;

function startdraw(){
  g.clear();
  g.setColor(1,1,1);
  Bangle.drawWidgets();
  candraw = true;
  intervalRef = setInterval(reading,200);
}

function stopdraw() {
  candraw=false;
  if(intervalRef) {clearInterval(intervalRef);}
}

function setButtons(){
  setWatch(()=>{load();}, BTN1, {repeat:false,edge:"falling"});
  setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
  setWatch(docalibrate, BTN3, {repeat:false,edge:"falling"});
}
 
Bangle.on('lcdPower',function(on) {
  if (on) {
    startdraw();
  } else {
    stopdraw();
  }
});

Bangle.on('kill',()=>{Bangle.setCompassPower(0);});

Bangle.loadWidgets();
Bangle.setCompassPower(1);
startdraw();
setButtons();
