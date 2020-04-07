Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
g.reset();
g.fillRect(0,0,g.getWidth(),g.getHeight());
// Any button turns off
setWatch(()=>load(), BTN1);
setWatch(()=>load(), BTN2);
setWatch(()=>load(), BTN3);
