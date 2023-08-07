{ // must be inside our own scope here so that when we are unloaded everything disappears

  /* Desktop launcher
   *
   */

  let settings = Object.assign({
    showClocks: true,
    showLaunchers: true,
    direct: false,
    swipeExit: false,
    timeOut: "Off",
    interactionBuzz: false,
  }, require('Storage').readJSON("dtlaunch.json", true) || {});

  let s = require("Storage");
  // Borrowed caching from Icon Launcher, code by halemmerich.
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
  apps.forEach(app=>{
    if (app.icon)
      app.icon = s.read(app.icon); // should just be a link to a memory area
  });

  let Napps = apps.length;
  let Npages = Math.ceil(Napps/4);
  let maxPage = Npages-1;
  let selected = -1;
  let oldselected = -1;
  let page = 0;
  const XOFF = 24;
  const YOFF = 30;

  let drawIcon= function(p,n,selected) {
    let x = (n%2)*72+XOFF; 
    let y = n>1?72+YOFF:YOFF;
    (selected?g.setColor(g.theme.fgH):g.setColor(g.theme.bg)).fillRect(x+11,y+3,x+60,y+52);
    g.clearRect(x+12,y+4,x+59,y+51);
    g.setColor(g.theme.fg);
    try{g.drawImage(apps[p*4+n].icon,x+12,y+4);} catch(e){}
    g.setFontAlign(0,-1,0).setFont("6x8",1);
    let txt =  apps[p*4+n].name.replace(/([a-z])([A-Z])/g, "$1 $2").split(" ");
    let lineY = 0;
    let line = "";
    while (txt.length > 0){
      let c = txt.shift();
      if (c.length + 1 + line.length > 13){
        if (line.length > 0){
          g.drawString(line.trim(),x+36,y+54+lineY*8);
          lineY++;
        }
        line = c;
      } else {
        line += " " + c;
      }
    }
    g.drawString(line.trim(),x+36,y+54+lineY*8);
  };

  let drawPage = function(p){
    g.reset();
    g.clearRect(0,24,175,175);
    let O = 88+YOFF/2-12*(Npages/2);
    for (let j=0;j<Npages;j++){
      let y = O+j*12;
      g.setColor(g.theme.fg);
      if (j==page) g.fillCircle(XOFF/2,y,4);
      else g.drawCircle(XOFF/2,y,4);
    }
    for (let i=0;i<4;i++) {
      if (!apps[p*4+i]) return i;
      drawIcon(p,i,selected==i && !settings.direct);
    }
    g.flip();
  };

  let buzzShort = function() {
    if (settings.interactionBuzz) Bangle.buzz(20);
  };
  let buzzLong = function() {
    if (settings.interactionBuzz) Bangle.buzz(100);
  };

  Bangle.drawWidgets(); // To immediately update widget field to follow current theme - remove leftovers if previous app set custom theme.
  Bangle.loadWidgets();
  drawPage(0);

  let swipeListenerDt = function(dirLeftRight, dirUpDown){
    updateTimeoutToClock();
    selected = -1;
    oldselected=-1;
    if(settings.swipeExit && dirLeftRight==1) Bangle.showClock();
    if (dirUpDown==-1||dirLeftRight==-1){
      ++page; if (page>maxPage) page=0;
      buzzShort();
      drawPage(page);
    } else if (dirUpDown==1||(dirLeftRight==1 && !settings.swipeExit)){
      --page; if (page<0) page=maxPage;
      buzzShort();
      drawPage(page);
    }
  };

  let isTouched = function(p,n){
    if (n<0 || n>3) return false;
    let x1 = (n%2)*72+XOFF;  let y1 =  n>1?72+YOFF:YOFF;
    let x2 = x1+71; let y2 = y1+81;
    return (p.x>x1 && p.y>y1 && p.x<x2 && p.y<y2);
  };

  let touchListenerDt = function(_,p){
    updateTimeoutToClock();
    let i;
    for (i=0;i<4;i++){
      if((page*4+i)<Napps){
        if (isTouched(p,i)) {
          drawIcon(page,i,true && !settings.direct);
          if (selected>=0 || settings.direct) {
            if (selected!=i && !settings.direct){
              buzzShort();
              drawIcon(page,selected,false);
            } else {
              buzzLong();
              load(apps[page*4+i].src);
            }
          }
          selected=i;
          break;
        }
      }
    }
    if ((i==4 || (page*4+i)>Napps) && selected>=0) {
      buzzShort();
      drawIcon(page,selected,false);
      selected=-1;
    }
  };

  Bangle.setUI({
    mode : 'custom',
    back : Bangle.showClock,
    swipe : swipeListenerDt,
    touch : touchListenerDt,
    remove : ()=>{if (timeoutToClock) clearTimeout(timeoutToClock);}
  });

  // taken from Icon Launcher with minor alterations
  let timeoutToClock;
  const updateTimeoutToClock = function(){
    if (settings.timeOut!="Off"){
      let time=parseInt(settings.timeOut);  //the "s" will be trimmed by the parseInt
      if (timeoutToClock) clearTimeout(timeoutToClock);
      timeoutToClock = setTimeout(Bangle.showClock,time*1000);  
    }
  };
  updateTimeoutToClock();

} // end of app scope

