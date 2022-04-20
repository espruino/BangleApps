let wsSettingsGoal = (require('Storage').readJSON("health.json", 1) || {}).stepGoal || 10000;

Bangle.on('step', function(s) { WIDGETS["widstep"].draw(); });
Bangle.on('lcdPower', function(on) {
  if (on) WIDGETS["widstep"].draw();
});
WIDGETS["widstep"]={area:"tl", sortorder:-1, width:28,
  draw:function() {
    if (!Bangle.isLCDOn()) return; // dont redraw if LCD is off
    var steps = Bangle.getHealthStatus("day").steps;
    g.reset();
    g.setColor(g.theme.bg);
    g.fillRect(this.x, this.y, this.x + this.width, this.y + 23);
    g.setColor(g.theme.dark ? '#00f' : '#0ff');
    var progress = this.width * Math.min(steps/wsSettingsGoal, 1);
    g.fillRect(this.x+1, this.y+1, this.x + progress -1, this.y + 23);
    g.setColor(g.theme.fg);
    g.setFontAlign(0, -1);
    var steps_k = (steps/1000).toFixed(1) + 'k';
    g.setFont('6x15').drawString(steps_k, this.x+this.width/2, this.y + 10);
    g.setFont('4x6').drawString('steps', this.x+this.width/2, this.y + 2);
  }
};
