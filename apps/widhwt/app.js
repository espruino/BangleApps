// Replace the "Loading..." box
// with our own message
g.clearRect(38, 68, 138, 108);
g.drawRect(38, 68, 138, 108);
g.setFontVector(13).drawString("Wash...", 60, 82);

Bangle.buzz();
setTimeout(() => {
  Bangle.buzz(1E3, 1);
  setTimeout(() => load(), 2E3);
}, 35E3);
