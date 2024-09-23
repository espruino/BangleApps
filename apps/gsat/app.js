// Clear screen
g.clear();

const secsinmin = 60;
const quickfixperiod = 900;
var seconds = 1200;

function countSecs() {
  if (seconds != 0) {seconds -=1;}
  console.log(seconds);
}
function drawTime() {
  g.clear();
  g.setFontAlign(0,0);
  g.setFont('Vector', 12);
  g.drawString('Geek Squad Appointment Timer', 125, 20);
  if (seconds == 0) {
    g.setFont('Vector', 35);
    g.drawString('Appointment', 125, 100);
    g.drawString('finished!', 125, 150);
    Bangle.buzz();
    return;
  }
  const min = seconds / secsinmin;
  if (seconds < quickfixperiod) {
    g.setFont('Vector', 20); 
    g.drawString('Quick Fix', 125, 50);
    g.drawString('Period Passed!', 125, 75);
  }
  g.setFont('Vector', 50); 
  g.drawString(Math.ceil(min), 125, 125);
  g.setFont('Vector', 25); 
  g.drawString('minutes', 125, 165);
  g.drawString('remaining', 125, 195);
}
drawTime();
setInterval(countSecs, 1000);
setInterval(drawTime, 60000);
