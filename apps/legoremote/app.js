var lego = require("mouldking");
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

function startLegoButtons(controls) {
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
    g.setFont("6x8:3").setFontAlign(0,0);
    c = getBoxCoords(0.5, 0.5);
    g.setColor(controlState=="c"?colOn:colOff).drawString("C",c.x,c.y);
    c = getBoxCoords(2.5, 0.5);
    g.setColor(controlState=="d"?colOn:colOff).drawString("D",c.x,c.y);
  }

  function setControlState(s) {
    controlState = s;
    var c = {};
    if (s in controls)
      c = controls[s];
    draw();
    lego.set(c);
  }

  lego.start();
  Bangle.setUI({mode:"custom", drag : e => {
    var x = Math.floor(E.clip((e.x - R.x) * 3 / R.w,0,2.99));
    var y = Math.floor(E.clip((e.y - R.y) * 3 / R.h,0,2.99));
    if (!e.b) {
      setControlState("");
      return;
    }
    if (y==0) { // top row
      if (x==0) setControlState("c");
      if (x==1) setControlState("up");
      if (x==2) setControlState("d");
    } else if (y==1) {
      if (x==0) setControlState("left");
      if (x==1) setControlState("down");
      if (x==2) setControlState("right");
    }
  }});

  draw();
  NRF.on('connect', draw);
  NRF.on('disconnect', draw);
}

function startLegoLinear() {
  var mx = R.x+R.w/2;
  var my = R.y+R.h/2;
  var x=0,y=0;
  var scale = 10;

  function draw() {
    g.reset().clearRect(R);
    for (var i=3;i<60;i+=10)
      g.drawCircle(mx,my,i);
    g.setColor("#F00");
    var px = E.clip(mx + x*scale, R.x+20, R.x2-20);
    var py = E.clip(my + y*scale, R.y+20, R.y2-20);
    g.fillCircle(px, py, 20);
  }

  lego.start();
  Bangle.setUI({mode:"custom", drag : e => {
    x = Math.round((e.x - mx) / scale);
    y = Math.round((e.y - my) / scale);
    if (!e.b) {
      x=0; y=0;
    }
    lego.set({a:x, b:y});
    draw();
  }});

  draw();
  NRF.on('connect', draw);
  NRF.on('disconnect', draw);
}

// Mappings of button to output
const CONTROLS = {
    normal : {
      up :   {a: 7,b: 0},
      down : {a:-7,b: 0},
      left : {a: 0,b:-7},
      right: {a: 0,b: 7},
      c :    {c:7},
      d :    {d:7}
    }, tank : {
      up :   {a:-7,b:7},
      down : {a: 7,b:-7},
      left : {a: 7,b:7},
      right: {a:-7,b:-7},
      c :    {c:7},
      d :    {d:7}
    }, merged : {
      up :   {a: 7,b: 7},
      down : {a:-7,b:-7},
      left : {a: 7,b:-7},
      right: {a:-7,b: 7},
      c :    {c:7},
      d :    {d:7}
    }
  };

E.showMenu({ "" : {title:"LEGO Remote", back:()=>load()},
  "Linear" : () => startLegoLinear(),
  "Normal" : () => startLego(CONTROLS.normal), // TODO: Should `startLego` have been called `startLegoButtons` ?
  "Tank" : () => startLego(CONTROLS.tank),
  "Marged" : () => startLego(CONTROLS.merged),
});
