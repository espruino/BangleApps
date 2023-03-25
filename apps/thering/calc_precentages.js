/*

Used to calculate the x,y coordinates (so that we can manuall create
images) of the outer circumference of a rotating ring guage where
cx,cy is the centre of the screen r1 is the radius of the circle.  p
is the % completion or % measure for the guage to take we need to
generate images at percentages 0,2,4,7,10,20....100


the output is below

p=0 x=88 y=4
p=2 x=99 y=5
p=4 x=109 y=7
p=7 x=124 y=12
p=10 x=137 y=20
p=20 x=168 y=62
p=30 x=168 y=114
p=40 x=137 y=156
p=50 x=88 y=172
p=60 x=39 y=156
p=70 x=8 y=114
p=80 x=8 y=62
p=90 x=39 y=20

*/

const h = g.getHeight();
const w = g.getWidth();

function radians(a) {
  return a*Math.PI/180;
}

function calc() {
  var i = 0;
  var r1 = (w/2) - 4;
  var startrot = 0 - 180;
  var endrot = -360  - 180;
  var cx = w/2;
  var cy = h/2;
  var p = 0;

  // calc coords for each percentage point
  for (i = startrot; i > endrot; i -= 3.6) {
    x = cx + r1 * Math.sin(radians(i));
    y = cy + r1 * Math.cos(radians(i));
    x = Math.round(x);
    y = Math.round(y);

    if (p==2 || p==4 || p==7 || p % 10 == 0)
      print('p=' + p + ' x=' + x + ' y=' + y);
    p++;
  }
}

g.clear();
calc();
