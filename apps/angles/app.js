g.clear().setRotation(1);
// g.setRotation ALSO changes accelerometer axes
var avrAngle = undefined;
var history = [];

var R = Bangle.appRect;
var relativeTo = undefined;

function draw(v) {
  if (v===undefined) v = Bangle.getAccel();
  // current angle
  var d = Math.sqrt(v.y*v.y + v.z*v.z);
  var ang = Math.atan2(-v.x, d)*180/Math.PI;
  // Median filter
  if (history.length > 10) history.shift(); // pull old reading off the start
  history.push(ang);
  avrAngle = history.slice().sort()[(history.length-1)>>1]; // median filter
  // Render
  var x = R.x + R.w/2;
  var y = R.y + R.h/2;
  g.reset().clearRect(R).setFontAlign(0,0);
  var displayAngle = avrAngle;
  g.setFont("6x15").drawString("ANGLE (DEGREES)", x, R.y2-8);
  if (relativeTo!==undefined) {
    g.drawString("RELATIVE TO", x,y-50);
    g.setFont("Vector:30").drawString(relativeTo.toFixed(1),x,y-30);
    y += 20;
    displayAngle = displayAngle-relativeTo;
  }
  g.setFont("Vector:60").drawString(displayAngle.toFixed(1),x,y);

}

draw();
Bangle.on('accel',draw);

// Pressing the button turns relative angle on/off
Bangle.setUI({
  mode : "custom",
  btn : function(n) {
    if (relativeTo===undefined)
      relativeTo = avrAngle;
    else
      relativeTo = undefined;
    draw();
  }
});