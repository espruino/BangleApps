(function() {
  // don't show widget if we know we have a clock app running
  if (Bangle.CLOCK) return;

  let intervalRef = null;
  var width = 5 * 6*2;
  var text_color=0x07FF;//cyan 

  function draw() {
    g.reset().setFont("6x8", 2).setFontAlign(-1, 0).setColor(text_color);
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
    intervalRef = setInterval(()=>WIDGETS["wdclkbttm"].draw(), 60*1000);
    WIDGETS["wdclkbttm"].draw();
  }
  Bangle.on('lcdPower', (on) => {
    clearTimers();
    if (on) startTimers();
  });

  WIDGETS["wdclkbttm"]={area:"br",width:width,draw:draw};
  if (Bangle.isLCDOn) intervalRef = setInterval(()=>WIDGETS["wdclkbttm"].draw(), 60*1000);
})()
