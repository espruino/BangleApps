(function(back) {
  let settings = require("Storage").readJSON("trainer.json", 1) || {};
  function save(key, value) {
    settings[key] = value;
    require("Storage").write("trainer.json", settings);
  }
  const appMenu = {
    "": { title: "Trainer Settings" },
    "< Back": back,
    "Max BPM": {
      value: settings.maxbpm || 115,
      onchange: m => {
        save("maxbpm", m);
      }
    }
  };
  E.showMenu(appMenu);
});
