g.clear();
Bangle.setLCDBrightness(0);
if(!Bangle.isLocked()){
  var Storage = Storage || require("Storage");
  const data = JSON.parse(Storage.read("powersave.json") || Storage.read("setting.json"));
  load(data.app || data.clock);
}