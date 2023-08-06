let callback = (ud)=>{
  if (ud) Bangle.musicControl(ud>0 ? "volumedown" : "volumeup");
  print("hi");
};

require("SliderInput").interface(callback, false);
