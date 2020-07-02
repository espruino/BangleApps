(() => {
  let intervalRef = null;
  var width = 5 * 6*2

  function draw() {
    g.reset().setFont("6x8", 2).setFontAlign(-1, 0);
    var time = require("locale").time(new Date(),1);
    g.drawString(time, this.x, this.y+11, true); // 5 * 6*2 = 60
  }
  function clearTimers(){
    if(intervalRef) {
      clearInterval(intervalRef);
      intervalRef = null;
    }
  }
  function startTimers(){
    intervalRef = setInterval(()=>WIDGETS["wdclk"].draw(), 60*1000);
    WIDGETS["wdclk"].draw();
  }
  Bangle.on('lcdPower', (on) => {
    clearTimers();
    if (on) startTimers();
  });

  WIDGETS["wdclk"]={area:"tr",width:width,draw:draw};
  if (Bangle.isLCDOn) intervalRef = setInterval(()=>WIDGETS["wdclk"].draw(), 60*1000);
})()
