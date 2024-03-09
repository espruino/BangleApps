const falcon9 = Graphics.createImage(`
     xxxxx    
 xxxxx   xxxxx
     x   x    
     x   x    
     xxxxx    
     xxxxx    
     xxxxx    
     xxxxx    
     xxxxx    
     xxxxx    
     xxxxx    
     xxxxx    
     xxxxx    
     xxxxx    
     xxxxx    
     xxxxx   
     xxxxx    
     xxxxx  
   xxxxxxxxx 
 xx  xxxxx  xx
xx           xx`);

const droneShip = Graphics.createImage(`
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
`);

const droneX = Math.floor(Math.random()*(g.getWidth()-droneShip.width-40) + 20)
const cloudOffs = Math.floor(Math.random()*g.getWidth()/2);

const oceanHeight = g.getHeight()*0.1;

const targetY = g.getHeight()-oceanHeight-falcon9.height/2;

var booster = { x : g.getWidth()/4 + Math.random()*g.getWidth()/2,
                y : 20,
                vx : 0,
                vy : 0,
                mass : 100,
                fuel : 100 };

var exploded = false;
var nExplosions = 0;
//var landed = false;
var lightning = 0;

var settings = require("Storage").readJSON('f9settings.json', 1) || {};

const gravity = 4;
const dt = 0.1;
const fuelBurnRate = 20*(176/g.getHeight());
const maxV = 12;

function flameImageGen (throttle) {
  var str = " xxx \n xxx \n";
  str += "xxxxx\n".repeat(throttle);
  str += " xxx \n  x  \n";
  return Graphics.createImage(str);
}

function drawFalcon(x, y, throttle, angle) {
  g.setColor(1, 1, 1).drawImage(falcon9, x, y, {rotate:angle});
  if (throttle>0 || lightning>0) {
    var flameImg = flameImageGen(throttle);
    var r = falcon9.height/2 + flameImg.height/2-1;
    var xoffs = -Math.sin(angle)*r;
    var yoffs = Math.cos(angle)*r;
    if (Math.random()>0.7) g.setColor(1, 0.5, 0);
    else g.setColor(1, 1, 0);
    if (throttle>0) g.drawImage(flameImg, x+xoffs, y+yoffs, {rotate:angle});
    if (lightning>1 && lightning<30) {
      for (var i=0; i<6; ++i) {
        var r = Math.random()*6;
        var x = Math.random()*5 - xoffs;
        var y = Math.random()*5 - yoffs;
        g.setColor(1, Math.random()*0.5+0.5, 0).fillCircle(booster.x+x, booster.y+y, r);
      }
    }
  }
}

function drawLightning() {
  var c = {x:cloudOffs+50, y:30};
  var dx = c.x-booster.x;
  var dy = c.y-booster.y;
  var m1 = {x:booster.x+0.6*dx+Math.random()*20, y:booster.y+0.6*dy+Math.random()*10};
  var m2 = {x:booster.x+0.4*dx+Math.random()*20, y:booster.y+0.4*dy+Math.random()*10};
  g.setColor(1, 1, 1).drawLine(c.x, c.y, m1.x, m1.y).drawLine(m1.x, m1.y, m2.x, m2.y).drawLine(m2.x, m2.y, booster.x, booster.y);
}

function drawBG() {
  if (lightning==1) {
    g.setBgColor(1, 1, 1).clear();
    Bangle.buzz(200);
    return;
  }
  g.setBgColor(0.2, 0.2, 1).clear();
  g.setColor(0, 0, 1).fillRect(0, g.getHeight()-oceanHeight, g.getWidth()-1, g.getHeight()-1);
  g.setColor(0.5, 0.5, 1).fillCircle(cloudOffs+34, 30, 15).fillCircle(cloudOffs+60, 35, 20).fillCircle(cloudOffs+75, 20, 10);
  g.setColor(1, 1, 0).fillCircle(g.getWidth(), 0, 20);
  g.setColor(1, 1, 1).drawImage(droneShip, droneX, g.getHeight()-oceanHeight-1);
}

function showFuel() {
  g.setColor(0, 0, 0).setFont("4x6:2").setFontAlign(-1, -1, 0).drawString("Fuel: "+Math.abs(booster.fuel).toFixed(0), 4, 4);
}

function renderScreen(input) {
  drawBG();
  showFuel();
  drawFalcon(booster.x, booster.y, Math.floor(input.throttle*12), input.angle);
  if (lightning>1 && lightning<6) drawLightning();
}

function getInputs() {
  var accel = Bangle.getAccel();
  var a = Math.PI/2 + Math.atan2(accel.y, accel.x);
  var t = (1+accel.z);
  if (t > 1) t = 1;
  if (t < 0) t = 0;
  if (booster.fuel<=0) t = 0;
  if (lightning>0 && lightning<20) t = 0;
  return {throttle: t, angle: a};
}

function epilogue(str) {
  g.setFont("Vector", 24).setFontAlign(0, 0, 0).setColor(0, 0, 0).drawString(str, g.getWidth()/2, g.getHeight()/2).flip();
  g.setFont("Vector", 16).drawString("<= again      exit =>", g.getWidth()/2, g.getHeight()/2+20);
  clearInterval(stepInterval);
  Bangle.on("swipe", (d) => { if (d>0) load(); else load('f9lander.app.js'); });
}

function gameStep() {
  if (exploded) {
    if (nExplosions++ < 15) {
      var r = Math.random()*25;
      var x = Math.random()*30 - 15;
      var y = Math.random()*30 - 15;
      g.setColor(1, Math.random()*0.5+0.5, 0).fillCircle(booster.x+x, booster.y+y, r);
      if (nExplosions==1) Bangle.buzz(600);
    }
    else epilogue("You crashed!");
  }
  else {
    var input = getInputs();
    if (booster.y >= targetY) {
      if (Math.abs(booster.x-droneX-droneShip.width/2)<droneShip.width/2 && Math.abs(input.angle)<Math.PI/8 && booster.vy<maxV) {
        renderScreen({angle:0, throttle:0});
        epilogue("You landed!");
      }
      else exploded = true;
    }
    else {
      if (lightning) ++lightning;
      if (settings.lightning && (lightning==0||lightning>40) && Math.random()>0.98) lightning = 1;
      booster.x += booster.vx*dt;
      booster.y += booster.vy*dt;
      booster.vy += gravity*dt;
      booster.fuel -= input.throttle*dt*fuelBurnRate;
      booster.vy += -Math.cos(input.angle)*input.throttle*gravity*3*dt;
      booster.vx += Math.sin(input.angle)*input.throttle*gravity*3*dt;
      renderScreen(input);
    }
  }
}

var stepInterval;
Bangle.setLCDTimeout(0);
renderScreen({angle:0, throttle:0});
g.setFont("Vector", 24).setFontAlign(0, 0, 0).setColor(0, 0, 0).drawString("Swipe to start", g.getWidth()/2, g.getHeight()/2);
Bangle.on("swipe", () => {
  stepInterval = setInterval(gameStep, Math.floor(1000*dt));
  Bangle.removeListener("swipe");
});
