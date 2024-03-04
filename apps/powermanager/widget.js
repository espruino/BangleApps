/* run widgets in their own function scope so they don't interfere with
currently-running apps */
(() => {
  const s = require("Storage").readJSON("powermanager.json") || {};
  
  if (!s.widget) return;

  const SYSTICKMAX = peek32(0xE000E014);
  const SYSTICKWAIT = SYSTICKMAX/64000; // 64 MHz clock rate, Systick counting down on every non idle clock

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
    WIDGETS.powermanager.draw(WIDGETS.powermanager);
    return o(a);
  })(Bangle.setLCDBrightness);

  let brightness = () => {
    return process.HWVERSION == 2 ? (brightnessSetting * APPROX_BACKLIGHT) : (brightnessSetting * 0.9 * 33 + 7);
  };

  function doDraw(w, cpu){
    g.reset();

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

    g.clearRect(w.x, w.y, w.x + 23, w.y + 23);

    g.setColor(g.theme.fg);

    g.setFont6x15();
    g.setFontAlign(0, 0);
    g.drawString(mostExpensive, w.x + 12, w.y + 15);
    let end = 135 + (current * (405 - 135));
    g.setColor(current > 0.7 ? "#f00" : (current > 0.3 ? "#ff0" : "#0f0"));
    GU.fillArc(g, w.x + 12, w.y + 12, 9, 12, GU.degreesToRadians(135), GU.degreesToRadians(end), GU.degreesToRadians(30));

    g.setColor(g.theme.fg);
    let endCpu = 135 + (cpu * (405 - 135));
    GU.fillArc(g, w.x + 12, w.y + 12, 5.5, 8, GU.degreesToRadians(135), GU.degreesToRadians(endCpu), GU.degreesToRadians(30));
  }
  let sTimeout;
  let s2Timeout;
  let systickDiff;
  function draw(w) {
    let nextRefresh = Bangle.isLocked() ?  ((s.refreshLocked || 60) * 1000 ): ((s.refreshUnlocked || 1) * 1000)

    if (s2Timeout) clearTimeout(s2Timeout);
    if (sTimeout) clearTimeout(sTimeout);

    let systickNow;
    sTimeout = setTimeout(()=>{
      systickNow = peek32(0xE000E018);
    }, nextRefresh - SYSTICKWAIT - 100);

    s2Timeout = setTimeout(() => {
      let systickLater = peek32(0xE000E018);
      systickDiff = systickLater - systickNow;
      if (systickDiff < 0) systickDiff += SYSTICKMAX;
    }, nextRefresh - 100);

    doDraw(w, systickDiff ? (1 - systickDiff/SYSTICKMAX) : 0);

    if (w.timeoutId !== undefined) {
      clearTimeout(w.timeoutId);
    }
    w.timeoutId = setTimeout(() => {
      w.timeoutId = undefined;
      w.draw(w);
    }, nextRefresh);
  }

  // add your widget
  WIDGETS.powermanager = {
    area: "tl",
    width: 24,
    draw: draw
  };

  Bangle.on("lock", ()=>{WIDGETS.powermanager.draw(WIDGETS.powermanager);});

  // conserve memory
  delete settings;
})();