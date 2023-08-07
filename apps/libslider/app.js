let callback = (mode, ud)=>{
  if (mode == "map") Bangle.musicControl({cmd:"volumesetlevel", extra:ud});
  if (mode == "incr") Bangle.musicControl(ud>0 ? "volumedown" : "volumeup");
};

g.reset().clear().setColor(1,0,0).fillRect(0,0,176,176);

require("SliderInput").interface(callback, true, true);
