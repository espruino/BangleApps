var bgimg = require("Storage").read("analogimgclk.bg.img");

function getImg(g, col) {
  return {
    width:g.getWidth(),
    height:g.getHeight(),
    bpp:1,transparent:0,
    buffer:g.buffer,
    palette:new Uint16Array([0,col])};
}

var handSizeMin = 90;
var handSizeHr = 60;
var handSizeSec = 96;
var gmin = Graphics.createArrayBuffer(12,handSizeMin*2,1,{msb:true});
var gminimg = getImg(gmin, 0xFFFF);
var ghr = Graphics.createArrayBuffer(16,handSizeHr*2,1,{msb:true});
var ghrimg = getImg(ghr, g.setColor("#E0E0E0").getColor());
var gsec = Graphics.createArrayBuffer(6,handSizeSec*2,1,{msb:true});
var gsecimg = getImg(gsec, g.setColor("#FF0000").getColor());

// create hand images
var c = gmin.getHeight()/2;
var o = 16; // overhang
gmin.fillCircle(6,6,6);
gmin.fillCircle(6,c+o,6);
gmin.fillRect(0,6,11,c+o);
c = ghr.getHeight()/2;
ghr.fillCircle(8,8,8);
ghr.fillCircle(8,c+o,8);
ghr.fillRect(0,8,15,c+o);
c = gsec.getHeight()/2;
gsec.fillCircle(3,3,3);
gsec.fillCircle(3,c+o,3);
gsec.fillRect(0,3,5,c+o);

// last positions of hands (in radians)
var lastrmin=0, lastrhr=0, lastrsec=0;

// draw hands - just the bit of the image that changed
function drawHands(full) {
  var d = new Date();
  var rsec = d.getSeconds()*Math.PI/30;
  var rmin = d.getMinutes()*Math.PI/30;
  // hack so hour hand only moves every 10 minutes
  var rhr = (d.getHours() + Math.round(d.getMinutes()/10)/6)*Math.PI/6;
  var bounds = {};
  if (!full) { // work out the bounds of the hands
    var x1 = (g.getWidth()/2)-10;
    var y1 = (g.getHeight()/2)-10;
    var x2 = (g.getWidth()/2)+10;
    var y2 = (g.getHeight()/2)+10;
    function addPt(ang, r, ry) {
      var x = (g.getWidth()/2) + Math.sin(ang)*r + Math.cos(ang)*ry;
      var y = (g.getHeight()/2) - Math.cos(ang)*r + Math.sin(ang)*ry;
      //g.setColor("#ff0000").fillRect(x-2,y-2,x+2,y+2);
      if (x<x1)x1=x;
      if (y<y1)y1=y;
      if (x>x2)x2=x;
      if (y>y2)y2=y;
    }
    function addSec(r) {
      addPt(r,handSizeSec,5);addPt(r,handSizeSec,-5);
      addPt(r,-(o+8),5);addPt(r,-(o+8),-5);
    }
    function addMin(r) {
      addPt(r,handSizeMin,8);addPt(r,handSizeMin,-8);
      addPt(r,-(o+8),8);addPt(r,-(o+8),-8);
    }
    function addHr(r) {
      addPt(r,handSizeHr,8);addPt(r,handSizeHr,-8);
      addPt(r,-(o+8),8);addPt(r,-(o+8),-8);
    }
    if (rsec!=lastrsec) {
      addSec(rsec);addSec(lastrsec);
    }
    if (rmin!=lastrmin) {
      addMin(rmin);addMin(lastrmin);
    }
    if (rhr!=lastrhr) {
      addHr(rhr);addHr(lastrhr);
    }
    bounds = {x:x1,y:y1,width:1+x2-x1,height:1+y2-y1};
  }

  g.drawImages([
    {image:bgimg,x:24,y:24},
    {image:ghrimg,x:120,y:120,center:true,rotate:rhr},
    {image:gminimg,x:120,y:120,center:true,rotate:rmin},
    {image:gsecimg,x:120,y:120,center:true,rotate:rsec}
  ],bounds);
  lastrsec = rsec;
  lastrmin = rmin;
  lastrhr = rhr;
}

if (g.drawImages) {
  var secondInterval = setInterval(drawHands,1000);
  // handle display switch on/off
  Bangle.on('lcdPower', (on) => {
    if (secondInterval) {
      clearInterval(secondInterval);
      secondInterval = undefined;
    }
    if (on) {
      drawHands();
      secondInterval = setInterval(drawHands,1000);
    }
  });

  g.clear();
  drawHands(true);
} else {
  E.showMessage("Please update\nBangle.js firmware\nto use this clock","analogimgclk");
}

// Show launcher when button pressed
Bangle.setUI("clock");
