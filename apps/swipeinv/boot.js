{
  const settings = Object.assign({
    global: false,
    apps: []
  }, require("Storage").readJSON("swipeinv.json", true) || {});

  if (settings.global || settings.apps.length > 0) {
    const setURIOrig = Bangle.setUI;
    Bangle.setUI = (mode, callback) => {
      if (typeof mode === "object" && mode.swipe) {
        if (settings.global ^ settings.apps.includes(global.__FILE__)) {
          const origSwipeCb = mode.swipe;
          mode.swipe = (dirLR, dirUD) => origSwipeCb(dirLR*-1, dirUD*-1);
        }
      }
      return setURIOrig(mode, callback);
    };
  }
}
