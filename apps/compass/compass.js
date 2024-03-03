var W = g.getWidth();
var M = W/2; // middle of screen
// Angle buffer
var AGS = W > 200 ? 160 : 120; // buffer size
var AGM = AGS/2; // midpoint/radius
var AGH = AGM-10; // hand size
var ag = Graphics.createArrayBuffer(AGS,AGS,2,{msb:true});
var aimg = {
  width:ag.getWidth(),
  height:ag.getHeight(),
  bpp:2,
  buffer:ag.buffer,
  palette:new Uint16Array([
    g.theme.bg,
    g.toColor("#07f"),
    g.toColor("#f00"),
    g.toColor("#00f")])
};
ag.setColor(1).fillCircle(AGM,AGM,AGM-1,AGM-1);
ag.setColor(0).fillCircle(AGM,AGM,AGM-11,AGM-11);

function arrow(r,c) {
  r=(360-r)*Math.PI/180;
  var p = Math.PI/2;
  ag.setColor(c).fillPoly([
    AGM+AGH*Math.sin(r), AGM-AGH*Math.cos(r),
    AGM+10*Math.sin(r+p), AGM-10*Math.cos(r+p),
    AGM+10*Math.sin(r-p), AGM-10*Math.cos(r-p),
  ]);
}

var wasUncalibrated = false;
var oldHeading = 0;
Bangle.on('mag', function(m) {
  if (!Bangle.isLCDOn()) return;
  g.reset();
  if (isNaN(m.heading)) {
    if (!wasUncalibrated) {
      g.clearRect(0,24,W,48);
      g.setFontAlign(0,-1).setFont("6x8");
      g.drawString(/*LANG*/"Uncalibrated\nturn 360° around",M,24+4);
      wasUncalibrated = true;
    }
  } else {
    if (wasUncalibrated) {
      g.clearRect(0,24,W,48);
      wasUncalibrated = false;
    }
    g.setFontAlign(0,0).setFont("6x8",3);
    var y = 36;
    g.clearRect(M-40,24,M+40,48);
    g.drawString(Math.round(m.heading),M,y,true);
  }


  ag.setColor(0);
  arrow(oldHeading,0);
  arrow(oldHeading+180,0);
  arrow(m.heading,2);
  arrow(m.heading+180,3);
  g.drawImage(aimg,
              (W-ag.getWidth())/2,
              g.getHeight()-(ag.getHeight()+4));
  oldHeading = m.heading;
});

g.clear(1);
g.setFont("6x8").setFontAlign(0,0,3).drawString(/*LANG*/"RESET", g.getWidth()-5, g.getHeight()/2);
setWatch(function() {
  Bangle.resetCompass();
}, (process.env.HWVERSION==2) ? BTN1 : BTN2, {repeat:true, edge:"falling"});

Bangle.loadWidgets();
Bangle.drawWidgets();
Bangle.setCompassPower(1);
Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
