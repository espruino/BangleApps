(function(back) {
var settings = Object.assign(require("Storage").readJSON("quicklaunch.json", true) || {});

var apps = require("Storage").list(/\.info$/).map(app=>{var a=require("Storage").readJSON(app,1);return a&&{name:a.name,type:a.type,sortorder:a.sortorder,src:a.src};}).filter(app=>app && (app.type=="app" || app.type=="launch" || app.type=="clock" || !app.type));

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

// Quick Launch menu
function showMainMenu() {
  var mainmenu = {
    "" : { "title" : "Quick Launch" },
    "< Back" : ()=>{load();}
  };

  //List all selected apps
  mainmenu["Left: "+settings.leftapp.name] = function() { E.showMenu(leftmenu); };
  mainmenu["Right: "+settings.rightapp.name] = function() { E.showMenu(rightmenu); };
  mainmenu["Up: "+settings.upapp.name] = function() { E.showMenu(upmenu); };
  mainmenu["Down: "+settings.downapp.name] = function() { E.showMenu(downmenu); };
  mainmenu["Tap: "+settings.tapapp.name] = function() { E.showMenu(tapmenu); };
  
  return E.showMenu(mainmenu);
}
  
//Left swipe menu  
var leftmenu = {
  "" : { "title" : "Left Swipe" },
  "< Back" : showMainMenu
};

leftmenu["(none)"] = function() {
  save("leftapp", {"name":"(none)"});
  showMainMenu();
};
apps.forEach((a)=>{
  leftmenu[a.name] = function() {
    save("leftapp", a);
    showMainMenu();
    };
});

//Right swipe menu
var rightmenu = {
  "" : { "title" : "Right Swipe" },
  "< Back" : showMainMenu
};

rightmenu["(none)"] = function() {
  save("rightapp", {"name":"(none)"});
  showMainMenu();
};
apps.forEach((a)=>{
  rightmenu[a.name] = function() {
    save("rightapp", a);
    showMainMenu();
    };
});

//Up swipe menu
var upmenu = {
  "" : { "title" : "Up Swipe" },
  "< Back" : showMainMenu
};

upmenu["(none)"] = function() {
  save("upapp", {"name":"(none)"});
  showMainMenu();
};
apps.forEach((a)=>{
  upmenu[a.name] = function() {
    save("upapp", a);
    showMainMenu();
    };
});

//Down swipe menu
var downmenu = {
  "" : { "title" : "Down Swipe" },
  "< Back" : showMainMenu
};

downmenu["(none)"] = function() {
  save("downapp", {"name":"(none)"});
  showMainMenu();
};
apps.forEach((a)=>{
  downmenu[a.name] = function() {
    save("downapp", a);
    showMainMenu();
    };
});

//Tap menu
var tapmenu = {
  "" : { "title" : "Tap" },
  "< Back" : showMainMenu
};

tapmenu["(none)"] = function() {
  save("tapapp", {"name":"(none)"});
  showMainMenu();
};
apps.forEach((a)=>{
  tapmenu[a.name] = function() {
    save("tapapp", a);
    showMainMenu();
    };
});

showMainMenu();
});