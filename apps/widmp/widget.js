WIDGETS["widmoon"] = { area: "tr", width: 24, draw: function() {
  const CenterX = this.x + 12, CenterY = this.y + 12, Radius = 11;
  var southernHemisphere = false; // when in southern hemisphere, use the "My Location" App
  var lastCalculated = 0; // When we last calculated the phase
  var phase = 0; // The last phase we calculated

  const simulate = false; // simulate one month in one minute
  const updateR = 1000; // update every x ms in simulation

  // https://deirdreobyrne.github.io/calculating_moon_phases/
  function moonPhase(millis) {
    k = (millis - 946728000000) / 3155760000000;
    mp = (8328.69142475915 * k) + 2.35555563685;
    m =  (628.30195516723 * k) + 6.24006012726;
    d =  (7771.37714483372 * k) + 5.19846652984;
    t = d + (0.109764 * Math.sin (mp)) - (0.036652 * Math.sin(m)) + (0.022235 * Math.sin(d+d-mp)) + (0.011484 * Math.sin(d+d)) + (0.003735 * Math.sin(mp+mp)) + (0.00192 * Math.sin(d));
    k = (1 - Math.cos(t))/2;
    if (Math.sin(t) < 0) {
      k = -k;
    }
    return (k); // Goes 0 -> 1 for waxing, and from -1 -> 0 for waning
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

    millis = (new Date()).getTime();
    if ((millis - lastCalculated) >= 7200000) {
      phase = moonPhase(millis);
      lastCalculated = millis;
    }

    if (phase < 0) { // waning - phase goes from -1 to 0
      leftFactor = 1;
      rightFactor = -1 - 2*phase;
    } else { // waxing - phase goes from 0 to 1
      rightFactor = 1;
      leftFactor = -1 + 2*phase;
    }
    if (true == southernHemisphere) {
      var tmp=leftFactor; leftFactor=rightFactor; rightFactor=tmp;
    }

    drawMoonPhase(CenterX,CenterY, Radius, leftFactor,rightFactor);

    if (simulate) setTimeout(updateWidget, updateR);
  }

  loadLocation();
  updateWidget();
} };
