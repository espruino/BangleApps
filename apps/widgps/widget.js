(function(){
  if (!Bangle.isGPSOn) return; // old firmware

  function draw() {
    g.reset();
    if (Bangle.isGPSOn()) {
      g.setColor("#FD0");     // on = amber
    } else {
      g.setColor("#888"); // off = grey
    }
    g.drawImage(atob("GBiBAAAAAAAAAAAAAA//8B//+BgYGBgYGBgYGBgYGBgYGBgYGB//+B//+BgYGBgYGBgYGBgYGBgYGBgYGB//+A//8AAAAAAAAAAAAA=="), this.x, 2+this.y);
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
