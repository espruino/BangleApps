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
Graphics.prototype.setFontInterMini = function() {
  // Actual height 14 (13 - 0)
  // 1 BPP
  return this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('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'))),
    32,
    atob("BAQGCQoOCgQFBQcKBAcEBgkGCQkJCQoICgkEBQkJCQcOCgoLCwkJCwsECAoJDQsMCgwKCgkLCg4KCwkFBgUHBwUICggJCAYJCQQECQQMCQkKCQYIBgkIDAgICAYEBwkACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAgJCgkECAgNBgkIAAoGBgkGBgUJCQQFBQcIDAwNCAoKCgoKCg4KCQkJCQQFBQULCwwLDAwMCQsLCwsLCwkKCAgICAgIDggICQgIBAQEBAgJCQkJCQkJCQkJCQkICgg="),
    14|65536
  );
}
Graphics.prototype.setFontInterSmall = function() {
  // Actual height 17 (16 - 0)
  // 1 BPP
  return this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('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'))),
    32,
    atob("BAUJDAsRDAUHBgkLBQgFBwwHCwwMCwsKCwwFBgsLCwoRDQwNDQsLDg0FCg0KEA0ODA0MCwwNDRINDQwHBwYICQUKCwsLCgcLCwUFCwUPCwsLCwgKBwsLDwoLCgkGCAw="),
    17|65536
  );
}
Graphics.prototype.setFontMartianMono = function() {
  // Actual height 62 (61 - 0)
  // 1 BPP
  return this.setFontCustom(
    E.toString(require('heatshrink').decompress(atob('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'))),
    46,
    atob("IiktLCwsLi0tKSwtIQ=="),
    62|65536
  );
}

  let drawTimeout;
  
  const fontBorder = 6;
  const hoursYPos = 68-5+7;
  let bgColor = require("dailycolor").getDailyColor()
  let dateStr = "";

  
 
  //g.drawRect(0,
  let draw = function () {
    try {
      if (drawTimeout) clearTimeout(drawTimeout);
      drawTimeout = setTimeout(draw, 60000 - (Date.now() % 60000));

      let R = Bangle.appRect;
      let date = new Date();
      let t = locale.time(date, 1).split(":");
      let hourStr = " "+String(t[0]).trim().padStart(2, '0')+" ";
      let minStr = " " + t[1].padStart(2, '0') + " ";

      dateStr = locale.month(date, 1) + " " + date.getDate();
      g.setColor(g.theme.bg)
        .setFontAlign(-1, 0)
        .setFontMartianMono()
        .setColor(g.theme.bg)
        .fillRect(fontBorder,hoursYPos-7-33,98,hoursYPos-5+50-30+6)
        .setColor(g.theme.fg)
        .drawString(hourStr, fontBorder, hoursYPos-5)
        .setFontAlign(-1, 0)
        .setColor(g.theme.bg)
        .fillRect(fontBorder,hoursYPos-5-33+68,98,hoursYPos-5+50-30+6+68+3)
        .setColor(bgColor)
        .drawString(minStr, fontBorder, hoursYPos+68)
        .setFontAlign(1, -1)
        .setFontInterSmall()
        .setColor(bgColor)
        .setFontAlign(1, -1)
        .drawString(dateStr, R.x+R.w-6,hoursYPos-14-20-1);
        
      

    } catch (e) {
      drawTimeout = undefined;
      throw e;
    }
  }


  let clockInfoDraw = (itm, info, options) => {
    let texty = options.y + 41;
    g.reset().setClipRect(options.x, options.y, options.x + options.w - 1, options.y + options.h - 1);
    g.setFontInterMini().setBgColor(options.bg)
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
    app: "dailycolor", x: 98, y: 38+20+10, w: 70, h: 50,
    draw: clockInfoDraw, bg: g.theme.bg, fg: g.theme.fg,
    hl: (g.theme.fg === g.toColor(bgColor)) ? "#f00" : bgColor
  });
  let clockInfoMenu2 = require("clock_info").addInteractive(clockInfoItems, {
    app: "dailycolor", x: 98, y: 102+10+10, w: 70, h: 50,
    draw: clockInfoDraw, bg: g.theme.bg, fg: g.theme.fg,
    hl: (g.theme.fg === g.toColor(bgColor)) ? "#f00" : bgColor
  });
  
  Bangle.on('midnight',load)
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
    }
  });
  Bangle.loadWidgets();
  if (settings.hideWidgets) require("widget_utils").swipeOn();
  else setTimeout(Bangle.drawWidgets, 0);
  draw();
  clockInfoMenu.redraw();
  clockInfoMenu2.redraw();
})()
