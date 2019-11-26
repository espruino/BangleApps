var tStart = Date.now();
var tCurrent = Date.now();
var started = false;
var timeY = 60;
var hsXPos = 0;
var lapTimes = [];
var displayInterval;

function timeToText(t) {
  var secs = Math.floor(t/1000)%60;
  var mins = Math.floor(t/60000);
  var hs = Math.floor(t/10)%100;
  return mins+":"+("0"+secs).substr(-2)+"."+("0"+hs).substr(-2);
}
function updateLabels() {
  g.clear();
  g.setFont("6x8",2);
  g.setFontAlign(0,0,3);
  g.drawString(started?"STOP":"GO",230,120);
  if (!started) g.drawString("RESET",230,50);
  g.drawString("LAP",230,190);
  g.setFont("6x8",1);
  g.setFontAlign(-1,-1);
  for (var i in lapTimes) {
    g.drawString(i+": "+timeToText(lapTimes[i]),10,timeY + 30 + i*8);
  }
  drawsecs();
}
function drawsecs() {
  var t = tCurrent-tStart;
  g.setFont("Vector",48);
  g.setFontAlign(0,0);
  var secs = Math.floor(t/1000)%60;
  var mins = Math.floor(t/60000);
  var txt = mins+":"+("0"+secs).substr(-2);
  var x = 100;
  g.clearRect(0,timeY-26,200,timeY+26);
  g.drawString(txt,x,timeY);
  hsXPos = 5+x+g.stringWidth(txt)/2;
  drawms();
}
function drawms() {
  var t = tCurrent-tStart;
  var hs = Math.floor(t/10)%100;
  g.setFontAlign(-1,0);
  g.setFont("6x8",2);
  g.clearRect(hsXPos,timeY,220,timeY+20);
  g.drawString("."+("0"+hs).substr(-2),hsXPos,timeY+10);
}

setWatch(function() { // Start/stop
  started = !started;
  Bangle.beep();
  if (started)
    tStart = Date.now()+tStart-tCurrent;
  tCurrent = Date.now();
  if (displayInterval) {
    clearInterval(displayInterval);
    displayInterval = undefined;
  }
  updateLabels();
  if (started)
    displayInterval = setInterval(function() {
      var last = tCurrent;
      if (started) tCurrent = Date.now();
      if (Math.floor(last/1000)!=Math.floor(tCurrent/1000))
        drawsecs();
      else
        drawms();
    }, 20);
}, BTN2, {repeat:true});
setWatch(function() { // Reset
  Bangle.beep();
  if (!started) {
    tStart = tCurrent = Date.now();
  }
  lapTimes = [];
  updateLabels();
}, BTN1, {repeat:true});
setWatch(function() { // Lap
  Bangle.beep();
  if (started) tCurrent = Date.now();
  lapTimes.unshift(tCurrent-tStart);
  tStart = tCurrent;
  updateLabels();
}, BTN3, {repeat:true});

updateLabels();
