//function draw_eye()
var s = Object.assign({
  // default values
  bgColor: "#57FF4F",
  noseColor: "#FF0000",
  widgetsOn: false,
}, require('Storage').readJSON("goofster.settings.json", true) || {});

function percentToAngle(p) {
  return p * 2 * Math.PI - Math.PI / 2;
}

function drawCircleStroke(x, y, r, thickness, bg) {
  //orig = g.getColor();
  g.setColor("#000000");
  g.fillCircle(x, y, r);
  g.setColor(bg);
  g.fillCircle(x, y, r - thickness);
  //g.setColor(orig);
}

function pointOnCircle(cx, cy, radius, percent) {
  let angle = percent * 2 * Math.PI;
  angle -= Math.PI / 2;
  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius
  };
}

function fillArc(x, y, rOuter, rInner, start, end) {
  const points = [];

  // Outer arc
  for (let a = start; a <= end; a += 0.2) {
    points.push(x + Math.cos(a) * rOuter);
    points.push(y + Math.sin(a) * rOuter);
  }

  // Inner arc (reverse direction)
  for (let a = end; a >= start; a -= 0.2) {
    points.push(x + Math.cos(a) * rInner);
    points.push(y + Math.sin(a) * rInner);
  }
  g.setColor("#000000");
  g.fillPoly(points);
}

function noseDraw(){
  var cx= width/2;
  var cy= height*7/12;
  var radius= width/8;
  var p = pointOnCircle(cx,cy,(radius-(radius/6)-2),0.9);
  g.setColor(s.noseColor);
  g.fillCircle(cx,cy,radius);
  g.setColor("#FFFFFF");
  g.fillCircle(p.x,p.y,radius/6);

}

function smileDraw(){
  var cx = width/2;
  var cy = height*9 / 12;
  var radius = width/5;
  const start = percentToAngle(0.25);
  const end   = percentToAngle(0.75);
  fillArc(cx,cy,radius,radius-6,start,end);
}

function eyeDraw(cx,cy,radius,value,maxvalue){
  p = pointOnCircle(cx,cy,(radius-(radius/3)-4),value/maxvalue);
  drawCircleStroke(cx,cy,radius,3,"#FFFFFF");
  g.setColor("#000000");
  g.fillCircle(p.x,p.y,radius/3);
  //drawCircleStroke(cx,cy,radius/3,1,"#FFFFFF");
}

function hourIncrement(){
globalHour = globalHour++;
if (globalHour > 12){
  globalHour = 1;
}
globalMinute = globalHour++;
if (globalHour > 60){
  globalHour = 1;
}
}

function draw() {
  // work out how to display the current time
  var d = new Date();
  var clock = require("locale").time(d);
  var meridian = require("locale").meridian(d);
  var time = clock + " " + meridian;
  var hours = d.getHours();

  hours = hours % 12;
  if (hours===0) hours=12;
  var minutes = d.getMinutes();
  var seconds =d.getSeconds();
  var iHours = hours + (minutes/60);
  var iMinutes = minutes + (seconds/60);
  var hEye = { w: width/4, h: height/2.5, r:width/4.5 };
  var mEye = { w: width*3/4, h: height/2.5, r:width/4.5 };


  // Reset the state of the graphics library
  g.reset();
  // Clear the area where we want to draw the time
  //g.setBgColor('#9BFF77');
  g.setBgColor(s.bgColor);
  //g.setBgColor('#5BFF84');
  g.clearRect(0,0,width,height);
  //g.setBgColor('#55FFAA');
  // draw the current time
  g.drawString(time, 50, 50);
  //g.drawCircleAA(60, 80, 20);
  //hour
  //drawCircleStroke(hEye.w,hEye.h,hEye.r,2,"#FFFFFF");
  eyeDraw(hEye.w,hEye.h,hEye.r,iHours,12);
  eyeDraw(mEye.w,mEye.h,mEye.r,iMinutes,60);
  smileDraw();
  
  //minutess
  //drawCircleStroke(width*3/4,height/2.5,width/4.5,2,"#FFFFFF");
  //nose
  noseDraw();
  
  // Load and display widgets
  if (s.widgetsOn==true){
    Bangle.loadWidgets();
    Bangle.drawWidgets();
  }
}

const width = g.getWidth();
const height = g.getHeight();
//const nosecolor = "#FF0000";
//var globalHour = 1;
//var globalMinute = 1;
// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();
// now draw every second
var secondInterval = setInterval(draw, 1000);
//var tenInterval = setInterval(hourIncrement,10000);

// Show launcher when middle button pressed
Bangle.setUI("clock");
