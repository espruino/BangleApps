const STORAGE = require('Storage');
const HEIGHT = g.getHeight();
const WIDTH = g.getWidth();

var settings = STORAGE.readJSON('hass.json', 1);
var page = 0;
var entity = 0;
var isEntityPage = false;

function sendIntent( intent, data ) {
  Bluetooth.println(JSON.stringify({t:"intent",action:intent,extra: data}));
}

function drawPage(p, e){
  isEntityPage = false;
  var name = domains[p].name;
  var icon = domains[p].icon;
  var nameHeight = HEIGHT/2;
  var nameWidth = WIDTH/2+25;
  if (e) {
    isEntityPage = true;
    name = domains[p].entity[e].replace(/_/g, ' ');
    nameHeight = HEIGHT/2;
    nameWidth = WIDTH/2;
  }
  g.reset();
  g.clearRect(0, 0, HEIGHT, WIDTH);
  g.setFont("Vector",20);
  g.setFontAlign(0,0);
  if(!isEntityPage) {
    g.drawImage(require("heatshrink").decompress(atob(icon)), (HEIGHT/2)-25, (WIDTH/2)-40);
  }
  g.drawString(name, nameHeight, nameWidth);
  g.flip();
}

Bangle.on("swipe",(RL, UD)=>{
  var numDomains = domains.length;
  var maxDomains = numDomains-1;
  if (UD==1||UD==-1){
    entity=0;
    if (UD==1) {
      ++page; if (page>maxDomains) page=0;
      drawPage(page);
    } else if (UD==-1){
      --page; if (page<0) page=maxDomains;
      drawPage(page);
    }
  }
  else if (RL==1||RL==-1){
    var maxEntity = domains[page].entity.length-1;
    if (RL==-1) {
      entity++; if (entity>maxEntity) entity=0;
      drawPage(page, entity);
    }
    else if (RL==1) {
      entity--; if (entity < 0) entity=0;
      drawPage(page, entity);
    }
    else {
      drawPage(page, entity);
    }
  }
});

Bangle.on("touch",(_,p)=>{
  if (isEntityPage==true) {
    sendIntent(intent, {service: domains[page].service,entity_id: `${domains[page].name}.${domains[page].entity[entity]}`});
    Bangle.buzz(250);
    E.showMessage("sent!");
    setInterval("drawPage(page, entity);", 1000);
  }
});

g.clear();
drawPage(page);