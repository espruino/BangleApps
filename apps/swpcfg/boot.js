(function () {
  const DEFAULTS = {
    scrolldir: 0,
    swipedir: 0,
  };

  let settings = require("Storage").readJSON("swpcfg.json", 1) || DEFAULTS;

  if (settings.scrolldir === 1 || settings.swipedir === 1) {
    const originalSetUI = Bangle.setUI;

    Bangle.setUI = (mode, callback) => {
      if (typeof mode === "object" && mode.swipe) {
        const originalSwipe = mode.swipe;
        mode.swipe = (dirLR, dirUD) => originalSwipe(dirLR*-settings.swipedir, dirUD*-settings.scrolldir);
      }
      return originalSetUI(mode, callback);
    };
  }
})();
