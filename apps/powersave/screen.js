var Storage = Storage || require("Storage");
g.clear();
Bangle.setLCDBrightness(0);
Bangle.setPollInterval(1000);
if(!Bangle.isLocked()){
  load(Storage.read("resumeaftersleep") || JSON.parse(Storage.read("setting.json")).clock);
}