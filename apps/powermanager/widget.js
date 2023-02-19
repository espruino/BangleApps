/* run widgets in their own function scope so they don't interfere with
currently-running apps */
(() => {

  const APPROX_IDLE = 0.3;
  const APPROX_HIGH_BW_BLE = 0.5;
  const APPROX_COMPASS = process.HWVERSION == 2 ? 5.5 : 2;
  const APPROX_HRM = process.HWVERSION == 2 ? 1 : 2.5;
  const APPROX_CPU = 3;
  const APPROX_GPS = process.HWVERSION == 2 ? 25 : 30;
  const APPROX_TOUCH = 2.5;
  const APPROX_BACKLIGHT = process.HWVERSION == 2 ? 16 : 40;
  const MAX = APPROX_IDLE + APPROX_HIGH_BW_BLE + APPROX_COMPASS + APPROX_HRM + APPROX_CPU + APPROX_GPS + APPROX_TOUCH + APPROX_BACKLIGHT;

  function draw() {
    g.reset(); // reset the graphics context to defaults (color/font/etc)
    // add your code

    let current = APPROX_IDLE;
    if (Bangle.isGPSOn()) current += APPROX_GPS;
    if (Bangle.isHRMOn()) current += APPROX_HRM;
    if (Bangle.isLocked()) current += APPROX_TOUCH + APPROX_BACKLIGHT;
    if (Bangle.isCompassOn()) current += APPROX_COMPASS;
    g.setColor(g.theme.fg);
    g.setFont6x15();
    g.setFontAlign(1,-1);
    g.drawString("mA", this.x + 14, this.y+13);
    g.setFont6x15();
    g.setFontAlign(1,-1);
    g.drawString(current.toFixed(0), this.x + 14, this.y);

    timeout = 5000;
    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(()=>{
      this.timeoutId = undefined;
      this.draw();
    }, timeout);
  }

  // add your widget
  WIDGETS.powermanager={
    area:"tl",
    width: 14,
    draw:draw
  };
})()
