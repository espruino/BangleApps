(() => {
  const PEDOMFILE = "wpedom.json";
  // add the width
  // WIDGETPOS.tr is originally 208 without any widgets
  var xpos = WIDGETPOS.tl;
  var width = 24;
  WIDGETPOS.tl += (width + 2);

  let lastUpdate = new Date();
  let stp_today = 0;

  // draw your widget at xpos
  function draw() {
    // Widget	(0,0,239,23)
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
    g.clearRect(xpos,15,xpos+width,24); // erase background
    g.drawString(stps, xpos+width/2, 19);
    g.drawImage(atob("CgoCLguH9f2/7+v6/79f56CtAAAD9fw/n8Hx9A=="),xpos+(width-10)/2,2);
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
    if (Bangle.isLCDOn()) draw();
  });
  // redraw when the LCD turns on
  Bangle.on('lcdPower', function(on) {
    if (on) draw();
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
  WIDGETS["wpedom"]={draw:draw};
  // Load data at startup
  let pedomData = require("Storage").readJSON(PEDOMFILE,1);
  if (pedomData) {
    if (pedomData.lastUpdate)
      lastUpdate = new Date(pedomData.lastUpdate);
    stp_today = pedomData.stepsToday|0;
  }
})()
