{
  // If doing regular loads, not Bangle.load, this is used:
  if (global.__FILE__=="messagegui.new.js") {
    onTwistEmitDrag();
  }

  // If Fastload Utils is installed this is used:
  Bangle.on("message", (_, msg)=>{if (Bangle.CLOCK && msg.new) {
    setTimeout(()=>{
      if (global.__FILE__=="messagegui.new.js") {
        onTwistEmitDrag();
      }
    },700) // It feels like there's a more elegant solution than checking the filename after 700 milliseconds. But this at least seems to work w/o sometimes activating when it shouldn't.
  }});

  // twistThreshold How much acceleration to register a twist of the watch strap? Can be negative for opposite direction. default = 800
  // twistMaxY Maximum acceleration in Y to trigger a twist (low Y means watch is facing the right way up). default = -800
  // twistTimeout How little time (in ms) must a twist take from low->high acceleration? default = 1000
  function onTwistEmitDrag() {
    Bangle.setOptions({twistThreshold:2500, twistMaxY:-800, twistTimeout:400});
    Bangle.on("twist", ()=>{
      let i = 25;
      const int = setInterval(() => {
        Bangle.emit("drag", {dy:-3})
        i--;
        if (i<1) clearInterval(int);
      }, 10);
    });

  }
}
