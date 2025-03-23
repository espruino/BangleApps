
// Fade in to FG color with angled lines
function fade(col, callback) {
  var n = 0;
  function f() {"ram"
    g.setColor(col);
    for (var i=n;i<240;i+=10) g.drawLine(i,0,0,i).drawLine(i,240,240,i);
    g.flip();
    n++;
    if (n<10) setTimeout(f,0);
    else callback();
  }
  f();
}

var quotes = [
  "",
  "Get that bread!",
  "WOOOOOOOO",
  "Hulle weet nie\nwat ons weet nie"
];

var SCENE_COUNT= 2 + quotes.length;


function getScene(n) {
  if (n==0) return function() {
    g.reset().setBgColor(0).clearRect(0,0,176,176);
    g.setFont("6x15");
    var n=0;
    var l = Bangle.getLogo();
    var im = g.imageMetrics(l);
    var i = setInterval(function() {
      n+=0.1;
      g.setColor(n,n,n);
      g.drawImage(l,(176-im.width)/2,(176-im.height)/2);
      if (n>=1) {
        clearInterval(i);
        setTimeout(()=>g.drawString("Harry's",44,104), 500);
        setTimeout(()=>g.drawString("Hacked Watch",44,116), 1000);
        setTimeout(()=>g.drawString("~ Quotes ~",44,128), 1500);
      }
    },50);
  };
  if (n == 1) {
    var s = 30;
    g.clearRect(88-s,78-s,88+s,78+s);
    
    var img = require("heatshrink").decompress(atob("mEw4P/AAJF/AEMHwAECkEP4AFC+EP8AEBgPwj4FCgf4j/wDYQFB/AFE/gFBh4FB/wFBB4IFDn4jB/+T+n/zERUIX/iEZAokcAgX+uEKv4FC6EJAoX/mEPC4dwAohZBAofgAofP+EH/wHBwfgg/8g//gIRBAoYdBAov+AoPD/ApEMoIFD/gFj"));
    var im = g.imageMetrics(img);
    g.reset();
    g.setBgColor("#ff0000");
    var y = 176, speed = 5;
    function balloon(callback) {
      y-=speed;
      var x = (176-im.width)/2;
      g.drawImage(img,x,y);
      g.clearRect(x,y+81,x+77,y+81+speed);
      if (y>30) setTimeout(balloon,0,callback);
      else callback();
    }
    fade("#ff0000", function() {
      balloon(function() {
        g.setColor(-1).setFont("6x15:2").setFontAlign(0,0);
        g.drawString("Fuck Yeah!",88,130);
      });
    });
    setTimeout(function() {
      var n=0;
      var i = setInterval(function() {
        n+=4;
        g.scroll(0,-4);
        if (n>150)
          clearInterval(i);
      },20);
    },3500);
  }

  if (n >= 2) {
    g.reset();
    g.setBgColor("#ff0000").setColor(0).clear();
    //g.setFont("12x20").setFontAlign(0,0);
    var x = 88;
    
    
      g.drawString(quotes[n-2],x,30);
      //g.drawString("Not much more\nto say...",x,130);
    

    var rx = 0, ry = 0;
    // draw a cube
    function draw() {
      // rotate
      rx += 0.1;
      ry += 0.11;
      var rcx=Math.cos(rx),
        rsx=Math.sin(rx),
        rcy=Math.cos(ry),
        rsy=Math.sin(ry);
      // Project 3D coordinates into 2D
      function p(x,y,z) {
        var t;
        t = x*rcy + z*rsy;
        z = z*rcy - x*rsy;
        x=t;
        t = y*rcx + z*rsx;
        z = z*rcx - y*rsx;
        y=t;
        z += 4;
        return [88 + 60*x/z, 78+ 60*y/z];
      }

      var a;
      // draw a series of lines to make up our cube
      var s = 30;
      g.clearRect(88-s,78-s,88+s,78+s);
      a = p(-1,-1,-1); g.moveTo(a[0],a[1]);
      a = p(1,-1,-1); g.lineTo(a[0],a[1]);
      a = p(1,1,-1); g.lineTo(a[0],a[1]);
      a = p(-1,1,-1); g.lineTo(a[0],a[1]);
      a = p(-1,-1,-1); g.lineTo(a[0],a[1]);
      a = p(-1,-1,1); g.moveTo(a[0],a[1]);
      a = p(1,-1,1); g.lineTo(a[0],a[1]);
      a = p(1,1,1); g.lineTo(a[0],a[1]);
      a = p(-1,1,1); g.lineTo(a[0],a[1]);
      a = p(-1,-1,1); g.lineTo(a[0],a[1]);
      a = p(-1,-1,-1); g.moveTo(a[0],a[1]);
      a = p(-1,-1,1); g.lineTo(a[0],a[1]);
      a = p(1,-1,-1); g.moveTo(a[0],a[1]);
      a = p(1,-1,1); g.lineTo(a[0],a[1]);
      a = p(1,1,-1); g.moveTo(a[0],a[1]);
      a = p(1,1,1); g.lineTo(a[0],a[1]);
      a = p(-1,1,-1); g.moveTo(a[0],a[1]);
      a = p(-1,1,1); g.lineTo(a[0],a[1]);
    }

    setInterval(draw,50);
  }
}

var sceneNumber = 0;

function move(dir) {
  if (dir>0 && sceneNumber+1 == SCENE_COUNT) return; // at the end
  sceneNumber = (sceneNumber+dir)%SCENE_COUNT;
  if (sceneNumber<0) sceneNumber=0;
  clearInterval();
  getScene(sceneNumber)();
  if (sceneNumber>1) {
    var l = SCENE_COUNT;
    for (var i=0;i<l-2;i++) {
      var x = 88+(i-(l-2)/2)*12;
      if (i<sceneNumber-1) {
        g.setColor(-1).fillCircle(x,166,4);
      } else {
        g.setColor(0).fillCircle(x,166,4);
        g.setColor(-1).drawCircle(x,166,4);
      }
    }
  }
  if (sceneNumber < SCENE_COUNT-1)
    setTimeout(function() {
      move(1);
    }, 5000);
}



Bangle.on('swipe', dir => move(dir));
setWatch(()=>{
  if (sceneNumber == SCENE_COUNT-1)
    load();
  else
    move(1);
}, BTN1, {repeat:true});

Bangle.setLCDTimeout(0);
Bangle.setLocked(0);
Bangle.setLCDPower(1);
move(0);
