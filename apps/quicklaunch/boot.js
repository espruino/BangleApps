{
  let settings = Object.assign(require("Storage").readJSON("quicklaunch.json", true) || {});

  let hash = require("Storage").hash(/\.info/);
  if (settings.hash!=hash) {
    //apps changed, rescan and remove no longer existing apps
    let apps = require("Storage").list(/\.info$/).map(app=>{var a=require("Storage").readJSON(app,1);return a&&{src:a.src};});

    for (let c of ["leftapp","rightapp","upapp","downapp","tapapp"]){
      if (!settings[c]) settings[c] = {"name":"(none)"};
      if (!require("Storage").read(settings[c].src)) settings[c] = {"name":"(none)"};
    }
    settings.hash = hash;
    require("Storage").write("quicklaunch.json",settings);
  }

  Bangle.on("touch", () => {
    if (!Bangle.CLOCK) return;
    if (settings.tapapp.src) load(settings.tapapp.src);
  });
  Bangle.on("swipe", (lr,ud) => {
    if (!Bangle.CLOCK) return;

    if (lr == -1 && settings.leftapp.src) load(settings.leftapp.src);
    if (lr == 1 && settings.rightapp.src) load(settings.rightapp.src);
    if (ud == 1 && settings.upapp.src) load(settings.upapp.src);
    if (ud == -1 && settings.downapp.src) load(settings.downapp.src);
  });
}
