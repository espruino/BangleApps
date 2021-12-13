/* Desktop launcher
*
*/

var settings = Object.assign({
  showClocks: true,
  showLaunchers: true,
  direct: false,
}, require('Storage').readJSON("dtlaunch.json", true) || {});

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
apps.forEach(app=>{
    if (app.icon)
      app.icon = s.read(app.icon); // should just be a link to a memory area
  });

var Napps = apps.length;
var Npages = Math.ceil(Napps/4);
var maxPage = Npages-1;
var selected = -1;
var oldselected = -1;
var page = 0;
const XOFF = 24;
const YOFF = 30;

function draw_icon(p,n,selected) {
    var x = (n%2)*72+XOFF; 
    var y = n>1?72+YOFF:YOFF;
    (selected?g.setColor(g.theme.fgH):g.setColor(g.theme.bg)).fillRect(x+11,y+3,x+60,y+52);
    g.clearRect(x+12,y+4,x+59,y+51);
    g.setColor(g.theme.fg);
    try{g.drawImage(apps[p*4+n].icon,x+12,y+4);} catch(e){}
    g.setFontAlign(0,-1,0).setFont("6x8",1);
    var txt =  apps[p*4+n].name.split(" ");
    for (var i = 0; i < txt.length; i++) {
        txt[i] = txt[i].trim();
        g.drawString(txt[i],x+36,y+54+i*8);
    }
}

function drawPage(p){
    g.reset();
    g.clearRect(0,24,175,175);
    var O = 88+YOFF/2-12*(Npages/2);
    for (var j=0;j<Npages;j++){
        var y = O+j*12;
        g.setColor(g.theme.fg);
        if (j==page) g.fillCircle(XOFF/2,y,4);
        else g.drawCircle(XOFF/2,y,4);
    }
    for (var i=0;i<4;i++) {
        if (!apps[p*4+i]) return i;
        draw_icon(p,i,selected==i && !settings.direct);
    }
    g.flip();
}

Bangle.on("swipe",(dir)=>{
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

function isTouched(p,n){
    if (n<0 || n>3) return false;
    var x1 = (n%2)*72+XOFF;  var y1 =  n>1?72+YOFF:YOFF;
    var x2 = x1+71; var y2 = y1+81;
    return (p.x>x1 && p.y>y1 && p.x<x2 && p.y<y2);
}

Bangle.on("touch",(_,p)=>{
    var i;
    for (i=0;i<4;i++){
        if((page*4+i)<Napps){
            if (isTouched(p,i)) {
                draw_icon(page,i,true && !settings.direct);
                if (selected>=0 || settings.direct) {
                    if (selected!=i && !settings.direct){
                        draw_icon(page,selected,false);
                    } else {
                        load(apps[page*4+i].src);
                    }
                }
                selected=i;
                break;
            }
        }
    }
    if ((i==4 || (page*4+i)>Napps) && selected>=0) {
        draw_icon(page,selected,false);
        selected=-1;
    }
});

Bangle.loadWidgets();
Bangle.drawWidgets();
drawPage(0);
