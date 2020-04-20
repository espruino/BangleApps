(function(back) {
  let settings = require("Storage").readJSON("app.json", 1) || {};
  function save(key, value) {
    settings[key] = value;
    require("Storage").write("app.json", settings);
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
