Bangle.loadWidgets();
Bangle.drawWidgets();
E.showMessage("Loading...");
Bangle.setOptions({hrmPollInterval:5});
Bangle.setHRMPower(1);

function drawCounter() {
  g.reset().clearRect(0,24,175,90);
  //g.drawRect(0,24,175,90);
  g.setFontAlign(0,0).setFontVector(60);
  g.drawString(count, 88, 60);
}

function hadPulse() {
  count++;
  drawCounter();
  g.setColor("#f00").fillCircle(156,156,20);
  setTimeout(function() {
    g.setColor(g.theme.bg).fillCircle(156,156,20);
  }, 500);
}

if (parseFloat(process.env.VERSION.replace("v","0"))<2019) {
  E.showMessage("You need at least firmware 2v19","Error");
} else if (Bangle.hrmRd(0)!=33) { // wrong sensor - probably VC31 from original bangle.js 2
  E.showMessage("This Bangle.js doesn't have a VC31B HRM sensor","Error");
} else {
  Bangle.setOptions({hrmGreenAdjust:false, hrmWearDetect:false, hrmPushEnv:true});
  Bangle.hrmWr(0x10, 197&0xF8 | 4); // just SLOT2
  Bangle.hrmWr(0x16, 0); // force env to be used as fast as possible

  var samples = 0, samplesHi = 0;
  var count = 0;
  {
    let last = 0;
    Bangle.on('HRM-env',v => {
      if (v) {
        if (!last) hadPulse();
        samplesHi++;
      }
      last = v;
      samples++;
    });
  }

  drawCounter();
  setInterval(function() {
    g.reset().clearRect(0,90,175,130);
    g.setFontAlign(0,0).setFont("6x8:2");
    g.drawString(samples+" sps", 88, 100);
    if (samplesHi*5 > samples) {
      g.setBgColor("#f00").setColor("#fff");
      g.clearRect(0,110,175,130).drawString("TOO LIGHT",88,120);
    }
    samples=0;
    samplesHi=0;
    Bangle.setLCDPower(1); // force LCD on!
  }, 1000);
}