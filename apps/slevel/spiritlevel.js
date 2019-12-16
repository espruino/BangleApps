g.clear();
var old = {x:0,y:0};
Bangle.on('accel',function(v) {
  var max = Math.max(Math.abs(v.x),Math.abs(v.y),Math.abs(v.z));
  if (Math.abs(v.y)==max) {
    v = {x:v.x,y:v.z,z:v.y};
  } else if (Math.abs(v.x)==max) {
    v = {x:v.z,y:v.y,z:v.x};
  }

  var d = Math.sqrt(v.x*v.x+v.y*v.y);
  var ang = Math.atan2(d,Math.abs(v.z))*180/Math.PI;
  
  g.setColor(1,1,1);
  g.setFont("6x8",2);
  g.setFontAlign(0,-1);
  g.clearRect(60,0,180,16);
  g.drawString(ang.toFixed(1),120,0);
  var n = {
    x:E.clip(120+v.x*256,4,236),
    y:E.clip(120+v.y*256,4,236)};
  g.clearRect(old.x-3,old.y-3,old.x+6,old.y+6);
  g.setColor(1,1,1);
  g.fillRect(n.x-3,n.y-3,n.x+6,n.y+6);
  g.setColor(1,0,0);
  g.drawCircle(120,120,20);
  g.drawCircle(120,120,60);
  g.drawCircle(120,120,100);
  old = n;
});
