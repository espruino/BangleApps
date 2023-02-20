/* run widgets in their own function scope so they don't interfere with
currently-running apps */
(() => {
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
    draw();
    return o(a);
  })(Bangle.setLCDBrightness);

  let brightness = () => {
    return process.HWVERSION == 2 ? (brightnessSetting * APPROX_BACKLIGHT) : (brightnessSetting * 0.9 * 33 + 7);
  };

  function draw() {
    g.reset();
    g.clearRect(this.x, this.y, this.x + 24, this.y + 24);

    let current = APPROX_IDLE;
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

    g.setColor(g.theme.fg);

    g.setFont6x15();
    g.setFontAlign(0, 0);
    g.drawString(mostExpensive, this.x + 12, this.y + 15);

    let end = 135 + (current * (405 - 135));
    g.setColor(current > 0.7 ? "#f00" : (current > 0.3 ? "#ff0" : "#0f0"));
    GU.fillArc(g, this.x + 12, this.y + 12, 8, 12, GU.degreesToRadians(135), GU.degreesToRadians(end));

    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.timeoutId = undefined;
      this.draw();
    }, Bangle.isLocked() ? 60000 : 5000);
  }

  // add your widget
  WIDGETS.powermanager = {
    area: "tl",
    width: 24,
    draw: draw
  };

  Bangle.on("lock", draw);

  // conserve memory
  delete settings;
})();