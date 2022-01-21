g.clear();
var old = {x:0,y:0};
var W = g.getWidth();
var H = g.getHeight();

Bangle.on('accel',function(v) {
  var max = Math.max(Math.abs(v.x),Math.abs(v.y),Math.abs(v.z));
  if (Math.abs(v.y)==max) {
    v = {x:v.x,y:v.z,z:v.y};
  } else if (Math.abs(v.x)==max) {
    v = {x:v.z,y:v.y,z:v.x};
  }

  var d = Math.sqrt(v.x*v.x+v.y*v.y);
  var ang = Math.atan2(d,Math.abs(v.z))*180/Math.PI;

  g.reset();
  g.clearRect(W*(1/4),0,W*(3/4),16);// clear behind text
  g.setFont("6x8",2).setFontAlign(0,-1).drawString(ang.toFixed(1),W/2,0);
  var n = {
    x:E.clip(W/2+v.x*256,4,W-4),
    y:E.clip(H/2+v.y*256,4,H-4)};
  g.clearRect(old.x-3,old.y-3,old.x+6,old.y+6); // clear old marker
  g.setColor("#0f0");
  g.fillRect(n.x-3,n.y-3,n.x+6,n.y+6); // draw new marker
  // draw rings
  g.setColor("#f00");
  g.drawCircle(W/2,H/2,W*(1/12));
  g.drawCircle(W/2,H/2,W*(1/4));
  g.drawCircle(W/2,H/2,W*(5/12));
  old = n;
});

setWatch(_=>load(), BTN1);
if (global.BTN2) {
  setWatch(_=>load(), BTN2);
  setWatch(_=>load(), BTN3);
}
