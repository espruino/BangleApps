function draw(color) {
  if (color == undefined) {
    color = -1;
  }
  g.clear();
  g.setColor(color);
  g.fillRect(0, 0, g.getWidth(), g.getHeight());
}

function draw2Pattern() {
  const colors = ["ff0000", "8080ff", "00ff00",
            "ffffff"];
  drawPattern(2, colors);
}

function draw3Pattern() {
  const colors = ["ff0000", "00ff00", "0000ff",
            "ff00ff", "ffffff", "00ffff",
            "ffff00", "ff8000", "ff0080"];
  drawPattern(3, colors);
}

function drawPattern(size, colors) {
  g.clear();
  var w = g.getWidth() / size;
  var h = g.getHeight() / size;
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      var color = colors[i*size + j];
      g.setColor("#" + color);
      g.fillRect(j * w, i * h, j * w + w, i * h + h);
    }
  }
  Bangle.on("touch", function(btn, xy) {
    var x = parseInt((xy.x) / w);
    var y = parseInt((xy.y) / h);
    draw("#" + colors[y * size + x]);
  });
}

// Clear the screen once, at startup
// draw immediately at first
draw3Pattern();

/*
require("Storage").write("wristlight.info",{
  "id":"wristlight",
  "name":"Wrist Light",
  "src":"wristlight.app.js",
  "icon":"wristlight.img"
});
*/
