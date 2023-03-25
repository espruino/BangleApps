(() => {
  const intervalLow = 60000; // update time when not charging
  const intervalHigh = 2000; // update time when charging
  const outline = atob("CRSBAD4AP/AYDAYDAYDAYDAYDAYDAYDAYD/w");

  let COLORS = {
    'black':    g.theme.dark ? "#fff" : "#000",
    'charging': "#0f0",
    'low':      "#f00",
  };

  function draw() {
    var i;
    var oCol = COLORS.low;
    var cCol = COLORS.low;
    var nCells = 0;

    const bat = E.getBattery();
    if (bat>5) {
      oCol = COLORS.black;
      nCells = 1 + Math.floor((bat-6)/19);
    }
    if (nCells>1)
      cCol = COLORS.black;
    if (Bangle.isCharging())
      oCol = COLORS.charging;
    g.reset();
    g.setColor(oCol).drawImage(outline,this.x+2,this.y+2);
    for (i=0;i<nCells;i++) {
      var x = this.x+2+2;
      var y = this.y+16+2-i*3;
      g.setColor(cCol).drawRect(x,y,x+4,y+1);
    }
    if (Bangle.isCharging()) {
      changeInterval(id,intervalHigh);
    } else {
      changeInterval(id,intervalLow);
    }
  }

  Bangle.on("charging",function(charging) {
    if (charging) Bangle.buzz();
    WIDGETS["widslimbat"].draw();
  });
  Bangle.on('lcdPower',function(on) {
    WIDGETS["widslimbat"].draw();
  });
  var id = setInterval(()=>WIDGETS["widslimbat"].draw(),intervalLow);

  WIDGETS["widslimbat"]={
    area:"tr",
    width:13,
    draw:draw
  };
})();
