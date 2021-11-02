var FACES = [];
var STOR = require("Storage");
STOR.list(/\.face\.js$/).forEach(face=>FACES.push(eval(require("Storage").read(face))));
var lastface = STOR.readJSON("clock.json") || {pinned:0}
var iface = lastface.pinned;
var face = FACES[iface]();
var intervalRefSec;
var intervalRefSec;
var tickTimeout;

function stopdraw() {
  if(intervalRefSec) {intervalRefSec=clearInterval(intervalRefSec);}
  if(tickTimeout) {tickTimeout=clearTimeout(tickTimeout);}
  g.clear();
}

function queueMinuteTick(f) {
  if (tickTimeout) clearTimeout(drawTimeout);
  tickTimeout = setTimeout(function() {
    tickTimeout = undefined;
    f();
  }, 60000 - (Date.now() % 60000));
}

function startdraw() {
  g.reset();
  face.init();
  if (face.tickpersec)
    intervalRefSec = setInterval(face.tick,1000);
  else 
    queueMinuteTick(face.tick);
  Bangle.drawWidgets();
}

var SCREENACCESS = {
  withApp:true,
  request:function(){
    this.withApp=false;
    stopdraw();
  },
  release:function(){
    this.withapp=true;
    startdraw(); 
    setButtons();
  }
}; 

Bangle.on('lcdPower',function(b) {
  if (!SCREENACCESS.withApp) return;
  if (b) {
      startdraw();
  } else {
      stopdraw();
  }
});

function setButtons(){
  function newFace(inc){
    if (!inc) Bangle.showLauncher();
    else  {
      var n = FACES.length-1;
      iface+=inc;
      iface = iface>n?0:iface<0?n:iface;
      stopdraw();
      face = FACES[iface]();
      startdraw();
    }
  }
  Bangle.setUI("leftright", newFace);
}

E.on('kill',()=>{
    if (iface!=lastface.pinned){
      lastface.pinned=iface;
      STOR.write("clock.json",lastface);
    }
});

Bangle.loadWidgets();
g.clear();
startdraw();
setButtons();



