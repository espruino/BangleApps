Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
Bangle.setHRMPower(1);
var hrmInfo, hrmOffset = 0;
var hrmInterval;
function onHRM(h) {
  // this is the first time we're called
  if (counter!==undefined) {
    counter = undefined;
    g.clear();
  }
  hrmInfo = h;
  hrmOffset = 0;
  if (hrmInterval) clearInterval(hrmInterval);
  hrmInterval = setInterval(readHRM,40);

  var px = g.getWidth()/2;
  g.setFontAlign(0,0);
  g.clearRect(0,24,239,90);
  g.setFont("6x8").drawString("Confidence "+hrmInfo.confidence+"%", px, 75);
  var str = hrmInfo.bpm;
  g.setFontVector(40).drawString(str,px,45);
  px += g.stringWidth(str)/2;
  g.setFont("6x8");
  g.drawString("BPM",px+15,45);
}
Bangle.on('HRM', onHRM);

// It takes 5 secs for us to get the first HRM event
var counter = 5;
function countDown() {
  E.showMessage("Please wait...\n"+counter--);
  if (counter) setTimeout(countDown, 1000);
}
countDown();


var min=0,max=0;
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
    min=Math.min(min*0.97+a*0.03,a);
    max=Math.max(max*0.97+a*0.03,a);
    y = E.clip(170 - (a*4),100,230);
    g.setColor(1,1,1);
    g.lineTo(hrmOffset, y);
  }
}
