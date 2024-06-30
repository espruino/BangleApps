{
  let backlightTimeout = Bangle.getOptions().backlightTimeout;
  let brightness = require("Storage").readJSON("setting.json", true);
  brightness = brightness?brightness.brightness:1;

  Bangle.setOptions({
    backlightTimeout: backlightTimeout,
    lockTimeout: backlightTimeout+5000
  });

  let turnLightsOn = (_,numOrObj)=>{
    if (!Bangle.isBacklightOn()) {
      Bangle.setLCDPower(brightness);
      if (typeof numOrObj !== "number") E.stopEventPropagation(); // Touches will not be passed on to other listeners, but swipes will.
    }
  };

  setWatch(turnLightsOn, BTN1, { repeat: true, edge: 'rising' });
  Bangle.prependListener("swipe", turnLightsOn);
  Bangle.prependListener("touch", turnLightsOn);
}
