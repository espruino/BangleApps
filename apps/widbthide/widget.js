WIDGETS["bluetooth"]={area:"tr",draw:function() {
  if (WIDGETS.bluetooth.width==0)
    return;
  g.reset();
  g.setColor((g.getBPP()>8) ? "#07f" : (g.theme.dark ? "#0ff" : "#00f"));
  g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="),2+this.x,2+this.y);
},changed:function() {
  WIDGETS.bluetooth.width = NRF.getSecurityStatus().connected?15:0;
  Bangle.drawWidgets();
},width:NRF.getSecurityStatus().connected?15:0
};
NRF.on('connect',WIDGETS.bluetooth.changed);
NRF.on('disconnect',WIDGETS.bluetooth.changed);
