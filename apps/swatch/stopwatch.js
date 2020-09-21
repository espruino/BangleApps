var tTotal = Date.now();
var tStart = Date.now();
var tCurrent = Date.now();
var started = false;
var timeY = 45;
var hsXPos = 0;
var TtimeY = 75;
var ThsXPos = 0;
var lapTimes = [];
var displayInterval;

function timeToText(t) {
  var secs = Math.floor(t/1000)%60;
  var mins = Math.floor(t/60000);
  var hs = Math.floor(t/10)%100;
  return mins+":"+("0"+secs).substr(-2)+"."+("0"+hs).substr(-2);
}

function updateLabels() {
  g.reset(1);
  g.clearRect(0,23,g.getWidth()-1,g.getHeight()-24);
  g.setFont("6x8",2);
  g.setFontAlign(0,0,3);
  g.drawString(started?"STOP":"GO",230,120);
  if (!started) g.drawString("RESET",230,180);
  g.drawString(started?"LAP":"SAVE",230,50);
  g.setFont("6x8",1);
  g.setFontAlign(-1,-1);
  for (var i in lapTimes) {
    if (i<15)
    {g.drawString(lapTimes.length-i+": "+timeToText(lapTimes[i]),35,timeY + 40 + i*8);}
    else if (i<30)
    {g.drawString(lapTimes.length-i+": "+timeToText(lapTimes[i]),125,timeY + 40 + (i-15)*8);}
  }
  drawsecs();
}

function drawsecs() {
  var t = tCurrent-tStart;
  var Tt = tCurrent-tTotal;
  var secs = Math.floor(t/1000)%60;
  var mins = Math.floor(t/60000);
  var txt = mins+":"+("0"+secs).substr(-2);
  var Tsecs = Math.floor(Tt/1000)%60;
  var Tmins = Math.floor(Tt/60000);
  var Ttxt = Tmins+":"+("0"+Tsecs).substr(-2);
  var x = 100;
  var Tx = 125;
  g.reset(1);
  g.setFont("Vector",38);
  g.setFontAlign(0,0);
  g.clearRect(0,timeY-21,200,timeY+21);
  g.drawString(Ttxt,x,timeY);
  hsXPos = 5+x+g.stringWidth(txt)/2;
  g.setFont("6x8",2);
  g.clearRect(0,TtimeY-7,200,TtimeY+7);
  g.drawString(txt,Tx,TtimeY);
  ThsXPos = 5+Tx+g.stringWidth(Ttxt)/2;
  drawms();
}

function drawms() {
  var t = tCurrent-tStart;
  var hs = Math.floor(t/10)%100;
  var Tt = tCurrent-tTotal;
  var Ths = Math.floor(Tt/10)%100;
  g.setFontAlign(-1,0);
  g.setFont("6x8",2);
  g.clearRect(hsXPos,timeY,220,timeY+20);
  g.drawString("."+("0"+Ths).substr(-2),hsXPos-5,timeY+14);
  g.setFont("6x8",1);
  g.clearRect(ThsXPos,TtimeY,220,TtimeY+5);
  g.drawString("."+("0"+hs).substr(-2),ThsXPos-5,TtimeY+3);
}

function getLapTimesArray() {
  lapTimes.push(tCurrent-tTotal);
  return lapTimes.map(timeToText).reverse();
}

setWatch(function() { // Start/stop
  started = !started;
  Bangle.beep();
  if (started)
    tStart = Date.now()+tStart-tCurrent;
  tTotal = Date.now()+tTotal-tCurrent;
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
      if (Math.floor((last-tStart)/1000)!=Math.floor((tCurrent-tStart)/1000) ||
          Math.floor((last-tTotal)/1000)!=Math.floor((tCurrent-tTotal)/1000))
        drawsecs();
      else
        drawms();
    }, 20);
}, BTN2, {repeat:true});

setWatch(function() { // Lap
  Bangle.beep();
  if (started) {
    tCurrent = Date.now();
    lapTimes.unshift(tCurrent-tStart);
  }
  if (!started) { // save
    var filename = "swatch-"+(new Date()).toISOString().substr(0,16).replace("T","_")+".json";
    if (tCurrent!=tStart)
      lapTimes.unshift(tCurrent-tStart);
    // this maxes out the 28 char maximum
    require("Storage").writeJSON(filename, getLapTimesArray());
    tStart = tCurrent = tTotal = Date.now();
    lapTimes = [];
    E.showMessage("Laps Saved","Stopwatch");
    setTimeout(updateLabels, 1000);
  } else {
    tStart = tCurrent;
    updateLabels();
  }
}, BTN1, {repeat:true});
setWatch(function() { // Reset
  if (!started) {
    Bangle.beep();
    tStart = tCurrent = tTotal = Date.now();
    lapTimes = [];
  }
  updateLabels();
}, BTN3, {repeat:true});

updateLabels();
Bangle.loadWidgets();
Bangle.drawWidgets();
