// on.step version
Bangle.on('step', function(s) { WIDGETS["widpb"].draw(); });
Bangle.on('lcdPower', function(on) {
  if (on) WIDGETS["widpb"].draw();
});
WIDGETS["widpb"]={area:"tl",sortorder:-1,width:13,draw:function() {
  if (!Bangle.isLCDOn()) return; // dont redraw if LCD is off
  var steps = Bangle.getHealthStatus("day").steps;
  var w = 1 + (steps.toString().length)*12;
  if (w != this.width) {this.width = w; setTimeout(() => Bangle.drawWidgets(),10); return;}
  g.reset();
  g.setColor(g.theme.bg);
  g.fillRect(this.x, this.y, this.x + this.width, this.y + 23); // erase background
  g.setColor(g.theme.fg);
  // Lato from fonts.google.com, Actual height 17 (17 - 1), Numeric only
  const scale = 1;
  g.setFontCustom(atob("AAAAABwAAOAAAgAAHAADwAD4AB8AB8AA+AAeAADAAAAOAAP+AH/8B4DwMAGBgAwMAGBgAwOAOA//gD/4AD4AAAAAAAABgAAcAwDAGAwAwP/+B//wAAGAAAwAAGAAAAAAAAIAwHgOA4DwMA+BgOwMDmBg4wOeGA/gwDwGAAAAAAAAAGAHA8A4DwMAGBhAwMMGBjgwOcOA+/gDj4AAAAABgAAcAAHgADsAA5gAOMAHBgBwMAP/+B//wABgAAMAAAAAAAgD4OB/AwOYGBjAwMYGBjBwMe8Bh/AIHwAAAAAAAAAfAAP8AHxwB8GAdgwPMGBxgwMOOAB/gAH4AAAAAAABgAAMAABgAwMAeBgPgMHwBj4AN8AB+AAPAABAAAAAAAMfAH38B/xwMcGBhgwMMGBjgwP+OA+/gDj4AAAAAAAAOAAH4AA/gQMMGBgzwME8BhvAOPgA/4AD8AAEAAAAAAGAwA4OAHBwAAA="), 46, atob("BAgMDAwMDAwMDAwMBQ=="), 21+(scale<<8)+(1<<16));
  g.setFontAlign(-1, 0);
  g.drawString(steps, this.x, this.y + 12);
}};
