g.clear();

var minuteDate = new Date();
var secondDate = new Date();

function line(angle, r1,r2) {
  var a = angle*Math.PI/180;
  g.drawLine(
    120+Math.sin(a)*r1,
    120-Math.cos(a)*r1,
    120+Math.sin(a)*r2,
    120-Math.cos(a)*r2);
}
function hand(angle, r1,r2) {
  var a = angle*Math.PI/180;
  var r3 = 3;
  var p = Math.PI/2;
  g.fillPoly([
    120+Math.sin(a)*r1,
    120-Math.cos(a)*r1,
    120+Math.sin(a+p)*r3,
    120-Math.cos(a+p)*r3,
    120+Math.sin(a)*r2,
    120-Math.cos(a)*r2,
    120+Math.sin(a-p)*r3,
    120-Math.cos(a-p)*r3]);
}

function drawAll() {
  g.clear();
  g.setColor(0,0,0.3);
  for (var i=0;i<60;i++)
    line(360*i/60, 92, 95);
  secondDate = minuteDate = new Date();
  onSecond();
  onMinute();
}

function onSecond() {
  g.setColor(0,0,0.3);
  line(360*secondDate.getSeconds()/60, 92, 95);
  g.setColor(1,0,0);
  secondDate = new Date();
  line(360*secondDate.getSeconds()/60, 92, 95);
  g.setColor(1,1,1);

}

function onMinute() {
  g.setColor(0,0,0);
  hand(360*minuteDate.getHours()/12, -10, 50);
  hand(360*minuteDate.getMinutes()/60, -10, 85);
  oldMinute = new Date();
  g.setColor(1,1,1);
  hand(360*minuteDate.getHours()/12, -10, 50);
  hand(360*minuteDate.getMinutes()/60, -10, 85);
}

setInterval(onSecond,1000);
setInterval(onMinute,60*1000);
drawAll();

Bangle.on('lcdPower',function(on) {
  if (on) {
    g.clear();
    drawAll();
    drawWidgets();
  }
});
