const SunCalc = require("suncalc"); // from modules folder

// ################################################################################

let ScreenWidth  = g.getWidth(),  CenterX = ScreenWidth/2;
let ScreenHeight = g.getHeight(), CenterY = ScreenHeight/2;
let outerRadius = Math.min(CenterX,CenterY) * 0.9;

const lat = 50.1;
const lon = 14.45;

const h = g.getHeight();
const w = g.getWidth();
const sm = 15;
let settings, location, mode = 0;
var altitude, temperature;

var img_north = Graphics.createImage(`
    X    
   XXX   
   XXX   
  X XXX  
  X XXX  
 X  XXXX 
 X  XXXX 
X   XXXXX
X   XXXXX
XXXXXXXXX
`);

var img_sunrise = Graphics.createImage(`
   XXX   
  XXXXX  
XXXXXXXXX
`);

var img_moonrise = Graphics.createImage(`
   XXX   
  XX  X  
XXXXXXXXX
`);

var img_altitude = Graphics.createImage(`
X       X
X   X   X
XXXXXXXXX
X   X   X
X       X
`);

var img_temperature = Graphics.createImage(`
 XX      
XXXXXXXX 
X      XX
XXXXXXXX 
 XX      
`);

var img_battery = Graphics.createImage(`
XXXXXXXX 
XXX    X 
XXXX   XX
XXXXX  X 
XXXXXXXX 
`);

var img_step = Graphics.createImage(`
     XXX 
 XX XXXXX
XXX XXXXX
XXX XXXXX
 XX XXXX 
`);

var img_sun = Graphics.createImage(`
X       X
   XXX   
 XXXXXXX 
XXXXXXXXX
XXXXXXXXX
XXXXXXXXX
 XXXXXXX 
   XXX   
X       X
`);

var img_moon = Graphics.createImage(`
   XXX   
 XX  XXX 
X    XXXX
X     XXX
X     XXX
X     XXX
X    XXXX
 X   XXX 
   XXX   
`);

let use_compass = 0;

function draw() {
  drawBorders();
  queueDraw();
}

function radA(p) { return p*(Math.PI*2); }
function radD(d) { return d*(h/2); }

function radX(p, d) {
  let a = radA(p);
  return h/2 + Math.sin(a)*radD(d);
}

function radY(p, d) {
  let a = radA(p);
  return w/2 - Math.cos(a)*radD(d);
}

function fracHour(d) {
  let hour = d.getHours();
  let min = d.getMinutes();
  hour = hour + min/60;
  if (hour > 12)
    hour -= 12;
  return hour;
}

  let HourHandLength = outerRadius * 0.5;
  let HourHandWidth  = 2*3, halfHourHandWidth = HourHandWidth/2;

  let MinuteHandLength = outerRadius * 0.7;
  let MinuteHandWidth  = 2*2, halfMinuteHandWidth = MinuteHandWidth/2;

  let SecondHandLength = outerRadius * 0.9;
  let SecondHandOffset = 6;

  let twoPi  = 2*Math.PI;
  let Pi     = Math.PI;
  let halfPi = Math.PI/2;

  let sin = Math.sin, cos = Math.cos;

  let HourHandPolygon = [
    -halfHourHandWidth,halfHourHandWidth,
    -halfHourHandWidth,halfHourHandWidth-HourHandLength,
     halfHourHandWidth,halfHourHandWidth-HourHandLength,
     halfHourHandWidth,halfHourHandWidth,
  ];

  let MinuteHandPolygon = [
    -halfMinuteHandWidth,halfMinuteHandWidth,
    -halfMinuteHandWidth,halfMinuteHandWidth-MinuteHandLength,
     halfMinuteHandWidth,halfMinuteHandWidth-MinuteHandLength,
     halfMinuteHandWidth,halfMinuteHandWidth,
  ];

/**** drawClockFace ****/

  function drawClockFace () {
    g.setColor(g.theme.fg);
    g.setFont('Vector', 22);

    g.setFontAlign(0,-1);
    g.drawString('12', CenterX,CenterY-outerRadius);

    g.setFontAlign(1,0);
    g.drawString('3', CenterX+outerRadius,CenterY);

    g.setFontAlign(0,1);
    g.drawString('6', CenterX,CenterY+outerRadius);

    g.setFontAlign(-1,0);
    g.drawString('9', CenterX-outerRadius,CenterY);
  }

/**** transforme polygon ****/

  let transformedPolygon = new Array(HourHandPolygon.length);

  function transformPolygon (originalPolygon, OriginX,OriginY, Phi) {
    let sPhi = sin(Phi), cPhi = cos(Phi), x,y;

    for (let i = 0, l = originalPolygon.length; i < l; i+=2) {
      x = originalPolygon[i];
      y = originalPolygon[i+1];

      transformedPolygon[i]   = OriginX + x*cPhi + y*sPhi;
      transformedPolygon[i+1] = OriginY + x*sPhi - y*cPhi;
    }
  }

/**** draw clock hands ****/

  function drawClockHands () {
    let now = new Date();

    let Hours   = now.getHours() % 12;
    let Minutes = now.getMinutes();
    let Seconds = now.getSeconds();

    let HoursAngle   = (Hours+(Minutes/60))/12 * twoPi - Pi;
    let MinutesAngle = (Minutes/60)            * twoPi - Pi;
    let SecondsAngle = (Seconds/60)            * twoPi - Pi;

    g.setColor(g.theme.fg);

    transformPolygon(HourHandPolygon, CenterX,CenterY, HoursAngle);
    g.fillPoly(transformedPolygon);

    transformPolygon(MinuteHandPolygon, CenterX,CenterY, MinutesAngle);
    g.fillPoly(transformedPolygon);

    let sPhi = Math.sin(SecondsAngle), cPhi = Math.cos(SecondsAngle);

    g.setColor(g.theme.fg2);
    g.drawLine(
      CenterX + SecondHandOffset*sPhi,
      CenterY - SecondHandOffset*cPhi,
      CenterX - SecondHandLength*sPhi,
      CenterY + SecondHandLength*cPhi
    );

    g.setFont('Vector', 22);

    g.setFontAlign(-1, 1);
    g.drawString(now.getDate(), CenterX-outerRadius,CenterY+outerRadius);

  }

function drawTimeIcon(time, icon, options) {
  let h = fracHour(time);
  let x = radX(h/12, 0.7);
  let y = radY(h/12, 0.7);
  g.drawImage(icon, x,y, options);
}

function drawOutsideIcon(h, icon, options) {
  let x = radX(h, 0.95);
  let y = radY(h, 0.95);
  g.drawImage(icon, x,y, options);
}

function drawBorders() {
  g.reset();
  g.setColor(0);
  g.fillRect(Bangle.appRect);

  g.setColor(-1);
  g.fillCircle(w/2, h/2, h/2 - 2);
  if (0) {
    g.fillCircle(sm+1, sm+1, sm);
    g.fillCircle(sm+1, h-sm-1, sm);
    g.fillCircle(w-sm-1, h-sm-1, sm);
    g.fillCircle(h-sm-1, sm+1, sm);
  }
  g.setColor(0, 1, 0);
  g.drawCircle(h/2, w/2, radD(0.7));
  g.drawCircle(h/2, w/2, radD(0.5));

  outerRadius = radD(0.7);
  drawClockHands();

  let d = new Date();
  let hour = fracHour(d);
  let min = d.getMinutes();
  let day = d.getDay();
  day = day + hour/24;
  {
    let x = radX(hour/12, 0.7);
    let y = radY(hour/12, 0.7);
    g.setColor(0, 0, 0);
    g.fillCircle(x,y, 5);
  }
  {
    let x = radX(min/60, 0.5);
    let y = radY(min/60, 0.5);
    g.setColor(0, 0, 0);
    g.drawLine(h/2, w/2, x, y);
  }
  {
    let x = radX(hour/12, 0.3);
    let y = radY(hour/12, 0.3);
    g.setColor(0, 0, 0);
    g.drawLine(h/2, w/2, x, y);
  }
  {
    let km = 0.001 * 0.719 * Bangle.getHealthStatus("day").steps;
    let x = radX(km/12 + 0, 0.95);
    let y = radY(km/12 + 0, 0.95);
    g.setColor(0, 0.7, 0);
    g.drawImage(img_step, x,y, { scale: 2, rotate: Math.PI*0.0 } );
  }
  {
    let bat = E.getBattery();
    let x = radX(bat/100, 0.95);
    let y = radY(bat/100, 0.95);
    g.setColor(0.7, 0, 0);
    g.drawImage(img_battery, x,y, { scale: 2, rotate: Math.PI*0.0 } );
  }
  {
    d = new Date();
    sun = SunCalc.getTimes(d, lat, lon);
    g.setColor(0.5, 0.5, 0);
    print("sun", sun);
    drawTimeIcon(sun.sunset, img_sunrise, { rotate: Math.PI, scale: 2 });
    drawTimeIcon(sun.sunrise, img_sunrise, { scale: 2 });
    g.setColor(0, 0, 0);
    moon = SunCalc.getMoonTimes(d, lat, lon);
    print("moon", moon);
    drawTimeIcon(moon.set, img_moonrise, { rotate: Math.PI, scale: 2 });
    drawTimeIcon(moon.rise, img_sunrise, { scale: 2 });
    pos = SunCalc.getPosition(d, lat, lon);
    print("sun:", pos);
    if (pos.altitude > -0.1) {
      g.setColor(0.5, 0.5, 0);
      az = pos.azimuth;
      drawOutsideIcon(az / (2*Math.PI), img_sun, { scale: 2 });
    }
    pos = SunCalc.getMoonPosition(d, lat, lon);
    print("moon:", pos);
    if (pos.altitude > -0.05) {
      g.setColor(0, 0, 0);
      az = pos.azimuth;
      drawOutsideIcon(az / (2*Math.PI), img_moon, { scale: 2 });
    }
  }
  {
    Bangle.getPressure().then((x) =>
      { altitude = x.altitude; temperature = x.temperature; },
      print);
    print(altitude, temperature);
    drawOutsideIcon(altitude / 120, img_altitude, { scale: 2 });
    drawOutsideIcon(temperature / 12, img_temperature, { scale: 2 });
  }
  if (use_compass) {
    let obj = Bangle.getCompass();
    if (obj) {
      let h = 360-obj.heading;
      let x = radX(h/360, 0.7);
      let y = radY(h/360, 0.7);
      g.setColor(0, 0, 1);
      g.drawImage(img_north, x,y, {scale:2});
    }
  }
  {
    let x = radX(day/7, 0.95);
    let y = radY(day/7, 0.95);
    g.setColor(0, 0, 0);
    g.fillCircle(x,y, 5);
  }
}

function drawEmpty() {
  g.reset();
  g.setColor(g.theme.bg);
  g.fillRect(Bangle.appRect);
}

Bangle.on('touch', function(button, xy) {
  var x = xy.x;
  var y = xy.y;
  if (y > h) y = h;
  if (y < 0) y = 0;
  if (x > w) x = w;
  if (x < 0) x = 0;
});

// if we get a step then we are not idle
Bangle.on('step', s => {
});

// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  next = 60000;
  if (use_compass) next = 250;
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, next - (Date.now() % next));
}

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});

Bangle.setUI("clockupdown", btn=> {
  if (btn<0) use_compass = 0;
  if (btn>0) use_compass = 1;
  Bangle.setCompassPower(use_compass, 'orloj');
  draw();
});

if (use_compass)
  Bangle.setCompassPower(true, 'orloj');
g.clear();
draw();

