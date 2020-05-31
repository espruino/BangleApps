/**
 * Bangle.js Numerals Clock
 *
 * + Original Author: Raik M. https://github.com/ps-igel
 * + Created: April 2020
 * + see README.md for details
 */

var numerals = {
  0:[[9,1,82,1,90,9,90,92,82,100,9,100,1,92,1,9],[30,25,61,25,69,33,69,67,61,75,30,75,22,67,22,33]],
  1:[[59,1,82,1,90,9,90,92,82,100,73,100,65,92,65,27,59,27,51,19,51,9]],
  2:[[9,1,82,1,90,9,90,53,82,61,21,61,21,74,82,74,90,82,90,92,82,100,9,100,1,92,1,48,9,40,70,40,70,27,9,27,1,19,1,9]],
  3:[[9,1,82,1,90,9,90,92,82,100,9,100,1,92,1,82,9,74,70,74,70,61,9,61,1,53,1,48,9,40,70,40,70,27,9,27,1,19,1,9]],
  4:[[9,1,14,1,22,9,22,36,69,36,69,9,77,1,82,1,90,9,90,92,82,100,78,100,70,92,70,61,9,61,1,53,1,9]],
  5:[[9,1,82,1,90,9,90,19,82,27,21,27,21,40,82,40,90,48,90,92,82,100,9,100,1,92,1,82,9,74,71,74,71,61,9,61,1,53,1,9]],
  6:[[9,1,82,1,90,9,90,19,82,27,22,27,22,40,82,40,90,48,90,92,82,100,9,100,1,92,1,9],[22,60,69,60,69,74,22,74]],
  7:[[9,1,82,1,90,9,90,15,20,98,9,98,1,90,1,86,56,22,9,22,1,14,1,9]],
  8:[[9,1,82,1,90,9,90,92,82,100,9,100,1,92,1,9],[22,27,69,27,69,43,22,43],[22,58,69,58,69,74,22,74]],
  9:[[9,1,82,1,90,9,90,92,82,100,9,100,1,92,1,82,9,74,69,74,69,61,9,61,1,53,1,9],[22,27,69,27,69,41,22,41]],
};
var _12hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"]||false;
var _hCol = ["#ff5555","#ffff00","#FF9901","#2F00FF"];
var _mCol = ["#55ff55","#ffffff","#00EFEF","#FFBF00"];
var _rCol = 0;
var interval = 0;
const REFRESH_RATE = 10E3;

function translate(tx, ty, p){
  return p.map((x, i)=> x+((i%2)?ty:tx));
}

function fill(poly){
  return g.fillPoly(poly,true);
}

function frame(poly){
  return g.drawPoly(poly,true);
}

let settings = require('Storage').readJSON('numerals.json',1);
if (!settings) {
  settings = {
    color:0,
    drawMode:"fill",
    menuButton:24
  };
}

function drawNum(num,col,x,y,func){
  g.setColor(col);
  let tx = x*100+25;
  let ty = y*104+32;
  for (let i=0;i<numerals[num].length;i++){
    if (i>0) g.setColor((func==fill)?"#000000":col);
    func(translate(tx,ty,numerals[num][i]));
  }
}

function draw(drawMode){
  let d = new Date();
  let h1 = Math.floor((_12hour?d.getHours()%12:d.getHours())/10);
  let h2 = (_12hour?d.getHours()%12:d.getHours())%10;
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
setWatch(Bangle.showLauncher, settings.menuButton, {repeat:false,edge:"falling"});

g.clear();
clearInterval();
if (settings.color>0) _rCol=settings.color-1;
interval=setInterval(draw, REFRESH_RATE, settings.drawMode);
draw(settings.drawMode);

Bangle.on('lcdPower', function(on){
  if (on){
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