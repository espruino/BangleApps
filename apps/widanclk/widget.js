/* Simple analog clock that appears in the widget bar if no other clock
is running. We update once per minute, but don't bother stopping
if the */
WIDGETS["wdanclk"]={area:"tl",width:Bangle.CLOCK?0:24,draw:function() {
  if (!Bangle.CLOCK == !this.width) { // if we're the wrong size for if we have a clock or not...
    this.width = Bangle.CLOCK?0:24;
    return setTimeout(Bangle.drawWidgets,1); // widget changed size - redraw
  }
  if (!this.width) return; // if size not right, return
  g.reset();
  let d = new Date();
  let dd = d.getDate();
  let x=this.x+12, y=this.y+12,
      ah = (d.getHours()+d.getMinutes()/60)*Math.PI/6,
      am = d.getMinutes()*Math.PI/30;
  g.clearRect(this.x, this.y, this.x+this.width-1, this.y+23).
    setFont("Vector:16").
    setColor(g.theme.bgH).
    drawString(dd,this.x+4+10*(dd<10),this.y+5,true).
    setColor(g.theme.fg).
    drawCircle(x, y, 11).
    drawLine(x,y, x+Math.sin(ah)*7, y-Math.cos(ah)*7).
    drawLine(x,y, x+Math.sin(am)*9, y-Math.cos(am)*9);
  // queue draw in one minute
  if (this.drawTimeout) clearTimeout(this.drawTimeout);
  this.drawTimeout = setTimeout(()=>{
    this.drawTimeout = undefined;
    this.draw();
  }, 60000 - (Date.now() % 60000));
}};
