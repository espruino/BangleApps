Bangle.loadWidgets();
g.clear(1);
Bangle.drawWidgets();
var R = Bangle.appRect;

var x = 0;
var last;

function getY(v) {
  return (R.y+R.y2 + v*R.h/2)/2;
}
Bangle.on('accel', a => {
  g.reset();
  if (last) {
    g.setColor("#f00").drawLine(x-1,getY(last.x),x,getY(a.x));
    g.setColor("#0f0").drawLine(x-1,getY(last.y),x,getY(a.y));
    g.setColor("#00f").drawLine(x-1,getY(last.z),x,getY(a.z));
  }
  last = a;x++;
  if (x>=g.getWidth()) {
    x = 1;
    g.clearRect(R);
  }
});
