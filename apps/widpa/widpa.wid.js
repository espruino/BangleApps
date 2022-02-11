Bangle.on('step', function(s) { WIDGETS["widpa"].draw(); });
Bangle.on('lcdPower', function(on) {
  if (on) WIDGETS["widpa"].draw();
});
WIDGETS["widpa"]={area:"tl",sortorder:-1,width:13,draw:function() {
  if (!Bangle.isLCDOn()) return; // dont redraw if LCD is off
  var steps = Bangle.getHealthStatus("day").steps;
  var w = 1 + (steps.toString().length)*12;
  if (w != this.width) {this.width = w; setTimeout(() => Bangle.drawWidgets(),10); return;}
  g.reset();
  g.setColor(g.theme.bg);
  g.fillRect(this.x, this.y, this.x + this.width, this.y + 23);
  g.setColor(g.theme.fg);
  g.setFont('6x8',2);
  g.setFontAlign(-1, 0);
  g.drawString(steps, this.x, this.y + 12);
}};
