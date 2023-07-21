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

let forceRealLoad = false;
if (SETTINGS.detectSettingsChange){
  const P = {};
  P.eraseAll = s.eraseAll;
  P.erase = s.erase;
  P.read = s.read;
  P.readJSON = s.readJSON;
  P.readArrayBuffer = s.readArrayBuffer;
  P.write = ()=>{
    forceRealLoad = arguments[0].includes("boot.js") || arguments[0] == "setting.json";
    return s.write.apply(s, arguments);
  };
  P.writeJSON = ()=>{
    forceRealLoad = arguments[0].includes("boot.js") || arguments[0] == "setting.json";
    return s.writeJSON.apply(s, arguments);
  };
  P.list = s.list;
  P.hash = s.hash;
  P.compact = s.compact;
  P.debug = s.debug;
  P.getFree = s.getFree;
  P.getStats = s.getStats;
  P.optimise = s.optimise;
  P.open = s.open;

  global.require = ((orig) => (n) => {
    if (n == "Storage"){
      return P;
    }
    return orig(n);
  })(require);
}

let appFastloadPossible = function(n){
  if (forceRealLoad) return false;
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

global._load = load;

let slowload = function(n){
  global._load(n);
};

let fastload = function(n){
  if (!n || appFastloadPossible(n)){
    // Bangle.load can call load, to prevent recursion this must be the system load
    global.load = slowload;
    Bangle.load(n);
    // if fastloading worked, we need to set load back to this method
    global.load = fastload;
  }
  else
    slowload(n);
};
global.load = fastload;

let appHistory, resetHistory, recordHistory;
if (SETTINGS.useAppHistory){
  appHistory  = s.readJSON("fastload.history.json",true)||[];
  resetHistory = ()=>{appHistory=[];s.writeJSON("fastload.history.json",appHistory);};
  recordHistory = ()=>{s.writeJSON("fastload.history.json",appHistory);};
}

Bangle.load = (o => (name) => {
  if (Bangle.uiRemove && !SETTINGS.hideLoading) loadingScreen();
  if (SETTINGS.useAppHistory){
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
  }
  if (SETTINGS.autoloadLauncher && !name){
    let orig = Bangle.load;
    if (!forceRealLoad){
      Bangle.load = (n)=>{
        Bangle.load = orig;
        fastload(n);
      };
    }
    Bangle.showLauncher();
    Bangle.load = orig;
  } else if (forceRealLoad) {
    slowload(name);
  } else
    o(name);
})(Bangle.load);

if (SETTINGS.useAppHistory) E.on('kill', ()=>{if (!BTN.read()) recordHistory(); else resetHistory();}); // Usually record history, but reset it if long press of HW button was used.
}
