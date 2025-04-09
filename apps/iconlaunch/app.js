{
  const s = require("Storage");
  const settings = Object.assign({
    showClocks: true,
    fullscreen: false,
    direct: false,
    oneClickExit: true,
    swipeExit: false,
    timeOut:"Off"
  }, s.readJSON("iconlaunch.json", true) || {});
  let font = g.getFonts().includes("28") ? "28" : "12x20";

  if (!settings.fullscreen) {
    Bangle.loadWidgets();
    Bangle.drawWidgets();
  } else { // for fast-load, if we had widgets then we should hide them
    require("widget_utils").hide();
  }

  let selectedItem = -1;
  const R = Bangle.appRect;
  const iconSize = 48;
  const appsN = Math.floor(R.w / iconSize);
  const whitespace = Math.floor((R.w - appsN * iconSize) / (appsN + 1));
  const iconYoffset = Math.floor(whitespace/4)-1;
  const itemSize = iconSize + whitespace;

  // show some grey blocks as a loading screen
  g.clearRect(Bangle.appRect).setColor("#888");
  for (var y=R.y+whitespace/2;y<R.h;y+=itemSize)
    for (var x=R.x+whitespace/2;x<R.w;x+=itemSize)
      g.drawRect(x+16,y+16,x+32,y+32);
  g.flip();

  let launchCache = s.readJSON("iconlaunch.cache.json", true)||{};
  let launchHash = s.hash(/\.info/);
  if (launchCache.hash!=launchHash) {
    launchCache = {
      hash : launchHash,
      apps : s.list(/\.info$/)
      .map(app=>{let a=s.readJSON(app,1);return a&&{name:a.name,type:a.type,icon:a.icon,sortorder:a.sortorder,src:a.src};})
      .filter(app=>app && (app.type=="app" || (app.type=="clock" && settings.showClocks) || !app.type))
      .sort((a,b)=>{
        let n=(0|a.sortorder)-(0|b.sortorder);
        if (n) return n; // do sortorder first
        if (a.name<b.name) return -1;
        if (a.name>b.name) return 1;
        return 0;
      }) };
    s.writeJSON("iconlaunch.cache.json", launchCache);
  }

  // cache items
  const ICON_MISSING = s.read("iconlaunch.na.img");
  let count = 0;



  launchCache.items = {};
  for (let c of launchCache.apps){
    let i = Math.floor(count/appsN);
    if (!launchCache.items[i])
      launchCache.items[i] = {};
    launchCache.items[i][(count%3)] = c;
    count++;
  }

  let texted;
  let drawItem = function(itemI, r) {
    let x = whitespace, i = itemI * appsN - 1, selectedApp, c, selectedRect, item = launchCache.items[itemI];
    if (texted == itemI){
      g.clearRect(r.x, r.y, r.x + r.w - 1, r.y + r.h - 1);
      texted = undefined;
    }
    for (c of item) {
      i++;
      let id = c.icondata || (c.iconData = (c.icon ? s.read(c.icon) : ICON_MISSING));
      g.drawImage(id,x + r.x - 1, r.y + iconYoffset - 1, x + r.x + iconSize, r.y + iconYoffset + iconSize);
      if (selectedItem == i) {
        selectedApp = c;
        selectedRect = [
          x + r.x - 1,
          r.y + iconYoffset - 1,
          x + r.x + iconSize,
          r.y + iconYoffset + iconSize
        ];
      }
      x += iconSize + whitespace;
    }
    if (selectedRect) {
      g.drawRect.apply(null, selectedRect);
      drawText(itemI, r.y, selectedApp);
      texted=itemI;
    }
    if (firstRun) g.flip(); // at startup
  };
  let firstRun = true;
  let drawText = function(i, appY, selectedApp) {
    const idy = (selectedItem - (selectedItem % 3)) / 3;
    if (i != idy) return;
    appY = appY + itemSize/2;
    g.setFontAlign(0, 0, 0).setFont(font);
    const rect = g.stringMetrics(selectedApp.name);
    let r = {
      x : (R.w - rect.width) / 2 - 7,
      y : appY - rect.height / 2 - 6,
      w : rect.width + 15,
      h : rect.height + 10,
      r : 4
    };
    g.setBgColor(g.theme.bgH).clearRect(r).setBgColor(g.theme.bg2).clearRect({x:r.x+2, y:r.y+2, w:r.w-4, h:r.h-4, r:3}).drawString(selectedApp.name, R.w / 2, appY).setBgColor(g.theme.bg);
  };

  let selectItem = function(id, e) {
    const iconN = E.clip(Math.floor((e.x - R.x) / itemSize), 0, appsN - 1);
    const appId = id * appsN + iconN;
    if( settings.direct && launchCache.apps[appId])
    {
      load(launchCache.apps[appId].src);
      return;
    }
    if (appId == selectedItem && launchCache.apps[appId]) {
      const app = launchCache.apps[appId];
      if (!app.src || s.read(app.src) === undefined) {
        E.showMessage( /*LANG*/ "App Source\nNot found");
      } else {
        load(app.src);
      }
    }
    selectedItem = appId;
    if (scroller) scroller.draw();
  };
  const itemsN = Math.ceil(launchCache.apps.length / appsN);

  let idWatch = null;
  let options = {
    h: itemSize,
    c: itemsN,
    draw: drawItem,
    select: selectItem,
    remove: function() {
      if (timeout) clearTimeout(timeout);
      Bangle.removeListener("drag", updateTimeout);
      Bangle.removeListener("touch", updateTimeout);
      Bangle.removeListener("swipe", swipeHandler);
      if (settings.fullscreen) { // for fast-load, if we hid widgets then we should show them again
        require("widget_utils").show();
      }
      if(idWatch) clearWatch(idWatch);
    }
  };

  //work both the fullscreen and the oneClickExit
  if( settings.fullscreen && settings.oneClickExit) {
      idWatch=setWatch(function(e) {
        Bangle.showClock();
      }, BTN, {repeat:false, edge:'rising' });

  } else if( settings.oneClickExit ) {
      options.back=Bangle.showClock;
  }

  let scroller = E.showScroller(options);
  firstRun = false; // this stops us flipping the screen after each line we draw

  let timeout;
  const updateTimeout = function(){
    if (settings.timeOut!="Off"){
      let time=parseInt(settings.timeOut);  //the "s" will be trimmed by the parseInt
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(Bangle.showClock,time*1000);
    }
  };

  let swipeHandler = (h,_) => { if(settings.swipeExit && h==1) { Bangle.showClock(); } };

  Bangle.on("swipe", swipeHandler)
  Bangle.on("drag", updateTimeout);
  Bangle.on("touch", updateTimeout);

  updateTimeout();
}