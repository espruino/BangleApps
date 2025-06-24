{
  // twistThreshold How much acceleration to register a twist of the watch strap? Can be negative for opposite direction. default = 800
  // twistMaxY Maximum acceleration in Y to trigger a twist (low Y means watch is facing the right way up). default = -800
  // twistTimeout How little time (in ms) must a twist take from low->high acceleration? default = 1000
  let onTwistEmitDrag = ()=>{
    Bangle.setOptions({twistThreshold:2500, twistMaxY:-800, twistTimeout:400});
    let isTwistDragging = false;
    let twistHandler = ()=>{
      if (!isTwistDragging) {
        isTwistDragging = true;
        Bangle.setLocked(false);
        Bangle.setLCDPower(true);
        let i = 25;
        const int = setInterval(() => {
          Bangle.emit("drag", {dy:-3, b:i===0?0:1})
          i--;
          if (i<0) {
            clearInterval(int);
            isTwistDragging = false;
          }
        }, 10);
      }
    }
    Bangle.on("twist", twistHandler);
    // Give messagegui some extra time to add its remove function to
    // Bangle.uiRemove, then attach msgtwscr remove logic.
    setTimeout(
      ()=>{if (Bangle.uiRemove) {
        let showMessageUIRemove = Bangle.uiRemove;
        Bangle.uiRemove = function () {
          Bangle.removeListener("twist", twistHandler)
          showMessageUIRemove();
          // Reset twist drag logic if we go to next message.
          attachAfterTimeout();
        }
      }},
      800)
  }

  // If doing regular loads, not Bangle.load, this is used:
  if (global.__FILE__=="messagegui.new.js") {
    onTwistEmitDrag();
  }

  let attachAfterTimeout = ()=>{
    setTimeout(()=>{
      if (global.__FILE__=="messagegui.new.js") {
        onTwistEmitDrag();
      }
    },700)
    // It feels like there's a more elegant solution than checking the filename
    // after 700 milliseconds. But this at least seems to work w/o sometimes
    // activating when it shouldn't.
    // Maybe we could add events for when fast load and/or Bangle.uiRemove occurs?
    // Then that could be used similarly to boot code and/or the `kill` event.
  }

  // If Fastload Utils is installed this is used:
  Bangle.on("message", (_, msg)=>{if (Bangle.CLOCK && msg.new) {
    attachAfterTimeout();
  }});

}
