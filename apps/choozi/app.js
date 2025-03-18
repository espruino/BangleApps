
/* Choozi - Choose people or things at random using Bangle.js.
 * Inspired by the "Chwazi" Android app
 *
 * James Stanley 2021
 */
const GU = require("graphics_utils");
var colours = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ffffff'];
var colours2 = ['#808080', '#404040', '#000040', '#004000', '#400000', '#ff8000', '#804000', '#4000c0'];

var stepAngle = 0.18; // radians - resolution of polygon
var gapAngle = 0.035; // radians - gap between segments
var perimMin = g.getWidth()*0.40; // px - min. radius of perimeter
var perimMax = g.getWidth()*0.49; // px - max. radius of perimeter

var segmentMax = g.getWidth()*0.38; // px - max radius of filled-in segment
var segmentStep = 5; // px - step size of segment fill animation
var circleStep = 4; // px - step size of circle fill animation

// rolling ball animation:
var maxSpeed = 0.08; // rad/sec
var minSpeed = 0.001; // rad/sec
var animStartSteps = 300; // how many steps before it can start slowing?
var accel = 0.0002; // rad/sec/sec - acc-/deceleration rate
var ballSize = 3; // px - ball radius
var ballTrack = perimMin - ballSize*2; // px - radius of ball path

var centreX = g.getWidth()*0.5; // px - centre of screen
var centreY = g.getWidth()*0.5; // px - centre of screen

var fontSize = 50; // px

var radians = 2*Math.PI; // radians per circle

var defaultN = 3; // default value for N
var minN = 2;
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

// draw the arc segments around the perimeter
function drawPerimeter() {
  g.setBgColor('#000000');
  g.clear();
  for (var i = 0; i < N; i++) {
    g.setColor(colours[i%colours.length]);
    var minAngle = (i/N)*radians;
    GU.fillArc(g, centreX, centreY, perimMin,perimMax,minAngle,minAngle+arclen, stepAngle);
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
    if (process.env.HWVERSION == 2) g.flip();
  }
}

// choose a winning segment and animate its selection
function choose() {
  var chosen = Math.floor(Math.random()*N);
  var minAngle = (chosen/N)*radians;
  var maxAngle = minAngle + arclen;
  animateChoice((minAngle+maxAngle)/2);
  g.setColor(colours[chosen%colours.length]);
  for (var i = segmentMax-segmentStep; i >= 0; i -= segmentStep){
    GU.fillArc(g, centreX, centreY, i, perimMax, minAngle, maxAngle, stepAngle);
    if (process.env.HWVERSION == 2) g.flip();
  }
  GU.fillArc(g, centreX, centreY, 0, perimMax, minAngle, maxAngle, stepAngle);
  for (var r = 1; r < segmentMax; r += circleStep){
    g.fillCircle(centreX,centreY,r);
    if (process.env.HWVERSION == 2) g.flip();
  }
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

// save N to choozi.save
function writeN() {
  var savedN = read();
  if (savedN != N) require("Storage").write("choozi.save","" + N);
}

function read(){
  var n = require("Storage").read("choozi.save");
  if (n !== undefined) return parseInt(n);
  return defaultN;
}

// load N from choozi.save
function readN() {
  setN(read());
}

if (process.env.HWVERSION == 1){
  colours=colours.concat(colours2);
  shuffle(colours);
} else {
  shuffle(colours);
  shuffle(colours2);
  colours=colours.concat(colours2);
}

var maxN = colours.length;
if (process.env.HWVERSION == 1){
  Bangle.setLCDMode("direct");
  Bangle.setLCDTimeout(0); // keep screen on
}
readN();
drawN();

Bangle.setUI("updown", (v)=>{
  if (!v){
    writeN();
    drawPerimeter();
    choose();
  } else {
    setN(N-v);
    drawN();
  }
});
