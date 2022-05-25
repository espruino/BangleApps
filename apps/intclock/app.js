Graphics.prototype.setFontUndo = function(scale) {
  // Actual height 19 (20 - 2)
  this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKqKAqooCqigKqKAAAACgAAKAAAoAACgAAAAAAAAACgAAKAAAoAACgAAAAAAKCgAoKAKqqAqqoCqqgKqqAKCgAoKAKqqAqqoCqqgKqqAKCgAoKAAAAAKgoAqCgKqKAqooKiioqKKiooqKiioKKqAoqoCgqAKCoAAAACoCgKgKAiCoCIKgKioAqKgACoAAKgACoAAKgACoqAKioCoIgKgiAoCoCgKgAAAAKqgAqqAKqqAqqoKiioqKKiooqKiioKAKAoAoCgCgKAKAAAACgAAKAAAoAACgAAAAAAKqgAqqAKqqAqqoCgCgKAKAAAACgCgKAKAqqoCqqgCqoAKqgAAAACigAKKAAqoACqgAqoACqgAKqAAqoAAqoACqgAKKAAooAAAAAAoAACgAAKAAAoAAqqACqoAKqgAqqAAKAAAoAACgAAKAAAAAAACoAAKgAAqAACoAAAAAoAACgAAKAAAoAACgAAKAAAoAACgAAKAAAoAACgAAKAAAAAAACgAAKAAAoAACgAAAAAAoAACgAAqAACoAAqAACoAAqAACoAAqAACoAAqAACoAAqAACoAAKAAAoAAAAAACqoAKqgCqqgKqqAoAoCgCgKAKAoAoCqqgKqqAKqgAqqAAAAAqqoCqqgKqqAqqoAAAAKCqAoKoCiqgKKqAoooCiigKKKAoooCqigKqKAKgoAqCgAAAAoAoCgCgKAKAoAoCiigKKKAoooCiigKqqAqqoAqqACqoAAAACqAAKoAAqoACqgAAKAAAoAACgAAKAAqqoCqqgKqqAqqoAAAAKoKAqgoCqigKqKAoooCiigKKKAoooCiqgKKqAoKgCgqAAAAAKqgAqqAKqqAqqoCiigKKKAoooCiigKKqAoqoCgqAKCoAAAACgAAKAAAoAACgAAKAAAoAACgAAKAAAqqoCqqgCqqAKqoAAAACqoAKqgCqqgKqqAoooCiigKKKAoooCqqgKqqAKqgAqqAAAAAKgAAqAAKqAAqoACigAKKAAooACigAKqqAqqoAqqgCqqAAAACgCgKAKAoAoCgCgAAAAoAqCgCoKAKgoAqAAAAAKAAAoAAKoAAqgAKqgAqqAKgqAqCoCgCgKAKAAAAAoKACgoAKCgAoKACgoAKCgAoKACgoAKCgAoKACgoAKCgAAAAKAKAoAoCoKgKgqAKqgAqqAAqgACqAACgAAKAAAAACgAAKAAAoAACgAAKKKAoooCiigKKKAqoACqgACoAAKgAAAAACqqAKqoCqqgKqqAoAACgAAKCoAoKgCiqgKKqAoooCiigKqqAqqoAqqACqoAAAAAqqgCqqAqqoCqqgKKAAooACigAKKAAqqoCqqgCqqAKqoAAAAKqqAqqoCqqgKqqAoooCiigKKKAoooCqqgKqqAKCgAoKAAAAAKqgAqqAKqqAqqoCgCgKAKAoAoCgCgKAKAoAoCgCgKAKAAAACqqgKqqAqqoCqqgKAKAoAoCoKgKgqAKqgAqqAAqgACqAAAAACqoAKqgCqqgKqqAoooCiigKKKAoooCgCgKAKAoAoCgCgAAAAKqoAqqgKqqAqqoCigAKKAAooACigAKAAAoAACgAAKAAAAAAAqqACqoAqqoCqqgKAKAoAoCiigKKKAoqoCiqgKKqAoqoAAAAKqqAqqoCqqgKqqAAoAACgAAKAAAoACqqgKqqAqqoCqqgAAAAoAoCgCgKAKAoAoCqqgKqqAqqoCqqgKAKAoAoCgCgKAKAAAAAAKAAAoAACoAAKgAAKAAAoAACgAAKAqqoCqqgKqoAqqgAAAAKqqAqqoCqqgKqqACqAAKoACqoAKqgCoKgKgqAoAoCgCgAAAAqqgCqqAKqqAqqoAACgAAKAAAoAACgAAKAAAoAACgAAKAAAACqqgKqqAqqoCqqgCoAAKgAAKgAAqAAKgAAqAAKqqAqqoCqqgKqqAAAACqqgKqqAqqoCqqgCoAAKgAAKgAAqAAqqoCqqgKqqAqqoAAAACqoAKqgCqqgKqqAoAoCgCgKAKAoAoCqqgKqqAKqgAqqAAAAAqqoCqqgKqqAqqoCigAKKAAooACigAKqAAqoAAqAACoAAAAAAqqACqoAqqoCqqgKAKAoAoCgKgKAqAqqoCqqgCqqAKqoAAAAKqqAqqoCqqgKqqAooACigAKKgAoqACqqgKqqAKioAqKgAAAAKgoAqCgKqKAqooCiigKKKAoooCiigKKqAoqoCgqAKCoAAAACgAAKAAAoAACgAAKqqAqqoCqqgKqqAoAACgAAKAAAoAAAAAAKqoAqqgCqqgKqqAAAoAACgAAKAAAoCqqgKqqAqqgCqqAAAAAqqACqoAKqoAqqgAAKgAAqAACoAAKgKqoAqqgCqoAKqgAAAACqqgKqqAqqoCqqgACoAAKgACoAAKgAAKgAAqAKqqAqqoCqqgKqqAAAACoKgKgqAqqoCqqgAqgACqAAKoAAqgAqqoCqqgKgqAqCoAAAAKoAAqgACqgAKqAAAqoACqgAKqAAqoCqgAKqAAqgACqAAAAAAoCoCgKgKCqAoKoCiqgKKqAqooCqigKoKAqgoCoCgKgKAAAACqqgKqqAqqoCqqgKAKAoAoAAAAKAAAoAACoAAKgAAKgAAqAAAqAACoAACoAAKgAAKgAAqAAAqAACoAACgAAKAAAACgCgKAKAqqoCqqgKqqAqqoAAA"), 32, atob("DQULDw0RDQUHBw0NBQ0FEQ0FDQ0NDQ0NDQ0FBQsNCw0RDQ0NDQ0NDQ0NDQ0NDw0NDQ0NDQ0NDQ8NDQ0HEQc="), 22+(scale<<8)+(1<<16));
  return this;
}

// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}


function draw() {
  var x = g.getWidth()/2;
  var y = g.getHeight()/2 - 10;
  g.reset();
  // work out locale-friendly date/time
  var date = new Date();
  var timeStr = require("locale").time(date,1).trim();
  var dateStr = require("locale").date(date).toUpperCase();
  
  
  // draw time
  g.setFontAlign(0,0).setFont("Undo:3");
  g.clearRect(0,y-30,g.getWidth(),y+30); // clear the background
  g.drawString(timeStr,x,y);
  // draw date
  y += 40;
  g.setFontAlign(0,0).setFont("Undo");
  g.clearRect(0,y-10,g.getWidth(),y+20); // clear the background
  g.drawString(dateStr,x,y);
  // queue draw in one minute
  queueDraw();
}

// Clear the screen once, at startup
g.clear();
// draw immediately at first, queue update
draw();
// Stop updates when LCD is off, restart when on
Bangle.on('lcdPower',on=>{
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});
// Show launcher when middle button pressed
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();