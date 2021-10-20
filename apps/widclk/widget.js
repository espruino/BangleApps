<<<<<<< HEAD
(() => {
  let intervalRef = null;
  var width = 5 * 6*2

  function draw() {
    g.reset().setFont("6x8", 2).setFontAlign(-1, 0);
    var time = require("locale").time(new Date(),1);
    g.drawString(time, this.x, this.y+11, true); // 5 * 6*2 = 60
  }
  function clearTimers(){
    if(intervalRef) {
      clearInterval(intervalRef);
      intervalRef = null;
    }
  }
  function startTimers(){
    intervalRef = setInterval(()=>WIDGETS["wdclk"].draw(), 60*1000);
    WIDGETS["wdclk"].draw();
  }
  Bangle.on('lcdPower', (on) => {
    clearTimers();
    if (on) startTimers();
  });

  WIDGETS["wdclk"]={area:"tr",width:width,draw:draw};
  if (Bangle.isLCDOn) intervalRef = setInterval(()=>WIDGETS["wdclk"].draw(), 60*1000);
})()
=======
/* Simple clock that appears in the widget bar if no other clock
is running. We update once per minute, but don't bother stopping
if the */

// don't show widget if we know we have a clock app running
if (!Bangle.CLOCK) WIDGETS["wdclk"]={area:"tl",width:52/* g.stringWidth("00:00") */,draw:function() {
  g.reset().setFontCustom(atob("AAAAAAAAAAIAAAQCAQAAAd0BgMBdwAAAAAAAdwAB0RiMRcAAAERiMRdwAcAQCAQdwAcERiMRBwAd0RiMRBwAAEAgEAdwAd0RiMRdwAcERiMRdwAFAAd0QiEQdwAdwRCIRBwAd0BgMBAAABwRCIRdwAd0RiMRAAAd0QiEQAAAAAAAAAA="), 32, atob("BgAAAAAAAAAAAAAAAAYCAAYGBgYGBgYGBgYCAAAAAAAABgYGBgYG"), 512+9);
  var time = require("locale").time(new Date(),1);
  g.drawString(time, this.x, this.y+3, true); // 5 * 6*2 = 60
  // queue draw in one minute
  if (this.drawTimeout) clearTimeout(this.drawTimeout);
  this.drawTimeout = setTimeout(()=>{
    this.drawTimeout = undefined;
    this.draw();
  }, 60000 - (Date.now() % 60000));
}};
>>>>>>> 1cc7674aa7f990f88644e78d9d19cd981ea34324
