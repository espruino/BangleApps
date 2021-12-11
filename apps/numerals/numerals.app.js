/**
 * Bangle.js Numerals Clock
 *
 * + Original Author: Raik M. https://github.com/ps-igel
 * + Created: April 2020
 * + see README.md for details
 */

 var numerals = {
  0:[[9,1,82,1,90,9,90,92,82,100,9,100,1,92,1,9],[30,25,61,25,69,33,69,67,61,75,30,75,22,67,22,33]],
  1:[[50,1,82,1,90,9,90,92,82,100,73,100,65,92,65,27,50,27,42,19,42,9]],
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
var _hCol = [];
var _mCol = [];
var _rCol = 0;
var scale = g.getWidth()/240;
var interval = 0;
const REFRESH_RATE = 10E3;
var drawFuncs = {
  fill : function(poly,isHole){
    if (isHole) g.setColor(g.theme.bg);
    g.fillPoly(poly,true);
  },
  framefill : function(poly,isHole){
    var c = g.getColor();
    g.setColor(isHole ? g.theme.bg : ((c&0b1111011111011110)>>1)); // 16 bit half bright
    g.fillPoly(poly,true);
    g.setColor(c);
    g.drawPoly(poly,true);
  },
  frame : function(poly,isHole){
    g.drawPoly(poly,true);
  },
  thickframe : function(poly,isHole){
    g.drawPoly(poly,true);
    g.drawPoly(translate(1,0,poly,1),true);
    g.drawPoly(translate(1,1,poly,1),true);
    g.drawPoly(translate(0,1,poly,1),true);
  },
  thickfill : function(poly,isHole){
    if (isHole) g.setColor(g.theme.bg);
    g.fillPoly(poly,true);
    g.setColor(g.theme.fg);
    g.drawPoly(translate(1,0,poly,1),true);
    g.drawPoly(translate(1,1,poly,1),true);
    g.drawPoly(translate(0,1,poly,1),true);
  }
};

function translate(tx, ty, p, ascale){
  //return p.map((x, i)=> x+((i&1)?ty:tx));
  return g.transformVertices(p, {x:tx,y:ty,scale:ascale==undefined?scale:ascale});
}


let settings = require('Storage').readJSON('numerals.json',1);
if (!settings) {
  settings = {
    color:0,
    drawMode:"fill",
    showDate:0
  };
}

function drawNum(num,col,x,y,func,funcName){
  g.setColor(col);
  let tx = (x*100+25) * scale;
  let ty = (y*104+32) * scale;
  for (let i=0;i<numerals[num].length;i++){
    g.setColor(col);
    func(translate(tx,ty,numerals[num][i]), i>0);
  }
}

function draw(date){
  let d = new Date();
  let l1, l2;
  if (date) {
    setUpdateInt(0);
    l1 = ("0"+(new Date()).getDate()).substr(-2);
    l2 = ("0"+((new Date()).getMonth()+1)).substr(-2);
    setTimeout(()=>{ draw(); setUpdateInt(1); }, 5000);
  } else {
    l1 = ("0"+(_12hour?d.getHours()%12:d.getHours())).substr(-2);
    l2 = ("0"+d.getMinutes()).substr(-2);
  }
  var drawFunc = drawFuncs[settings.drawMode];
  if (drawFunc==undefined) drawFunc=drawFuncs.fill;
  g.clearRect(0,24,240,240);
  drawNum(l1[0],_hCol[_rCol],0,0,drawFunc);
  drawNum(l1[1],_hCol[_rCol],1,0,drawFunc);
  drawNum(l2[0],_mCol[_rCol],0,1,drawFunc);
  drawNum(l2[1],_mCol[_rCol],1,1,drawFunc);
}

function setUpdateInt(set){
  if (interval) clearInterval(interval);
  if (set) interval=setInterval(draw, REFRESH_RATE);
}

function setUp(){
  if (process.env.HWVERSION==1){
    _hCol = ["#ff5555","#ffff00","#FF9901","#2F00FF"];
    _mCol = ["#55ff55","#ffffff","#00EFEF","#FFBF00"];
  } else {
    _hCol = ["#ff0000","#00ff00","#ff0000","#ff00ff"];
    _mCol = ["#00ff00","#0000ff","#00ffff","#00ff00"];
  }
  if (settings.color==0) _rCol = Math.floor(Math.random()*_hCol.length);
}

setUp();
g.clear(1);
// Show launcher when button pressed
Bangle.setUI("clock");
if (settings.color>0) _rCol=settings.color-1;
setUpdateInt(1);
draw();

if (settings.showDate) {
  Bangle.on('touch', () => draw(1));
}
Bangle.on('lcdPower', function(on){
  if (on){
    setUp();
    draw();
    setUpdateInt(1);
  } else setUpdateInt(0);
});
Bangle.on('lock', () => setUp());

Bangle.loadWidgets();
Bangle.drawWidgets();