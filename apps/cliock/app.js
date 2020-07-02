var fontsize = 3;
var locale = require("locale");
var marginTop = 40;
var flag = false;
var WeekDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function drawAll(){
  updateTime();
  updateRest(new Date());
}

function updateRest(now){
  let date = locale.date(now,false);
  writeLine(WeekDays[now.getDay()],1);
  writeLine(date,2);
}
function updateTime(){
  if (!Bangle.isLCDOn()) return;
  let now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  h = h>=10?h:"0"+h;
  m = m>=10?m:"0"+m;
  writeLine(h+":"+m,0);
  writeLine(flag?" ":"_",3);
  flag = !flag;
  if(now.getMinutes() == 0)
    updateRest(now);
}
function writeLineStart(line){
  g.drawString(">",4,marginTop+line*30);
}
function writeLine(str,line){
  g.setFont("6x8",fontsize);
  g.setColor(0,1,0);
  g.setFontAlign(-1,-1);
  g.clearRect(0,marginTop+line*30,((str.length+1)*20),marginTop+25+line*30);
  writeLineStart(line);
  g.drawString(str,25,marginTop+line*30);
} 

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
drawAll();
Bangle.on('lcdPower',function(on) {
  if (on)
    drawAll();
});
var click = setInterval(updateTime, 1000);
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
