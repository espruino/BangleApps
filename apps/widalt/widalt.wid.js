(()=>{
  var alt="";
  var lastAlt=0;
  var settings = Object.assign({
    interval: 5000,
  }, require('Storage').readJSON("widalt.json", true) || {});
  Bangle.setBarometerPower(true,"widalt");
  Bangle.on("pressure", (p)=>{
    if (Math.floor(p.altitude)!=lastAlt) {
      lastAlt=Math.floor(p.altitude);
      alt=p.altitude.toFixed(0); 
      var w = WIDGETS["widalt"].width;
      WIDGETS["widalt"].width = 1 + (alt.length)*12+16;
      if (w!=WIDGETS["widalt"].width) Bangle.drawWidgets();
      else WIDGETS["widalt"].draw();
    }
    Bangle.setBarometerPower(false,"widalt")
    setTimeout(()=>{Bangle.setBarometerPower(true,"widalt");},settings.interval);
  });
  
  function draw() {
    if (!Bangle.isLCDOn()) return; 
    g.reset();
    g.setColor(g.theme.bg);
    g.fillRect(this.x, this.y, this.x + this.width, this.y + 23); 
    g.setColor(g.theme.fg); 
    g.drawImage(atob("EBCBAAAAAAAIAAwgFXAX0BCYIIggTD/EYPZADkACf/4AAAAA"), this.x, this.y+4);
g.setFontCustom(atob("AAAAABwAAOAAAgAAHAADwAD4AB8AB8AA+AAeAADAAAAOAAP+AH/8B4DwMAGBgAwMAGBgAwOAOA//gD/4AD4AAAAAAAABgAAcAwDAGAwAwP/+B//wAAGAAAwAAGAAAAAAAAIAwHgOA4DwMA+BgOwMDmBg4wOeGA/gwDwGAAAAAAAAAGAHA8A4DwMAGBhAwMMGBjgwOcOA+/gDj4AAAAABgAAcAAHgADsAA5gAOMAHBgBwMAP/+B//wABgAAMAAAAAAAgD4OB/AwOYGBjAwMYGBjBwMe8Bh/AIHwAAAAAAAAAfAAP8AHxwB8GAdgwPMGBxgwMOOAB/gAH4AAAAAAABgAAMAABgAwMAeBgPgMHwBj4AN8AB+AAPAABAAAAAAAMfAH38B/xwMcGBhgwMMGBjgwP+OA+/gDj4AAAAAAAAOAAH4AA/gQMMGBgzwME8BhvAOPgA/4AD8AAEAAAAAAGAwA4OAHBwAAA="), 46, atob("BAgMDAwMDAwMDAwMBQ=="), 21+(1<<8)+(1<<16));
    g.setFontAlign(-1, 0);
    g.drawString(alt, this.x+16, this.y + 12); 
  }
  WIDGETS["widalt"] = {
    area: "tr",
    width: 6,
    draw: draw
  };

})();
