// make sure to enclose the function in parentheses
(function(back) {
  
  let launchCache;
  let settings = Object.assign({
    showClocks: true,
    fullscreen: false,
    buzz:false,
    shortcuts:["","",""]
  }, require("Storage").readJSON("taglaunch.json", true) || {});
  let fonts = g.getFonts();
  function save(key, value) {
    settings[key] = value;
    require("Storage").write("taglaunch.json",settings);
  }
  
  function setShortcut(id,spot,bk){
    let shortcuts=settings.shortcuts;
    shortcuts[spot]=id;
    save("shortcuts",shortcuts);
    bk();
  }
  
  function showAppList(spot,bk){
    //make sure cache is present
    launchCache=require("Storage").readJSON("taglaunch.cache.json")
    if (!launchCache || !launchCache.appsByTag) {
      E.showAlert("Caching apps, returning to launcher","Loading").then(function(v){
        Bangle.load("taglaunch.app.js");
      });
    } else {
      var appsByTag = launchCache.appsByTag;
      var appsById = {};
      for (var tag in appsByTag) {
        var list = appsByTag[tag];
        for (var i = 0; i < list.length; i++) {
          var app = list[i];
          // Use app.id as key to deduplicate
          if (!appsById[app.id]) {
            appsById[app.id] = {
              name: app.name,
              src: app.src || app.name,
              id: app.id
            };
          }
        }
      }
      var apps = Object.values(appsById);

    var menu = {};
    var spotText="";
    if(spot==0)spotText+="Left ";
    if(spot==1)spotText+="Center ";
    if(spot==2)spotText+="Right ";
    spotText+="App";
    menu[""] = { "title" : spotText}, // Title for the menu

    menu["None"] = function(){
      
      E.showPrompt("Remove the "+spotText+" shortcut?",{
          title:"Confirm",
          buttons: {"Cancel":false,"Ok":true}
        }).then(function(v){
          if(v)setShortcut("",spot,bk);
          else showAppList(spot,bk)
        })
    }
    apps.forEach(a => {
      menu[a.name] = function(){
        E.showPrompt("Set "+a.name+" as the "+spotText+"?",{
          title:"Confirm",
          buttons: {"Cancel":false,"Ok":true}
        }).then(function(v){
          if(v)setShortcut(a.id,spot,bk);
          else showAppList(spot,bk)
        })
      }
    });
    menu["< Back"] = bk;

    // Show it
    E.showMenu(menu);
    }
  }

  function showSpotMenu(){
    E.showMenu({
      "":{ "title" : "Select Spot"}, // Title for the menu
       "< Back":function(){
         eval(require("Storage").read("taglaunch.settings.js"))(()=>load());
       },
       "Left": function() { showAppList(0,showSpotMenu); }, 
      "Center": function() { showAppList(1,showSpotMenu); }, 
      "Right": function() { showAppList(2,showSpotMenu);} 
    })
  }
  const appMenu = {
    "": { "title": /*LANG*/"Tag Launcher" },
    "< Back": back,
    /*LANG*/"Shortcuts": function(){
        showSpotMenu()
     },
    /*LANG*/"Font": {
      value: fonts.includes(settings.font)? fonts.indexOf(settings.font) : fonts.indexOf("12x20"),
      min:0, max:fonts.length-1, step:1,wrap:true,
      onchange: (m) => {save("font", fonts[m])},
      format: v => fonts[v]
     },
    /*LANG*/"Vector Font Size": {
      value: settings.vectorsize || 10,
      min:10, max: 25,step:1,wrap:true,
      onchange: (m) => {save("vectorsize", m)}
    },
    /*LANG*/"Haptic Feedback": {
      value: settings.buzz == true,
      onchange: (m) => {
        save("buzz", m);
        
      }
    },
    /*LANG*/"Show Clocks": {
      value: settings.showClocks == true,
      onchange: (m) => {
        save("showClocks", m);
        require("Storage").erase("taglaunch.cache.json"); //delete the cache app list
       }
    },
    /*LANG*/"Fullscreen": {
      value: settings.fullscreen == true,
      onchange: (m) => { save("fullscreen", m) }
    }
  };
  E.showMenu(appMenu);
})
