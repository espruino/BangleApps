(function(){
  Bangle.on(Bangle.isLocked?'lock':'lcdPower', function(on) {
    WIDGETS["lock"].width = Bangle.isLocked()?0:16;
    Bangle.drawWidgets();
  });
  if (Bangle.isLocked===undefined)
    Bangle.isLocked = Bangle.isLCDOn;
  WIDGETS["lock"]={area:"tl",width:Bangle.isLocked()?0:16,draw:function(w) {
    if (!Bangle.isLocked())
      g.reset().drawImage(atob("DhABH+D/wwMMDDAwwMf/v//4f+H/h/8//P/z///f/g=="), w.x+1, w.y+4);
  }};
})()
