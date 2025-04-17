{
  // TODO: Should the global case just hijack the swipe and drag events, modifying them before passing on to other listeners?
  //   - That could be a new separate bootloader app instead though?

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
          mode.swipe = (dirLR, dirUD) => origSwipeCb(dirLR * -1, dirUD * -1);
        }
      }
      if (typeof mode === "object" && mode.drag) {
        if (settings.global ^ settings.apps.includes(global.__FILE__)) {
          const origDragCb = mode.drag;
          mode.drag = (e) => {
            e.dx *= -1;
            e.dy *= -1;
            origDragCb(e);
          }
        }
      }
      return setURIOrig(mode, callback);
    };
  }
}
