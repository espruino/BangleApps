{ // must be inside our own scope here so that when we are unloaded everything disappears
  let s = require("Storage");
  // handle customised launcher
  let scaleval = 1, vectorval = 20, fonts = g.getFonts();
  let font = fonts.includes("12x20") ? "12x20" : "6x8:2";
  if (fonts.includes("22")) font="22"; // 2v26+
  let settings = Object.assign({
    showClocks: true,
    fullscreen: false
  }, s.readJSON("launch.json", true) || {});
  if ("vectorsize" in settings)
    vectorval = parseInt(settings.vectorsize);
  if ("font" in settings){
    if(settings.font == "Vector"){
      scaleval = vectorval/20;
      font = "Vector"+(vectorval).toString();
    } else{
      font = settings.font;
      scaleval = (font.split("x")[1])/20;
    }
  }
  let height = 50*scaleval;

  // Now apps list is loaded - render
  if (!settings.fullscreen)
    Bangle.loadWidgets();
  let R = Bangle.appRect;
  g.reset().clearRect(R).setColor("#888");
  for (var y=R.y;y<R.y2;y+=height) {
    g.drawRect(5*scaleval,y+5*scaleval,49*scaleval,y+49*scaleval) // image
     .drawRect(54*scaleval,y+20*scaleval,R.y2-16,y+34*scaleval); // text
  }
  g.flip();

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
        g.clearRect((r.x),(r.y),(r.x+r.w-1), (r.y+r.h-1)).setFont(font).setFontAlign(-1,0).drawString(app.name,54*scaleval,r.y+(27*scaleval));
        if (app.icon) {
          if (!app.img) app.img = s.read(app.icon); // load icon if it wasn't loaded
          try {g.drawImage(app.img,3*scaleval, r.y+(3*scaleval), {scale: scaleval});} catch(e){}
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
    }
    Bangle.on("lock", lockHandler);
  };
  drawMenu();

  if (!settings.fullscreen) // finally draw widgets
    Bangle.drawWidgets();
  }