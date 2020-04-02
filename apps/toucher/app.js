g.clear();

var Storage = require("Storage");


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

var selected = 0;
var menuScroll = 0;
var menuShowing = false;
var apps = getApps();
var displayBack = false;

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

/*
function drawMenu() {
  g.setFont("6x8",2);
  g.setFontAlign(-1,0);
  var n = 3;
  if (selected>=n+menuScroll) menuScroll = 1+selected-n;
  if (selected<menuScroll) menuScroll = selected;
  if (menuScroll) g.fillPoly([120,0,100,20,140,20]);
  else g.clearRect(100,0,140,20);
  if (apps.length>n+menuScroll) g.fillPoly([120,239,100,219,140,219]);
  else g.clearRect(100,219,140,239);
  for (var i=0;i<n;i++) {
    var app = apps[i+menuScroll];
    if (!app) break;
    var y = 24+i*64;
    if (i+menuScroll==selected) {
      g.setColor(0.3,0.3,0.3);
      g.fillRect(0,y,239,y+63);
      g.setColor(1,1,1);
      g.drawRect(0,y,239,y+63);
    } else
      g.clearRect(0,y,239,y+63);
    g.drawString(app.name,64,y+32);
    var icon=undefined;
    if (app.icon) icon = Storage.read(app.icon);
    if (icon) try {g.drawImage(icon,8,y+8);} catch(e){}
  }
}
*/
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


function getPrevApp(){
  return apps[selected-1];
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
setWatch(prev, BTN1, {repeat:true});
setWatch(prev, BTN4, {repeat:true});

setWatch(next, BTN3, {repeat:true});
setWatch(next, BTN5, {repeat:true});

setWatch(run, BTN2, {repeat:true,edge:"falling"});
