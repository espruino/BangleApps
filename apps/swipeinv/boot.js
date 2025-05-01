{
  const settings = Object.assign({
    global: false,
    apps: []
  }, require("Storage").readJSON("swipeinv.json", true) || {});

  let getAppIdFromSrc = ()=> { return global.__FILE__.split(".")[0]; }

  setTimeout(() => { // Timeout so we prepend listeners late, hopefully after all other listerners were added.
    if (settings.global || settings.apps.length > 0) {

      let swipeInverter = (dirLR, dirUD, obj) => {
        if (settings.global ^ Object.keys(settings.apps).includes(getAppIdFromSrc())) {
          if (!(obj && obj.inverted)) {
            E.stopEventPropagation();
            obj = Object.assign({inverted:true}, obj);

            if (settings.global ^ settings.apps[getAppIdFromSrc].swipeH) {dirLR *= -1;}
            if (settings.global ^ settings.apps[getAppIdFromSrc].swipeV) {dirUD *= -1;}

            Bangle.emit("swipe", dirLR, dirUD, obj)
          }
        }
      }

      let dragInverter = (e) => {
        if (settings.global ^ Object.keys(settings.apps).includes(getAppIdFromSrc())) {
          if (!e.inverted) {
            E.stopEventPropagation();
            e.inverted = true;

            if (settings.global ^ settings.apps[getAppIdFromSrc].dragH) {e.dx *= -1;}
            if (settings.global ^ settings.apps[getAppIdFromSrc].dragV) {e.dy *= -1;}

            Bangle.emit("drag", e);
          }
        }
      }

      Bangle.prependListener("swipe", swipeInverter);
      Bangle.prependListener("drag", dragInverter);

    }
  }, 0)
}
