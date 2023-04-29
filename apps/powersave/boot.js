var Storage = Storage || require("Storage");
Bangle.on("lock", locked => {
  if(locked){
    load("powersave.screen.js");
  }else{
    const data = JSON.parse(Storage.read("powersave.json") || Storage.read("setting.json"));
    load(data.app || data.clock);
  }
});
E.on("init", () => {
  if("__FILE__" in global && __FILE__ !== "powersave.screen.js"){
    Storage.write("powersave.json", {
      app: __FILE__
    });
  }else if(!("__FILE__" in global)){
    Storage.write("powersave.json", {
      app: null
    });
  }
});