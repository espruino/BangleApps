// NOTE: 240 x 240
// Load fonts
require("Font7x11Numeric7Seg").add(Graphics);


function draw() {
  var daysOfWeek = ["MON", "TUE","WED","THUR","FRI","SAT","SUN"];
  // work out how to display the current time
  var d = new Date();
  var h = d.getHours(), m = d.getMinutes(), day = d.getDate(), month = (d.getMonth()+1), weekDay = d.getDay();

  var hours = h;
  var mins= ("0"+m).substr(-2);
  var date = `${daysOfWeek[weekDay]}\n\n${day}/${month}`;

  // Reset the state of the graphics library
  g.reset();

  // draw the current time
  g.setFont("7x11Numeric7Seg",8);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString(hours, 30, 70, true /*clear background*/);
  g.drawString(mins, 30, 170, true /*clear background*/);

  // draw the date (2x size 7 segment)
  g.setFont("6x8",2.5);
  g.setFontAlign(-1,0); // align right bottom
  g.drawString(date, 150, 110, true /*clear background*/);
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first
draw();
var secondInterval = setInterval(draw, 5000);

// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (secondInterval) clearInterval(secondInterval);
  secondInterval = undefined;
  if (on) {
    setInterval(draw, 5000);
    draw(); // draw immediately
  }
});
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
// Show launcher when middle button pressed
setWatch(Bangle.showLauncher, BTN2, { repeat: false, edge: "falling" });
