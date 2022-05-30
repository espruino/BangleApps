Bangle.setBarometerPower(true, "tinyVario");
Bangle.setGPSPower(true, "tinyVario");

require("Font8x16").add(Graphics);

var intTime=10;
var altH = [];
var fAlt=0;
var roc;
var gs;
var lastPressure = Date.now();
var flying=false;
var takeoffTime, flyingTime;


Bangle.on('pressure', function(e) {
  if ((fAlt)==0) fAlt=e.altitude;
  fAlt=fAlt+(e.altitude-fAlt)*0.1;
});

Bangle.on('GPS', function(fix) {
  gs=fix.speed;
});
          
/*setWatch(function() {
  
}, (process.env.HWVERSION==2) ? BTN1 : BTN2, {repeat:true});*/

setInterval(function () { 
  altH.push(fAlt);
  if (altH.length>=intTime) altH.shift();
}, 1000);

setInterval(function() {
  if ((!flying) && ((roc>1) || (roc<-1) || (gs>10))) { //take-off detected
    takeoffTime=Date().getTime();
    flying=true;
    flyingTime=0;
  } 
  if (flying) {
    flyingTime=Date().getTime()-takeoffTime;
    ftString=(flyingTime / 3600000).toFixed(0)+":"+(flyingTime / 60000 % 60).toFixed(0).padStart(2,'0');
  }
  
  roc=(altH[altH.length-1]-altH[0])/intTime;
  var timeStr = require("locale").time(Date(),1);
  
  g.reset();
  g.clear();
  g.setFont("8x16",4).setFontAlign(1,-1).drawString((fAlt).toFixed(0)+"m", g.getWidth(), 0);
  //gs=100;
  if (!isNaN(gs)) {
    g.setFont("8x16",3).setFontAlign(1,-1).drawString(gs.toFixed(0), g.getWidth()-20, 14*7);
    g.setFont("8x16",1).setFontAlign(-1,1).drawString("km", g.getWidth()-20, 14*8.5);
    g.setFont("8x16",1).setFontAlign(-1,-1).drawString("h", g.getWidth()-20, 14*8.5);
  }
  g.setColor(0.5,0.5,0.5);
  g.drawLine(0,14*4,g.getWidth(),14*4);
  g.drawLine(0,14*7,g.getWidth(),14*7);
  g.drawLine(0,14*10,g.getWidth(),14*10);
  g.drawLine(g.getWidth()/2,14*10,g.getWidth()/2,g.getHeight()-1);

  g.setColor(1,1,1);
  if (flying) {
    g.setFont("8x16",2).setFontAlign(0,-1).drawString(ftString, g.getWidth()*0.75, 14*10+4);
  }
  g.setFont("8x16",2).setFontAlign(0,-1).drawString(timeStr, g.getWidth()/4, 14*10+4);
  if (roc>0.1) g.setColor(0,1,0);
  if (roc<-1) g.setColor(1,0,0);
  
  g.setFont("8x16",3).setFontAlign(1,-1).drawString(roc.toFixed(1), g.getWidth()-20, 58);
  g.setFont("8x16",2).setFontAlign(-1,-1).drawString("m", g.getWidth()-20, 51);
  g.setFont("8x16",2).setFontAlign(-1,-1).drawString("s", g.getWidth()-20, 71);
  g.drawLine(g.getWidth()-20,77,g.getWidth()-8,77);
  g.drawLine(g.getWidth()-20,14*8.5-1,g.getWidth()-8,14*8.5-1);

}, 250);
