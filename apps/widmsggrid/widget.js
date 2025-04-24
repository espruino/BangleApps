(function () {
  if (global.MESSAGES) return; // don't load widget while in the app
  let settings = require('Storage').readJSON("messages.settings.json", true) || {};
  const s = {
    flash: (settings.flash === undefined) ? true : !!settings.flash,
    showRead: !!settings.showRead,
  };
  delete settings;
  // widget name needs to be "messages": the library calls WIDGETS["messages'].hide()/show()
  WIDGETS["messages"] = {
    area: "tl", width: 0,
    flash: s.flash,
    showRead: s.showRead,
    init: function() {
      // runs on first draw
      delete w.init; // don't run again
      Bangle.on("touch", w.touch);
      Bangle.on("message", w.listener);
      w.listener(); // update status now
    },
    draw: function () {
      if (w.init) w.init();
      // If we had a setTimeout queued from the last time we were called, remove it
      if (w.t) {
        clearTimeout(w.t);
        delete w.t;
      }
      if (!w.width || this.hidden) return;
      const b = w.flash && w.status === "new" && ((Date.now() / 1000) & 1), // Blink(= inverse colors) on this second?
        // show multiple icons in a grid, by scaling them down
        cols = Math.ceil(Math.sqrt(w.srcs.length - 0.1)); // cols===rows, -0.1 to work around rounding error
      g.reset().clearRect(w.x, w.y, w.x + w.width - 1, w.y + 24)
        .setClipRect(w.x, w.y, w.x + w.width - 1, w.y + 24); // guard against oversized icons
      let r = 0, c = 0; // row, column
      const offset = pos => Math.floor(pos / cols * 24); // pixel offset for position in row/column
      let icons = require("messageicons");
      let defaultCol = icons.getColor("alert", {settings:settings});
      w.srcs.forEach(src => {
        const appColor = icons.getColor(src, {settings:settings,default:defaultCol});
        let colors = [g.theme.bg, appColor];
        if (b) {
          if (colors[1] == g.theme.fg) colors = colors.reverse();
          else colors[1] = g.theme.fg;
        }
        g.setColor(colors[1]).setBgColor(colors[0]);
        g.drawImage(icons.getImage(src), w.x+offset(c), w.y+offset(r), { scale: 1 / cols });
        if (++c >= cols) {
          c = 0;
          r++;
        }
      });
      g.reset(); // Make sure we don't leave clipRect set to some smaller rectangle.
      if (w.total > 1) {
        // show total number of messages in bottom-right corner
        g.reset();
        if (w.total < 10) g.fillCircle(w.x + w.width - 5, w.y + 19, 4); // single digits get a round background, double digits fill their rectangle
        g.setColor(g.theme.bg).setBgColor(g.theme.fg)
          .setFont('6x8').setFontAlign(1, 1)
          .drawString(w.total, w.x + w.width - 1, w.y + 24, w.total > 9);
      }
      if (w.flash && w.status === "new") w.t = setTimeout(w.draw, 1000); // schedule redraw while blinking
    },
    // show() and hide() are required by the "message" library!
    show: function (m) {
      delete w.hidden;
      w.width = 24;
      w.srcs = require("messages").getMessages(m)
        .filter(m => !['call', 'map', 'music'].includes(m.id))
        .filter(m => m.new || w.showRead)
        .map(m => m.src);
      w.total = w.srcs.length;
      w.srcs = w.srcs.filter((src, i, uniq) => uniq.indexOf(src) === i); // keep unique entries only
      Bangle.drawWidgets();
    }, hide: function () {
      w.hidden = true;
      w.width = 0;
      w.srcs = [];
      w.total = 0;
      Bangle.drawWidgets();
    }, touch: function (b, c) {
      if (!w || !w.width) return; // widget not shown
      if (process.env.HWVERSION < 2) {
        // Bangle.js 1: open app when on clock we touch the side with widget
        if (!Bangle.CLOCK) return;
        const m = Bangle.appRect / 2;
        if ((w.x < m && b !== 1) || (w.x > m && b !== 2)) return;
      }
      // Bangle.js 2: open app when touching the widget
      else if (c.x < w.x || c.x > w.x + w.width || c.y < w.y || c.y > w.y + 24) return;
      require("messages").openGUI();
    }, listener: function (t,m) {
      if (this.hidden) return;
      w.status = require("messages").status(m);
      if (w.status === "new" || (w.status === "old" && w.showRead)) w.show(m);
      else w.hide();
      delete w.hidden; // always set by w.hide(), but we checked it wasn't there before
    }
  };
  delete s;
  const w = WIDGETS["messages"];
  Bangle.on("message", w.listener);
})();
