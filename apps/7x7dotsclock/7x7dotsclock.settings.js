(function(back) {

let settings = Object.assign({ swupApp: "",swdownApp: "", swleftApp: "", swrightApp: ""}, require("Storage").readJSON("7x7dotsclock.json", true) || {});
  
  
function showMainMenu() {
  const mainMenu = {
    "": {"title": "7x7 Dots Clock Settings"},
    "< Back": ()=>load(),
    "sw-up": ()=>showSelAppMenu("swupApp"),
    "sw-down": ()=>showSelAppMenu("swdownApp"),
    "sw-left": ()=>showSelAppMenu("swleftApp"),
    "sw-right": ()=>showSelAppMenu("swrightApp")

  };  

  E.showMenu(mainMenu);
}

function setSetting(key,value) {
  print("call " + key + " = " + value);
  settings[key] = value;

  print("storing settings 7x7dotsclock.json");
  storage.write('7x7dotsclock.json', settings);
}
  
function showSelAppMenu(key) {
  var Apps = require("Storage").list(/\.info$/)
    .map(app => {var a=storage.readJSON(app, 1);return (
      a&&a.name != "Launcher" 
      && a&&a.name != "Bootloader" 
      &&  a&&a.type != "clock" 
      && a&&a.type !="widget"
    )?a:undefined})
    .filter(app => app) // filter out any undefined apps
    .sort((a, b) => a.sortorder - b.sortorder);
  const SelAppMenu = {
    '': {
      'title': /*LANG*/'Select App',
    },
    '< Back': ()=>showMainMenu(),
  };
  Apps.forEach((app, index) => {
    var label = app.name;
    if ((settings[key]  && index === 0) || (settings[key] === app.src)) {
      label = "* " + label;
    }
    SelAppMenu[label] = () => {
      if (settings[key]  !== app.src) {
        setSetting(key,app.src);
        showMainMenu();
      }
    };
  });
  if (Apps.length === 0) {
    SelAppMenu[/*LANG*/"No Apps Found"] = () => { };
  }
  return E.showMenu(SelAppMenu);
}

showMainMenu();
  
})
