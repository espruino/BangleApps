(() => {
  const PEDOMFILE = "wpedom.json";
  let lastUpdate = new Date();
  let stp_today = 0;

  // draw your widget
  function draw() {
    var width = 24;
    if (stp_today > 99999){
      stp_today = stp_today % 100000; // cap to five digits + comma = 6 characters
    }
    let stps = stp_today.toString();
    g.reset();
    if (stps.length > 3){
      stps = stps.slice(0,-3) + "," + stps.slice(-3);
      g.setFont("4x6", 1); // if big, shrink text to fix
    } else {
      g.setFont("6x8", 1);
    }
    g.setFontAlign(0, 0); // align to x: center, y: center
    g.clearRect(this.x,this.y+15,this.x+width,this.y+23); // erase background
    g.drawString(stps, this.x+width/2, this.y+19);
    g.drawImage(atob("CgoCLguH9f2/7+v6/79f56CtAAAD9fw/n8Hx9A=="),this.x+(width-10)/2,this.y+2);
  }

  Bangle.on('step', (up) => {
    let date = new Date();
    if (lastUpdate.getDate() == date.getDate()){
      stp_today ++;
    } else {
      // TODO: could save this to PEDOMFILE for lastUpdate's day?
      stp_today = 1;
    }
    lastUpdate = date;
    //console.log("up: " + up + " stp: " + stp_today + " " + date.toString());
    if (Bangle.isLCDOn()) WIDGETS["wpedom"].draw();
  });
  // redraw when the LCD turns on
  Bangle.on('lcdPower', function(on) {
    if (on) WIDGETS["wpedom"].draw();
  });
  // When unloading, save state
  E.on('kill', () => {
    let d = {
      lastUpdate : lastUpdate.toISOString(),
      stepsToday : stp_today
    };
    require("Storage").write(PEDOMFILE,d);
  });

  // add your widget
  WIDGETS["wpedom"]={area:"tl",width:26,draw:draw};
  // Load data at startup
  let pedomData = require("Storage").readJSON(PEDOMFILE,1);
  if (pedomData) {
    if (pedomData.lastUpdate)
      lastUpdate = new Date(pedomData.lastUpdate);
    stp_today = pedomData.stepsToday|0;
  }
})()
