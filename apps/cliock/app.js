var line;
var fontsize = 2;
var locale = require("locale");
var marginTop = 40;
var flag = false;
var WeekDays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function drawAll(){
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  g.setFont("6x8",fontsize);
  g.setColor("#00ff00");
  updateTime();
}
function updateTime(){
  if (!Bangle.isLCDOn()) return;
  line = 0;
  var now = new Date();
  var date = locale.date(now,false);
  var h = now.getHours();
  var m = now.getMinutes();
  h = h>10?h:"0"+h;
  m = m>10?m:"0"+m;
  g.setFont("6x8",fontsize);
  g.setColor("#00ff00");
  writeLine(h+":"+m);
  writeLine(WeekDays[now.getDay()]);
  writeLine(date);
  if(flag){
    writeLine("");
    flag = false;
  }
  else{
    writeLine("_");
    flag = true;
  }
}
function writeLineStart(){
  g.drawString(">",4,marginTop+line*20);
}
function writeLine(str){
  g.clearRect(0,marginTop+line*20,(str.length*15+15),marginTop+20+line*20);
  writeLineStart();
  g.drawString(str,20,marginTop+line*20);
  line++;
} 

drawAll();
Bangle.on('lcdPower',function(on) {
  if (on)
    drawAll();
});
var click = setInterval(updateTime, 1000);
