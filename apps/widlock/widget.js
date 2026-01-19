
WIDGETS["lock"]={area:"tl",sortorder:10,width:Bangle.isLocked()?16:1,draw(w) {
  if (Bangle.isLocked())
    g.reset().drawImage(atob("DhABH+D/wwMMDDAwwMf/v//4f+H/h/8//P/z///f/g=="), w.x+1, w.y+4);
},changed() {
  WIDGETS["lock"].width = Bangle.isLocked()?16:1;
  Bangle.drawWidgets();
}, remove() {
  Bangle.removeListener('lock', WIDGETS["lock"].changed);
  delete WIDGETS["lock"];
}};
Bangle.on("lock", WIDGETS["lock"].changed);