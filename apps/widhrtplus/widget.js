(function(){
  if (!Bangle.isHRMOn) return; // old firmware
  var hp = Bangle.setHRMPower;
  Bangle.setHRMPower = () => {
    hp.apply(Bangle, arguments);
    WIDGETS.widhrt.draw();
  };

  var bp = Math.round(Bangle.getHealthStatus().bpm||Bangle.getHealthStatus("last").bpm);
  
  Bangle.on('HRM',(e)=>{
    //console.log('onHrm');
    if (e && e.confidence>60) bp = Math.round(e.bpm);
    if (bp == 0) bp = Math.round(Bangle.getHealthStatus().bpm||Bangle.getHealthStatus("last").bpm);
    WIDGETS["widhrt"].draw();
  });
  
  WIDGETS.widhrt={area:"tr",sortorder:9,width:56,draw:function() {
    g.reset();
    // Lato from fonts.google.com, Actual height 17 (17 - 1), Numeric only
    g.setFontCustom(atob("AAAAABwAAOAAAgAAHAADwAD4AB8AB8AA+AAeAADAAAAOAAP+AH/8B4DwMAGBgAwMAGBgAwOAOA//gD/4AD4AAAAAAAABgAAcAwDAGAwAwP/+B//wAAGAAAwAAGAAAAAAAAIAwHgOA4DwMA+BgOwMDmBg4wOeGA/gwDwGAAAAAAAAAGAHA8A4DwMAGBhAwMMGBjgwOcOA+/gDj4AAAAABgAAcAAHgADsAA5gAOMAHBgBwMAP/+B//wABgAAMAAAAAAAgD4OB/AwOYGBjAwMYGBjBwMe8Bh/AIHwAAAAAAAAAfAAP8AHxwB8GAdgwPMGBxgwMOOAB/gAH4AAAAAAABgAAMAABgAwMAeBgPgMHwBj4AN8AB+AAPAABAAAAAAAMfAH38B/xwMcGBhgwMMGBjgwP+OA+/gDj4AAAAAAAAOAAH4AA/gQMMGBgzwME8BhvAOPgA/4AD8AAEAAAAAAGAwA4OAHBwAAA="), 46, atob("BAgMDAwMDAwMDAwMBQ=="), 21+(1<<8)+(1<<16));
    //console.log("hrm=" + bp);
    
    var text_w = g.stringWidth(bp);
    var hw = 20; // heart image width
    var w = text_w + 3 + hw + 2;
    // we need this to be able to shrink or grow on the 3,2,1 digit bpm
    if (w != this.width) {this.width = w; setTimeout(() => Bangle.drawWidgets(),10); return;}
    //var h = 12; // height

    g.setColor(g.theme.bg);
    g.fillRect(this.x, this.y, this.x + this.width, this.y + 23); // erase background
    g.setColor(g.theme.fg);
    g.setFontAlign(-1, 0);
    g.drawString(bp, this.x, this.y + 12);
    var x = this.x + text_w + 3;

    // draw image
    if (Bangle.isHRMOn()) {
      g.setColor('#f00');     // on = red
    } else {
      g.setColor(g.theme.dark ? '#fff' : '#000'); // off
    }

    // image converter https://www.espruino.com/Image+Converter ; settings to get a fillable image
    // 1 bit bw, transparency? Y, transparent bg, white heart (must be white for color fill)
    g.drawImage(atob("FBSBAAAAAAAAAAAB+fg//8f//n//5//+f//n//5//+P//D//wf/4D/8Af+AB+AAPAABgAAAA"), x, 1+this.y);
  }};
})();
