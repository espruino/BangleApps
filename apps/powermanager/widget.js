/* run widgets in their own function scope so they don't interfere with
currently-running apps */
(() => {
  const s = require("Storage").readJSON("powermanager.json") || {};
  
  if (!s.widget) return;

  const systickMax = peek32(0xE000E014);
  let t, systickNow, tLater, systickLater, systickDiff;
  setInterval(() => {
    tLater = Date.now();
    systickLater = peek32(0xE000E018);
    systickDiff = systickLater - systickNow;
    if (systickDiff < 0) systickDiff += systickMax;
    t = Date.now();
    systickNow = peek32(0xE000E018);
  }, 250);

  const GU = require("graphics_utils");
  const APPROX_IDLE = 0.3;
  const APPROX_HIGH_BW_BLE = 0.5;
  const APPROX_COMPASS = process.HWVERSION == 2 ? 5.5 : 2;
  const APPROX_HRM = process.HWVERSION == 2 ? 1 : 2.5;
  const APPROX_CPU = 3;
  const APPROX_GPS = process.HWVERSION == 2 ? 25 : 30;
  const APPROX_TOUCH = 2.5;
  const APPROX_BACKLIGHT = process.HWVERSION == 2 ? 16 : 40;
  const MAX = APPROX_IDLE + APPROX_HIGH_BW_BLE + APPROX_COMPASS + APPROX_HRM + APPROX_CPU + APPROX_GPS + APPROX_TOUCH + APPROX_BACKLIGHT;

  let settings = require("Storage").readJSON("setting.json") || {};

  let brightnessSetting = settings.brightness || 1;
  Bangle.setLCDBrightness = ((o) => (a) => {
    brightnessSetting = a;
    draw(WIDGETS.powermanager);
    return o(a);
  })(Bangle.setLCDBrightness);

  let brightness = () => {
    return process.HWVERSION == 2 ? (brightnessSetting * APPROX_BACKLIGHT) : (brightnessSetting * 0.9 * 33 + 7);
  };

  function draw(w) {
    g.reset();

    let cpu = 1 - systickDiff/systickMax;
    let current = APPROX_IDLE + cpu * APPROX_CPU;
    let mostExpensive = "P";

    if (!Bangle.isLocked()) current += APPROX_TOUCH + brightness();
    if (Bangle.isCompassOn()) {
      current += APPROX_COMPASS;
      mostExpensive = "C";
    }
    if (Bangle.isHRMOn()) {
      current += APPROX_HRM;
      mostExpensive = "H";
    }
    if (Bangle.isGPSOn()) {
      current += APPROX_GPS;
      mostExpensive = "G";
    }

    current = current / MAX;

    g.clearRect(this.x, this.y, this.x + 23, this.y + 23);

    g.setColor(g.theme.fg);

    g.setFont6x15();
    g.setFontAlign(0, 0);
    g.drawString(mostExpensive, this.x + 12, this.y + 15);

    let end = 135 + (current * (405 - 135));
    g.setColor(current > 0.7 ? "#f00" : (current > 0.3 ? "#ff0" : "#0f0"));
    GU.fillArc(g, this.x + 12, this.y + 12, 9, 12, GU.degreesToRadians(135), GU.degreesToRadians(end));

    g.setColor(g.theme.fg);
    let endCpu = 135 + (cpu * (405 - 135));
    GU.fillArc(g, this.x + 12, this.y + 12, 6, 8, GU.degreesToRadians(135), GU.degreesToRadians(endCpu));

    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.timeoutId = undefined;
      w.draw(w);
    }, Bangle.isLocked() ? 60000 : 2000);
  }

  // add your widget
  WIDGETS.powermanager = {
    area: "tl",
    width: 24,
    draw: draw
  };

  Bangle.on("lock", ()=>{draw(WIDGETS.powermanager);});

  // conserve memory
  delete settings;
})();