{
// Things that use `eval` instead of `load` or `Bangle.load` (e.g. auto displaying new messages - `messagegui.new.js`) can affect the app history record unexpectedly. They don't themselves get added to the history (since we don't override `eval`) and if they use one of the other two mentioned load functions they may remove the last recorded entry.
// Seems like `apphist` must be placed before `Fastload Utils` in execution order at boot for compatibility. Otherwise the Bangle.js 2 craps out, freezed up and soon reboots extra hard before loading the clock face again. This is ensured by metadata placing apphist at order 4 and Fastload Utils at order 5 in the boot sequence.

const s = require("Storage");
const SETTINGS = s.readJSON("apphist.settings.json") || {};

global._load = global.load;
Bangle._load = Bangle.load;

let appHistory  = s.readJSON("apphist.json",true)||[];
const resetHistory = ()=>{appHistory=[];s.writeJSON("apphist.json",appHistory);};
const recordHistory = ()=>{s.writeJSON("apphist.json",appHistory);};

const traverseHistory = (name)=>{
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
  return name;
};

const addHistoryTraversal = (loadFn => (name) => {
  name = traverseHistory(name);
  loadFn(name);
});

const addHistoryTraversalFastload = (loadFn => (name) => {
  global.load = global._load; // Only run through traverseHistory once, not both for Bangle.load and global.load.
  name = traverseHistory(name);
  loadFn(name);
  global.load = globalLoadWithHistory;
});

const globalLoadWithHistory = addHistoryTraversal(global.load);
global.load = globalLoadWithHistory;
Bangle.load = addHistoryTraversalFastload(Bangle._load);

E.on('kill', ()=>{
  // Usually record history, but reset it if long press of HW button was used.
  // FIXME: May be tricky for user to release button quickly enough to not trigger resetHistory. Commented out for now.
  // if (!BTN.read()) recordHistory();  else resetHistory();
  recordHistory();
});
}
