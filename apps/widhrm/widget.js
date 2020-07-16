(() => {
  var currentBPM = undefined;
  var lastBPM = undefined;
  var firstBPM = true; // first reading since sensor turned on

  function draw() {
    var width = 24;
    g.reset();
    g.setFont("6x8", 1);
    g.setFontAlign(0, 0);
    g.clearRect(this.x,this.y+15,this.x+width,this.y+23); // erase background
    var bpm = currentBPM, isCurrent = true;
    if (bpm===undefined) {
      bpm = lastBPM;
      isCurrent = false;
    }
    if (bpm===undefined)
      bpm = "--";
    g.setColor(isCurrent ? "#ffffff" : "#808080");
    g.drawString(bpm, this.x+width/2, this.y+19);
    g.setColor(isCurrent ? "#ff0033" : "#808080");
    g.drawImage(atob("CgoCAAABpaQ//9v//r//5//9L//A/+AC+AAFAA=="),this.x+(width-10)/2,this.y+1);
    g.setColor(-1);
  }

  // redraw when the LCD turns on
  Bangle.on('lcdPower', function(on) {
    if (on) {
      Bangle.setHRMPower(1);
      firstBPM = true;
      currentBPM = undefined;
      WIDGETS["hrm"].draw();
    } else {
      Bangle.setHRMPower(0);
    }
  });

  Bangle.on('HRM',function(d) {
    if (firstBPM)
      firstBPM=false; // ignore the first one as it's usually rubbish
    else {
      currentBPM = d.bpm;
      lastBPM = currentBPM;
    }
    WIDGETS["hrm"].draw();
  });
  Bangle.setHRMPower(Bangle.isLCDOn());

  // add your widget
  WIDGETS["hrm"]={area:"tl",width:24,draw:draw};
})();
