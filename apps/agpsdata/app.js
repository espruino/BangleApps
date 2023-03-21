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

function start(restart) {
  g.reset();
  g.clear();
  waiting = false;
  if (!restart) {
    display("Start?", "touch to start");
  }
  else {
    display("Retry?", "touch to retry");
  }
  Bangle.on("touch", () => { updateAgps(); });

  const file = "agpsdata.json";
  let data = require("Storage").readJSON(file, 1) || {};
  if (data.lastUpdate) {
    g.setFont("Vector", 11);
    g.drawString("last success:", 5, g.getHeight() - 22);
    g.drawString(new Date(data.lastUpdate).toISOString(), 5, g.getHeight() - 11);
  }

}

function updateAgps() {
  g.reset();
  g.clear();
  if (!waiting) {
    waiting = true;
    display("Updating A-GPS...", "takes ~10 seconds");
    require("agpsdata").pull(function() {
      waiting = false;
      display("A-GPS updated.", "touch to close");
      Bangle.on("touch", () => { load(); });
    },
    function(error) {
      waiting = false;
      E.showAlert(error, "Error")
                    .then(() => { start(true); });
    });
  } else {
    display("Waiting...");
  }
}
start(false);
