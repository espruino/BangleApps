{
  const settings = Object.assign({
    global: false,
    apps: []
  }, require("Storage").readJSON("swipeinv.json", true) || {});

  setTimeout(() => { // Timeout so we prepend listeners late, hopefully after all other listerners were added.
    if (settings.global || settings.apps.length > 0) {

      let swipeInverter = (dirLR, dirUD, obj) => {
        if (settings.global ^ settings.apps.includes(global.__FILE__)) {
          if (!(obj && obj.inverted)) {
            E.stopEventPropagation();
            obj = Object.assign({inverted:true}, obj);

            Bangle.emit("swipe", dirLR * -1, dirUD * -1, obj)
          }
        }
      }

      let dragInverter = (e) => {
        if (settings.global ^ settings.apps.includes(global.__FILE__)) {
          if (!e.inverted) {
            E.stopEventPropagation();
            e.inverted = true;

            e.dx *= -1;
            e.dy *= -1;
            Bangle.emit("drag", e);
          }
        }
      }

      Bangle.prependListener("swipe", swipeInverter);
      Bangle.prependListener("drag", dragInverter);

    }
  }, 0)
}
