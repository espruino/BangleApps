var line;
var fontsize = 2;
var locale = require("locale");
var marginTop = 40;
var flag = false;

var WeekDays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function updateTime(){
  if (!Bangle.isLCDOn()) return;
  line = 0;
  var now = new Date();
  var date = locale.date(now,false);
  var h = now.getHours();
  var m = now.getMinutes();
  h = h>10?h:"0"+h;
  m = m>10?m:"0"+m;
  g.clear();
  Bangle.loadWidgets();
  Bangle.drawWidgets();
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
  writeLineStart();
  g.drawString(str,17,marginTop+line*20);
  line++;
} 

Bangle.on('lcdPower',function(on) {
  if (on)
    updateTime();
});
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
var click = setInterval(updateTime, 1000);



