Bangle.on("lockunlock", function() {
  Bangle.drawWidgets();
});
WIDGETS["lockunlock"]={area:"tl",sortorder:10,width:14,draw:function(w) {
  g.reset().drawImage(atob(Bangle.isLocked() ? "DBGBAAAA8DnDDCBCBP////////n/n/n//////z/A" : "DBGBAAAA8BnDDCBABP///8A8A8Y8Y8Y8A8A//z/A"), w.x+1, w.y+3);
}};
