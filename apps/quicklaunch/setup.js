()=>{
  var storage = require("Storage");
  var settings = Object.assign(storage.readJSON("quicklaunch.json", true) || {});

  // Convert settings object from before v0.12 to v0.12.
  for (let c of ["leftapp","rightapp","upapp","downapp","tapapp"]){
    if (settings[c]) {
      let cNew = c.substring(0,1)+"app";
      settings[cNew] = settings[c];
      delete settings[c];
      if (settings[cNew].name=="(none)") settings[cNew].name = "";

      if (settings[cNew].name=="Quick Launch Extension"){
        settings[cNew].name = "Extension";
        for (let d of ["extleftapp","extrightapp","extupapp","extdownapp","exttapapp"]){
          if (settings[d]) {
            let dNew = cNew.substring(0,1)+d.substring(3,4)+"app";
            settings[dNew] = settings[d];
            delete settings[d];
            if (settings[dNew].name=="(none)") settings[dNew].name = "";
          }
        }
      }
      storage.writeJSON("quicklaunch.json",settings);
    } 
  }
  for (let d of ["extleftapp","extrightapp","extupapp","extdownapp","exttapapp"]){
    if (settings[d]) delete settings[d];
  }

  var launchCache = require("launch_utils").cache({showClocks:true,showLaunchers:true});
  var apps = launchCache.apps;
  launchCache = require("launch_utils").cacheWidgetsCheck(launchCache.apps);

  // Add required launch_utils properties to settings object from versions older than 0.17
  //delete settings.trace;
  var settingsKeys = Object.keys(settings);
  settingsKeys.forEach(key => {
    let name = settings[key].name; 
    let app  = apps.find(app=>app.name === name);
    print(app)
    if (app) settings[key].wid = app.wid;
  });
  storage.writeJSON("quicklaunch.json",settings);
}()
