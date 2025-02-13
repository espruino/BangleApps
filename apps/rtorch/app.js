Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
g.reset();
let c = 1;

function setColor(delta){
  c+=delta;
  c = Math.max(c,0);
  c = Math.min(c,2);
  if (c<1){
    g.setColor(c,0,0);
    Bangle.setLCDBrightness(c >= 0.1 ? c : 0.1);
  }else{
    g.setColor(1,c-1,c-1);
    Bangle.setLCDBrightness(1);
  }
  g.fillRect(0,0,g.getWidth(),g.getHeight());
}

function updownHandler(direction){
  if (direction == undefined){
    c=1;
    setColor(0);
  } else {
    setColor(-direction * 0.1);
  }
}

setColor(0);

// Bangle 1:
// BTN1: light up toward white
// BTN3: light down to red
// BTN2: reset
// Bangle 2:
// Swipe up: light up toward white
// Swipe down: light down to red
// BTN1: reset
Bangle.setUI("updown", updownHandler);
