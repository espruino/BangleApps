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
    y : 20+Math.random()*38,
    gap : 12+Math.random()*15
  });
}

function gameStart() {
  running = true;
  birdy = 48/2;
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
  var H = g.getHeight()-24;
  g.setColor("#71c6cf");
  g.fillRect(0,0,g.getWidth(),H-1);
  floorpos++;
  for (var x=-(floorpos&15);x<g.getWidth();x+=16)
    g.drawImage(FLOORIMG,x,H);


  if (!running) {
    var x = g.getWidth()/2;
    g.setColor("#000000");
    g.setFontAlign(0,0);
    g.setFont("4x6",2);
    g.drawString("GAME OVER!",x,20);
    g.setFont("6x8",1);
    g.drawString("Score",x,40);
    g.drawString(score,x,56);
    g.drawString("Tap screen to",x,76);
    g.drawString("restart and flap",x,84);
    g.flip();
    return;
  }

  score++;
  birdvy += 0.4;
  birdvy *= 0.9;
  birdy += birdvy;
  if (birdy > H)
    gameStop();
  // draw bird
  g.drawImage(BIRDIMG, 6,birdy, {rotate:Math.atan2(birdvy,15)});
  // draw barriers
  barriers.forEach(function(b) {
    b.x1--;
    b.x2--;
    var btop = b.y-b.gap;
    var bbot = b.y+b.gap;
    g.setColor("#73bf2f"); // middle
    g.fillRect(b.x1+4, 0, b.x2-4, btop-1);
    g.fillRect(b.x1+4, bbot, b.x2-4, H-1);
    g.setColor("#c0f181"); // left
    g.fillRect(b.x1+1, 0, b.x1+3, btop-1);
    g.fillRect(b.x1+1, bbot, b.x1+3, H-1);
    g.setColor("#538917"); // right
    g.fillRect(b.x2-3, 0, b.x2-1, btop-1);
    g.fillRect(b.x2-3, bbot, b.x2-1, H-1);
    g.setColor("#808080"); // outlines
    g.drawRect(b.x1, btop-5, b.x2, btop); // top
    g.drawLine(b.x1+1, 0, b.x1+1, btop-6);
    g.drawLine(b.x2-2, 0, b.x2-2, btop-6);
    g.drawRect(b.x1, bbot, b.x2, bbot+5); // bottom
    g.drawLine(b.x1+1, bbot+6, b.x1+1, H-1);
    g.drawLine(b.x2-1, bbot+6, b.x2-1, H-1);
    if (b.x1<6 && (birdy-3<btop || birdy+3>bbot))
      gameStop();
  });
  while (barriers.length && barriers[0].x2<=0) {
    barriers.shift();
    newBarrier(g.getWidth());
  }

  g.flip();
}

Bangle.on('touch', function(button) {
  if (!running) {
    gameStart();
  } else {
    birdvy -= 4;
  }
});

// Finally, start everything going
setTimeout(()=>{
  Bangle.setLCDMode("120x120");
  g.setBgColor("#e3db9d");
  g.clear();
  gameStart();
  setInterval(draw, 100);
},10);
