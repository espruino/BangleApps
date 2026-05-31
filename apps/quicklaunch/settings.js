(function(back) {
var storage = require("Storage");
var settings = Object.assign(storage.readJSON("quicklaunch.json", true) || {});

// Add default settings if they haven't been configured before. 
for (let c of ["lapp","rapp","uapp","dapp","tapp"]){ // l=left, r=right, u=up, d=down, t=tap.
  if (!settings[c]) settings[c] = {"name":""};
}


var launchCache = require("launch_utils").cache({showClocks:true,showLaunchers:true});
var apps = launchCache.apps;

function updateSettingsObject() {
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
launchCache = require("launch_utils").cacheWidgetsCheck(launchCache.apps);
}
// Add required launch_utils properties to settings object from versions older than 0.17
//delete settings.trace;
var settingsKeys = Object.keys(settings);
settingsKeys.forEach(key => {
  let name = settings[key].name; 
  let app  = apps.find(app=>app.name === name);
  if (app) settings[key].wid = app.wid;
});
storage.writeJSON("quicklaunch.json",settings);

// Add psuedo app to trigger Bangle.showLauncher later
apps.push({
    "name": "Show Launcher",
    "type": undefined,
    "sortorder": -12,
    "src": "no source"
   });

// Add the Quick Launch extension app
let extension = {
    "name": "Extension",
    "type": "app",
    "sortorder": -11,
    "src": "quicklaunch.app.js",
    "wid": true // // Hack: Fool launch_utils that extension screen uses widgets. This way we get the fastest possibe loading in whichever environment we find ourselves.
   };
apps.push(extension);

apps.sort((a,b)=>{
  var n=(0|a.sortorder)-(0|b.sortorder);
  if (n) return n; // do sortorder first
  if (a.name<b.name) return -1;
  if (a.name>b.name) return 1;
  return 0;
});

function findPath(key) {return key.substring(0, key.length-3);}

function save(key, value) {
  let path = findPath(key);
  // If changing from extension app (to something else) remove downstream settings entries.
  if (settings[key].name == extension.name && value.name != extension.name) {
      for (let c of [path+"lapp", path+"rapp", path+"uapp", path+"dapp", path+"tapp"]) {
        delete settings[c];
      }
    }

  // If changing to extension app (from something else) add downstream settings entries.
  if (value.name == extension.name && settings[key].name != extension.name) {
      for (let c of [path+"lapp", path+"rapp", path+"uapp", path+"dapp", path+"tapp"]) {
        settings[c] = {"name":""};
        storage.write("quicklaunch.json",settings);
      }
    }
  
  // Now change the setting on the current level in the path.
  settings[key] = value;
  storage.writeJSON("quicklaunch.json",settings);
}

function showMainMenu() {
    // Quick Launch menu
  var mainmenu = {
    "" : { "title" : "Quick Launch" },
    "< Back" : ()=>{load();}
  };

  // List all selected apps.
  for (let key of Object.keys(settings)) {
    if (key == "trace") continue;
    let keyCurrent = key;
    let entry = findPath(key).toUpperCase();
    if (entry=="L") entry = "Left";
    if (entry=="R") entry = "Right";
    if (entry=="U") entry = "Up";
    if (entry=="D") entry = "Down";
    if (entry=="T") entry = "Tap";
    // If no app is selected the name is an empty string, but we want to display "(none)".
    let appName = settings[key].name==""?"(none)":settings[key].name;
    mainmenu[entry+ ": "+appName] = function() {showSubMenu(keyCurrent);};
  }
    mainmenu.updateSettingsObject = updateSettingsObject(); // FIXME: Make this a good user experience by wrapping in a alert/prompt or something.

  return E.showMenu(mainmenu);
}

function showSubMenu(key) {
  var submenu = {
    "" : { "title" : "Path: "+findPath(key).toUpperCase()},
    "< Back" : showMainMenu
  };
  
  submenu["(none)"] = function() {
    save(key, {"name":""});
    showMainMenu();
  };
  apps.forEach((a)=>{
    submenu[a.name] = function() {
      save(key, a);
      showMainMenu();
      };
  });

  return E.showMenu(submenu);
}

showMainMenu();
})
