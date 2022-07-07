function display(text1, text2) {
  g.reset();
  g.clear();
  var img = require("Storage").read("agpsdata.img");
  if (img) {
    g.drawImage(img, g.getWidth() - 48, g.getHeight() - 48 - 24);
  }
  g.setFont("Vector", 18);
  g.setFontAlign(0, 1);
  g.drawString(text1, g.getWidth() / 2, g.getHeight() / 3 + 24);
  if (text2 != undefined) {
    g.setFont("Vector", 12);
    g.setFontAlign(-1, -1);
    g.drawString(text2, 5, g.getHeight() / 3 + 29);
  }
  Bangle.drawWidgets();
}

// Show launcher when middle button pressed
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();

function start() {
  display("Updating A-GPS...");
  require("agpsdata").pull(function() {
    display("A-GPS updated.", "touch to close");
    Bangle.on("touch", () => { load(); });
  },
  function(error) {
    display("Error:" + error, "touch to retry");
    Bangle.on("touch", () => { start(); });
  });
}
start();
