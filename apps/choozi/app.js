
/* Choozi - Choose people or things at random using Bangle.js.
 * Inspired by the "Chwazi" Android app
 *
 * James Stanley 2021
 */

var colours = ['#ff0000', '#ff8080', '#00ff00', '#80ff80', '#0000ff', '#8080ff', '#ffff00', '#00ffff', '#ff00ff', '#ff8000', '#ff0080', '#8000ff', '#0080ff'];

var stepAngle = 0.18; // radians - resolution of polygon
var gapAngle = 0.035; // radians - gap between segments
var perimMin = 110; // px - min. radius of perimeter
var perimMax = 120; // px - max. radius of perimeter

var segmentMax = 106; // px - max radius of filled-in segment
var segmentStep = 5; // px - step size of segment fill animation
var circleStep = 4; // px - step size of circle fill animation

// rolling ball animation:
var maxSpeed = 0.08; // rad/sec
var minSpeed = 0.001; // rad/sec
var animStartSteps = 300; // how many steps before it can start slowing?
var accel = 0.0002; // rad/sec/sec - acc-/deceleration rate
var ballSize = 3; // px - ball radius
var ballTrack = 100; // px - radius of ball path

var centreX = 120; // px - centre of screen
var centreY = 120; // px - centre of screen

var fontSize = 50; // px

var radians = 2*Math.PI; // radians per circle

var defaultN = 3; // default value for N
var minN = 2;
var maxN = colours.length;
var N;
var arclen;

// https://www.frankmitchell.org/2015/01/fisher-yates/
function shuffle (array) {
  var i = 0
    , j = 0
    , temp = null;

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

// draw an arc between radii minR and maxR, and between
// angles minAngle and maxAngle
function arc(minR, maxR, minAngle, maxAngle) {
  var step = stepAngle;
  var angle = minAngle;
  var inside = [];
  var outside = [];
  var c, s;
  while (angle < maxAngle) {
    c = Math.cos(angle);
    s = Math.sin(angle);
    inside.push(centreX+c*minR); // x
    inside.push(centreY+s*minR); // y
    // outside coordinates are built up in reverse order
    outside.unshift(centreY+s*maxR); // y
    outside.unshift(centreX+c*maxR); // x
    angle += step;
  }
  c = Math.cos(maxAngle);
  s = Math.sin(maxAngle);
  inside.push(centreX+c*minR);
  inside.push(centreY+s*minR);
  outside.unshift(centreY+s*maxR);
  outside.unshift(centreX+c*maxR);
  
  var vertices = inside.concat(outside);
  g.fillPoly(vertices, true);
}

// draw the arc segments around the perimeter
function drawPerimeter() {
  g.clear();
  for (var i = 0; i < N; i++) {
    g.setColor(colours[i%colours.length]);
    var minAngle = (i/N)*radians;
    arc(perimMin,perimMax,minAngle,minAngle+arclen);
  }
}

// animate a ball rolling around and settling at "target" radians
function animateChoice(target) {
  var angle = 0;
  var speed = 0;
  var oldx = -10;
  var oldy = -10;
  var decelFromAngle = -1;
  var allowDecel = false;
  for (var i = 0; true; i++) {
    angle = angle + speed;
    if (angle > radians) angle -= radians;
    if (i < animStartSteps || (speed < maxSpeed && !allowDecel)) {
      speed = speed + accel;
      if (speed > maxSpeed) {
        speed = maxSpeed;
        /* when we reach max speed, we know how long it takes
         * to accelerate, and therefore how long to decelerate, so
         * we can work out what angle to start decelerating from */
        if (decelFromAngle < 0) {
          decelFromAngle = target-angle;
          while (decelFromAngle < 0) decelFromAngle += radians;
          while (decelFromAngle > radians) decelFromAngle -= radians;
        }
      }
    } else {
      if (!allowDecel && (angle < decelFromAngle) && (angle+speed >= decelFromAngle)) allowDecel = true;
      if (allowDecel) speed = speed - accel;
      if (speed < minSpeed) speed = minSpeed;
      if (speed == minSpeed && angle < target && angle+speed >= target) return;
    }

    var r = i/2;
    if (r > ballTrack) r = ballTrack;
    var x = centreX+Math.cos(angle)*r;
    var y = centreY+Math.sin(angle)*r;
    g.setColor('#000000');
    g.fillCircle(oldx,oldy,ballSize+1);
    g.setColor('#ffffff');
    g.fillCircle(x, y, ballSize);
    oldx=x;
    oldy=y;
  }
}

// choose a winning segment and animate its selection
function choose() {
  var chosen = Math.floor(Math.random()*N);
  var minAngle = (chosen/N)*radians;
  var maxAngle = minAngle + arclen;
  animateChoice((minAngle+maxAngle)/2);
  g.setColor(colours[chosen%colours.length]);
  for (var i = segmentMax-segmentStep; i >= 0; i -= segmentStep)
    arc(i, perimMax, minAngle, maxAngle);
  arc(0, perimMax, minAngle, maxAngle);
  for (var r = 1; r < segmentMax; r += circleStep)
    g.fillCircle(centreX,centreY,r);
  g.fillCircle(centreX,centreY,segmentMax);
}

// draw the current value of N in the middle of the screen, with
// up/down arrows
function drawN() {
  g.setColor('#ffffff');
  g.setFont("Vector",fontSize);
  g.drawString(N,centreX-g.stringWidth(N)/2+4,centreY-fontSize/2);
  if (N < maxN)
    g.fillPoly([centreX-6,centreY-fontSize/2-7, centreX+6,centreY-fontSize/2-7, centreX, centreY-fontSize/2-14]);
  if (N > minN)
    g.fillPoly([centreX-6,centreY+fontSize/2+5, centreX+6,centreY+fontSize/2+5, centreX, centreY+fontSize/2+12]);
}

// update number of segments, with min/max limit, "arclen" update,
// and screen reset
function setN(n) {
  N = n;
  if (N < minN) N = minN;
  if (N > maxN) N = maxN;
  arclen = radians/N - gapAngle;
  drawPerimeter();
}

// save N to choozi.txt
function writeN() {
  var file = require("Storage").open("choozi.txt","w");
  file.write(N);
}

// load N from choozi.txt
function readN() {
  var file = require("Storage").open("choozi.txt","r");
  var n = file.readLine();
  if (n !== undefined) setN(parseInt(n));
  else setN(defaultN);
}

shuffle(colours); // is this really best?
Bangle.setLCDMode("direct");
Bangle.setLCDTimeout(0); // keep screen on
readN();
drawN();

setWatch(() => {
  setN(N+1);
  drawN();
}, BTN1, {repeat:true});

setWatch(() => {
  writeN();
  drawPerimeter();
  choose();
}, BTN2, {repeat:true});

setWatch(() => {
  setN(N-1);
  drawN();
}, BTN3, {repeat:true});
