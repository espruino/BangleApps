Bangle.on("lock", function() {
  WIDGETS["lock"].width = Bangle.isLocked()?16:1;
  Bangle.drawWidgets();
});
WIDGETS["lock"]={area:"tl",sortorder:10,width:Bangle.isLocked()?16:1,draw:function(w) {
  if (Bangle.isLocked())
    g.reset().drawImage(atob("DhABH+D/wwMMDDAwwMf/v//4f+H/h/8//P/z///f/g=="), w.x+1, w.y+4);
}};
