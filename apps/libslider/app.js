let callback = (mode,fb)=>{
  if (mode =="map") Bangle.musicControl({cmd:"volumesetlevel",extra:Math.round(100*fb/30)});
  if (mode =="incr") Bangle.musicControl(fb>0?"volumedown":"volumeup");
};

g.reset().clear().setColor(1,0,0).fillRect(0,0,176,176);

Bangle.on('drag', ()=>{require("SliderInput").interface(callback,true,true);});
