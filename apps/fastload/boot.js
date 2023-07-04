{
const s = require("Storage");
const SETTINGS = s.readJSON("fastload.json") || {};

let loadingScreen = function(){
  g.reset();

  let x = g.getWidth()/2;
  let y = g.getHeight()/2;
  g.setColor(g.theme.bg);
  g.fillRect(x-49, y-19, x+49, y+19);
  g.setColor(g.theme.fg);
  g.drawRect(x-50, y-20, x+50, y+20);
  g.setFont("6x8");
  g.setFontAlign(0,0);
  g.drawString("Fastloading...", x, y);
  g.flip(true);
};

let cache = s.readJSON("fastload.cache") || {};

let checkApp = function(n){
  // no widgets, no problem
  if (!global.WIDGETS) return true;
  let app = s.read(n);
  if (cache[n] && E.CRC32(app) == cache[n].crc)
    return cache[n].fast;
  cache[n] = {};
  cache[n].fast = app.includes("Bangle.loadWidgets");
  cache[n].crc = E.CRC32(app);
  s.writeJSON("fastload.cache", cache);
  return cache[n].fast;
};

let appHistory, resetHistory, recordHistory;
if (SETTINGS.useAppHistory){
  appHistory  = s.readJSON("fastload.history.json",true)||[];
  resetHistory = ()=>{appHistory=[];s.writeJSON("fastload.history.json",appHistory);};
  recordHistory = ()=>{s.writeJSON("fastload.history.json",appHistory);};
}
/*
    load(file)/Bang.load(file) -> transformName() -> validate() -> (orig)Bangle.load()
    slowload resets memory.                                 -> load()
    Attempt to convert a slowEntry into a fastEntry.
*/
Bangle.load = (fastload => {
  //global.load()
  let slowEntry = (n) => {
    hookload(n,false);
  };
  //Bangle.load()
  let fastEntry = (n) => {
    hookload(n,true);
  };

  // double function hook
  let hookload = (name,fastRequest) => {
    if (SETTINGS.useAppHistory) name = rememberAppName(name); 
    if (!Bangle.uiRemove) {
      slowload(name);
      return; // never gets here.
    }
    if (SETTINGS.autoloadLauncher) name = transformName(name);
    let force = SETTINGS.hiddenWidgets; // always true
    // bootloader(bootcde) internally checks if target clock calls LoadWidgets thus why true.
    let isValidApp = name ? checkApp(name) : true; 
    if (!SETTINGS.hideLoading) loadingScreen();
    if (validate(name,isValidApp,force)) {
      //if (!fastRequest) print("Upgraded slow to fast!");
      //else print("Intended fast!");
      if (force && name === ".bootcde") name = ""; // disguise to allow clock @bootloader.js
      global.load = slowload;
      fastload(name); // guaranteed to fastload (uiRemove=true)
      global.load = slowEntry;
      if (force) { 
        global.__FILE__ = name; // restore from disguise
        if (isValidApp) require("widget_utils").show();
        else require("widget_utils").hide();
      }
    }
    else {
      slowload(name);
    }
  };

  // Does the target app contain LoadWidgets()?
  let validate = function(n,valid,force){
    if ( force || !n || checkApp(n)) return true;
    // invalidate named app without LoadWidgets.
    return false;
  };

  // Intercept App Load.
  let transformName = function(name) {
    // empty name is converted into launcher name
    if (!name){
      Bangle.load = (n)=>{
        name = n;
      };
      Bangle.showLauncher(); // calls Bangle.load()
      Bangle.load = fastEntry;
    }
    return name;
  };

  let rememberAppName = function(name) {
    if (name && name!=".bootcde" && !(name=="quicklaunch.app.js" && SETTINGS.disregardQuicklaunch)) {
      // store the name of the app to launch
      appHistory.push(name);
    } else if (name==".bootcde") { // when Bangle.showClock is called
      resetHistory();
    } else if (name=="quicklaunch.app.js" && SETTINGS.disregardQuicklaunch) {
      // do nothing with history
    } else {
      // go back in history
      appHistory.pop();
      name = appHistory[appHistory.length-1];
    }
    //print(appHistory);
    return name;
  };

  let slowload = global.load;
  // Intercept load too.
  global.load = slowEntry;
  return fastEntry;
})(Bangle.load);

// Usually record history, but reset it if long press of HW button was used.
if (SETTINGS.useAppHistory) E.on('kill', ()=>{if (!BTN.read()) recordHistory(); else resetHistory();}); 
}
