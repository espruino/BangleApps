WIDGETS["bluetooth"] = {area: "tr", width: NRF.getSecurityStatus().connected ? 0 : 15, draw: function () {
    if (WIDGETS.bluetooth.width < 15) return;
    g.reset();
    g.setColor((g.getBPP()>8) ? "#07f" : (g.theme.dark ? "#0ff" : "#00f"));
    g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="),2+this.x,2+this.y);
    g.setColor("#f00");
    g.drawImage(atob("CxSBAMA8DYG4YwxzBmD4DwHAGAeA8DcGYY4wzB2B4DA="), 2+this.x, 2+this.y);
  },changed:function(){
    WIDGETS.bluetooth.width=NRF.getSecurityStatus().connected?0:15;
    Bangle.drawWidgets();
  }};
NRF.on('connect', WIDGETS.bluetooth.changed);
NRF.on('disconnect', WIDGETS.bluetooth.changed);
