{
const defaultSettings = {
  loadWidgets    : false,
  textAboveHands : false,
  shortHrHand    : false,
  weekdayNoYear  : false,
  noBattery      : false,
  darkTheme      : true
};
const settings = Object.assign(defaultSettings, require('Storage').readJSON('andark.json',1)||{});

const origTheme = g.theme;
if (settings.darkTheme) {
  g.setTheme({bg: "#000"});
  g.setTheme({fg: "#FFF"});
}

const c={"x":g.getWidth()/2,"y":g.getHeight()/2};

const zahlpos=(function() {
  let z=[];
  let sk=1;
  for(let i=-10;i<50;i+=5){
    let win=i*2*Math.PI/60;
    let xsk =c.x+2+Math.cos(win)*(c.x-10),
        ysk =c.y+2+Math.sin(win)*(c.x-10);
    if(sk==3){xsk-=10;}
    if(sk==6){ysk-=10;}
    if(sk==9){xsk+=10;}
    if(sk==12){ysk+=10;}
    if(sk==10){xsk+=3;}
    z.push([sk,xsk,ysk]);
    sk+=1;
  }
  return z;
})();

const zeiger = function(len,dia,tim) {
  const x=c.x+ Math.cos(tim)*len/2,
        y=c.y + Math.sin(tim)*len/2,
        d={"d":3,"x":dia/2*Math.cos(tim+Math.PI/2),"y":dia/2*Math.sin(tim+Math.PI/2)},
        pol=[c.x-d.x,c.y-d.y,c.x+d.x,c.y+d.y,x+d.x,y+d.y,x-d.x,y-d.y];
  return pol;
};

const drawHands = function(d) {
  let m=d.getMinutes(), h=d.getHours(), s=d.getSeconds();
  g.setColor(g.theme.fg);

  if(h>12){
    h=h-12;
  }
  //calculates the position of the minute, second and hour hand
  h=2*Math.PI/12*(h+m/60)-Math.PI/2;
  //more accurate
  //m=2*Math.PI/60*(m+s/60)-Math.PI/2;
  m=2*Math.PI/60*(m)-Math.PI/2;

  s=2*Math.PI/60*s-Math.PI/2;
  //g.setColor(1,0,0);
  const hz = zeiger(settings.shortHrHand?88:100,5,h);
  g.fillPoly(hz,true);
  //g.setColor(1,1,1);
  const minz = zeiger(150,5,m);
  g.fillPoly(minz,true);
  if (unlock){
    const sekz = zeiger(150,2,s);
    g.fillPoly(sekz,true);
  }
  g.fillCircle(c.x,c.y,4);
};

const drawText = function(d) {
//g.setFont("Vector",10);
  g.setBgColor(g.theme.bg);
  g.setColor(g.theme.fg);
  const dateStr = settings.weekdayNoYear
    ? require("locale").dow(d, 1)+" "+d.getDate()+" "+require("locale").month(d, 1)
    : require("locale").date(d);
  const batStr = Math.round(E.getBattery()/5)*5+"%";
  if (settings.noBattery) {
    g.setFont("Vector",13);
    g.drawString(dateStr, c.x, c.y+25, true);
  } else {
    g.setFont("Vector",10);
    g.drawString(dateStr, c.x, c.y+20, true);
    if (Bangle.isCharging()) {
      g.setBgColor(1,0,0);
    }
    g.drawString(batStr, c.x, c.y+40, true);
  }
};

const drawNumbers = function() {
  //draws the numbers on the screen
  g.setFont("Vector",20);
  g.setColor(g.theme.fg);
  g.setBgColor(g.theme.bg);
  for(let i = 0;i<12;i++){
    g.drawString(zahlpos[i][0],zahlpos[i][1],zahlpos[i][2],true);
  }
};

let drawTimeout;
let queueMillis = 1000;
let unlock = true;

const updateState = function() {
  if (Bangle.isLCDOn()) {
    if (!Bangle.isLocked()) {
      queueMillis = 1000;
      unlock = true;
    } else {
      queueMillis = 60000;
      unlock = false;
    }
    draw();
  } else {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
};

const queueDraw = function() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, queueMillis - (Date.now() % queueMillis));
};

const draw = function() {
  // draw black rectangle in the middle to clear screen from scale and hands
  g.setColor(g.theme.bg);
  g.fillRect(10,10,2*c.x-10,2*c.x-10);
  // prepare for drawing the text
  g.setFontAlign(0,0);
  // do drawing
  drawNumbers();
  const d=new Date();
  if (settings.textAboveHands) {
    drawHands(d); drawText(d);
  } else {
    drawText(d); drawHands(d);
  }
  queueDraw();
};

//draws the scale once the app is startet
const drawScale = function() {
  // clear the screen
  g.setBgColor(g.theme.bg);
  g.clear();
  // draw the ticks of the scale
  for(let i=-14;i<47;i++){
    const win=i*2*Math.PI/60;
    let d=2;
    if(i%5==0){d=5;}
    g.fillPoly(zeiger(300,d,win),true);
    g.setColor(g.theme.bg);
    g.fillRect(10,10,2*c.x-10,2*c.x-10);
    g.setColor(g.theme.fg);
  }
};

//// main running sequence ////

// Show launcher when middle button pressed, and widgets that we're clock
Bangle.setUI({
  mode: "clock",
  remove: function() {
    if (settings.darkTheme) g.setTheme(origTheme);
    Bangle.removeListener('lcdPower', updateState);
    Bangle.removeListener('lock', updateState);
    Bangle.removeListener('charging', draw);
    // We clear drawTimout after removing all listeners, because they can add one again
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    require("widget_utils").show();
  }
});
// Load widgets if needed, and make them show swipeable
if (settings.loadWidgets) {
  Bangle.loadWidgets();
  require("widget_utils").swipeOn();
} else if (global.WIDGETS) require("widget_utils").hide();

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower', updateState);
Bangle.on('lock', updateState);
Bangle.on('charging', draw); // Immediately redraw when charger (dis)connected

updateState();
drawScale();
draw();
}
