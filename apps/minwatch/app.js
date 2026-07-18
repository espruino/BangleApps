{
  let drawInterval;
  var charging = false;
  var lc = require("locale");
  var cachedWeather = null;
  var cachedWeatherTime = 0;
  var cachedWeekNum = -1;
  var cachedWeekDay = -1;

  function getWeekNumber(d) {
    var day = d.getDate();
    if (day === cachedWeekDay) return cachedWeekNum;
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    cachedWeekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    cachedWeekDay = day;
    return cachedWeekNum;
  }

  function getWeather() {
    var now = Date.now();
    if (cachedWeather !== null && now - cachedWeatherTime < 300000) return cachedWeather;
    var wd = null;
    try { wd = require("Storage").readJSON("weather.json"); } catch(e) {}
    var w = wd && wd.weather ? wd.weather : null;
    cachedWeather = w && w.temp !== undefined ? w : null;
    cachedWeatherTime = now;
    return cachedWeather;
  }

  function drawWeatherIcon(cx, cy, code) {
    if (code === undefined || code === null) return;
    g.setColor(0);
    if (code === 800) {
      g.fillCircle(cx, cy, 4);
      for (var i = 0; i < 8; i++) {
        var a = i * 0.785;
        g.drawLine(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6,
                   cx + Math.cos(a) * 8, cy + Math.sin(a) * 8);
      }
    } else if (code >= 801 && code <= 804) {
      g.fillCircle(cx + 4, cy - 3, 3);
      g.fillCircle(cx - 2, cy, 5);
      g.fillCircle(cx + 4, cy, 4);
    } else if (code >= 701 && code <= 741) {
      g.drawLine(cx - 6, cy - 3, cx + 6, cy - 3);
      g.drawLine(cx - 4, cy, cx + 4, cy);
      g.drawLine(cx - 6, cy + 3, cx + 6, cy + 3);
    } else if ((code >= 300 && code <= 321) || (code >= 500 && code <= 531)) {
      g.fillCircle(cx - 2, cy - 2, 4);
      g.fillCircle(cx + 3, cy - 2, 3);
      g.fillCircle(cx, cy - 4, 3);
      g.fillPoly([cx-3,cy+2, cx-2,cy+5, cx-1,cy+2]);
      g.fillPoly([cx+1,cy+3, cx+2,cy+6, cx+3,cy+3]);
    } else if (code >= 600 && code <= 622) {
      g.fillCircle(cx - 2, cy - 2, 4);
      g.fillCircle(cx + 3, cy - 2, 3);
      g.fillCircle(cx, cy - 4, 3);
      g.fillCircle(cx - 3, cy + 3, 1);
      g.fillCircle(cx + 1, cy + 4, 1);
      g.fillCircle(cx + 4, cy + 3, 1);
    } else if (code >= 200 && code <= 232) {
      g.fillCircle(cx - 2, cy - 3, 4);
      g.fillCircle(cx + 3, cy - 3, 3);
      g.fillCircle(cx, cy - 5, 3);
      g.fillPoly([cx,cy, cx-2,cy+3, cx+1,cy+3, cx-1,cy+6]);
    } else {
      g.fillCircle(cx - 2, cy, 4);
      g.fillCircle(cx + 3, cy, 3);
      g.fillCircle(cx, cy - 2, 3);
    }
  }

  function drawBatteryBar(cx, y) {
    var filled = Math.round(E.getBattery() / 10);
    for (var i = 0; i < 10; i++) {
      g.setColor(i < filled ? (filled <= 2 ? 0xF800 : filled <= 4 ? 0xFE60 : 0x07E0) : 0xC618);
      var x = cx - 59 + i * 12;
      g.fillRect(x, y, x + 9, y + 6);
    }
  }

  function drawChargingIcon() {
    var W = g.getWidth();
    var cx = W - 12, cy = 166;
    g.setColor(0xFFFF);
    g.fillRect(W - 22, 158, W, 175);
    if (charging) {
      g.setColor(0xFE60);
      g.fillCircle(cx, cy - 3, 3);
      g.fillRect(cx - 1, cy, cx + 1, cy + 6);
      g.fillPoly([cx - 2, cy + 3, cx, cy + 7, cx + 2, cy + 3]);
    }
  }

  function draw() {
    try {
      var W = g.getWidth();
      var H = g.getHeight();
      var cx = W >> 1;
      var date = new Date();
      var appTop = Bangle.appRect ? Bangle.appRect.y : 24;
      var appH = Bangle.appRect ? Bangle.appRect.h : H - 24;

      var w = getWeather();
      var hasWeather = w !== null;

      var gap = 8;
      var th = g.setFont("6x8", 4).getFontHeight();
      var sh = g.setFont("6x8", 2).getFontHeight();
      var bh = 7;
      var totalH = th + sh + sh + bh + (hasWeather ? sh + 8 : 0) + sh + gap * 5;
      var y = appTop + (appH - totalH) / 2 + 16;

      g.reset();
      g.setColor(0xFFFF);
      g.fillRect(0, appTop, W, H);
      g.setFontAlign(0, -1);
      g.setColor(0);

      try {
        g.setFont("6x8", 4);
        g.drawString(lc.time(date, 1), cx, y, true);
        y += th + gap;
      } catch(e) {}

      try {
        g.setFont("6x8", 2);
        var dateStr = lc.dow(date, 1) + " " + lc.date(date, 1);
        if (g.stringWidth(dateStr) > W - 10) dateStr = lc.date(date, 1);
        if (g.stringWidth(dateStr) > W - 10) dateStr = lc.dow(date, 1);
        g.drawString(dateStr, cx, y, true);
        y += sh + gap;
      } catch(e) {}

      try {
        g.drawString("CW " + getWeekNumber(date), cx, y, true);
        y += sh + gap;
      } catch(e) {}

      try {
        drawBatteryBar(cx, y);
        y += bh + gap;
      } catch(e) {}

      try {
        if (hasWeather) {
          drawWeatherIcon(cx - 24, y + 8, w.code);
          g.setFontAlign(-1, -1);
          g.drawString(Math.round(w.temp - 273.15) + "\u00B0C", cx - 11, y, true);
          g.setFontAlign(0, -1);
          y += sh + gap;
        }
      } catch(e) {
        g.setFontAlign(0, -1);
      }

      try {
        g.drawString(Bangle.getStepCount() + " steps", cx, y, true);
      } catch(e) {}

    } catch(e) {}
    drawChargingIcon();
  }

  if (Bangle.setHRMPower) Bangle.setHRMPower(0, "minwatch");
  if (Bangle.on) {
    Bangle.on('charging', function(c) {
      charging = c;
      drawChargingIcon();
    });
  }

  Bangle.setUI({mode:"clock", remove:function() {
    if (drawInterval !== undefined) { clearInterval(drawInterval); drawInterval = undefined; }
    if (Bangle.removeAllListeners) Bangle.removeAllListeners('charging');
  }});
  g.setColor(0xFFFF);
  g.fillRect(0, 0, g.getWidth(), g.getHeight());
  Bangle.loadWidgets();
  Bangle.drawWidgets();
  if (Bangle.isCharging) charging = Bangle.isCharging();
  draw();
  drawInterval = setInterval(draw, 60000);
}
