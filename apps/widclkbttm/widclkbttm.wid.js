WIDGETS["wdclkbttm"]={area:"br",width:Bangle.CLOCK?0:60,draw:function() {
  if (!Bangle.CLOCK == !this.width) { // if we're the wrong size for if we have a clock or not...
    this.width = Bangle.CLOCK?0:60;
    return setTimeout(Bangle.drawWidgets,1); // widget changed size - redraw
  }
  if (!this.width) return; // if not visible, return
  g.reset().setFont("6x8", 2).setFontAlign(-1, 0).clearRect(this.x, this.y, this.x+this.width-1, this.y+23);
  var time = require("locale").time(new Date(),1);
  g.drawString(time, this.x, this.y+11, true); // 5 * 6*2 = 60
  // queue draw in one minute
  if (this.drawTimeout) clearTimeout(this.drawTimeout);
  this.drawTimeout = setTimeout(()=>{
    this.drawTimeout = undefined;
    this.draw();
  }, 60000 - (Date.now() % 60000));
}};
