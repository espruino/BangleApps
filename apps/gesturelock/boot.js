var locked=false;

function lock(){
    
    if(!locked){  
      E.stopEventPropagation && E.stopEventPropagation();

      Bangle.setLocked(true);

      const backlightTimeout = Bangle.getOptions().backlightTimeout; // ms

      // seems to be a race/if we don't give the firmware enough time,
      // it won't timeout the backlight and we'll restore it in our setTimeout below
      Bangle.setOptions({ backlightTimeout: 20 });

      setTimeout(() => {
        Bangle.setOptions({ backlightTimeout });
      }, 300);
    }
}
Bangle.on('aiGesture',(gesture)=>{
  print(locked);
  print(gesture);
  if(gesture=="TwistOut"){
    
    lock();
    
  }
});


Bangle.on('lock', function(isLocked) {
  locked=isLocked;
});

