var s = require("Storage");
let settings = Object.assign({ showClocks: true }, s.readJSON("launch.json", true) || {});

var apps = s.list(/\.info$/).map(app=>{var a=s.readJSON(app,1);return a&&{name:a.name,type:a.type,sortorder:a.sortorder,src:a.src};}).filter(app=>app && (app.type=="app" || (app.type=="clock" && settings.showClocks) || !app.type));
apps.sort((a,b)=>{
  var n=(0|a.sortorder)-(0|b.sortorder);
  if (n) return n; // do sortorder first
  if (a.name<b.name) return -1;
  if (a.name>b.name) return 1;
  return 0;
});

// First menu
var mainmenu = {
  "" : { "title" : "-- Main Menu --" },
};

apps.forEach((app)=>{
  mainmenu[app.name] = function() {
      E.showMessage(/*LANG*/"Loading...");
      load(app.src);
    };
});

// Actually display the menu
E.showMenu(mainmenu);
