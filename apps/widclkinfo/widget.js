if (!require("clock_info").loadCount) { // don't load if a clock_info was already loaded
  // Load the clock infos
  let clockInfoItems = clock_info.load();

  // TODO only do checks if widget_utils.swipeOn is being used
  let wuo = widget_utils.offset;

  let clockInfoMenu = clock_info.addInteractive(clockInfoItems, {
    app: "widclkinfo",
    // Add the dimensions we're rendering to here - these are used to detect taps on the clock info area
    x: 0,
    y: 0, // maybe set offset to initial offset
    w: 72,
    h: 24,
    // You can add other information here you want to be passed into 'options' in 'draw'
    // This function draws the info
    draw: (itm, info, options) => {
      // itm: the item containing name/hasRange/etc
      // info: data returned from itm.get() containing text/img/etc
      // options: options passed into addInteractive
      clockInfoInfo = info;
      wuo = 0 | widget_utils.offset;
      clockInfoMenu.y = options.y + wuo;
      if (WIDGETS["clkinfo"]) {
        WIDGETS["clkinfo"].draw(WIDGETS["clkinfo"]);
        console.log("Clock Info was updated, thus drawing widget.");
      }
    }
  });
  let clockInfoInfo; // when clockInfoMenu.draw is called we set this up

  // The actual widget we're displaying
  WIDGETS["clkinfo"] = {
    area:"tl",
    width: clockInfoMenu.w,
    draw:function(e) {
      clockInfoMenu.x = e.x;
      wuo = 0 | widget_utils.offset;
      clockInfoMenu.y = e.y + wuo;
      var o = clockInfoMenu;
      // Clear the background
      g.reset();
      // indicate focus
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

  Bangle.on("hidden", () => {
    console.log("hidden");
    clockInfoMenu.y = -24;
    if (clockInfoMenu.focus) {
      clockInfoMenu.force_blur();
      console.log("Forced blur bc hidden");
    }
  });

  Bangle.on("shown", () => {
    clockInfoMenu.y = 0;
    console.log("shown");
    if (WIDGETS["clkinfo"]) {
      WIDGETS["clkinfo"].draw(WIDGETS["clkinfo"]);
    }
  });
