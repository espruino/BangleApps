/**
 * Bangle.js Numerals Clock
 *
 * + Original Author: Raik M. https://github.com/ps-igel
 * + Created: April 2020
 * + see README.md for details
 */

var numerals = {
  0:[[9,1,82,1,90,9,90,82,82,90,9,90,1,82,1,9,9,1],[30,21,61,21,69,29,69,61,61,69,30,69,22,61,22,29,30,21]],
  1:[[59,1,82,1,90,9,90,82,82,90,73,90,65,82,65,27,59,27,51,19,51,9,59,1]],
  2:[[9,1,82,1,90,9,90,47,82,55,21,55,21,64,82,64,90,72,90,82,82,90,9,90,1,82,1,43,9,35,70,35,70,25,9,25,1,17,1,9,9,1]],
  3:[[9,1,82,1,90,9,90,82,82,90,9,90,1,82,1,74,9,66,70,66,70,57,9,57,1,49,1,41,9,33,70,33,70,25,9,25,1,17,1,9,9,1]],
  4:[[9,1,14,1,22,9,22,34,69,34,69,9,77,1,82,1,90,9,90,82,82,90,78,90,70,82,70,55,9,55,1,47,1,9,9,1]],
  5:[[9,1,82,1,90,9,90,17,82,25,21,25,21,35,82,35,90,43,90,82,82,90,9,90,1,82,1,72,9,64,71,64,71,55,9,55,1,47,1,9,9,1]],
  6:[[9,1,82,1,90,9,90,14,82,22,22,22,22,36,82,36,90,44,90,82,82,90,9,90,1,82,1,9,9,1],[22,55,69,55,69,69,22,69,22,55]],
  7:[[9,1,82,1,90,9,90,15,15,90,9,90,1,82,1,76,54,23,9,23,1,15,1,9,9,1]],
  8:[[9,1,82,1,90,9,90,82,82,90,9,90,1,82,1,9,9,1],[22,22,69,22,69,36,22,36,22,22],[22,55,69,55,69,69,22,69,22,55]],
  9:[[9,1,82,1,90,9,90,82,82,90,9,90,1,82,1,77,9,69,69,69,69,55,9,55,1,47,1,9,9,1],[22,22,69,22,69,36,22,36,22,22]],
};
var _hCol = ["#ff5555","#ffff00","#FF9901","#2F00FF"];
var _mCol = ["#55ff55","#ffffff","#00EFEF","#FFBF00"];
var _rCol = 0;
var interval = 0;
const REFRESH_RATE = 10E3;

function translate(tx, ty, p) {
  return p.map((x, i)=> x+((i%2)?ty:tx));
}

function fill(poly){
  return g.fillPoly(poly);
}

function frame(poly){
  return g.drawPoly(poly);
}

let settings = require('Storage').readJSON('numerals.json',1);
if (!settings) {
  settings = {
    color: 0,
    drawMode: "fill"
  };
}

function drawNum(num,col,x,y,func){
  g.setColor(col);
  let tx = x*100+35;
  let ty = y*100+35;
  for (let i=0;i<numerals[num].length;i++){
	  if (i>0) g.setColor((func==fill)?"#000000":col);
	  func(translate(tx, ty,numerals[num][i]));
  }
}

function draw(drawMode){
  let d = new Date();
  let h1 = Math.floor(d.getHours()/10);
  let h2 = d.getHours()%10;
  let m1 = Math.floor(d.getMinutes()/10);
  let m2 = d.getMinutes()%10;
  g.clearRect(0,24,240,240);
  drawNum(h1,_hCol[_rCol],0,0,eval(drawMode));
  drawNum(h2,_hCol[_rCol],1,0,eval(drawMode));
  drawNum(m1,_mCol[_rCol],0,1,eval(drawMode));
  drawNum(m2,_mCol[_rCol],1,1,eval(drawMode));
}

Bangle.setLCDMode();

clearWatch();
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});

g.clear();
clearInterval();
if (settings.color>0) _rCol=settings.color-1;
interval=setInterval(draw, REFRESH_RATE, settings.drawMode);
draw(settings.drawMode);

Bangle.on('lcdPower', function(on) {
  if (on) {
    if (settings.color==0) _rCol = Math.floor(Math.random()*_hCol.length);
	draw(settings.drawMode);
    interval=setInterval(draw, REFRESH_RATE, settings.drawMode);
  }else
  {
    clearInterval(interval);
  }
});

Bangle.loadWidgets();
Bangle.drawWidgets();
