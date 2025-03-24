/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

const storage = require('Storage');
require("Font8x16").add(Graphics);

let appsettings = storage.readJSON('setting.json');

//MASCOT
if (appsettings.showMascot) {
  var L1 = {
    width : 16, height : 16, bpp : 1,
    transparent : 0,
    palette : new Uint16Array([65535,0]),
    buffer : atob("AAAH4AgQcMiAaIDohgh4CEAQP4gpLylFGM40YlPVfn8=")
  };
  var L2 = {
    width : 16, height : 16, bpp : 1,
    transparent : 0,
    palette : new Uint16Array([65535,0]),
    buffer : atob("B+AIEHDIgGiA6IYIeAhA0D8QGMgpGDnHDF0zxlKqfv4=")
  };
  var R1 = {
    width : 16, height : 16, bpp : 1,
    transparent : 0,
    palette : new Uint16Array([65535,0]),
    buffer : atob("B+AIEBMOFgEXARBhEB4LAgj8ExgYlOOcujBjzFVKf34=")
  };
  var R2 = {
    width : 16, height : 16, bpp : 1,
    transparent : 0,
    palette : new Uint16Array([65535,0]),
    buffer : atob("AAAH4AgQEw4WARcBEGEQHggCEfz0lKKUcxhGLKvK/n4=")
  };

  // Initial position and direction
  var x = 40;
  var y = 25;
  var direction = 1; // 1 for right, -1 for left
  var currentFrame = 0; // 0 for L1/R1, 1 for L2/R2
  var prevX = x; // Track the previous position of the sprite

  function drawSprite() {
    g.clearRect(prevX, y, prevX + 32, y + 32);
    if (direction === 1) {
      g.drawImage(currentFrame === 0 ? R1 : R2, x, y, {scale:2});
    } else {
      g.drawImage(currentFrame === 0 ? L1 : L2, x, y, {scale:2});
    }
    prevX = x;
  }

  function updatePosition() {
    if (Math.random() < 0.3) { 
      direction = Math.random() < 0.5 ? -1 : 1; 
    }

    x += direction * 2;

    if (x > g.getWidth() - 70) {
      x = g.getWidth() - 70;
      direction = -1;
    } else if (x < 0) {
      x = 0;
      direction = 1;
    }
  }

  function alternateFrame() {
    currentFrame = 1 - currentFrame;
  }
}

//BARS

if (appsettings.showDJSeconds) {
  let barCount = 0;
  let increasing = true;

  function drawBars() {
    const barWidth = 5;
    const barSpacing = 3;
    const barHeight = 15;
    const startX = (g.getWidth() - (5 * barWidth + 4 * barSpacing)) / 2 -60;
    const startY = g.getHeight() / 2 + 30;

    for (let i = 0; i < barCount; i++) {
      g.fillRect(
        startX + i * (barWidth + barSpacing),
        startY - barHeight / 2,
        startX + i * (barWidth + barSpacing) + barWidth,
        startY + barHeight / 2
      );
    }
  }

  function updateBars() {
    if (increasing) {
      barCount++;
      if (barCount >= 5) {
        increasing = false;
      }
    } else {
      barCount--;
      if (barCount <= 0) {
        increasing = true;
      }
    }
  }
}


//ACTUAL WATCH

{
let drawTimeout;
let queueMillis = 1000;
let queueDraw = function() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    drawWatchface();
  }, queueMillis - (Date.now() % queueMillis));
};
let updateState = function() {
  if (Bangle.isLCDOn()) {
    if (Bangle.isLocked()){
      queueMillis = 60000;
    } else {
      queueMillis = 1000;
    }
    drawWatchface(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
};

function drawWatchface() {
  var date = new Date();
  var day = date.getDate();
  var month = date.getMonth() + 1; // Months are 0-indexed
  var year = date.getFullYear();
  var seconds = date.getSeconds();

  g.reset().clearRect(Bangle.appRect);
  g.setFontAlign(0, 0);
  g.setFontVector(60);
  var timeString = require("locale").time(date, 1);
  var AMPM = require("locale").meridian(new Date()).toUpperCase();
  var timeWidth = g.stringWidth(timeString)/2;
  var jpclX = (g.getWidth() - timeWidth ); 
  var jpclY = g.getHeight() / 2;
  g.drawString(timeString, jpclX, jpclY);
  if (!Bangle.isLocked()) {
    if (appsettings.showMascot) {
      updatePosition();
      alternateFrame();
      drawSprite();
    }
    if (appsettings.showDJSeconds) {
      g.setFontVector(20); 
      g.drawString(seconds.toString().padStart(2, '0'), jpclX + timeWidth / 2+25, jpclY + 33);
      updateBars();
      drawBars();
    }
  g.drawString(AMPM, jpclX+60, jpclY-38);
  }
  queueDraw();
}

// Clear the screen once, at startup
g.clear();
// Set dynamic state and perform initial drawing
updateState();
// Register hooks for LCD on/off event and screen lock on/off event
Bangle.on('lcdPower', updateState);
Bangle.on('lock', updateState);
Bangle.setUI({
  mode: "clock",
  remove: function() {
    // Called to unload all of the clock app
    Bangle.removeListener('lcdPower', updateState);
    Bangle.removeListener('lock', updateState);
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
}