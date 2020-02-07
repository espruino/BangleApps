(() => {
  const PEDOMFILE = "@wpedom";
  // add the width
  // WIDGETPOS.tr is originally 208 without any widgets
  var xpos = WIDGETPOS.tr; // draw string with right alignment
  var width = 48;
  WIDGETPOS.tr -= (width + 2);

  let lastUpdate = new Date();
  let stp_today = 0;

  function erase() {
    g.clearRect(xpos-width, 0, xpos, 23);
  }

  // draw your widget at xpos
  function draw() {
    // Widget	(0,0,239,23)
    if (stp_today > 99999){
      stp_today = stp_today % 100000; // cap to five digits + comma = 6 characters
      erase();
    }
    let stps = stp_today.toString();
    if (stps.length > 3){
      stps = stps.slice(0,-3) + "," + stps.slice(-3);
    }
    g.setColor(1,1,1);
    g.setFont("4x6", 2);
    g.setFontAlign(1, 0); // align to x: right, y: center
    g.drawString(stps, xpos, 11, true); // 6 * 4*2 = 48
    g.flip();
  }

  Bangle.on('step', (up) => {
    let date = new Date();
    if (lastUpdate.getDate() == date.getDate()){
      stp_today += 1;
    } else {
      stp_today = 1;
      erase();
    }
    lastUpdate = date;
    //console.log("up: " + up + " stp: " + stp_today + " " + date.toString());
    draw();
  });

  // When unloading, save state
  E.on('kill', () => {
    let d = {
      lastUpdate : lastUpdate.toString(),
      stepsToday : stp_today
    };
    require("Storage").write(PEDOMFILE,d);
  });

  // add your widget
  WIDGETS["wpedom"]={draw:draw};
  // Load data at startup
  let pedomData = require("Storage").readJSON(PEDOMFILE);
  if (pedomData) {
    if (pedomData.lastUpdate)
      lastUpdate = new Date(pedomData.lastUpdate);
    stp_today = pedomData.stepsToday|0;
  }
})()
