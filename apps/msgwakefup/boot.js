{
let attach = ()=>{
  if (global.__FILE__=="messagegui.new.js") Bangle.setOptions({wakeOnFaceUp:true});

  // Give messagegui some extra time to add its remove function to
  // Bangle.uiRemove, then attach msgtwscr remove logic.
  setTimeout(
    ()=>{if (Bangle.uiRemove) {
      let showMessageUIRemove = Bangle.uiRemove;
      Bangle.uiRemove = function () {
        Bangle.setOptions({wakeOnFaceUp:false});
        showMessageUIRemove();
        attachAfterTimeout();
      }
    }},
    850)
}

let attachAfterTimeout = ()=>{
  setTimeout(()=>{
    attach();
  },700) // It feels like there's a more elegant solution than checking the filename after 700 milliseconds. But this at least seems to work w/o sometimes activating when it shouldn't.
}

// If doing regular loads, not Bangle.load, this is used:
if (global.__FILE__=="messagegui.new.js") attach();

// If Fastload Utils is installed this is used:
Bangle.on("message", (_, msg)=>{if (Bangle.CLOCK && msg.new) {
  attachAfterTimeout();
}});
}
