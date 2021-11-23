var BTNL, BTNR, BTNU, BTNA;
if (process.env.HWVERSION==2) {
  var tap = {};
  // use tapping on screen for left,right,accel
  Bangle.on('drag',e=>tap=e);
  BTNL = { read : _=>tap.b && tap.x < 58};
  BTNR = { read : _=>tap.b && tap.x > 117};
  BTNU = { read : _=>tap.b && tap.x > 58 && tap.x < 117};
  // use button for fire
  BTNA = BTN1;
} else {
  // use hard buttons
  BTNL = BTN4;
  BTNR = BTN5;
  BTNU = BTN1;
  BTNA = BTN2;
  Bangle.setLCDMode("doublebuffered");
}
var W = g.getWidth();
var H = g.getHeight();
g.clear().setFontAlign(0,-1);

function newAst(x,y) {
  var a = {
    x:x,y:y,
    vx:Math.random()-0.5,
    vy:Math.random()-0.5,
    rad:3+Math.random()*5
  };
  return a;
}

var running = true;
var ship = {};
var ammo = [];
var ast = [];
var score = 0;
var level = 4;
var timeSinceFired = 0;
var lastFrame;

function gameStop() {
  running = false;
  g.clear();
  g.drawString("Game Over!",120,(H-6)/2);
  g.flip();
}

function addAsteroids() {
  for (var i=0;i<level;i++) {
    var d,x,y;
    do {
      x = Math.random()*W; y = Math.random()*H;
      var dx = x-ship.x, dy = y-ship.y;
      d = Math.sqrt(dx*dx+dy*dy);
    } while (d<10);
    ast.push(newAst(x,y));
  }
}

function gameStart() {
  ammo = [];
  ast = [];
  score = 0;
  level = 4;
  ship = { x:W/2,y:H/2,r:0,v:0 };
  timeSinceFired = 0;
  addAsteroids();
  running = true;
}


function onFrame() {
  "ram"
  var t = getTime();
  var d = (lastFrame===undefined)?0:(t-lastFrame)*20;
  lastFrame = t;

  if (!running) {
    if (BTNA.read()) gameStart();
    return;
  }

  if (BTNL.read()) ship.r-=0.1*d;
  if (BTNR.read()) ship.r+=0.1*d;
  ship.v *= Math.pow(0.9,d);
  if (BTNU.read()) ship.v+=0.2*d;
  ship.x += Math.cos(ship.r)*ship.v*d;
  ship.y += Math.sin(ship.r)*ship.v*d;
  if (ship.x<0) ship.x+=W;
  if (ship.y<0) ship.y+=H;
  if (ship.x>=W) ship.x-=W;
  if (ship.y>=H) ship.y-=H;
  timeSinceFired+=d;
  if (BTNA.read() && timeSinceFired>4) { // fire!
    Bangle.beep(10);
    timeSinceFired = 0;
    ammo.push({
      x:ship.x+Math.cos(ship.r)*4,
      y:ship.y+Math.sin(ship.r)*4,
      vx:Math.cos(ship.r)*3,
      vy:Math.sin(ship.r)*3,
    });
  }

  g.clear();
  g.drawString(score,W-20,0);
  var rs = Math.PI*0.8;
  g.drawPoly([
    ship.x+Math.cos(ship.r)*4, ship.y+Math.sin(ship.r)*4,
    ship.x+Math.cos(ship.r+rs)*3, ship.y+Math.sin(ship.r+rs)*3,
    ship.x+Math.cos(ship.r-rs)*3, ship.y+Math.sin(ship.r-rs)*3,
  ],true);
  var na = [];
  ammo.forEach(function(a) {
    a.x += a.vx*d;
    a.y += a.vy*d;
    g.fillRect(a.x-1, a.y, a.x+1, a.y);
    g.fillRect(a.x, a.y-1, a.x, a.y+1);
    var hit = false;
    ast.forEach(function(b) {
      var dx = a.x-b.x;
      var dy = a.y-b.y;
      var d = Math.sqrt(dx*dx+dy*dy);
      if (d<b.rad) {
        hit=true;
        b.hit=true;
        score++;
      }
    });
    if (!hit && a.x>=0 && a.y>=0 && a.x<W && a.y<H)
      na.push(a);
  });
  ammo=na;
  na = [];
  var crashed = false;
  ast.forEach(function(a) {
    a.x += a.vx*d;
    a.y += a.vy*d;
    g.drawCircle(a.x, a.y, a.rad);
    if (a.x<0) a.x+=W;
    if (a.y<0) a.y+=H;
    if (a.x>=W) a.x-=W;
    if (a.y>=H) a.y-=H;
    if (!a.hit) {
      na.push(a);
    } else if (a.rad>4) {
      Bangle.buzz(100);
      a.hit = false;
      var vx = 1*(Math.random()-0.5);
      var vy = 1*(Math.random()-0.5);
      a.rad/=2;
      na.push({
        x:a.x,
        y:a.y,
        vx:a.vx-vx,
        vy:a.vy-vy,
        rad:a.rad,
      });
      a.vx += vx;
      a.vy += vy;
      na.push(a);
    }

    var dx = a.x-ship.x;
    var dy = a.y-ship.y;
    var d = Math.sqrt(dx*dx+dy*dy);
    if (d < a.rad) crashed = true;
  });
  ast=na;
  if (!ast.length) {
    level++;
    addAsteroids();
  }
  g.flip();
  if (crashed) {
    Bangle.buzz(500);
    gameStop();
  }
}

gameStart();
setInterval(onFrame, 50);
