/*
 * Tape Launcher
 *
 */

var s = require("Storage");
var apps = s.list(/\.info$/).map(app=>{var a=s.readJSON(app,1);return a&&{name:a.name,type:a.type,icon:a.icon,sortorder:a.sortorder,src:a.src};}).filter(app=>app && (app.type=="app" || app.type=="clock" || !app.type));
apps.sort((a,b)=>{
  var n=(0|a.sortorder)-(0|b.sortorder);
  if (n) return n; // do sortorder first
  if (a.name<b.name) return -1;
  if (a.name>b.name) return 1;
  return 0;
});

var Napps = apps.length;
var selected = 1; // assumes we have at least 2 apps

function draw_icon(pos, id, select) {
  var x = ((pos % 3)*80) + 2; 
  var y = 80;

  g.setColor(-1);
  g.drawImage(s.read(apps[id].icon),x+2,y+11,{scale:1.625});

  if (select) {
    g.setColor(1,1,1).drawRect(x,y,x+79,y+99); // white bounding box
  }
}

function draw() {
  g.setColor(0,0,0).fillRect(0,0,239,239);

  if (selected -1 > -1)
    draw_icon(0, selected -1, false);

  draw_icon(1, selected, true);

  if (selected + 1 < Napps)
    draw_icon(2, selected + 1, false);

  g.setColor(-1).setFontAlign(0,-1,0).setFont("6x8",3);

  if (apps[selected].name.length <= 12) {
    g.drawString(apps[selected].name, 120, 40, true);
  } else {
    // some app names are too long for one line
    var name = apps[selected].name;
    var first = name.substring(0, name.indexOf(" "));
    var last = name.substring(name.indexOf(" ") + 1, name.length);
    g.drawString(first, 120, 40, true);
    g.drawString(last, 120, 200, true);
  }
}

Bangle.on("swipe",(dir)=>{
  (dir<0) ? nextapp(1) : nextapp(-1);
});

function nextapp(dir){
  selected += dir;

  if (selected > Napps - 1) {
    selected = Napps - 1;
  } else if (selected < 0) {
    selected = 0;
  }
  draw();
}

function doselect(){
  load(apps[selected].src);
}

setWatch(nextapp.bind(null,-1), BTN1, {repeat:true,edge:"falling"});
setWatch(doselect, BTN2, {repeat:true,edge:"falling"});
setWatch(nextapp.bind(null,1), BTN3, {repeat:true,edge:"falling"});

draw();
