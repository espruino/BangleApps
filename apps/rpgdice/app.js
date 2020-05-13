const dice = [4, 6, 8, 10, 12, 20, 100];
const nFlips = 20;
const delay = 500;

let dieIndex = 1;
let face = 0;
let rolling = false;

let bgColor;
let fgColor;

function getDie() {
  return dice[dieIndex];
}

function setColors(lastBounce) {
  if (lastBounce) {
    bgColor = 0xFFFF;
    fgColor = 0x0000;
  } else {
    bgColor = 0x0000
    fgColor = 0xFFFF;
  }
}

function flipFace() {
  while(true) {
    let newFace = Math.floor(Math.random() * getDie()) + 1;
    if (newFace !== face) {
      face = newFace;
      break;
    }
  }
}

function draw() {
  g.setColor(bgColor);
  g.fillRect(0, 0, g.getWidth(), g.getHeight());
  g.setColor(fgColor);
  g.setFontAlign(0, 0);
  g.setFontVector(40);
  g.drawString('d' + getDie(), 180, 30);
  g.setFontVector(100);
  g.drawString(face, 120, 120);
}

function roll(bounces) {
  flipFace();
  setColors(bounces === 0);
  draw();
  if (bounces > 0) {
    setTimeout(() => roll(bounces - 1), delay / bounces);
  } else {
    rolling = false;
  }
}

function startRolling() {
  if (rolling) return;
  rolling = true;
  roll(nFlips);
}

function changeDie() {
  if (rolling) return;
  dieIndex = (dieIndex + 1) % dice.length;
  draw();
}

Bangle.on('lcdPower',function(on) {
  if (on) {
    startRolling();
  }
});

g.clear();
Bangle.loadWidgets();
Bangle.drawWidgets();
startRolling();

// Top button rolls the die, bottom button changes it
setWatch(startRolling, BTN1, {repeat:true});
setWatch(changeDie, BTN3, {repeat:true});

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, {repeat:false,edge:"falling"});
