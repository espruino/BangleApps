Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
g.reset();
c = 1;
function setColor(delta){
  c+=delta;
  c = Math.max(c,0);
  c = Math.min(c,2);
  if (c<1){
    g.setColor(c,0,0);
  }else{
    g.setColor(1,c-1,c-1);
  }
  g.fillRect(0,0,g.getWidth(),g.getHeight());
}
setColor(0)
// BTN1 light up toward white
// BTN3 light down to red
// BTN2 to reset
setWatch(()=>setColor(0.1), BTN1, { repeat:true, edge:"rising", debounce: 50 });
setWatch(()=>load(), BTN2);
setWatch(()=>setColor(-0.1), BTN3, { repeat:true, edge:"rising", debounce: 50 });
