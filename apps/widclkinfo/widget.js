(() => {
  if (!require("clock_info").loadCount) { // don't load if a clock_info was already loaded
  const clock_info = require("clock_info");

  WIDGETS["clkinfo"] = {
    area: "tl",
    width: 0, //this.clockInfoMenu.w,
    init: function() {
      this.width = this.clockInfoMenu.w;
      delete this.init;
      return this;
    },
    clockInfoInfo: undefined, // defined during clockInfoMenu.draw()
    clockInfoMenu: clock_info.addInteractive(clock_info.load(), {
      app: "widclkinfo",
      // Add the dimensions we're rendering to here - these are used to detect taps on the clock info area
      x: 0,
      y: 0, // TODO how know if offscreen to start?
      w: 72,
      h: 23, // workaround off by one error in clock_info
      // You can add other information here you want to be passed into 'options' in 'draw'
      // This function draws the info
      draw: (itm, info, options) => {
        // itm: the item containing name/hasRange/etc
        // info: data returned from itm.get() containing text/img/etc
        // options: options passed into addInteractive
        var wi = WIDGETS["clkinfo"];
        wi.clockInfoInfo = info;
        wi.clockInfoMenu.y = options.y;
        if (WIDGETS["clkinfo"] && wi.clockInfoMenu.y > -24) {
          WIDGETS["clkinfo"].draw(WIDGETS["clkinfo"]);
        }
      }
    }),
    draw: function(e) {
      this.clockInfoMenu.x = e.x;
      var o = this.clockInfoMenu;
      g.reset();
      // indicate focus
      if (this.clockInfoMenu.focus) {
        g.setColor("#f00");
      }
      g.clearRect(o.x, o.y, o.x + o.w - 1, o.y + o.h - 1);
      if (this.clockInfoInfo) {
        var x = o.x;
        if (this.clockInfoInfo.img) {
          g.drawImage(this.clockInfoInfo.img, x, o.y); // draw the image
          x += 24;
        }
        var availableWidth = o.x + this.clockInfoMenu.w - (x + 2);
        g.setFont("6x8:2").setFontAlign(-1, 0);
        if (g.stringWidth(this.clockInfoInfo.text) > availableWidth)
          g.setFont("6x8:1x2");
        g.drawString(this.clockInfoInfo.text, x + 2, o.y + 12); // draw the text
      }
    }
  }.init();

  // We make clock info touch area active on the start of the animation
  Bangle.on("widgets-start-show", () => {
    var wi = WIDGETS["clkinfo"];
    if (wi) {
      wi.clockInfoMenu.y = 0;
      wi.draw(wi);
    }
  });

  Bangle.on("widgets-shown", () => {
    var wi = WIDGETS["clkinfo"];
    if (wi) {
      wi.clockInfoMenu.y = 0;
      wi.draw(wi);
    }
  });

  Bangle.on("widgets-start-hide", () => {
    var wi = WIDGETS["clkinfo"];
    if (wi) {
      wi.clockInfoMenu.ensure_blur(); // let user see defocus cue before hiding
      wi.clockInfoMenu.y = -24;
      wi.draw(wi);
    }
  });

  Bangle.on("widgets-hidden", () => {
    var wi = WIDGETS["clkinfo"];
    if (wi) {
      wi.clockInfoMenu.ensure_blur();
      wi.clockInfoMenu.y = -24;
      wi.draw(wi);
    }
  });
}})()
