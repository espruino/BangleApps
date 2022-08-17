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

let waiting = false;

function start() {
  g.reset();
  g.clear();
  waiting = false;
  display("Retry?", "touch to retry");
  Bangle.on("touch", () => { updateAgps(); });
}

function updateAgps() {
  g.reset();
  g.clear();
  if (!waiting) {
    waiting = true;
    display("Updating A-GPS...");
    require("agpsdata").pull(function() {
      waiting = false;
      display("A-GPS updated.", "touch to close");
      Bangle.on("touch", () => { load(); });
    },
    function(error) {
      waiting = false;
      E.showAlert(error, "Error")
                    .then(() => { start(); });
    });
  } else {
    display("Waiting...");
  }
}
updateAgps();
