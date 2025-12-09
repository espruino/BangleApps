var sosInterval;
var currentColor = "#ffffff"; // last selected color

function draw(color) {
  if (color == undefined) {
    color = -1;
  }
  g.clear();
  g.setColor(color);
  g.fillRect(0, 0, g.getWidth(), g.getHeight());

  // Store the current color only if it is a valid user-selected color
  // "#000000" is used internally when blinking (SOS off state)
  if (typeof color === "string" && color !== "#000000") currentColor = color;
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

  // Draw selectable color blocks
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      var color = colors[i*size + j];
      g.setColor("#" + color);
      g.fillRect(j * w, i * h, j * w + w, i * h + h);
    }
  }

  // Touching a block sets the main screen color
  Bangle.on("touch", function(btn, xy) {
    // If SOS mode is active, stop it when user interacts
    if (sosInterval) {
      clearInterval(sosInterval);
      sosInterval = undefined;
    }

    var x = parseInt((xy.x) / w);
    var y = parseInt((xy.y) / h);
    draw("#" + colors[y * size + x]);
  });
}

// Start SOS blinking using the selected color
function startSOS() {
  if (sosInterval) return;
  var on = false;
  sosInterval = setInterval(function() {
    on = !on;
    if (on) {
      draw(currentColor); // active/on state
    } else {
      draw("#000000"); // off/black state
    }
  }, 200); // blinking frequency
}

// Stop SOS blinking
function stopSOS() {
  if (sosInterval) {
    clearInterval(sosInterval);
    sosInterval = undefined;
  }
}

// Toggle SOS mode using the hardware button
setWatch(function() {
  if (sosInterval) {
    stopSOS();
  } else {
    startSOS();
  }
}, BTN1, {repeat:true, edge:"rising"});

// Show the color grid at startup
draw3Pattern();

/*
require("Storage").write("wristlight.info",{
  "id":"wristlight",
  "name":"Wrist Light",
  "src":"wristlight.app.js",
  "icon":"wristlight.img"
});
*/
