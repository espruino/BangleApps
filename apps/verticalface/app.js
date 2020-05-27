  // Set color
  g.setColor('#27ae60');
  // draw the current time (4x size 7 segment)
  g.setFont("8x12",9);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString(hours, 25, 65, true /*clear background*/);
  g.drawString(mins, 25, 155, true /*clear background*/);

  // draw the date (2x size 7 segment)
  g.setFont("6x8",2);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString(date, 20, 215, true /*clear background*/);
}


//We will create custom "Widgets" for our face.

function drawSteps() {
  //Reset to defaults.
  g.reset();
  // draw the date (2x size 7 segment)
  g.setColor('#7f8c8d');
  g.setFont("8x12",2);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString("STEPS", 145, 40, true /*clear background*/);
  g.setColor('#bdc3c7');
  g.drawString("1234", 145, 70, true /*clear background*/);
}

function drawBPM() {
  //Reset to defaults.
  g.reset();
  // draw the date (2x size 7 segment)
  g.setColor('#7f8c8d');
  g.setFont("8x12",2);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString("BPM", 145, 120, true /*clear background*/);
  g.setColor('#bdc3c7');
  g.drawString("1234", 145, 150, true /*clear background*/);
}


// Clear the screen once, at startup
g.clear();
// draw immediately at first
drawTimeDate();
drawSteps();
drawBPM();

var secondInterval = setInterval(()=>{
  drawTimeDate();
}, 5000);

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    setInterval(drawTimeDate, 5000);
    drawTimeDate(); // draw immediately
  }
});

// Load widgets
//Bangle.loadWidgets();
//Bangle.drawWidgets();

// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });

Bangle.on('touch', function(button) {
  if(button == 1 || button == 2) Bangle.showLauncher();
});
