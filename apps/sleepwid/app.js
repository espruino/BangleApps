const clock = JSON.parse(require("Storage").read("setting.json")).clock;
g.clear().reset();
Bangle.loadWidgets();
Bangle.drawWidgets();
Bangle.setLCDBrightness(0);
g.clear();
Bangle.on("lock", function (on) {
  if(!Bangle.isLocked()){
    load(clock);
  }
});
