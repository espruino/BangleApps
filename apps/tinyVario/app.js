Bangle.setBarometerPower(true, "tinyVario");
Bangle.setGPSPower(true, "tinyVario");

require("Font8x16").add(Graphics);

var intTime=10;
var altH = [];
var fAlt=0;
var roc,rocAvg;
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
  
}, BTN1);*/

setInterval(function () { 
  altH.push(fAlt);
  if (altH.length>=intTime) altH.shift();
}, 1000);

setInterval(function() {
  //var y=0;
  //gs=100;
  //fAlt=7777;
  if ((!flying) && ((rocAvg>1) || (rocAvg<-1) || (gs>10))) { //take-off detected
    takeoffTime=Date().getTime();
    flying=true;
    flyingTime=0;
  } 
  if (flying) {
    flyingTime=Date().getTime()-takeoffTime;
    ftString=(flyingTime / 3600000).toFixed(0)+":"+(flyingTime / 60000 % 60).toFixed(0).padStart(2,'0');
  }
  
  rocAvg=(altH[altH.length-1]-altH[0])/intTime;
  roc=(altH[altH.length-1]-altH[altH.length-2]);
  var timeStr = require("locale").time(Date(),1);
  
  g.reset();
  g.clear();
  //draw altitude
  g.setFont("8x16",3).setFontAlign(1,-1).drawString((fAlt).toFixed(0)+"m", g.getWidth(), y); 
  //-------------
  y+=16*3;
  g.drawLine(24,y-2,g.getWidth(),y-2);
  //draw rate of climb
  if (roc>0.1) g.setColor(0,1,0);
  if (roc<-1) g.setColor(1,0,0);
  g.setFont("8x16",3).setFontAlign(1,-1).drawString(rocAvg.toFixed(1), g.getWidth()-20, y);
  g.setColor(1,1,1);
  g.setFont("8x16",2).setFontAlign(-1,-1).drawString("m", g.getWidth()-20, y);
  g.setFont("8x16",2).setFontAlign(-1,-1).drawString("s", g.getWidth()-20, y+20);
  g.drawLine(g.getWidth()-20,y+26,g.getWidth()-8,y+26);
  //-------------
  y+=16*3;
  g.drawLine(24,y-2,g.getWidth(),y-2);
  //draw groundspeed
  if (!isNaN(gs)) {
    g.setFont("8x16",3).setFontAlign(1,-1).drawString(gs.toFixed(0), g.getWidth()-20, y);
    g.setFont("8x16",1).setFontAlign(-1,-1).drawString("km", g.getWidth()-20, y+4);
    g.setFont("8x16",1).setFontAlign(-1,-1).drawString("h", g.getWidth()-20, y+24);
    g.drawLine(g.getWidth()-20,y+21,g.getWidth()-8,y+21);
  }  
  //-------------
  y+=16*3;
  g.drawLine(0,y-2,g.getWidth(),y-2);
  g.drawLine(24,0,24,y-2);
  g.drawLine(g.getWidth()/2,y-2,g.getWidth()/2,g.getHeight()-1);
  g.setColor(1,1,1);
  //draw flight time
  if (flying) {
    g.setFont("8x16",2).setFontAlign(0,-1).drawString(ftString, g.getWidth()*0.75, 14*10+4);
  }
  //draw time
  g.setFont("8x16",2).setFontAlign(0,-1).drawString(timeStr, g.getWidth()/4, 14*10+4);
  //draw bar graph
  if (roc>0.1) g.setColor(0,1,0);
  if (roc<-1) g.setColor(1,0,0);
  g.fillRect(0,(y-2)/2,23,Math.clip((y-2)/2-roc*20,0,y-2));
}, 250);
