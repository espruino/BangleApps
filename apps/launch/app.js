{ // must be inside our own scope here so that when we are unloaded everything disappears
  let s = require("Storage");
  // handle customised launcher
  let settings = Object.assign({
    showClocks: true,
    fullscreen: false,
    height: 52
  }, s.readJSON("launch.json", true) || {});
  let font = settings.font;
  if (!font || font=="Vector"/*compat with old settings*/) {
    let fonts = g.getFonts();
    font = fonts.includes("12x20") ? "12x20" : "6x8:2";
    if (fonts.includes("22")) font="22"; // 2v26+
  }
  let height = 0|Math.max(settings.height,12), pad = 2;
  let imgsize = height-pad*2, imgscale = imgsize/48;

  // Load widgets if we need to
  if (!settings.fullscreen) {
    Bangle.loadWidgets();
  } else if (global.WIDGETS) {
    require("widget_utils").hide();
  }
  { // Draw 'placeholder'
    let R = Bangle.appRect, mid = height/2, th = g.setFont(font).stringMetrics("X").height/2;
    g.reset().clearRect(R).setColor("#888");
    for (var y=R.y;y<R.y2;y+=height) {
      g.drawRect(pad*2,y+pad*2,imgsize-pad,y+imgsize-pad) // image
      .drawRect(imgsize+pad*2,y+mid-th,R.y2-R.w/3, y+mid+th); // text
    }
    g.flip();
  }

  // cache app list so launcher loads more quickly
  let launchCache = s.readJSON("launch.cache.json", true)||{};
  let launchHash = require("Storage").hash(/\.info/);
  if (launchCache.hash!=launchHash) {
    launchCache = {
      hash : launchHash,
      apps : s.list(/\.info$/)
              .map(app=>{var a=s.readJSON(app,1);return a&&{name:a.name,type:a.type,icon:a.icon,sortorder:a.sortorder,src:a.src};})
              .filter(app=>app && (app.type=="app" || (app.type=="clock" && settings.showClocks) || !app.type))
              .sort((a,b)=>{
                var n=(0|a.sortorder)-(0|b.sortorder);
                if (n) return n; // do sortorder first
                if (a.name<b.name) return -1;
                if (a.name>b.name) return 1;
                return 0;
              }) };
    s.writeJSON("launch.cache.json", launchCache);
  }
  let apps = launchCache.apps;


  const drawMenu = () => {
    E.showScroller({
      h : height, c : apps.length,
      draw : (i, r) => {
        var app = apps[i];
        if (!app) return;
        g.clearRect(r).setFont(font).setFontAlign(-1,0).drawString(app.name,imgsize+pad*2,r.y+2+r.h/2);
        if (app.icon) {
          if (!app.img) app.img = s.read(app.icon); // load icon if it wasn't loaded
          try {g.drawImage(app.img, pad, r.y+pad, {scale: imgscale});} catch(e){}
        }
      },
      select : i => {
        var app = apps[i];
        if (!app) return;
        if (!app.src || require("Storage").read(app.src)===undefined) {
          E.showScroller();
          E.showMessage(/*LANG*/"App Source\nNot found");
          setTimeout(drawMenu, 2000);
        } else {
          load(app.src);
        }
      },
      back : Bangle.showClock, // button press or tap in top left shows clock now
      remove : () => {
        // cleanup the timeout to not leave anything behind after being removed from ram
        if (lockTimeout) clearTimeout(lockTimeout);
        Bangle.removeListener("lock", lockHandler);
        // Restore widgets if they were hidden by fullscreen setting
        if (global.WIDGETS) require("widget_utils").show();
      }
    });
    g.flip(); // force a render before widgets have finished drawing

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
  };
  // Now apps list is loaded - render
  drawMenu();
  // finally draw widgets
  if (!settings.fullscreen)
    Bangle.drawWidgets();
}