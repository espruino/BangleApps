var Storage = Storage || require("Storage");
Bangle.on("lock", locked => {
  if(locked){
    g.clear().reset();
    Bangle.setLCDBrightness(0);
    Bangle.setPollInterval(1000);
    load("powersave.screen.js");
  }else{
    load(Storage.read("resumeaftersleep") || JSON.parse(Storage.read("setting.json")).clock);
  }
});
E.on("init", () => {
  if(__FILE__ && __FILE__ !== "powersave.screen.js")
  Storage.write("resumeaftersleep", __FILE__);
});