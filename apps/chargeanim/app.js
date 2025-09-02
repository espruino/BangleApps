
var settings = Object.assign({
  // default values
  showBatPercent: true,
  showTime: true,
  
  
  }, require("Storage").readJSON("chargeAnimSettings.json", true) || {});


g.setBgColor(0, 0, 0);
g.clear().flip();
var imgbat = require("heatshrink").decompress(atob("nFYhBC/AH4A/AGUeACA22HEo3/G8YrTAC422HBQ2tHBI3/G/43/G/43/G/43/G/43/G/43/G+fTG+vSN+w326Q31GwI3/G9g2WG742CG/43rGwY3yGwg33RKo3bNzQ3bGwo3/G9A2GG942dG/43QGw43uGxA34IKw3VGyY3iG0I3pb8pBRG+wYPG8wYQG/42uG8oZSG/43bDKY3iDKg3cNzI3iRKo3gGyo3/G7A2WG7g2aG/43WGzA3dGzI3/G6fTGzRvcG/43/G/43/G/43/G/43/G/43/G/437HFw2IHFo2KAH4A/AH4Aa"));
var imgbubble = require("heatshrink").decompress(atob("i0UhAebgoAFCaYXNBocjAAIWNCYoVHCw4UFIZwqELJQWFKZQVOChYVzABwVaCx7wKCqIWNCg4WMChIXJCZgAnA=="));
require("Font8x12").add(Graphics);
var batteryPercentStr="";
var W=g.getWidth(),H=g.getHeight();
var b2v = (W != 240)?-1:1;
var b2rot = (W != 240)?Math.PI:0;
var b2scale = W/240.0;
var bubbles = [];
for (var i=0;i<10;i++) {
  bubbles.push({y:Math.random()*H,ly:0,x:(0.5+(i<5?i:i+8))*W/18,v:0.6+Math.random(),s:0.5+Math.random()});
}

g.setFont("Vector",22);
g.setFontAlign(0,0);

var clockStr="";
var x=g.getWidth()/2;
var cy=g.getHeight()-(g.getHeight()/7)
var by=g.getHeight()-(g.getHeight()/3.500)


function calculateTime(){

  var d=new Date();
  clockStr = require("locale").time(d, 1); // Hour and minute
  var meridian=require("locale").meridian(d);
  if(meridian!=""){
    //Meridian active
    clockStr=clockStr+" "+meridian;
  }
  
}
function calculate(){
  if(settings.showTime==true){
    calculateTime();
  }
  if(settings.showBatPercent==true){
    batteryPercentStr=E.getBattery()+"%";
  }
  
  
}

function anim() {
  /* we don't use any kind of buffering here. Just draw one image
  at a time (image contains a background) too, and there is minimal
  flicker. */  
  var mx = W/2.0;
  var my;
  if(settings.showBatPercent){
    var my = H/2.5;
  }else{
    var my = H/2.0;
  }
  
  
  bubbles.forEach(f=>{
    f.y-=f.v * b2v;
    if (f.y<-24)
      f.y=H+8;
    else if (f.y > (H+8))
      f.y=0;
    g.drawImage(imgbubble,f.y,f.x,{scale:f.s * b2scale, rotate:b2rot});
  });
  g.drawImage(imgbat, mx,my,{scale:b2scale, rotate:Math.sin(getTime()*2)*0.5-Math.PI/2 + b2rot});
  if(settings.showTime==true){
    g.drawString(clockStr,x,cy);
  }
  if(settings.showBatPercent==true){
    g.drawString(batteryPercentStr,x,by,true);
  }
  g.flip();
  
  
}
  
if(settings.showBatPercent||settings.showTime){
  //Eliminate unnesccesary need for calculation
  calculate();
  setInterval(calculate,20000);
}

setInterval(anim,22);


Bangle.on("charging", isCharging => {
  if (!isCharging) load();
});
