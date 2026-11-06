let s = require("Storage");
let settings = Object.assign(
  {showClocks:false,showLaunchers:false, showWidgets:true},s.readJSON("gridlaunch.settings.json")||{});

let launchCache = require("launch_utils").cache(settings);
let apps = launchCache.apps;
let chunkedApps = [];

for (let i = 0; i < apps.length; i += 3) {
  chunkedApps.push(apps.slice(i, i + 3));
}
if(settings.showWidgets){
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}
E.showScroller({
  h : 70,
  c : chunkedApps.length,
  draw : (idx, r) => {
    if (!chunkedApps[idx]) return;

    const iconW = 48*0.9;
    const third = r.w / 3;
    const x0 = r.x + (third * 0.5) - (iconW / 2);
    const x1 = r.x + (third * 1.5) - (iconW / 2);
    const x2 = r.x + (third * 2.5) - (iconW / 2);

    if (chunkedApps[idx][0] && chunkedApps[idx][0].icon) {
      g.drawImage(s.read(chunkedApps[idx][0].icon), x0, r.y-3, {scale:0.9});
    }
    if (chunkedApps[idx][1] && chunkedApps[idx][1].icon) {
      g.drawImage(s.read(chunkedApps[idx][1].icon), x1, r.y+26, {scale:0.9});
    }
    if (chunkedApps[idx][2] && chunkedApps[idx][2].icon) {
      g.drawImage(s.read(chunkedApps[idx][2].icon), x2, r.y-3, {scale:0.9});
    }
  },
  select : (idx, touch) => {
    let hIdx = 2;
    if(touch.x<g.getWidth()/3*2) hIdx = 1;
    if(touch.x<g.getWidth()/3) hIdx = 0;

    if (Bangle.haptic) Bangle.haptic("touch");
     var app = chunkedApps[idx][hIdx];
        if (!app) return;
        if (Bangle.haptic) Bangle.haptic("touch");
        if (!app.src || s.read(app.src)===undefined) {
          E.showScroller();
          E.showMessage(/*LANG*/"App Source\nNot found");
        } else {
          require("launch_utils").loadApp(app);
      }
  },
  back : Bangle.showClock,
});
// 10s of inactivity goes back to clock

Bangle.setLocked(false); // unlock initially
let lockTimeout;
let lockHandler = function(locked) {
  if (lockTimeout) clearTimeout(lockTimeout);
  lockTimeout = undefined;
  if (locked)
    lockTimeout = setTimeout(Bangle.showClock, 10000);
};
Bangle.on("lock", lockHandler);
