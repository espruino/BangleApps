(function () {
  let settings;
  let getSettings = function () {
    settings = Object.assign(
      require("Storage").readJSON("dailycolor.json", true) || {}
    );
  }
  getSettings();

  g.clear();
  const locale = require("locale");

  const fontBitmap = E.toString(require('heatshrink').decompress(atob('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')));

  let setFontPaytoneOne = function (g) {
    g.setFontCustom(fontBitmap, 46, atob("ER0mGCMjJiMkIiUkEg=="), 70 | 65536);
  }

  let drawTimeout;

  const slopeHeight = 90;
  const fontBorder = 13;
  const hoursYPos = 68;
  const minOffset = 4;
  const slopeBorder = 4;
  let bgColor = require("dailycolor").getDailyColor();
  let dateStr = "";

  let preDraw = function () {
    g.setColor(g.theme.bg).fillRect(0, 0, g.getWidth(), g.getHeight());
    g.setColor(bgColor).fillRect(0, slopeHeight, g.getWidth(), g.getHeight());
  }

  let draw = function () {
    try {
      if (drawTimeout) clearTimeout(drawTimeout);
      drawTimeout = setTimeout(draw, 60000 - (Date.now() % 60000));

      let R = Bangle.appRect;
      let date = new Date();
      let t = locale.time(date, 1).split(":");
      let hourStr = " "+String(t[0]).trim().padStart(2, '0')+" ";
      let minStr = " " + t[1].padStart(2, '0') + " ";

      dateStr = locale.dow(date, 1) + ', ' + locale.month(date, 1) + " " + date.getDate();

      g.setColor(g.theme.bg)
        .fillRect(0, 24, 96, 88)
        .setColor(g.theme.fg)
        .setFontAlign(-1, 0);
      setFontPaytoneOne(g);
      let yo = slopeHeight + minOffset;
      g.drawString(hourStr, fontBorder, hoursYPos)
        .setColor(bgColor)
        .fillRect(92, 92, g.getWidth(), 152)
        .setFontAlign(1, -1);
      setFontPaytoneOne(g);
      g.setColor(g.theme.bg)
        .drawString(minStr, g.getWidth() - 7, yo)
        .setColor(g.theme.bg)
        .fillRect(0, slopeHeight - slopeBorder, g.getWidth(), slopeHeight)
        .setFont("Vector", 16).setFontAlign(0, 0)
        .drawString(dateStr, R.x + R.w / 2, R.y + R.h - 13);
    } catch (e) {
      drawTimeout = undefined;
      throw e;
    }
  }


  let clockInfoDraw = (itm, info, options) => {
    let texty = options.y + 41;
    g.reset().setClipRect(options.x, options.y, options.x + options.w - 1, options.y + options.h - 1);
    g.setFont("Vector", 15).setBgColor(options.bg)
      .clearRect(options.x, texty - 15, options.x + options.w - 2, texty);

    g.setColor(options.focus ? options.hl : options.fg);
    if (options.x < g.getWidth() / 2) {
      let x = options.x + 2;
      if (info.img) g.clearRect(x, options.y, x + 23, options.y + 23).drawImage(info.img, x, options.y);
      g.setFontAlign(-1, 1).drawString(info.text, x, texty);
    } else {
      let x = options.x + options.w - 3;
      if (info.img) g.clearRect(x - 23, options.y, x, options.y + 23).drawImage(info.img, x - 23, options.y);
      g.setFontAlign(1, 1).drawString(info.text, x, texty);
    }
    g.setClipRect(0, 0, g.getWidth() - 1, g.getHeight() - 1);
  };

  let clockInfoItems = require("clock_info").load();
  let clockInfoMenu = require("clock_info").addInteractive(clockInfoItems, {
    app: "dailycolorclk", x: 98, y: 38, w: 70, h: 50,
    draw: clockInfoDraw, bg: g.theme.bg, fg: g.theme.fg,
    hl: (g.theme.fg === g.toColor(bgColor)) ? "#f00" : bgColor
  });
  let clockInfoMenu2 = require("clock_info").addInteractive(clockInfoItems, {
    app: "dailycolorclk", x: 10, y: 102, w: 70, h: 50,
    draw: clockInfoDraw, bg: bgColor, fg: g.theme.bg,
    hl: (g.theme.fg === g.toColor(bgColor)) ? "#f00" : g.theme.fg
  });

  Bangle.setUI({
    mode: "clock",
    remove: function () {
      if (drawTimeout) clearTimeout(drawTimeout);
      drawTimeout = undefined;
      clockInfoMenu.remove();
      clockInfoMenu2.remove();
      clockInfoMenu = null;
      clockInfoMenu2 = null;
      Bangle.removeListener('midnight',load);
    },
    redraw: draw
  });

  Bangle.loadWidgets();
  if (settings.hideWidgets) require("widget_utils").swipeOn();
  else setTimeout(Bangle.drawWidgets, 0);
  Bangle.on('midnight',load)
  preDraw();
  draw();
  clockInfoMenu.redraw();
  clockInfoMenu2.redraw();
})()
