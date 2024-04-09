

function getArcXY(centerX,centerY,radius,angle){
  var s,r = [];
  s = 2 * Math.PI * angle / 360;
  r.push(centerX + Math.round(Math.cos(s) * radius));
  r.push(centerY + Math.round(Math.sin(s) * radius));
  return r;
}

function getArc(centerX,centerY,radius,startAngle,endAngle){
  var r = [], actAngle = startAngle;
  var stepAngle = (radius + radius) * Math.PI / 60;
  stepAngle = 6;
  while(actAngle < endAngle){
    r = r.concat(getArcXY(centerX,centerY,radius,actAngle));
    actAngle += stepAngle;
    actAngle = Math.min(actAngle,endAngle);
  }
  return r.concat(getArcXY(centerX,centerY,radius,endAngle));
}


let clockInfoItems = require("clock_info").load();

clockInfoItems[0].items.unshift({
  name : "BatteryRing",
  hasRange : true,
  get : () => {
    var s = 30;
    var mid=s/2;
    var v = E.getBattery();
    var img;
    var g = Graphics.createArrayBuffer(s,s,4);
    
    const outerarc = getArc(mid,mid,14,-90,Math.max(v*3.6, 10)-90);
    const innerarc = getArc(mid,mid,11,-92,Math.max(v*3.6, 10)-88);
    
    g.reset();
    g.setColor('#00FF00').fillPoly([mid, mid].concat(outerarc));
    g.setColor('#000').fillPoly([mid, mid].concat(innerarc));
    g.setFont("6x8").setColor('#FFF').setFontAlign(0, 0).drawString(v, mid, mid);
    img = g.asImage("object");
    return { v : v, min:0, max:100, img : img };
  },
  show : function() { },
  hide : function() { },
});

function drawInfoClock(itm,info,options){
  g.reset().clearRect(options.x-1, options.y-1, options.x+options.w+1, options.y+options.h+1);
  if (options.focus) g.drawRect(options.x-1, options.y-1, options.x+options.w+1, options.y+options.h+1);
  if (info.img) g.drawImage(info.img, options.x+options.w/2-(info.img.width||options.w)*options.scale/2,options.y, {scale:options.scale});
  if(info.text) g.setFont("6x8").setFontAlign(0,1).drawString(info.text, options.x+options.w/2,options.y+options.h);
}

const topleft = require("clock_info").addInteractive(clockInfoItems, {
  x : g.getWidth()*(1/4)-15, y: g.getHeight()*(1/4)-15, w: 30, h:30, scale:1,
  draw : drawInfoClock
});

const topright = require("clock_info").addInteractive(clockInfoItems, {
  x : g.getWidth()*(3/4)-15, y: g.getHeight()*(1/4)-15, w: 30, h:30, scale:1,
  draw : drawInfoClock
});


var timeout;

function fillLine(x1,y1,x2,y2,thickness){
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const offset_x = thickness * Math.sin(angle) / 2;
  const offset_y = thickness * Math.cos(angle) / 2;
  g.fillPoly([
    x1 + offset_x,
    y1 - offset_y,
    x1 - offset_x,
    y1 + offset_y,
    x2 - offset_x,
    y2 + offset_y,
    x2 + offset_x,
    y2 - offset_y
  ],true);
}

function draw(){
  g.setTheme({fg:0xFFFF, bg:0});
  
  if(timeout){
    clearTimeout(timeout);
    timeout = undefined;
  }
  g.reset().clear();
  
  const mid=g.getWidth()/2;
  g.drawImage(require("heatshrink").decompress(atob("2GwgIGDhwMEgPAAwk4Dg8HCpdwCqnwCo8DwAVK8AVIB4gVFgIVIB4wFKD5IPFG4pLJCosHMYiNJCozNJvAVJh4VJkAKJgT/PAH4A/AH4A/AH4A/AH4A/ADWACqngCicD/AVTh9+Cqc/n4VTv0P4AURgP4gZuSCYQrTVwNACqT/6AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4Ah//ACaMD/4VrQP4A/AH4A/AH4A/AH4A/AH4A/AH4A/AH4A/ADlACSMBAQPACqMDwED8AVS8EPFaUB/E/Nad+vwVTn/4CqcPNiSEDd/4A/AH4A/AH4A/AH4A/AH8gAgcB4AFDgwVJvAVJh4VJuAVJg4VJ8AVJgeACg8BCqoPEApYfECpY3EGpIlGCpEHCpfwCo6jFCoylEA=")));
  
  
  topleft.redraw();
  topright.redraw();
  
  const now = new Date();
  
  g.setFont("Vector",14);
  g.setColor('#FFF');
  g.setFontAlign(0,0);
  // Date (ex. MON 8)
  g.drawString(require("locale").dow(now, 1).toUpperCase() + " " + now.getDate(), g.getWidth()/2, g.getHeight()*(3/4));

  let rhour = (now.getHours()*Math.PI/6)+(now.getMinutes()*Math.PI/30/12)-Math.PI/2;
  let rmin = now.getMinutes()*Math.PI/30-Math.PI/2;
  
  // Middle circle
  g.fillCircle(mid,mid,4);
  
  // Hours hand
  fillLine(mid, mid, mid+Math.cos(rhour)*10, mid+Math.sin(rhour)*10,3);
  fillLine(mid+Math.cos(rhour)*10, mid+Math.sin(rhour)*10, mid+Math.cos(rhour)*50, mid+Math.sin(rhour)*50,7);

  // Minutes hand
  fillLine(mid, mid, mid+Math.cos(rmin)*10, mid+Math.sin(rmin)*10,3);
  fillLine(mid+Math.cos(rmin)*10, mid+Math.sin(rmin)*10, mid+Math.cos(rmin)*76, mid+Math.sin(rmin)*76,7);
  
  if(now.getMinutes()==0){
    Bangle.buzz();
  }

  timeout = setTimeout(()=>{
    timeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

draw();
Bangle.setUI("clock");
