(function(back) {
var storage = require("Storage");
var settings = Object.assign(storage.readJSON("quicklaunch.json", true) || {});

for (let c of ["leftapp","rightapp","upapp","downapp","tapapp","extleftapp","extrightapp","extupapp","extdownapp","exttapapp"]){
  if (!settings[c]) settings[c] = {"name":"(none)"};
}

var apps = storage.list(/\.info$/).map(app=>{var a=storage.readJSON(app,1);return a&&{name:a.name,type:a.type,sortorder:a.sortorder,src:a.src};}).filter(app=>app && (app.type=="app" || app.type=="launch" || app.type=="clock" || !app.type));

// Add psuedo app to trigger Bangle.showLauncher later
apps.push({
    "name": "Show Launcher",
    "type": undefined,
    "sortorder": -12,
    "src": "no source"
   });

// Add the Quick Launch extension app
apps.push({
    "name": "Quick Launch Extension",
    "type": "app",
    "sortorder": -11,
    "src": "quicklaunch.app.js"
   });

apps.sort((a,b)=>{
  var n=(0|a.sortorder)-(0|b.sortorder);
  if (n) return n; // do sortorder first
  if (a.name<b.name) return -1;
  if (a.name>b.name) return 1;
  return 0;
});

function save(key, value) {
  settings[key] = value;
  storage.write("quicklaunch.json",settings);
}

function showMainMenu() {
    // Quick Launch menu
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
  mainmenu["Extend Quick Launch"] = showExtMenu;

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

function showExtMenu() {
  // Extend Quick Launch menu
  var extmenu = {
    "" : { "title" : "Extend Quick Launch" },
    "< Back" : ()=>{showMainMenu();}
  };

  //List all selected apps
  extmenu["Left: "+settings.extleftapp.name] = function() { E.showMenu(extleftmenu); };
  extmenu["Right: "+settings.extrightapp.name] = function() { E.showMenu(extrightmenu); };
  extmenu["Up: "+settings.extupapp.name] = function() { E.showMenu(extupmenu); };
  extmenu["Down: "+settings.extdownapp.name] = function() { E.showMenu(extdownmenu); };
  extmenu["Tap: "+settings.exttapapp.name] = function() { E.showMenu(exttapmenu); };

  return E.showMenu(extmenu);
}

//Extension Left swipe menu
var extleftmenu = {
  "" : { "title" : "Extension Left Swipe" },
  "< Back" : showExtMenu
};

extleftmenu["(none)"] = function() {
  save("extleftapp", {"name":"(none)"});
  showExtMenu();
};
apps.forEach((a)=>{
  extleftmenu[a.name] = function() {
    save("extleftapp", a);
    showExtMenu();
    };
});

//Extension Right swipe menu
var extrightmenu = {
  "" : { "title" : "Extension Right Swipe" },
  "< Back" : showExtMenu
};

extrightmenu["(none)"] = function() {
  save("extrightapp", {"name":"(none)"});
  showExtMenu();
};
apps.forEach((a)=>{
  extrightmenu[a.name] = function() {
    save("extrightapp", a);
    showExtMenu();
    };
});

//Extension Up swipe menu
var extupmenu = {
  "" : { "title" : "Extension Up Swipe" },
  "< Back" : showExtMenu
};

extupmenu["(none)"] = function() {
  save("extupapp", {"name":"(none)"});
  showExtMenu();
};
apps.forEach((a)=>{
  extupmenu[a.name] = function() {
    save("extupapp", a);
    showExtMenu();
    };
});

//Extension Down swipe menu
var extdownmenu = {
  "" : { "title" : "Extension Down Swipe" },
  "< Back" : showExtMenu
};

downmenu["(none)"] = function() {
  save("extdownapp", {"name":"(none)"});
  showExtMenu();
};
apps.forEach((a)=>{
  extdownmenu[a.name] = function() {
    save("extdownapp", a);
    showExtMenu();
    };
});

//Extension Tap menu
var exttapmenu = {
  "" : { "title" : "Extension Tap" },
  "< Back" : showExtMenu
};

exttapmenu["(none)"] = function() {
  save("exttapapp", {"name":"(none)"});
  showExtMenu();
};
apps.forEach((a)=>{
  exttapmenu[a.name] = function() {
    save("exttapapp", a);
    showExtMenu();
    };
});

showMainMenu();
})
