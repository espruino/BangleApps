(function(){
  Bangle.on('lcdPower', function(on) {
    WIDGETS["lock"].width = Bangle.isLCDOn()?0:16;
    Bangle.drawWidgets();
  });
  WIDGETS["lock"]={area:"tl",width:Bangle.isLCDOn()?0:16,draw:function(w) {
    if (!Bangle.isLCDOn())
      g.reset().drawImage(atob("DhABH+D/wwMMDDAwwMf/v//4f+H/h/8//P/z///f/g=="), w.x, w.y);
  }};
})()
