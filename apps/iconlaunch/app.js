{
  const s = require("Storage");
  const settings = Object.assign({
    showClocks: true,
    fullscreen: false,
    direct: false,
    oneClickExit: false,
    swipeExit: false,
    timeOut:"Off"
  }, s.readJSON("iconlaunch.json", true) || {});

  if (!settings.fullscreen) {
    Bangle.loadWidgets();
    Bangle.drawWidgets();
  } else { // for fast-load, if we had widgets then we should hide them
    require("widget_utils").hide();
  }
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

  let selectedItem = -1;
  const R = Bangle.appRect;
  const iconSize = 48;
  const appsN = Math.floor(R.w / iconSize);
  const whitespace = (R.w - appsN * iconSize) / (appsN + 1);
  const itemSize = iconSize + whitespace;

  let drawItem = function(itemI, r) {
    g.clearRect(r.x, r.y, r.x + r.w - 1, r.y + r.h - 1);
    let x = 0;
    for (let i = itemI * appsN; i < appsN * (itemI + 1); i++) {
      if (!launchCache.apps[i]) break;
      x += whitespace;
      if (!launchCache.apps[i].icon) {
        g.setFontAlign(0, 0, 0).setFont("12x20:2").drawString("?", x + r.x + iconSize / 2, r.y + iconSize / 2);
      } else {
        if (!launchCache.apps[i].icondata) launchCache.apps[i].icondata = s.read(launchCache.apps[i].icon);
        g.drawImage(launchCache.apps[i].icondata, x + r.x, r.y);
      }
      if (selectedItem == i) {
        g.drawRect(
          x + r.x - 1,
          r.y - 1,
          x + r.x + iconSize + 1,
          r.y + iconSize + 1
        );
      }
      x += iconSize;
    }
    drawText(itemI, r.y);
  };

  let drawText = function(i, appY) {
    const selectedApp = launchCache.apps[selectedItem];
    const idy = (selectedItem - (selectedItem % 3)) / 3;
    if (!selectedApp || i != idy) return;
    appY = appY + itemSize/2;
    g.setFontAlign(0, 0, 0);
    g.setFont("12x20");
    const rect = g.stringMetrics(selectedApp.name);
    g.clearRect(
      R.w / 2 - rect.width / 2 - 2,
      appY - rect.height / 2 - 2,
      R.w / 2 + rect.width / 2 + 1,
      appY + rect.height / 2 + 1
    );
    g.drawString(selectedApp.name, R.w / 2, appY);
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

  let back = ()=>{};
  if (settings.oneClickExit) back = Bangle.showClock;

  let options = {
    h: itemSize,
    c: itemsN,
    draw: drawItem,
    select: selectItem,
    back: back,
    remove: function() {
      if (timeout) clearTimeout(timeout);
      Bangle.removeListener("drag", updateTimeout);
      Bangle.removeListener("touch", updateTimeout);
      Bangle.removeListener("swipe", swipeHandler);
      if (settings.fullscreen) { // for fast-load, if we hid widgets then we should show them again
        require("widget_utils").show();
      }
    }
  };

  let scroller = E.showScroller(options);

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
