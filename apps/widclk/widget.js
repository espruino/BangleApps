/* Simple clock that appears in the widget bar if no other clock
is running. We update once per minute, but don't bother stopping
if the */
WIDGETS["wdclk"]={area:"tl",width:Bangle.CLOCK?0:52/* g.stringWidth("00:00") */,draw:function() {
  if (!Bangle.CLOCK == !this.width) { // if we're the wrong size for if we have a clock or not...
    this.width = Bangle.CLOCK?0:52;
    return setTimeout(Bangle.drawWidgets,1); // widget changed size - redraw
  }
  if (!this.width) return; // if not visible, return
g.reset().setFontCustom(atob("AAAAAAAAAAIAAAQCAQAAAd0BgMBdwAAAAAAAdwAB0RiMRcAAAERiMRdwAcAQCAQdwAcERiMRBwAd0RiMRBwAAEAgEAdwAd0RiMRdwAcERiMRdwAFAAd0QiEQdwAdwRCIRBwAd0BgMBAAABwRCIRdwAd0RiMRAAAd0QiEQAAAAAAAAAA="), 32, atob("BgAAAAAAAAAAAAAAAAYCAAYGBgYGBgYGBgYCAAAAAAAABgYGBgYG"), 512+9).setFontAlign(0,0);
  var time = require("locale").time(new Date(),1);
  g.clearRect(this.x, this.y, this.x+this.width-1, this.y+23).drawString(time, this.x+this.width/2, this.y+12); // 5 * 6*2 = 60
  // queue draw in one minute
  if (this.drawTimeout) clearTimeout(this.drawTimeout);
  this.drawTimeout = setTimeout(()=>{
    this.drawTimeout = undefined;
    this.draw();
  }, 60000 - (Date.now() % 60000));
}};