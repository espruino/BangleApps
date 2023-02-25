{
  const storage = require("Storage");
  let settings = storage.readJSON("quicklaunch.json", true) || {};

  let reset = function(name){
    if (!settings[name]) settings[name] = {"name":"(none)"};
    if (!storage.read(settings[name].src)) settings[name] = {"name":"(none)"};
    storage.write("quicklaunch.json", settings);
  };

  let touchHandler = (_,e) => {
    let R = Bangle.appRect;
    if (e.x < R.x || e.x > R.x2 || e.y < R.y || e.y > R.y2 ) return;
    if (settings.exttapapp.src){ if (settings.exttapapp.name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings.exttapapp.src)) reset("exttapapp"); else load(settings.exttapapp.src); }
  };

  let swipeHandler = (lr,ud) => {
    if (lr == -1 && settings.extleftapp && settings.extleftapp.src){ if (settings.extleftapp.name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings.extleftapp.src)) reset("extleftapp"); else load(settings.extleftapp.src); }
    if (lr == 1 && settings.extrightapp && settings.extrightapp.src){ if (settings.extrightapp.name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings.extrightapp.src)) reset("extrightapp"); else load(settings.extrightapp.src); }
    if (ud == -1 && settings.extupapp && settings.extupapp.src){ if (settings.extupapp.name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings.extupapp.src)) reset("extupapp"); else load(settings.extupapp.src); }
    if (ud == 1 && settings.extdownapp && settings.extdownapp.src){ if (settings.extdownapp.name == "Show Launcher") Bangle.showLauncher(); else if (!storage.read(settings.extdownapp.src)) reset("extdownapp"); else load(settings.extdownapp.src); }
  };

  Bangle.setUI({
    mode: "custom",  
    touch: touchHandler,
    swipe : swipeHandler,
    remove: ()=>{if (timeoutToClock) clearTimeout(timeoutToClock);} // Compatability with Fastload Utils.
  });

  g.clearRect(Bangle.appRect);
  Bangle.loadWidgets(); // Compatability with Fastload Utils.

  // taken from Icon Launcher with some alterations
  let timeoutToClock;
  const updateTimeoutToClock = function(){
    let time = 1000; // milliseconds
    if (timeoutToClock) clearTimeout(timeoutToClock);
    timeoutToClock = setTimeout(load,time);  
  };
  updateTimeoutToClock();
}
