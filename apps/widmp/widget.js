(() => {

  var lastCalculated = 0; // When we last calculated the phase
  var phase = 0; // The last phase we calculated
  var southernHemisphere = false; // when in southern hemisphere -- use the "My Location" App
  var settings;

  // https://github.com/deirdreobyrne/LunarPhase
  function moonPhase(sec) {
    let d = (4.847408287988257 + sec/406074.7465115577) % (2.0*Math.PI);
    let m = (6.245333801867877 + sec/5022682.784840698) % (2.0*Math.PI);
    let l = (4.456038755040014 + sec/378902.2499653011) % (2.0*Math.PI);
    let t = d+1.089809730923715e-01 * Math.sin(l)-3.614132757006379e-02 * Math.sin(m)+2.228248661252023e-02 * Math.sin(d+d-l)+1.353592753655652e-02 * Math.sin(d+d)+4.238560208195022e-03 * Math.sin(l+l)+1.961408105275610e-03 * Math.sin(d);
    let k = (1.0 - Math.cos(t))/2.0;
    if ((t >= Math.PI) && (t < 2.0*Math.PI)) {
      k = -k;
    }
    return (k); // Goes 0 -> 1 for waxing, and from -1 -> 0 for waning
  }

  function loadLocation() {
    // "mylocation.json" is created by the "My Location" app
    let location = require("Storage").readJSON("mylocation.json",1)||{"lat":50.1236,"lon":8.6553,"location":"Frankfurt"};
    southernHemisphere = (location.lat < 0);
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

  function reloadSettings() {
    settings = Object.assign({
      default_colour: true,
      hide: false,
      red: 0,
      green: 0,
      blue: 0,
    }, require('Storage').readJSON("widmp.json", true) || {});
  }
  
  function setMoonColour(g) {
    if (settings.default_colour) {
      if (g.theme.dark) {
        g.setColor(0xffff); // white
      } else {
        // rrrrrggggggbbbbb
        // 0000010000011111
        g.setColor(0x41f); // blue-ish
      }
    } else {
      g.setColor(settings.red/4, settings.green/4, settings.blue/4);
    }
  }


  function draw() {
    if (settings.hide) return;
    const CenterX = this.x + 12, CenterY = this.y + 12, Radius = 11;
    let leftFactor, rightFactor;

    loadLocation();
    g.reset().setColor(g.theme.bg);
    g.fillRect(CenterX - Radius, CenterY - Radius, CenterX + Radius, CenterY + Radius);

    let millis = (new Date()).getTime();
    if ((millis - lastCalculated) >= 7000000) { // if it's more than 7,000 sec since last calculation, re-calculate!
      phase = moonPhase(millis/1000);
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

    setMoonColour(g);
    drawMoonPhase(CenterX,CenterY, Radius, leftFactor,rightFactor);
  }

  reloadSettings();
  var wid = settings.hide ? 0 : 24;
  WIDGETS["widmp"] = {
    area: "tr",
    width: wid,
    draw: draw
  };

})();
