WIDGETS["widmoon"] = { area: "tr", width: 24, draw: function() {
  const CenterX = this.x + 12, CenterY = this.y + 12, Radius = 11;
  var southernHemisphere = false; // when in southern hemisphere, use the "My Location" App

  const simulate = false; // simulate one month in one minute
  const updateR = 1000; // update every x ms in simulation

  function moonPhase() {
    const d = Date();
    var month = d.getMonth(), year = d.getFullYear(), day = d.getDate();
    if (simulate) day = d.getSeconds() / 2 +1;
    if (month < 3) {year--; month += 12;}
    mproz = ((365.25 * year + 30.6 * ++month + day - 694039.09) /  29.5305882);
    mproz = mproz - (mproz | 0);  // strip integral digits, result is between 0 and <1
    if (simulate) console.log(mproz + "  " + day);
    return (mproz);
  }

  function loadLocation() {
    // "mylocation.json" is created by the "My Location" app
    location = require("Storage").readJSON("mylocation.json",1)||{"lat":50.1236,"lon":8.6553,"location":"Frankfurt"};
    if (location.lat < 0) southernHemisphere = true;
  }

  // code source: github.com/rozek/banglejs-2-activities/blob/main/README.md#drawmoonphase
  function drawMoonPhase (CenterX,CenterY, Radius, leftFactor,rightFactor) {
    let x = Radius, y = 0, Error = Radius;
    g.drawLine(CenterX-leftFactor*x,CenterY, CenterX+rightFactor*x,CenterY);
    let dx,dy;
    while (y <= x) {
      dy = 1 + 2*y; y++; Error -= dy;
      if (Error < 0) {
        dx = 1 - 2*x; x--; Error -= dx;
      }
      g.drawLine(CenterX-leftFactor*x,CenterY-y, CenterX+rightFactor*x,CenterY-y);
      g.drawLine(CenterX-leftFactor*x,CenterY+y, CenterX+rightFactor*x,CenterY+y);
      g.drawLine(CenterX-leftFactor*y,CenterY-x, CenterX+rightFactor*y,CenterY-x);
      g.drawLine(CenterX-leftFactor*y,CenterY+x, CenterX+rightFactor*y,CenterY+x);
    }
  }

  function updateWidget() {
    g.reset().setColor(g.theme.bg);
    g.fillRect(CenterX - Radius, CenterY - Radius, CenterX + Radius, CenterY + Radius);
    g.setColor(0x41f);

    mproz = moonPhase(); // mproz = 0..<1

    leftFactor = mproz * 4 - 1;
    rightFactor = (1 - mproz) * 4 - 1;
    if (mproz >= 0.5) leftFactor = 1; else rightFactor = 1;
    if (true == southernHemisphere) {
      var tmp=leftFactor; leftFactor=rightFactor; rightFactor=tmp;
    }

    drawMoonPhase(CenterX,CenterY, Radius, leftFactor,rightFactor);

    if (simulate) setTimeout(updateWidget, updateR);
  }

  loadLocation();
  updateWidget();
} };
