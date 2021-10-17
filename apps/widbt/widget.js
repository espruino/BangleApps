(function(){
  function draw() {
    g.reset();
    if (NRF.getSecurityStatus().connected)
      g.setColor((g.getBPP()>8) ? "#07f" : (g.theme.dark ? "#0ff" : "#00f"));
    else
      g.setColor(g.theme.dark ? "#666" : "#999");
    g.drawImage(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="),2+this.x,2+this.y);
  }
  function changed() {
    WIDGETS["bluetooth"].draw();
    g.flip();// turns screen on
  }
  NRF.on('connect',changed);
  NRF.on('disconnect',changed);
  WIDGETS["bluetooth"]={area:"tr",width:15,draw:draw};
})()
