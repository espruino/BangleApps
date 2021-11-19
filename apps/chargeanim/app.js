g.setBgColor(0, 0, 0);
g.clear().flip();
var imgbat = require("heatshrink").decompress(atob("mlU4X/8EHA4Pg//m/9VADlAFoUBBg47EBjxlKqtUBhUVqAMKgoM/Bn4MvhgMLkAMY0AMKgQMYhWABhUqBjGqBhUCBhqbKhQMLlQMY1QMKH4OoBixMBBhQ/BBhgACQYQMEBYYMHH4IADEwwMEGobPHBhugBhbQDBiapFBg6CEBihMDBhA/DBgyDBBhjCJBgLPKBhxMEBg0KH4gMUBYgMGhAMYmAMLAAwM/Bn4MpqgMKitVBhVVADI"));
var imgbubble = require("heatshrink").decompress(atob("i0UhAebgoAFCaYXNBocjAAIWNCYoVHCw4UFIZwqELJQWFKZQVOChYVzABwVaCx7wKCqIWNCg4WMChIXJCZgAnA=="));

var W=g.getWidth(),H=g.getHeight();
var b2v = (W != 240)?-1:1;
var b2rot = (W != 240)?Math.PI:0;
var bubbles = [];
for (var i=0;i<10;i++) {
  bubbles.push({y:Math.random()*H,ly:0,x:(0.5+(i<5?i:i+8))*W/18,v:0.6+Math.random(),s:0.5+Math.random()});
}

function anim() {
  /* we don't use any kind of buffering here. Just draw one image
  at a time (image contains a background) too, and there is minimal
  flicker. */  
  var mx = W/2.0, my = H/2.0;
  bubbles.forEach(f=>{
    f.y-=f.v * b2v;
    if (f.y<-24)
      f.y=H+8;
    else if (f.y > (H+8))
      f.y=0;
    g.drawImage(imgbubble,f.y,f.x,{scale:f.s, rotate:b2rot});
  });
  g.drawImage(imgbat, mx,my,{scale:W/240.0, rotate:Math.sin(getTime()*2)*0.5-Math.PI/2 + b2rot});
  g.flip();
}

setInterval(anim,20);

Bangle.on("charging", isCharging => {
  if (!isCharging) load();
});
