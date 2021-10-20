<<<<<<< HEAD
Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
Bangle.ioWr(0x80,0)
x=0;
var min=0,max=0;
var wasHigh = 0, wasLow = 0;
var lastHigh = getTime();
var hrmList = [];
var hrm;

function readHRM() {
  var a = analogRead(D29);
  var h = getTime();
  min=Math.min(min*0.97+a*0.03,a);
  max=Math.max(max*0.97+a*0.03,a);
  y = E.clip(170 - (a*960*4),100,230);
  if (x==0) {
    g.clearRect(0,100,239,239);
    g.moveTo(-100,0);
  }
  /*g.setColor(0,1,0);
  var z = 170 - (min*960*4); g.fillRect(x,z,x,z);
  var z = 170 - (max*960*4); g.fillRect(x,z,x,z);*/
  g.setColor(1,1,1);
  g.lineTo(x,y);
  if ((max-min)>0.005) {
    if (4*a > (min+3*max)) { // high
      g.setColor(1,0,0);
      g.fillRect(x,230,x,239);
      g.setColor(1,1,1);
      if (!wasHigh && wasLow) {
        var currentHrm = 60/(h-lastHigh);
        lastHigh = h;
        if (currentHrm<250) {
          while (hrmList.length>12) hrmList.shift();
          hrmList.push(currentHrm);
          // median filter
          var t = hrmList.slice(); // copy
          t.sort();
          // average the middle 3
          var mid = t.length>>1;
          if (mid+2<t.length)
            hrm = (t[mid]+t[mid+1]+t[mid+2])/3;
          else if (mid<t.length)
            hrm = t[mid];
          else
            hrm = 0;
          g.setFontVector(40);
          g.setFontAlign(0,0);
          g.clearRect(0,0,239,100);
          var str = hrm ? Math.round(hrm) : "?";
          var px = 120;
          g.drawString(str,px,40);
          px += g.stringWidth(str)/2;
          g.setFont("6x8");
          g.drawString("BPM",px+20,60);
        }
      }
      wasLow = 0;
      wasHigh = 1;
    } else if (4*a < (max+3*min)) { // low
      wasLow = 1;
    } else { // middle
      g.setColor(0.5,0,0);
      g.fillRect(x,230,x,239);
      g.setColor(1,1,1);
      wasHigh = 0;
    }
  }
  x++;
  if (x>239)x=0;
}

setInterval(readHRM,50);
=======
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
>>>>>>> 1cc7674aa7f990f88644e78d9d19cd981ea34324
