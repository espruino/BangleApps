(function(){
  if (!Bangle.isGPSOn) return; // old firmware

  function draw() {
    g.reset();
    if (Bangle.isGPSOn()) {
      g.setColor(1,0.8,0);     // on = amber
    } else {
      g.setColor(0.3,0.3,0.3); // off = grey
    }
    g.drawImage(atob("GBiBAAAAAAAAAAAAAA//8B//+BgYGBgYGBgYGBgYGBgYGBgYGB//+B//+BgYGBgYGBgYGBgYGBgYGBgYGB//+A//8AAAAAAAAAAAAA=="), 10+this.x, 2+this.y);
  }

  var timerInterval;
  Bangle.on('lcdPower', function(on) {
    if (on) {
      WIDGETS.gps.draw();
      if (!timerInterval) timerInterval = setInterval(()=>WIDGETS["gps"].draw(), 2000);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
      }
    }
  });

  WIDGETS.gps={area:"tr",width:24,draw:draw};
})();
