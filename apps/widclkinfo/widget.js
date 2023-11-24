if (!require("clock_info").loadCount) { // don't load if a clock_info was already loaded
  // Load the clock infos
  let clockInfoItems = require("clock_info").load();
  // Add the
  let clockInfoMenu = require("clock_info").addInteractive(clockInfoItems, {
    app : "widclkinfo",
    // Add the dimensions we're rendering to here - these are used to detect taps on the clock info area
    x : 0, y: 0, w: 72, h:24,
    // You can add other information here you want to be passed into 'options' in 'draw'
    // This function draws the info
    draw : (itm, info, options) => {
      // itm: the item containing name/hasRange/etc
      // info: data returned from itm.get() containing text/img/etc
      // options: options passed into addInteractive
      clockInfoInfo = info;
      if (WIDGETS["clkinfo"])
        WIDGETS["clkinfo"].draw(WIDGETS["clkinfo"]);
    }
  });
  let clockInfoInfo; // when clockInfoMenu.draw is called we set this up

  // The actual widget we're displaying
  WIDGETS["clkinfo"] = {
    area:"tl",
    width: clockInfoMenu.w,
    draw:function(e) {
      clockInfoMenu.x = e.x;
      clockInfoMenu.y = e.y;
      var o = clockInfoMenu;
      // Clear the background
      g.reset();
      // indicate focus - make background reddish
      //if (clockInfoMenu.focus) g.setBgColor(g.blendColor(g.theme.bg, "#f00", 0.25));
      if (clockInfoMenu.focus) g.setColor("#f00");
      g.clearRect(o.x, o.y, o.x+o.w-1, o.y+o.h-1);
      if (clockInfoInfo) {
        var x = o.x;
        if (clockInfoInfo.img) {
          g.drawImage(clockInfoInfo.img, x,o.y); // draw the image
          x+=24;
        }
        var availableWidth = o.x+clockInfoMenu.w - (x+2);
        g.setFont("6x8:2").setFontAlign(-1,0);
        if (g.stringWidth(clockInfoInfo.text) > availableWidth)
          g.setFont("6x8:1x2");
        g.drawString(clockInfoInfo.text, x+2,o.y+12); // draw the text
      }
    }
  };
}