{
const SETTINGS = require("Storage").readJSON("fastload.json") || {};

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

let cache = require("Storage").readJSON("fastload.cache") || {};

let checkApp = function(n){
  // no widgets, no problem
  if (!global.WIDGETS) return true;
  let app = require("Storage").read(n);
  if (cache[n] && E.CRC32(app) == cache[n].crc)
    return cache[n].fast
  cache[n] = {};
  cache[n].fast = app.includes("Bangle.loadWidgets");
  cache[n].crc = E.CRC32(app);
  require("Storage").writeJSON("fastload.cache", cache);
  return cache[n].fast;
}

global._load = load;

let slowload = function(n){
  global._load(n);
}

let fastload = function(n){
  if (!n || checkApp(n)){
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

Bangle.load = (o => (name) => {
  if (Bangle.uiRemove && !SETTINGS.hideLoading) loadingScreen();
  if (SETTINGS.autoloadLauncher && !name){
    let orig = Bangle.load;
    Bangle.load = (n)=>{
      Bangle.load = orig;
      fastload(n);
    }
    Bangle.showLauncher();
    Bangle.load = orig;
  } else 
    o(name);
})(Bangle.load);
}
