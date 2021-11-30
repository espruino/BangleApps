var center = g.getWidth() / 2;
var lastDayDraw;
var lastTimeDraw;

var fontColor = g.theme.fg;
var accentColor = "#FF0000";
var locale = require("locale");

function loop() {
  var d = new Date();
  var cleared = false;
   if(lastDayDraw != d.getDate()){
     lastDayDraw = d.getDate();
     drawDate(d);
     drawCal(d);
   }
  
  if(lastTimeDraw != d.getMinutes() || cleared){
     lastTimeDraw = d.getMinutes();
     drawTime(d);
   }
}
function drawTime(d){
  var hour = ("0" + d.getHours()).slice(-2);
  var min = ("0" + d.getMinutes()).slice(-2);
  g.setFontAlign(0,-1,0);
  g.setFont("Vector",40);
  g.setColor(fontColor);
  g.clearRect(0,50,g.getWidth(),90);
  g.drawString(hour + ":" + min,center,50);
}
function drawDate(d){
 var day = ("0" + d.getDate()).slice(-2);
  var month = ("0" + d.getMonth()).slice(-2);
  var dateStr = locale.date(d,1);
  g.clearRect(0,24,g.getWidth(),44);
  g.setFont("Vector",20);
  g.setColor(fontColor);
  g.setFontAlign(0,-1,0);
  g.drawString(dateStr,center,24);
}

function drawCal(d){
  var calStart = 101;
  var cellSize = g.getWidth() / 7;
  var halfSize = cellSize / 2;
  g.clearRect(0,calStart,g.getWidth(),g.getHeight());
  g.drawLine(0,calStart,g.getWidth(),calStart);
  var days = ["Mo","Tu","We","Th","Fr","Sa","Su"];
  g.setFont("Vector",10);
  g.setColor(fontColor);
  g.setFontAlign(-1,-1,0);
  for(var i = 0; i < days.length;i++){
    g.drawString(days[i],i*cellSize+5,calStart -11);
    if(i!=0){
      g.drawLine(i*cellSize,calStart,i*cellSize,g.getHeight());
    }
  }
  var cellHeight = (g.getHeight() -calStart  ) / 3;
  for(var i = 0;i < 3;i++){
    var starty = calStart + i * cellHeight;
    g.drawLine(0,starty,g.getWidth(),starty);
  }
  
  g.setFont("Vector",15);
  
  var dayOfWeek = d.getDay();
  var dayRem = d.getDay() - 1;
  if(dayRem <0){
    dayRem = 0;
  }
  
  var start = new Date();
  start.setDate(start.getDate()-(7+dayRem));
  g.setFontAlign(0,-1,0);
  for (var y = 0;y < 3; y++){ 
    for(var x = 0;x < 7; x++){
      if(start.getDate() === d.getDate()){
        g.setColor(accentColor);
      }else{
        g.setColor(fontColor);
      }
      g.drawString(start.getDate(),x*cellSize +(cellSize / 2) + 2,calStart+(cellHeight*y) + 5);
      start.setDate(start.getDate()+1);
    }
  }
}

g.clear();
Bangle.setUI("clock");
Bangle.loadWidgets();
Bangle.drawWidgets();
loop();
setInterval(loop,1000);