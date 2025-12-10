function animateExpandCircle(x, y, startR, endR, duration,color) {
  var r=startR;
  var fps=15
  var rChangeRate=(endR-startR)/(duration*fps)
  var interval;
  var time=0;
  interval=setInterval(function(){
    time+=1/fps
    r+=rChangeRate;
    g.setColor(color);

    g.fillEllipse(x-r,y-r,x+r,y+r)
    if(Math.round(r)==Math.round(endR)||time>duration){
      clearInterval(interval)
    }
  },1/fps)
  
}

Bangle.load=(function(name) {
  if (Bangle.uiRemove) {
    var animTime=0.3;  //seconds
    animateExpandCircle(g.getWidth()/2,g.getHeight()/2,0,150,animTime,g.theme.bg)
    Bangle.setUI(); // remove all existing UI (and call Bangle.uiRemove)
    __FILE__=name;
    if (!name) name = ".bootcde";
    setTimeout(eval,animTime*1000,require("Storage").read(name)); // Load app without a reboot
  } else load((name!=".bootcde")?name:undefined);
});

