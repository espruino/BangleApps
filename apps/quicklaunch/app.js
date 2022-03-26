var settings = Object.assign(require("Storage").readJSON("quicklaunch.json", true) || {});

if (!settings.leftapp) {
  settings["leftapp"] = {"name":"(none)"};
  require("Storage").write("quicklaunch.json",settings);
}
if (!settings.rightapp) {
  settings["rightapp"] = {"name":"(none)"};
  require("Storage").write("quicklaunch.json",settings);
}

var apps = require("Storage").list(/\.info$/).map(app=>{var a=require("Storage").readJSON(app,1);return a&&{name:a.name,type:a.type,sortorder:a.sortorder,src:a.src};}).filter(app=>app && (app.type=="app" || (app.type=="clock" && Object.assign(require("Storage").readJSON("launch.json", true) || {}).showClocks) || !app.type));
apps.sort((a,b)=>{
  var n=(0|a.sortorder)-(0|b.sortorder);
  if (n) return n; // do sortorder first
  if (a.name<b.name) return -1;
  if (a.name>b.name) return 1;
  return 0;
});

function save(key, value) {
  settings[key] = value;
  require("Storage").write("quicklaunch.json",settings);
}

// First menu
function showMainMenu() {
  var mainmenu = {
    "" : { "title" : "Quick Launch" },
    "< Back" : ()=>{load();}
  };

  mainmenu["Left: "+settings.leftapp.name] = function() { E.showMenu(ltappmenu); };
  mainmenu["Right: "+settings.rightapp.name] = function() { E.showMenu(rtappmenu); };
  
  return E.showMenu(mainmenu);
}
  
  
var ltappmenu = {
  "" : { "title" : "Left Swipe" },
  "< Back" : showMainMenu
};

ltappmenu["(none)"] = function() {
  save("leftapp", {"name":"(none)"});
  showMainMenu();
};
apps.forEach((a)=>{
  ltappmenu[a.name] = function() {
    save("leftapp", a);
    showMainMenu();
    };
});

var rtappmenu = {
  "" : { "title" : "Right Swipe" },
  "< Back" : showMainMenu
};

rtappmenu["(none)"] = function() {
  save("rightapp", {"name":"(none)"});
  showMainMenu();
};
apps.forEach((b)=>{
  rtappmenu[b.name] = function() {
    save("rightapp", b);
    showMainMenu();
    };
});

// Actually display the menu
showMainMenu();
