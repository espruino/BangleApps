var Y;
if (process.env.HWVERSION==2) {
  // we have offscreen graphics, so just go direct
  b = g;
  Y = 24; // widgets
} else {
  b = Graphics.createArrayBuffer(120,120,8);
  var gimg = {
      width:120,
      height:104,
      bpp:8,
      buffer:b.buffer
    };
  b.flip = function() {
    g.drawImage(gimg,0,24,{scale:2});
  };
  Y = 0; // we offset for widgets anyway
}

var BIRDIMG = E.toArrayBuffer(atob("EQyI/v7+/v7+/gAAAAAAAP7+/v7+/v7+/gYG0tLS0gDXAP7+/v7+/v4A0tLS0tIA19fXAP7+/v4AAAAA0tLS0gDX1wDXAP7+ANfX19cA0tLSANfXANcA/v4A19fX19cA0tLSANfX1wD+/gDS19fX0gDS0tLSAAAAAAD+/gDS0tIA0tLS0gDAwMDAwAD+/gAAAM3Nzc0AwAAAAAAA/v7+/v4Azc3Nzc0AwMDAwAD+/v7+/v4AAM3Nzc0AAAAAAP7+/v7+/v7+AAAAAP7+/v7+/g=="))
var FLOORIMG = require("heatshrink").decompress(atob("iEKxH+kklABuLAAlgAAwNFB34OLmAAO0YAO5wAOA"));


var birdy, birdvy;
var floorpos = 0;
var running = false;
var barriers;
var score;

function newBarrier(x) {
  barriers.push({
    x1 : x-7,
    x2 : x+7,
    y : Y+20+Math.random()*38,
    gap : 12+Math.random()*15
  });
}

function gameStart() {
  running = true;
  birdy = Y + 48/2;
  birdvy = 0;
  barriers = [];
  for (var i=38;i<g.getWidth();i+=38)
    newBarrier(i);
  score = 0;
}

function gameStop() {
  running = false;
}

function draw() {
  "ram"
  var H = b.getHeight()-24;
  b.setColor("#71c6cf").fillRect(0,Y,b.getWidth(),H-1);
  floorpos++;
  for (var x=-(floorpos&15);x<b.getWidth();x+=16)
    b.drawImage(FLOORIMG,x,H);


  if (!running) {
    var x = b.getWidth()/2;
    b.setColor("#000000");
    b.setFontAlign(0,0);
    b.setFont("4x6",2).drawString("GAME OVER!",x,20+Y);
    b.setFont("6x8",1).drawString("Score",x,40+Y).drawString(score,x,56+Y);
    b.drawString("Tap screen to",x,76+Y).drawString("restart and flap",x,84+Y);
    b.flip();
    return;
  }

  score++;
  birdvy += 0.4;
  birdvy *= 0.9;
  birdy += birdvy;
  if (birdy > H)
    gameStop();
  // draw bird
  b.drawImage(BIRDIMG, 6,birdy, {rotate:Math.atan2(birdvy,15)});
  // draw barriers
  barriers.forEach(function(r) {
    r.x1--;
    r.x2--;
    var btop = r.y-r.gap;
    var bbot = r.y+r.gap;
    b.setColor("#73bf2f").fillRect(r.x1+4, Y, r.x2-4, btop-1).fillRect(r.x1+4, bbot, r.x2-4, H-1); // middle
    b.setColor("#c0f181").fillRect(r.x1+1, Y, r.x1+3, btop-1).fillRect(r.x1+1, bbot, r.x1+3, H-1); // left
    b.setColor("#538917").fillRect(r.x2-3, Y, r.x2-1, btop-1).fillRect(r.x2-3, bbot, r.x2-1, H-1); // right
    b.setColor("#808080").drawRect(r.x1, btop-5, r.x2, btop).drawLine(r.x1+1, Y, r.x1+1, btop-6).drawLine(r.x2-2, Y, r.x2-2, btop-6); // top
    b.drawRect(r.x1, bbot, r.x2, bbot+5).drawLine(r.x1+1, bbot+6, r.x1+1, H-1).drawLine(r.x2-1, bbot+6, r.x2-1, H-1); // bottom
    if (r.x1<6 && (birdy-3<btop || birdy+3>bbot))
      gameStop();
  });
  while (barriers.length && barriers[0].x2<=0) {
    barriers.shift();
    newBarrier(g.getWidth());
  }

  b.flip();
}

Bangle.on('touch', function(button) {
  if (!running) {
    gameStart();
  } else {
    birdvy -= 4;
  }
});

Bangle.loadWidgets();
g.clear();
Bangle.drawWidgets();
b.setBgColor("#e3db9d");
gameStart();
setInterval(draw, 100);
