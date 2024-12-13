if (!require("clock_info").loadCount) { // don't load if a clock_info was already loaded
  // Load the clock infos
  let clockInfoItems = clock_info.load();

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
      if (WIDGETS["clkinfo"]) {
      clockInfoMenu.y = options.y;
        WIDGETS["clkinfo"].draw(WIDGETS["clkinfo"]);
        console.log("Clock Info was updated, thus drawing widget.");
      }
    }
  });
  let clockInfoInfo; // when clockInfoMenu.draw is called we set this up
  let draw = function(e) {
    clockInfoMenu.x = e.x;
    var o = clockInfoMenu;
    // Clear the background
    g.reset();
    // indicate focus
    if (clockInfoMenu.focus) {
      g.setColor("#f00");
    }
    g.clearRect(o.x, o.y, o.x + o.w - 1, o.y + o.h - 1);

    if (clockInfoInfo) {
      var x = o.x;
      if (clockInfoInfo.img) {
        g.drawImage(clockInfoInfo.img, x, o.y); // draw the image
        x += 24;
      }
      var availableWidth = o.x + clockInfoMenu.w - (x + 2);
      g.setFont("6x8:2").setFontAlign(-1, 0);
      if (g.stringWidth(clockInfoInfo.text) > availableWidth)
        g.setFont("6x8:1x2");
      g.drawString(clockInfoInfo.text, x + 2, o.y + 12); // draw the text
    }
  };

  // The actual widget we're displaying
  WIDGETS["clkinfo"] = {
    area: "tl",
    width: clockInfoMenu.w,
    draw: draw
  };

  Bangle.on("widgets-start-show", () => {
    clockInfoMenu.y = 0;
    if (WIDGETS["clkinfo"]) {
      WIDGETS["clkinfo"].draw(WIDGETS["clkinfo"]);
    }
  })

  Bangle.on("widgets-shown", () => {
    clockInfoMenu.y = 0;
    if (WIDGETS["clkinfo"]) {
      WIDGETS["clkinfo"].draw(WIDGETS["clkinfo"]);
    }
  });

  Bangle.on("widgets-start-hide", () => {
    clockInfoMenu.y = -24;
    if (WIDGETS["clkinfo"]) {
      WIDGETS["clkinfo"].draw(WIDGETS["clkinfo"]);
    }
    if (clockInfoMenu.focus) {
      clockInfoMenu.blur();
    }
  });

  Bangle.on("widgets-hidden", () => {
    clockInfoMenu.y = -24;
    if (WIDGETS["clkinfo"]) {
      WIDGETS["clkinfo"].draw(WIDGETS["clkinfo"]);
    }
    // check here too in case widget_utils.hide() is called
    if (clockInfoMenu.focus) {
      clockInfoMenu.blur();
    }
  });
