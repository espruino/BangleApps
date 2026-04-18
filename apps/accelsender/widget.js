(() => {
  WIDGETS.accelsender = {
    area: "tr",
    width: 0,
    draw: function(w) {
      // Copied from widsleepstatus and modified
      const NONE = 0;
      const SLEEP = 1;

      let icon = NONE;

      try {
        // accelSender may not be defined if the boot.js hasn't loaded yet
        if (globalThis.accelSender && globalThis.accelSender.isEnabled()) {
          icon = globalThis.accelSender.getWidget();
        }
      } catch (e) {}

      const oldWidth = w.width;
      w.width = icon !== NONE ? 24 : 0;

      // Width changed - redraw widgets
      if (w.width !== oldWidth) { return Bangle.drawWidgets(); }
      // Width zero - skip draw
      if (w.width === 0) { return; }

      g.reset();
      switch (icon) {
        case SLEEP:
          g.drawImage(atob("GBiBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAAGAAAGAAAGAAAGcf/Ge//GWwBGewBmcwBn///mAABmAABmAABgAAAAAAAAAAAA=="), w.x, w.y);
          break;
      }
    }
  };

  Bangle.on("accelsender", () =>WIDGETS.accelsender.draw(WIDGETS.accelsender));

})();
