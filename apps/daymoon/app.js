const LOCATION_FILE = "mylocation.json";
let location;

var Utils = require("graphics_utils");
var SunCalc = require("suncalc");

const TAU = 2.0*Math.PI,MX=g.getWidth()/2,MY=g.getHeight()/2-20,R=40,X=MX+55,Y=MY+98;
const DAY_MILLIS = 86400000, DIAL=0.05;
const dR1=R+2,dR2=R+23,dR3=R+26;
var shadeCol=8196;
const M_POS = {x:MX,y:MY,r:R};
const moon_texture = {
  width : 80, height : 80, bpp : 1,transparent:0,
  buffer : require("heatshrink").decompress(atob("ABsRqAJHkEiBA0VqtVqgIEgIIBqNVBIkCkQACDg4ABGYku1Wu1GICYgSDqsVBIf71U73WigQ6FAAdABIMD/2K1YpBwATCgoTFHgUf/e7/ej1eiJw5vEn/+///9WqxAoCutVq4UEBIP//YTB3Uj0UgJw5QCgYRBE4Uq1BOCE4N3CZWq3e6UIJiGMgUPJwX/9wpBE4MXutXJ4oTBCQW71f/8R2C6onGqgTD/3v//oE4RNFKoNQl//3+//4nB/UikBOHE4ZQB/2vCYOq9FXEIImDAoNUE4O61e73e/ZQP6E5FVO4O+xxQDCYInDPAIFDE4IlCKQWj+QnJCYJPC1wTB/BPBO4TyCAoUrd4JMB1U/MgM6J5SeBJgOoPAPu1QkCAARPBKYMjE4LGB0UrFgJ3JqkLEwPv1WIwXqeIIjCd4tUkW7HgOqkUj0W/1EVE5EA1Z3B1WAwXo/+ICZWv/YnCgE6ncgCZFQgEv9wnCwGu12gCZMCUAP/0UikE63eggoTHoEAwYnB9GAgEq1GAgITJPAM70ECkEiKQITIgEAhRNBAgMAhADCBwRTDioJBlRMBAgMCCQUACANURIaKBBwImDAAhkBqMRCYNRRQITBJIInGKAxiBAAMoJ448BE4Y6CEYgCBKYQ8DYogAMHggMHKQYUGJoYAJA="))
};
const dial = { width: 23, height: 9, bpp:1, transparent:0,
  buffer: atob("///B///gAADgAADgAADgAAOAAA5///j//8A=")
 };
/* 
 now use SunCalc.getMoonIllumination()
 previously used these:
 https://github.com/espruino/BangleApps/blob/master/apps/widmp/widget.js
 https://github.com/deirdreobyrne/LunarPhase
 modified to be based on millisec instead of sec, and to use tau = 2*pi
*/

// requires the myLocation app
function loadLocation() {
  location = require("Storage").readJSON(LOCATION_FILE,1)||{"lat":51.5072,"lon":0.1276,"location":"London"};
}

function drawMoon(shape){
  g.setColor(0,0,0).fillCircle(MX,MY,R+30);
  g.setColor(1,1,1).fillCircle(MX,MY,R-1);
  g.setColor(1,1,0).drawImage(moon_texture,MX,MY,{rotate:0});
  //later can set the rotation here to the parallacticAngle from getMoonPosition
  g.setColor(shadeCol).fillPoly(shape);
  //later set rotation of the fillPoly? parallactic-mp.angle I think. use g.transformVertices 
}

function drawSunTime(times){
  radT=[tToRad(times[0]),tToRad(times[1])];
  hhmm=[require("locale").time(times[0],1),require("locale").time(times[1],1)];
  g.setColor(0.6,0.6,1);
  Utils.fillArc(g,MX,MY,R+9,R+26,radT[0],radT[1]);
  g.setColor(0,0,0.2);
  Utils.fillArc(g,MX,MY,R+9,R+26,radT[1]-TAU,radT[0]);
  g.setFont('6x8').setColor(0,1,1);
  g.setFontAlign(-1,1,0).drawString(hhmm[0],MX-(R+26),MY+R+26);
  g.setFontAlign(1,1,0).drawString(hhmm[1],MX+(R+26),MY+R+26);
}

function drawDial() {
  let r=56;
  let labels=['6P','12A','6A','12P'];
  let offx=[-11,2,12,2];
  let offy=[1,-11,1,14];
  g.setFont('4x6').setFontAlign(0,0,0).setColor(0,1,1);
  //draw dots & labels
  let j =0;
  for (var i=0;i<24;i++) {
    let a=i*TAU/24;
    let ds = (i%3 == 0) ? 2 : 1;
    let pX = MX+Math.cos(a)*r;
    let pY = MY+Math.sin(a)*r;
    g.fillCircle(pX,pY,ds);
    if (i%6==0) {
      //console.log(i,j);
      g.drawString(labels[j],pX+offx[j],pY+offy[j]);
      j++;
    }
  }
}

function drawHHMM(d) {
  var HM=require("locale").time(d, 1 /*omit seconds*/).split(":");
  //write digital time
  g.setBgColor(0,0,0).setColor(1,1,1).setFontVector(46);
  g.setFontAlign(1,1,0).drawString("    "+HM[0],MX,g.getHeight()+7,true);
  g.setFontAlign(-1,1,0).drawString(HM[1]+"    ",MX+10,g.getHeight()+7,true);
  var meridian = require("locale").meridian(d);
}

function moonShade(pos,mp) {
  pos = pos !== undefined ? pos : M_POS;
  mp = mp !== undefined ? mp : SunCalc.getMoonIllumination(new Date());
  //position has x,y, r for the drawing, mp is from SunCalc Moon Illumination
  let k=mp.fraction;
  //k is the percent along the equator of the terminator
  const pts = Math.min(pos.r>>1,32); 
  //this gives r/2 pts on the way down and up, capped at 64 total for polyfill
  let a=[],b=[],s1=1,s2=0;
  // scale s1 is 1 or -1 for fixed edge of the shadow; defined via case switches below
  // scale s2 factor for the moving edge of the shadow
  // need to do some computation to simplify for new/full moon if k 'close enough' to 0 or 1/-1
  //  
  let isWaxing=(mp.phase<0.5);
  s1 = isWaxing ? -1 : 1;
  s2 = isWaxing ? 1-2*k : 2*k-1;
  let tr =(pos.r+0.5);
  for (var i=0;i<pts;i++) {

    //down stroke on the outer shadow
    var t = i*Math.PI/(pts+1); //pts+1 so we leave the last point for the starting of going up
    let cirX = Math.sin(t)*tr;
    let cirY = Math.cos(t)*tr;
    a.push(pos.x+s1*cirX); //x
    a.push(pos.y+cirY);    //y
    b.push(pos.x+s2*cirX); //x for shadow edge
    b.push(pos.y-cirY);    //y going up for shadow edge
  }
  return a.concat(b);
}

function tToRad(date) {
  date =  (date !== undefined) ? new Date(date.getTime()) : new Date();
  let milli = date - new Date(date.setHours(0,0,0,0));
  return (milli/DAY_MILLIS +0.25)*TAU;
}

function draw() {
  // work out how to display the current time
  var d = new Date(), a=tToRad(d);
  var shape = moonShade(M_POS,SunCalc.getMoonIllumination(d));
  var sTimes = SunCalc.getTimes(d,location.lat,location.lon);
  var daylight = [sTimes.sunrise,sTimes.sunset];
  drawHHMM(d);
  drawMoon(shape);
  drawSunTime(daylight);
  drawDial();
  //draw pointer 
  //Maybe later make this an overlay that can be removed?? -avoid drawing so much every minute/second
  g.setColor(1,0,0).drawImage(dial,MX+58*Math.cos(a),MY+58*Math.sin(a),{rotate:a});

}

// Clear the screen once, at startup
g.reset();
// requires the myLocation app
loadLocation();
g.setBgColor(0,0,0).clear();
// draw immediately at first
draw();
// now draw every second
// eventually maybe update the moon just every hour??
var secondInterval = setInterval(draw, 10000); //was 1000
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    secondInterval = setInterval(draw, 10000); //was 1000
    draw(); // draw immediately
  }
});
/* Show launcher when middle button pressed
This should be done *before* Bangle.loadWidgets so that
widgets know if they're being loaded into a clock app or not */
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();