{
let callback = (mode,fb)=>{
  if (mode =="map") Bangle.musicControl({cmd:"volumesetlevel",extra:Math.round(100*fb/30)});
  if (mode =="incr") Bangle.musicControl(fb>0?"volumedown":"volumeup");
  if (mode =="remove") {audioLevels.c = fb; ebLast = 0;}
};

g.reset().clear().setColor(1,0,0).fillRect(0,0,176,176);

let audioLevels;
let audioHandler = (e)=>{audioLevels = e;};
Bangle.on('audio', audioHandler);
Bangle.musicControl("volumegetlevel");

let ebLast = 0;
Bangle.on('drag', (e)=>{
  if (ebLast==0) {
  Bangle.musicControl("volumegetlevel");
  setTimeout(()=>{require("SliderInput").interface(callback, {useMap:true, steps:audioLevels.u, currLevel:audioLevels.c});},200);
  }
  ebLast = e.b;
}
);
}
