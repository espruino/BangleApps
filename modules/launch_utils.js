// Utility code for launchers

/** Return a cache of launchable apps/clocks

{
  hash : string // hash of .info files (used to figure out if we need to recreate it)
  apps : [ ...., {
    name,      // app's name
    type,      // "app"/"clock"/etc
    icon,      // filename of icon
    src,       // filename to launch
    wid        // boolean - does the app load widgets? used for fast loading
  }, ... ]
  new : did we just rebuild the cache?
}
settings : {
  showClocks:bool,
  onNew : function(launchCache) // called if cache is new, before we save it
}
*/
exports.cache = function(settings) {
  // cache app list so launcher loads more quickly
  let s = require("Storage");
  let launchCache = s.readJSON("launch.cache.json", true)||{};
  let launchHash = require("Storage").hash(/\.info/);
  if (launchCache.hash!=launchHash) {
    launchCache = {
      hash : launchHash,
      apps : s.list(/\.info$/)
              .map(app=>{
                let a=s.readJSON(app,1);
                return a&&{name:a.name,type:a.type,icon:a.icon,sortorder:a.sortorder,src:a.src};
              }).filter(app=>app && (app.type=="app" || (app.type=="clock" && settings.showClocks) || !app.type))
              .sort((a,b)=>{
                var n=(0|a.sortorder)-(0|b.sortorder);
                if (n) return n; // do sortorder first
                if (a.name<b.name) return -1;
                if (a.name>b.name) return 1;
                return 0;
              })
            };
    launchCache.apps.forEach(app => { delete app.sortorder; }); // no longer needed
    if (settings.onNew) settings.onNew(launchCache);
    s.writeJSON("launch.cache.json", launchCache);
    launchCache.new = true;
  }
  return launchCache;
};

/** Call with app object from .cache() */
exports.loadApp = function(app) {
  if (!app.src) return E.showMessage(/*LANG*/ "App Source\nNot found"); // sanity check
  if (app.wid===undefined) { // If we hadn't stored whether the app uses widgets before, check now
    let s = require("Storage");
    let src = s.read(app.src)
    app.wid = (src!==undefined)&&src.includes("Bangle.loadWidgets");
    // Now update the launch cache to save having to do this again
    let launchCache = s.readJSON("launch.cache.json", true)||{};
    let a = launchCache.apps.find(a=>a.src===app.src);
    if (a) {
      a.wid = app.wid;
      require("Storage").writeJSON("launch.cache.json", launchCache);
    }
  }
  // TODO: If there's a load screen boot app, we could call it? Or maybe Bangle.load should do that?
  if (app.wid) Bangle.load(app.src) // if app uses widgets, we can fast load into it
  else if (Object.keys(WIDGETS).every(w=>!!WIDGETS[w].remove)) { // are widgets unloadable? !! needed before 2v29 fw
    WIDGETS.forEach(w=>w.remove());
    delete global.WIDGETS;
    Bangle.load(app.src)
  } else load(app.src); // otherwise default to slow load
};

/** delete the cache app list */
exports.clearCache = function() {
  require("Storage").erase("launch.cache.json"); // delete the cache app list
};

// Should we have a helper function for loading/hiding widgets here?