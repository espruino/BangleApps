var lego = require("mouldking");
lego.start();
E.on('kill', () => {
  // return to normal Bluetooth advertising
  NRF.setAdvertising({},{showName:true});
});
// You must leave one second after 'start' to allow the remote to be paired

var arrowIcon = atob("IiiBAAAAwAAAAPwAAAB/gAAAP/AAAB/+AAAP/8AAB//4AAP//wAA///gAH///AA///8AH///4A////wH////gf////D////8f////5/////n////+f////4AP/8AAA//wAAD//AAAP/8AAA//wAAD//AAAH/8AAAf/wAAB//AAAH/8AAAf/gAAB/+AAAH/4AAAf/gAAB/+AAAH/4AAAP/gAAA/+AAAD/wAAAD8AA");
var controlState = "";

Bangle.loadWidgets();
Bangle.drawWidgets();
var R = Bangle.appRect;
// we'll divide up into 3x3
function getBoxCoords(x,y) {
  return {
    x : R.x + R.w*x/3,
    y : R.y + R.h*y/3
  };
}

function draw() {
  g.reset().clearRect(R);
  var c, ninety = Math.PI/2;
  var colOn = "#f00", colOff = g.theme.fg;
  c = getBoxCoords(1.5, 0.5);
  g.setColor(controlState=="up"?colOn:colOff).drawImage(arrowIcon,c.x,c.y,{rotate:0});
  c = getBoxCoords(2.5, 1.5);
  g.setColor(controlState=="right"?colOn:colOff).drawImage(arrowIcon,c.x,c.y,{rotate:ninety});
  c = getBoxCoords(0.5, 1.5);
  g.setColor(controlState=="left"?colOn:colOff).drawImage(arrowIcon,c.x,c.y,{rotate:-ninety});
  c = getBoxCoords(1.5, 1.5);
  g.setColor(controlState=="down"?colOn:colOff).drawImage(arrowIcon,c.x,c.y,{rotate:ninety*2});
  if (NRF.getSecurityStatus().connected) {
    c = getBoxCoords(1.5, 2.5);
    g.setFontAlign(0,0).setFont("6x8").drawString("WARNING:\nBluetooth Connected\nYou must disconnect\nbefore LEGO will work",c.x,c.y);
  }
}
draw();
NRF.on('connect', draw);
NRF.on('disconnect', draw);

function setControlState(s) {
  controlState = s;
  var c = {};
  var speed = 3;
  if (s=="up") c={a:-speed,b:-speed};
  if (s=="down") c={a:speed,b:speed};
  if (s=="left") c={a:speed,b:-speed};
  if (s=="right") c={a:-speed,b:speed};
  draw();
  lego.set(c);
}

Bangle.on('drag',e => {
  var x = Math.floor(E.clip((e.x - R.x) * 3 / R.w,0,2.99));
  var y = Math.floor(E.clip((e.y - R.y) * 3 / R.h,0,2.99));
  if (!e.b) {
    setControlState("");
    return;
  }
  if (y==0) { // top row
    if (x==1) setControlState("up");
  } else if (y==1) {
    if (x==0) setControlState("left");
    if (x==1) setControlState("down");
    if (x==2) setControlState("right");
  }
});
