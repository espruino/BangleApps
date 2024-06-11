if (process.env.HWVERSION == 1) {
  Bangle.setLCDPower(1);
  Bangle.setLCDTimeout(0);
}

Bangle.setHRMPower(1);
var hrmInfo = {}, hrmOffset = 0;
var hrmInterval;
var btm = g.getHeight()-1;
var lastHrmPt = []; // last xy coords we draw a line to

function onHRM(h) {
  if (counter!==undefined) {
    // the first time we're called remove
    // the countdown
    counter = undefined;
    g.clearRect(0,24,g.getWidth(),g.getHeight());
  }
  hrmInfo = h;
  /* On 2v09 and earlier firmwares the only solution for realtime
  HRM was to look at the 'raw' array that got reported. If you timed
  it right you could grab the data pretty much as soon as it was written.
  In new firmwares, '.raw' is not available. */
  if (hrmInterval) clearInterval(hrmInterval);
  hrmInterval = undefined;
  if (hrmInfo.raw) {
    hrmOffset = 0;
    setTimeout(function() {
      hrmInterval = setInterval(readHRM,41);
    }, 40);
  }
  updateHrm();
}
Bangle.on('HRM', onHRM);

function updateHrm(){
  var px = g.getWidth()/2;
  g.setFontAlign(0,-1);
  g.clearRect(0,24,g.getWidth(),80);
  g.setFont("6x8").drawString(/*LANG*/"Confidence "+(hrmInfo.confidence || "--")+"%", px, 70);

  updateScale();

  g.setFontAlign(0,0);
  var str = hrmInfo.bpm || "--";
  g.setFontVector(40).setColor(hrmInfo.confidence > 50 ? g.theme.fg : "#888").drawString(str,px,45);
  px += g.stringWidth(str)/2;
  g.setFont("6x8").setColor(g.theme.fg);
  g.drawString(/*LANG*/"BPM",px+15,45);
}

function updateScale(){
    g.setFontAlign(-1,-1);
    g.clearRect(2,70,40,78);
    g.setFont("6x8").drawString(scale, 2, 70);
}

var rawMax = 0;
var scale = 2000;
//var MID = (g.getHeight()+80)/2;
/* On newer (2v10) firmwares we can subscribe to get
HRM events as they happen */
Bangle.on('HRM-raw', function(v) {
  hrmOffset++;
  if (hrmOffset>g.getWidth()) {
    let thousands = Math.round(rawMax / 1000) * 1000;
    if (thousands > scale) scale = thousands;

    g.clearRect(0,80,g.getWidth(),g.getHeight());
    updateScale();

    hrmOffset=0;
    lastHrmPt = [-100,0];
  }
  if (rawMax < v.raw) {
    rawMax = v.raw;
  }
  let y = E.clip(btm-(8+v.filt/3000),btm-24,btm);
  g.setColor(1,0,0).fillRect(hrmOffset,btm, hrmOffset, y);
  y = E.clip(btm - (v.raw/scale*84),84,btm);
  g.setColor(g.theme.fg).drawLine(lastHrmPt[0],lastHrmPt[1],hrmOffset, y);
  lastHrmPt = [hrmOffset, y];
  if (counter !==undefined) {
    counter = undefined;
    g.clearRect(0,24,g.getWidth(),g.getHeight());
    updateHrm();
  }
});

// It takes 5 secs for us to get the first HRM event
var counter = 5;
function countDown() {
  if (counter) {
    g.drawString(counter--,g.getWidth()/2,g.getHeight()/2, true);
    setTimeout(countDown, 1000);
  }
}
g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
g.setColor(g.theme.fg);
g.reset().setFont("6x8",2).setFontAlign(0,-1);
g.drawString(/*LANG*/"Please wait...",g.getWidth()/2,g.getHeight()/2 - 16);
countDown();


//var wasHigh = 0, wasLow = 0;
//var lastHigh = getTime();
//var hrmList = [];
var hrmInfo;

function readHRM() {
  if (!hrmInfo) return;

  if (hrmOffset==0) {
    g.clearRect(0,100,g.getWidth(),g.getHeight());
    lastHrmPt = [-100,0];
  }
  for (var i=0;i<2;i++) {
    var a = hrmInfo.raw[hrmOffset];
    hrmOffset++;
    let y = E.clip(170 - (a*2),100,230);
    g.setColor(g.theme.fg).drawLine(lastHrmPt[0],lastHrmPt[1],hrmOffset, y);
    lastHrmPt = [hrmOffset, y];
  }
}
