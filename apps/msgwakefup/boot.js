// If doing regular loads, not Bangle.load, this is used:
if (global.__FILE__=="messagegui.new.js") Bangle.setOptions({wakeOnFaceUp:true});

// If Fastload Utils is installed this is used:
Bangle.on("message", (_, msg)=>{if (Bangle.CLOCK && msg.new) {
  setTimeout(()=>{
    if (global.__FILE__=="messagegui.new.js") Bangle.setOptions({wakeOnFaceUp:true});
  },700) // It feels like there's a more elegant solution than checking the filename after 700 milliseconds. But this at least seems to work w/o sometimes activating when it shouldn't.
}});
