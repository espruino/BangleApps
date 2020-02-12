(function(){
var img_bt = E.toArrayBuffer(atob("CxQBBgDgFgJgR4jZMawfAcA4D4NYybEYIwTAsBwDAA=="));
var xpos = WIDGETPOS.tr-24;
WIDGETPOS.tr-=24;

function draw() {
  var x = xpos, y = 0;
  if (NRF.getSecurityStatus().connected)
    g.setColor(0,0.5,1);
  else
    g.setColor(0.3,0.3,0.3);
  g.drawImage(img_bt,10+x,2+y);
  g.setColor(1,1,1);
}
function changed() {
  draw();
  g.flip();// turns screen on
}
NRF.on('connected',changed);
NRF.on('disconnected',changed);
WIDGETS["bluetooth"]={draw:draw};
})()
