(()=>{
  var alt="";
  var lastDraw=0;
  var lastAlt=0;
  
  function readAltitude() {
    try {Bangle.getPressure().then((p)=>{
      print("pressure read, altitude "+p.altitude.toFixed(0));
      if (Math.floor(p.altitude)!=lastAlt) {
        print("altitude changed!");
        lastAlt=Math.floor(p.altitude);
        alt=p.altitude.toFixed(0); 
        var w = WIDGETS["widalt"].width;
        WIDGETS["widalt"].width = 1 + (alt.length)*12+6;
        if (w!=WIDGETS["widalt"].width) Bangle.drawWidgets();
        WIDGETS["widalt"].draw();
      }
    });}
    catch(err) {
      print("ERROR");
    } 
    setTimeout(readAltitude,60000);
  }
  
  readAltitude();
  
  function draw() {
    //if (Date().getTime()-lastDraw<6000) return;//!!!!!
    if (!Bangle.isLCDOn()) return; 
    //lastDraw=Date().getTime();
    print("drawing");
    g.reset();
    g.setColor(g.theme.bg);
    g.fillRect(this.x, this.y, this.x + this.width, this.y + 23); 
    g.setColor(g.theme.fg); 
    g.drawImage(atob("BRaBACO3H8YghCEIfB8hCEIQ"), this.x+1, this.y);
g.setFontCustom(atob("AAAAABwAAOAAAgAAHAADwAD4AB8AB8AA+AAeAADAAAAOAAP+AH/8B4DwMAGBgAwMAGBgAwOAOA//gD/4AD4AAAAAAAABgAAcAwDAGAwAwP/+B//wAAGAAAwAAGAAAAAAAAIAwHgOA4DwMA+BgOwMDmBg4wOeGA/gwDwGAAAAAAAAAGAHA8A4DwMAGBhAwMMGBjgwOcOA+/gDj4AAAAABgAAcAAHgADsAA5gAOMAHBgBwMAP/+B//wABgAAMAAAAAAAgD4OB/AwOYGBjAwMYGBjBwMe8Bh/AIHwAAAAAAAAAfAAP8AHxwB8GAdgwPMGBxgwMOOAB/gAH4AAAAAAABgAAMAABgAwMAeBgPgMHwBj4AN8AB+AAPAABAAAAAAAMfAH38B/xwMcGBhgwMMGBjgwP+OA+/gDj4AAAAAAAAOAAH4AA/gQMMGBgzwME8BhvAOPgA/4AD8AAEAAAAAAGAwA4OAHBwAAA="), 46, atob("BAgMDAwMDAwMDAwMBQ=="), 21+(1<<8)+(1<<16));
    g.setFontAlign(-1, 0);
    g.drawString(alt, this.x+6, this.y + 12);       
  }
  WIDGETS["widalt"] = {
    area: "tr",
    width: 6,
    draw: draw
  };

})();
