function widhr_hrm(hrm) {
  require("Storage").writeJSON("widhr.data.json", {"bpm":hrm.bpm});
  WIDGETS["widhr"].draw();
}

Bangle.on('HRM', widhr_hrm);

function widhr_draw() {
  var json = require("Storage").readJSON("widhr.data.json");
  var bpm = json === undefined ? 0 : json.bpm;
  //3x6 from bpm text in 6x8 font
  var w = (bpm.toString().length)*8 > 3 * 6 ? (bpm.toString().length)*8 : 3 * 6;
  if (w != this.width)
  {
    this.width = w;
    setTimeout(() => Bangle.drawWidgets(),10); return;
  }
  g.reset();
  g.setColor(g.theme.bg);
  g.fillRect(this.x, this.y, this.x + this.width, this.y + 23); // erase background
  g.setColor(g.theme.fg);
  g.setFont("6x8:1");
  g.setFontAlign(-1, 0);
  g.drawString("bpm", this.x, this.y + 5);
  g.setFont("4x6:2");
  g.setFontAlign(-1, 0);
  g.drawString(bpm, this.x, this.y + 17);
}

WIDGETS["widhr"]={area:"tl",sortorder:-1,width:13,draw:widhr_draw};