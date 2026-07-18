(function() {
  var g = Graphics.createArrayBuffer(48,48,8);
  g.setColor(0x07E0);
  g.fillCircle(24,24,22);
  g.setColor(0);
  g.fillCircle(24,24,19);
  g.setColor(0x07E0);
  g.fillCircle(24,24,2);
  g.fillRect(23,10,25,24);
  g.fillRect(24,23,34,25);
  return g.asImage();
})()
