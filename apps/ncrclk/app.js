var locale = require("locale");

var bgimg = {
  width : 100, height : 100, bpp : 4,
  buffer : require("heatshrink").decompress(atob("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"))
}

function getImg(g, col) {
  return {
    width:g.getWidth(),
    height:g.getHeight(),
    bpp:1,transparent:0,
    buffer:g.buffer,
    palette:new Uint16Array([0,col])};
}

var handSizeMin = 40;
var handSizeHr = 25;
var handSizeSec = 50;
var gmin = Graphics.createArrayBuffer(6,handSizeMin*2,1,{msb:true});
var gminimg = getImg(gmin, 0xFFFF);
var ghr = Graphics.createArrayBuffer(8,handSizeHr*2,1,{msb:true});
var ghrimg = getImg(ghr, g.setColor("#E0E0E0").getColor());
var gsec = Graphics.createArrayBuffer(2,handSizeSec*2,1,{msb:true});
var gsecimg = getImg(gsec, g.setColor("#FF0000").getColor());
var lastDate;

// create hand images
var c = gmin.getHeight()/2;
var o = 8; // overhang
gmin.fillCircle(2,2,2);
gmin.fillCircle(2,c+o,2);
gmin.fillRect(0,2,4,c+o);
c = ghr.getHeight()/2;
ghr.fillCircle(4,4,4);
ghr.fillCircle(4,c+o,4);
ghr.fillRect(0,4,7,c+o);
c = gsec.getHeight()/2;
gsec.fillRect(0,1,2,c+o);

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
    var y1 = (g.getHeight()/2)-10 - 36;
    var x2 = (g.getWidth()/2)+10;
    var y2 = (g.getHeight()/2)+10 - 36;
    function addPt(ang, r, ry) {
      var x = (g.getWidth()/2) + Math.sin(ang)*r + Math.cos(ang)*ry;
      var y = (g.getHeight()/2) - Math.cos(ang)*r + Math.sin(ang)*ry - 36;
      //g.setColor("#ff0000").fillRect(x-2,y-2,x+2,y+2);
      if (x<x1)x1=x;
      if (y<y1)y1=y;
      if (x>x2)x2=x;
      if (y>y2)y2=y;
    }
    function addSec(r) {
      addPt(r,handSizeSec+5,5);addPt(r,handSizeSec+5,-5);
      addPt(r,-(o+10),5);addPt(r,-(o+10),-5);
    }
    function addMin(r) {
      addPt(r,handSizeMin,5);addPt(r,handSizeMin,-5);
      addPt(r,-(o+8),5);addPt(r,-(o+8),-5);
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
    {image:bgimg,x:20,y:25,scale:2},
    {image:ghrimg,x:120,y:120-31,center:true,rotate:rhr},
    {image:gminimg,x:120,y:120-31,center:true,rotate:rmin},
    {image:gsecimg,x:120,y:120-31,center:true,rotate:rsec}
  ],bounds);
  lastrsec = rsec;
  lastrmin = rmin;
  lastrhr = rhr;

  // Date
  var date = locale.date(new Date(),false);
  if (date === lastDate) return;
  lastDate = date;
  g.reset();
  g.setFont("6x8");
  g.setFontAlign(0,-1);
  g.drawString(date, g.getWidth()/2, 232, true);
}

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

// Show launcher when button pressed
Bangle.setUI("clock");

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
drawHands(true);
