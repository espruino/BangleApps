// inspire breathing app -- by pancake

var w = g.getWidth();
var h = g.getHeight();
var w2 = w/2;
var h2 = h/ 2;
var fs = 24;
//var tx = (w/3)-10;
var ty = (h)-fs;
var radius = (w/2)-6;
var breathing = false;
var count = 0;
var mode = 0;
//var sin = 0;
var dragged = 0;
var lastTime = Date.now();

function breath(t) {
  var r = Math.abs(Math.sin(t / 100)) * w2;
  g.fillCircle(w/2,h/2, r);
  return r;
}

// subtle vibration
Bangle.buzz(100);
setTimeout(()=>{Bangle.buzz(60);}, 500);

function showTouchScreen() {
  g.setColor(1,1,1);
  g.fillCircle(w2, h2, h2-5);
  g.setColor(0,0,0);
  g.setFont("Vector", 32);
  g.drawString("Tap to", w/6, h2-fs);
  g.drawString("breath", w/4, h2);
}

g.setBgColor(0,0,0);
g.setColor(0);
g.clear();

function animateCircle() {
  g.clear();
  g.setColor(1,1,1);
  g.fillCircle(w2, h2, radius);
  radius-=2;
  if (radius < 40) {
    breathing = true;
    startBreathing();
    return;
  }
  setTimeout(animateCircle, 50);
}

Bangle.on("drag", function(pos) {
  if (breathing) {
    dragged = 1;
    if (pos.dx == -pos.dy) {
      count += pos.dx;
    } else {
      count+=(pos.dx + pos.dy);
    }
  }
});

function main() {
  var started = false;
  function onTouch() {
    if (started) {
      return;
    }
    started = true;
    Bangle.setLCDPower(1);
    Bangle.setLocked(0);
    Bangle.setLCDTimeout(0);
    animateCircle();
    Bangle.buzz(40);
  }
  Bangle.on("touch", onTouch);
  showTouchScreen();
}

main();

function startBreathing() {
  var cicles = 3;
  g.setFont("Vector", fs);
  
  function breathTime() {
    if (lastTime + 10 > Date.now()) {
      return;
    }
    lastTime = Date.now();
    g.setColor(0, 0, 0);
    g.clear();
  
    g.setColor(0, 0.5, 1);
    var b = breath(count);
    g.setColor(0.5, 0.5, 1);
    var c = breath(count + 50);
    count++;
    g.setColor(1, 1, 1);
    if (b < c) {
      g.drawString("inspire",8,ty);
      if (mode) {
        mode = 0;
        Bangle.buzz(20);
        if (!dragged ) {
          cicles--;
        }
      }
    } else {
      g.drawString("expire",8,ty);
      if (!mode) {
        mode = 1;
       Bangle.buzz(20);
      }
    }
    g.drawString(cicles, w-fs, ty);
    if (cicles < 1) {
      clearInterval(interval);
      g.clear();
      g.drawString("Thanks for",20,h/3);
      g.drawString(" breathing!",20,(h/3) + 16);
      Bangle.showClock();
    }
    dragged = 0;
  }
  var interval = setInterval(breathTime, 4);
}
