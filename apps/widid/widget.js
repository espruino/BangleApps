/* jshint esversion: 6 */
(() => {
  var xpos = WIDGETPOS.tr-16;
  WIDGETPOS.tr-= 16;
  id = NRF.getAddress().split(":");

  // draw your widget at xpos
  function draw() {
    var x = xpos, y = 0;
    g.setColor(0,0.5,1).setFont("6x8",1);
  g.drawString(id[4],x,0,true);
    g.drawString(id[5],x,10),true;
  }
  WIDGETS["widid"]={draw:draw};
})()
