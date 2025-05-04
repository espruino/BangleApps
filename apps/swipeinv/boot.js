{
  const settings = Object.assign({
    global: false,
    apps: []
  }, require("Storage").readJSON("swipeinv.json", true) || {});

  const clockAppID = require("Storage").readJSON("setting.json",true).clock.split(".")[0];

  let getAppIdFromCurrentFile = ()=> {
    if (!global.__FILE__ || global.__FILE__===".bootcde") {
      return clockAppID;
    } else {return global.__FILE__.split(".")[0];}
  }

  setTimeout(() => { // Timeout so we prepend listeners late, hopefully after all other listerners were added.
    if (settings.global || Object.keys(settings.apps).length > 0) {

      let swipeInverter = (dirLR, dirUD, obj) => {
        "ram"
        const appID = getAppIdFromCurrentFile();
        if (settings.global ^ Object.keys(settings.apps).includes(appID)) {
          if (!(obj && obj.inverted)) {
            E.stopEventPropagation();
            obj = Object.assign({inverted:true}, obj);

            if (settings.global ^ (settings.apps[appID]&&settings.apps[appID].swipeH)) {dirLR *= -1;}
            if (settings.global ^ (settings.apps[appID]&&settings.apps[appID].swipeV)) {dirUD *= -1;}

            Bangle.emit("swipe", dirLR, dirUD, obj)
          }
        }
      }

      let dragInverter = (e) => {
        "ram"
        const appID = getAppIdFromCurrentFile();
        if (settings.global ^ Object.keys(settings.apps).includes(appID)) {
          if (!e.inverted) {
            E.stopEventPropagation();
            e.inverted = true;

            if (settings.global ^ (settings.apps[appID]&&settings.apps[appID].dragH)) {e.dx *= -1;}
            if (settings.global ^ (settings.apps[appID]&&settings.apps[appID].dragV)) {e.dy *= -1;}

            Bangle.emit("drag", e);
          }
        }
      }

      Bangle.prependListener("swipe", swipeInverter);
      Bangle.prependListener("drag", dragInverter);

    }
  }, 0)
}
