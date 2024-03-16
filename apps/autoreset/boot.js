{
let timeoutAutoreset;
let resetTimeoutAutoreset = (force)=>{
  if (timeoutAutoreset) clearTimeout(timeoutAutoreset);
  setTimeout(()=>{ // Short outer timeout to make sure we have time to leave clock face before checking `Bangle.CLOCK!=1`.
    if (Bangle.CLOCK!=1) { // Only add timeout if not already on clock face.
      timeoutAutoreset = setTimeout(()=>{
        if (Bangle.CLOCK!=1) Bangle.showClock();
      }, 10*60*1000);
    }
  },200);
};

Bangle.on('touch', resetTimeoutAutoreset);
Bangle.on('swipe', resetTimeoutAutoreset);
Bangle.on('message', resetTimeoutAutoreset);
setWatch(resetTimeoutAutoreset, BTN, {repeat:true, edge:'rising'});

if (Bangle.CLOCK!=1) resetTimeoutAutoreset();
}
