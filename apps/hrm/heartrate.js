Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
Bangle.setHRMPower(1);
var hrmInfo, hrmOffset = 0;
var hrmInterval;
var btm = g.getHeight()-1;

function onHRM(h) {
  if (counter!==undefined) {
    // the first time we're called remove
    // the countdown
    counter = undefined;
    g.clear();
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

  var px = g.getWidth()/2;
  g.setFontAlign(0,0);
  g.clearRect(0,24,239,80);
  g.setFont("6x8").drawString("Confidence "+hrmInfo.confidence+"%", px, 75);
  var str = hrmInfo.bpm;
  g.setFontVector(40).drawString(str,px,45);
  px += g.stringWidth(str)/2;
  g.setFont("6x8");
  g.drawString("BPM",px+15,45);
}
Bangle.on('HRM', onHRM);
/* On newer (2v10) firmwares we can subscribe to get
HRM events as they happen */
Bangle.on('HRM-raw', function(v) {
  hrmOffset++;
  if (hrmOffset>g.getWidth()) {
    hrmOffset=0;
    g.clearRect(0,80,239,239);
    g.moveTo(-100,0);
  }

  y = E.clip(btm-v.filt/4,btm-10,btm);
  g.setColor(1,0,0).fillRect(hrmOffset,btm, hrmOffset, y);
  y = E.clip(170 - (v.raw/2),80,btm);
  g.setColor(g.theme.fg).lineTo(hrmOffset, y);
  if (counter !==undefined) {
    counter = undefined;
    g.clear();
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
g.clear().setFont("6x8",2).setFontAlign(0,0);
g.drawString("Please wait...",g.getWidth()/2,g.getHeight()/2 - 16);
countDown();


var wasHigh = 0, wasLow = 0;
var lastHigh = getTime();
var hrmList = [];
var hrmInfo;

function readHRM() {
  if (!hrmInfo) return;

  if (hrmOffset==0) {
    g.clearRect(0,100,239,239);
    g.moveTo(-100,0);
  }
  for (var i=0;i<2;i++) {
    var a = hrmInfo.raw[hrmOffset];
    hrmOffset++;
    y = E.clip(170 - (a*2),100,230);
    g.setColor(g.theme.fg).lineTo(hrmOffset, y);
  }
}
