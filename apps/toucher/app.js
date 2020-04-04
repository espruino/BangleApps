g.clear();

const Storage = require("Storage");

function getApps(){
  return Storage.list(/\.info$/).filter(app => app.endsWith('.info')).map(app => Storage.readJSON(app,1) || { name: "DEAD: "+app.substr(1) })
    .filter(app=>app.type=="app" || app.type=="clock" || !app.type)
    .sort((a,b)=>{
    var n=(0|a.sortorder)-(0|b.sortorder);
    if (n) return n; // do sortorder first
    if (a.name<b.name) return -1;
    if (a.name>b.name) return 1;
    return 0;
  });
}

const selected = 0;
const apps = getApps();

function prev(){
  if (selected>=0) {
    selected--;
  }
  drawMenu();
}

function next() {
  if (selected+1<apps.length) {
    selected++;
  }
  drawMenu();
}

function run() {
  if(selected < 0) return load();
  if (!apps[selected].src) return;
  if (Storage.read(apps[selected].src)===undefined) {
    E.showMessage("App Source\nNot found");
    setTimeout(drawMenu, 2000);
  } else {
    E.showMessage("Loading...");
    load(apps[selected].src);
  }
}

function getCurrentApp(){
  return apps[selected];
}

function getNextApp(){
  return apps[selected+1];
}

function drawFallbackIcon(){
  g.setColor(1,1,1);
  g.fillRect(72, 40, 168, 136);
  g.setColor(0,0,0);
  g.setFont('6x8', 8);
  g.drawString('?', 124, 88);
}

function drawArrow(x, y, size, dir){
  size = size || 10;
  dir = dir || 1;
  g.moveTo(x, y).lineTo(x+(size*dir), y-size).lineTo(x+(size*dir),y+size).lineTo(x, y);
}

function drawMenu(){

  if(selected < 0){
    g.clear();
    g.setFontAlign(0,0);
    g.setFont('6x8', 2);
    g.drawString('Back', 120, 120);
    drawArrow(220, 120, 10, -1);
    return;
  }

  const app = getCurrentApp();
  g.clear();
  g.setFontAlign(0,0);
  g.setFont('6x8', 2);
  if(!app) return g.drawString('???', 120, 120);
  g.drawString(app.name, 120, 160);
  if (app.icon) icon = Storage.read(app.icon);
  if (icon) try {g.drawImage(icon, 120-48, 40, { scale: 2 });} catch(e){ drawFallbackIcon(); }
  else drawFallbackIcon();

  g.setFont('6x8', 1);

  const type = app.type ? app.type : 'App';
  const version = app.version ? app.version : '0.00';
  const info = type+' v'+version;
  g.setFontAlign(-1,1);
  g.drawString(info, 20, 220);

  const count = (selected+1)+'/'+apps.length;
  g.setFontAlign(1,1);
  g.drawString(count, 220, 220);

  drawArrow(20, 120, 10, 1);
  if(getNextApp()) drawArrow(220, 120, 10, -1);
}

drawMenu();

// Physical buttons
setWatch(prev, BTN1, {repeat:true});
setWatch(next, BTN3, {repeat:true});
setWatch(run, BTN2, {repeat:true,edge:"falling"});

// Screen event
Bangle.on('touch', function(button){
  switch(button){
    case 1:
      prev();
      break;
    case 2:
      next();
      break;
    case 3:
      run();
      break;
  }
});

Bangle.on('swipe', dir => {
  if(dir == 1) prev();
  else next();
});

Bangle.on('lcdPower', function(on) {
  if(!on) return load();
});