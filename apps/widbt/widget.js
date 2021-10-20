<<<<<<< HEAD
(function(){
  var img_bt = E.toArrayBuffer(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="));

  function draw() {
    g.reset();
    if (NRF.getSecurityStatus().connected)
      g.setColor(0,0.5,1);
    else
      g.setColor(0.3,0.3,0.3);
    g.drawImage(img_bt,10+this.x,2+this.y);
  }
  function changed() {
    WIDGETS["bluetooth"].draw();
    g.flip();// turns screen on
  }
  NRF.on('connect',changed);
  NRF.on('disconnect',changed);
  WIDGETS["bluetooth"]={area:"tr",width:24,draw:draw};
})()
=======
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
>>>>>>> 1cc7674aa7f990f88644e78d9d19cd981ea34324
