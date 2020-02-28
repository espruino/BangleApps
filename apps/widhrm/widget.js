(() => {
  var xpos = WIDGETPOS.tl;
  var width = 24;
  WIDGETPOS.tl += width+2;
  var currentBPM = undefined;
  var lastBPM = undefined;
  var firstBPM = true; // first reading since sensor turned on

  function draw() {
  	g.reset();
    g.setFont("6x8", 1);
    g.setFontAlign(0, 0);
    g.clearRect(xpos,15,xpos+width,24); // erase background
    var bpm = currentBPM, isCurrent = true;
    if (bpm===undefined) {
      bpm = lastBPM;
      isCurrent = false;
    }
    if (bpm===undefined)
      bpm = "--";
    g.setColor(isCurrent ? "#ffffff" : "#808080");
    g.drawString(bpm, xpos+width/2, 19);
    g.setColor(isCurrent ? "#ff0033" : "#808080");
    g.drawImage(atob("CgoCAAABpaQ//9v//r//5//9L//A/+AC+AAFAA=="),xpos+(width-10)/2,1);
    g.setColor(-1);
  }

  // redraw when the LCD turns on
  Bangle.on('lcdPower', function(on) {
    if (on) {
      Bangle.setHRMPower(1);
      firstBPM = true;
      currentBPM = undefined;
      draw();
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
    draw();
  });
  Bangle.setHRMPower(Bangle.isLCDOn());

  // add your widget
  WIDGETS["hrm"]={draw:draw};
})();
