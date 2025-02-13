setInterval(()=>WIDGETS["batc"].draw(), 60000);
Bangle.on('lcdPower', function(on) {
  if (on) WIDGETS["batc"].draw();
});
WIDGETS["batc"]={area:"tr",sortorder:10,width:48,draw:function() {
  g.reset();
  // Lato from fonts.google.com, Actual height 17 (17 - 1), Numeric only
  g.setFontCustom(atob("AAAAABwAAOAAAgAAHAADwAD4AB8AB8AA+AAeAADAAAAOAAP+AH/8B4DwMAGBgAwMAGBgAwOAOA//gD/4AD4AAAAAAAABgAAcAwDAGAwAwP/+B//wAAGAAAwAAGAAAAAAAAIAwHgOA4DwMA+BgOwMDmBg4wOeGA/gwDwGAAAAAAAAAGAHA8A4DwMAGBhAwMMGBjgwOcOA+/gDj4AAAAABgAAcAAHgADsAA5gAOMAHBgBwMAP/+B//wABgAAMAAAAAAAgD4OB/AwOYGBjAwMYGBjBwMe8Bh/AIHwAAAAAAAAAfAAP8AHxwB8GAdgwPMGBxgwMOOAB/gAH4AAAAAAABgAAMAABgAwMAeBgPgMHwBj4AN8AB+AAPAABAAAAAAAMfAH38B/xwMcGBhgwMMGBjgwP+OA+/gDj4AAAAAAAAOAAH4AA/gQMMGBgzwME8BhvAOPgA/4AD8AAEAAAAAAGAwA4OAHBwAAA="), 46, atob("BAgMDAwMDAwMDAwMBQ=="), 21+(1<<8)+(1<<16));
  var bp = "" + E.getBattery().toString();
  var text_w = g.stringWidth(bp);
  var bw = 7; // battery width
  var w = text_w + 3 + bw + 2;
  // we need this to be able to shrink or grow on the 3,2,1 digit battery levels
  if (w != this.width) {this.width = w; setTimeout(() => Bangle.drawWidgets(),10); return;}
  var h = 12; // height
  var x = this.x, y = this.y + 4;
  g.setColor(g.theme.bg);
  g.fillRect(this.x, this.y, this.x + this.width, this.y + 23); // erase background
  g.setColor(g.theme.fg);
  g.setFontAlign(-1, 0);
  g.drawString(bp, this.x, this.y + 12);
  x = x + text_w + 3;
  g.fillRect(x+2,y,x+5,y+1); // contact
  g.fillRect(x,y+2,x+bw,y+2+h); // outer
}};
