(function(){
  g.clear();
  const p = Math.PI/2;
  const PRad = Math.PI/180;
  
  let intervalRefMin = null;
  let intervalRefSec = null;
  
  let minuteDate = new Date();
  let secondDate = new Date();
  
  function seconds(angle, r) {
    const a = angle*PRad;
    const x = 120+Math.sin(a)*r;
    const y = 120-Math.cos(a)*r;
    g.fillRect(x-1,y-1,x+1,y+1);
  }
  function hand(angle, r1,r2) {
    const a = angle*PRad;
    const r3 = 3;
    g.fillPoly([
      120+Math.sin(a)*r1,
      120-Math.cos(a)*r1,
      120+Math.sin(a+p)*r3,
      120-Math.cos(a+p)*r3,
      120+Math.sin(a)*r2,
      120-Math.cos(a)*r2,
      120+Math.sin(a-p)*r3,
      120-Math.cos(a-p)*r3]);
  }
  
  function drawAll() {
    g.clear();
    g.setColor(0,0,0.6);
    for (let i=0;i<60;i++)
      seconds(360*i/60, 90);
    secondDate = minuteDate = new Date();
    onSecond();
    onMinute();
  }
  
  function onSecond() {
    g.setColor(0,0,0.6);
    seconds(360*secondDate.getSeconds()/60, 90);
    g.setColor(1,0,0);
    secondDate = new Date();
    seconds(360*secondDate.getSeconds()/60, 90);
    g.setColor(1,1,1);
  
  }
  
  function onMinute() {
    g.setColor(0,0,0);
    hand(360*minuteDate.getHours()/12, -10, 50);
    hand(360*minuteDate.getMinutes()/60, -10, 82);
    minuteDate = new Date();
    g.setColor(1,1,1);
    hand(360*minuteDate.getHours()/12, -10, 50);
    hand(360*minuteDate.getMinutes()/60, -10, 82);
    if(minuteDate.getHours() >= 0 && minuteDate.getMinutes() === 0) {
      Bangle.buzz();
    }
  }
  
  function clearTimers() {
    if(intervalRefMin) {clearInterval(intervalRefMin);}
    if(intervalRefSec) {clearInterval(intervalRefSec);}
  }
  
  function startTimers() {
    minuteDate = new Date();
    secondDate = new Date();
    intervalRefSec = setInterval(onSecond,1000);
    intervalRefMin = setInterval(onMinute,60*1000);
    drawAll();
  }
  
  startTimers();
  
  Bangle.on('lcdPower',function(on) {
    if (on) {
      g.clear();
      startTimers();
      drawWidgets();
    }else {
      clearTimers();
    }
  });
  
  Bangle.on('gesture',function(gesture){
    if (gesture && !Bangle.isLCDOn()) {
        clearTimers();
        Bangle.setLCDTimeout(30);
        Bangle.setLCDPower(true);
      }
  });
  
  })();
  