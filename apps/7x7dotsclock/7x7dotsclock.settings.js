(function(back) {

let settings = Object.assign({ swupApp: "",swdownApp: "", swleftApp: "", swrightApp: "",ColorMinutes: ""}, require("Storage").readJSON("7x7dotsclock.json", true) || {});
  
  

function setSetting(key,value) {
  print("call " + key + " = " + value);
  settings[key] = value;

  print("storing settings 7x7dotsclock.json");
  storage.write('7x7dotsclock.json', settings);
}


  // Helper method which uses int-based menu item for set of string values
  function stringItems(key, startvalue, values) {
    return {
      value: (startvalue === undefined ? 0 : values.indexOf(startvalue)),
      format: v => values[v],
      min: 0,
      max: values.length - 1,
      wrap: true,
      step: 1,
      onchange: v => {
        setSetting(key,values[v]);
      }
    };
  }

  // Helper method which breaks string set settings down to local settings object
  function stringInSettings(name, values) {
    return stringItems(name,settings[name], values);
  }  
  
function showMainMenu() {
  const mainMenu = {
    "": {"title": "7x7 Dots Clock Settings"},
    "< Back": ()=>load(),
    "Minutes": stringInSettings("ColorMinutes", ["blue","pink","green","yellow"]), 
    "swipe-up": ()=>showSelAppMenu("swupApp"),
    "swipe-down": ()=>showSelAppMenu("swdownApp"),
    "swipe-left": ()=>showSelAppMenu("swleftApp"),
    "swipe-right": ()=>showSelAppMenu("swrightApp")

  };  

  E.showMenu(mainMenu);
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
    if (settings[key] === app.src) {
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
