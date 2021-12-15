/* Desktop launcher
*
*/

var settings = Object.assign({
  showClocks: true,
  showLaunchers: true,
}, require('Storage').readJSON("dtlaunch.json", true) || {});

function wdog(handle,timeout){
 if(handle !== undefined){
 wdog.handle = handle;
 wdog.timeout = timeout;
 }
 if(wdog.timer){
   clearTimeout(wdog.timer)
 }
 wdog.timer = setTimeout(wdog.handle,wdog.timeout)
}

// reset after two minutes of inactivity
wdog(load,120000)

var s = require("Storage");
var apps = s.list(/\.info$/).map(app=>{
  var a=s.readJSON(app,1);
  return a && {
    name:a.name, type:a.type, icon:a.icon, sortorder:a.sortorder, src:a.src
  };}).filter(
    app=>app && (app.type=="app" || (app.type=="clock" && settings.showClocks) || (app.type=="launch" && settings.showLaunchers) || !app.type));

apps.sort((a,b)=>{
  var n=(0|a.sortorder)-(0|b.sortorder);
  if (n) return n; // do sortorder first
  if (a.name<b.name) return -1;
  if (a.name>b.name) return 1;
  return 0;
});

var Napps = apps.length;
var Npages = Math.ceil(Napps/6);
var maxPage = Npages-1;
var selected = 0;
var oldselected = -1;
var page = 0;

function draw_icon(p,n,selected) {
    var x = (n%3)*80; 
    var y = n>2?130:40;
    (selected?g.setColor(0.3,0.3,0.3):g.setColor(0,0,0)).fillRect(x,y,x+79,y+89);
    g.drawImage(s.read(apps[p*6+n].icon),x+10,y+10,{scale:1.25});
    g.setColor(-1).setFontAlign(0,-1,0).setFont("6x8",1);
    var txt =  apps[p*6+n].name.split(" ");
    for (var i = 0; i < txt.length; i++) {
        txt[i] = txt[i].trim();
        g.drawString(txt[i],x+40,y+70+i*8);
    }
}

function drawPage(p){
    g.setColor(0,0,0).fillRect(0,0,239,239);
    g.setFont("6x8",2).setFontAlign(0,-1,0).setColor(1,1,1).drawString("Bangle ("+(p+1)+"/"+Npages+")",120,12);
    for (var i=0;i<6;i++) {
        if (!apps[p*6+i]) return i;
        draw_icon(p,i,selected==i);
    }
}

Bangle.on("swipe",(dir)=>{
    wdog()
    selected = 0;
    oldselected=-1;
    if (dir<0){
        ++page; if (page>maxPage) page=0;
        drawPage(page);
    } else {
        --page; if (page<0) page=maxPage;
        drawPage(page);
    }  
});

function nextapp(d){
    wdog();
    oldselected = selected;
    selected+=d;
    selected = selected<0?5:selected>5?0:selected;
    selected = (page*6+selected)>=Napps?0:selected;
    draw_icon(page,selected,true);
    if (oldselected>=0) draw_icon(page,oldselected,false);
}

function doselect(){
    load(apps[page*6+selected].src);
}

setWatch(nextapp.bind(null,-1), BTN1, {repeat:true,edge:"falling"});
setWatch(doselect, BTN2, {repeat:true,edge:"falling"});
setWatch(nextapp.bind(null,1), BTN3, {repeat:true,edge:"falling"});

drawPage(0);
