{
  const SETTINGS = Object.assign({
    global: false,
    apps: []
  }, require("Storage").readJSON("swipeinv.json", true) || {});

  const CLOCK_APP_ID = require("Storage").readJSON("setting.json",true).clock.split(".")[0];

  let getAppIdFromCurrentFile = ()=> {
    "ram"
    if (!global.__FILE__ || global.__FILE__===".bootcde") {
      return CLOCK_APP_ID;
    } else {return global.__FILE__.split(".")[0];}
  }

  setTimeout(() => { // Timeout so we prepend listeners late, hopefully after all other listerners were added.
    if (SETTINGS.global || Object.keys(SETTINGS.apps).length > 0) {

      let swipeInverter = (dirLR, dirUD, obj) => {
        "ram"
        const APP_ID = getAppIdFromCurrentFile();
        if (SETTINGS.global ^ Object.keys(SETTINGS.apps).includes(APP_ID)) {
          if (!(obj && obj.inverted)) {
            E.stopEventPropagation();
            obj = Object.assign({inverted:true}, obj);

            if (SETTINGS.global ^ (SETTINGS.apps[APP_ID]&&SETTINGS.apps[APP_ID].swipeH)) {dirLR *= -1;}
            if (SETTINGS.global ^ (SETTINGS.apps[APP_ID]&&SETTINGS.apps[APP_ID].swipeV)) {dirUD *= -1;}

            Bangle.emit("swipe", dirLR, dirUD, obj)
          }
        }
      }

      let dragInverter = (e) => {
        "ram"
        const APP_ID = getAppIdFromCurrentFile();
        if (SETTINGS.global ^ Object.keys(SETTINGS.apps).includes(APP_ID)) {
          e.inverted = true;
          if (SETTINGS.global ^ (SETTINGS.apps[APP_ID]&&SETTINGS.apps[APP_ID].dragH)) {e.dx *= -1;}
          if (SETTINGS.global ^ (SETTINGS.apps[APP_ID]&&SETTINGS.apps[APP_ID].dragV)) {e.dy *= -1;}
        }
      }

      Bangle.prependListener("swipe", swipeInverter);
      Bangle.prependListener("drag", dragInverter);

    }
  }, 0)
}
