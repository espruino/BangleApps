WIDGETS["bluetooth"]={area:"tr",draw:function() {
  if (WIDGETS.bluetooth.width==0)
    return;
  g.reset();
  if (NRF.getSecurityStatus().connected)
    g.setColor((g.getBPP()>8) ? "#07f" : (g.theme.dark ? "#0ff" : "#00f"));
  else
    g.setColor(g.theme.dark ? "#666" : "#999");
  g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="),2+this.x,2+this.y);
},getWidth:function(){
  if (!NRF.getSecurityStatus().connected) {
    const settings = require('Storage').readJSON("widbt.json", true) || {};
    if (settings.hideDisconnected)
      return 0;
  }
  return 15;
},changed:function() {
  const newWidth = WIDGETS.bluetooth.getWidth();
  if (WIDGETS.bluetooth.width != newWidth) {
    WIDGETS.bluetooth.width = newWidth;
    Bangle.drawWidgets();
  } else {
    WIDGETS.bluetooth.draw();
  }
}};
WIDGETS.bluetooth.width = WIDGETS.bluetooth.getWidth();
NRF.on('connect',WIDGETS.bluetooth.changed);
NRF.on('disconnect',WIDGETS.bluetooth.changed);
