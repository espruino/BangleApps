(() => {
  if (!Bangle.isLocked) return; // old firmware
  
  const SETTINGS_FILE = 'widhrm.json';
  let settings;
  function loadSettings() {
    settings = require('Storage').readJSON(SETTINGS_FILE, 1) || {};
    const DEFAULTS = {
      'confidence': 0
    };
    Object.keys(DEFAULTS).forEach(k=>{
      if (settings[k]===undefined) settings[k]=DEFAULTS[k];
    });
  }
  
  var currentBPM;
  var lastBPM;
  var isHRMOn = false;

  // turn on sensor when the LCD is unlocked
  Bangle.on('lock', function(isLocked) {
    if (!isLocked) {
      Bangle.setHRMPower(1,"widhrm");
      currentBPM = undefined;
      WIDGETS["hrm"].draw();
    } else {
      Bangle.setHRMPower(0,"widhrm");
    }
  });

  var hp = Bangle.setHRMPower;
  Bangle.setHRMPower = () => {
    hp.apply(Bangle, arguments);
    isHRMOn = Bangle.isHRMOn();
    WIDGETS["hrm"].draw();
  };

  Bangle.on('HRM',function(d) {
    currentBPM = d.bpm;
    lastBPM = currentBPM;
    WIDGETS["hrm"].draw();
  });

  // add your widget
  WIDGETS["hrm"]={area:"tl",width:24,draw:function() {
    var width = 24;
    g.reset();
    g.setFont("6x8", 1).setFontAlign(0, 0);
    g.clearRect(this.x,this.y+15,this.x+width,this.y+23); // erase background
    var bpm = currentBPM, isCurrent = true;
    if (bpm===undefined) {
      bpm = lastBPM;
      isCurrent = false;
    }
    if (bpm===undefined || (settings && bpm<settings["confidence"]))
      bpm = "--";
    g.setColor(isCurrent ? g.theme.fg : "#808080");
    g.drawString(bpm, this.x+width/2, this.y+19);
    g.setColor(isHRMOn ? "#ff0033" : "#808080");
    g.drawImage(atob("CgoCAAABpaQ//9v//r//5//9L//A/+AC+AAFAA=="),this.x+(width-10)/2,this.y+1);
    g.setColor(-1);
  }};

  Bangle.setHRMPower(!Bangle.isLocked(),"widhrm");
})();
