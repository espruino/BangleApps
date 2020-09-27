var rx = 0, ry = 0;

function draw() {
  var rcx=Math.cos(rx),
    rsx=Math.sin(rx),
    rcy=Math.cos(ry),
    rsy=Math.sin(ry);
  function p(x,y,z) {
    var t;
    t = x*rcy + z*rsy;
    z = z*rcy - x*rsy;
    x=t;
    t = y*rcx + z*rsx;
    z = z*rcx - y*rsx;
    y=t;
    z += 4;
    return [g.getWidth() * (0.5 + x/z), g.getHeight() * (0.5 + y/z)];
  }

  var a;
  a = p(-1,-1,-1); g.moveTo(a[0],a[1]);
  a = p(1,-1,-1); g.lineTo(a[0],a[1]);
  a = p(1,1,-1); g.lineTo(a[0],a[1]);
  a = p(-1,1,-1); g.lineTo(a[0],a[1]);
  a = p(-1,-1,-1); g.lineTo(a[0],a[1]);
  a = p(-1,-1,1); g.moveTo(a[0],a[1]);
  a = p(1,-1,1); g.lineTo(a[0],a[1]);
  a = p(1,1,1); g.lineTo(a[0],a[1]);
  a = p(-1,1,1); g.lineTo(a[0],a[1]);
  a = p(-1,-1,1); g.lineTo(a[0],a[1]);
  a = p(-1,-1,-1); g.moveTo(a[0],a[1]);
  a = p(-1,-1,1); g.lineTo(a[0],a[1]);
  a = p(1,-1,-1); g.moveTo(a[0],a[1]);
  a = p(1,-1,1); g.lineTo(a[0],a[1]);
  a = p(1,1,-1); g.moveTo(a[0],a[1]);
  a = p(1,1,1); g.lineTo(a[0],a[1]);
  a = p(-1,1,-1); g.moveTo(a[0],a[1]);
  a = p(-1,1,1); g.lineTo(a[0],a[1]);
}

function step() {
  // rotate
  rx += 0.1;
  ry += 0.11;
  // draw
  g.clear();
  g.setColor(0xFFFF);
  draw();
}

g.clear();
setInterval(step,50);
