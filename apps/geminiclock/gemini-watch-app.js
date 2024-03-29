// Clock by Giles Booth for BangleJS2 using B�ro Destruct Console Remix font
// based on code in https://www.espruino.com/Bangle.js+Clock+Font

Graphics.prototype.setFontBDGemini = function() {
  // Actual height 79 (84 - 6)
  var widths = atob("Gio1KS8zNS8vLzkvGg==");
  var font = atob("AAAAAAAAD///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAH///gAAAAAAAAAAAD///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAf/AAAAAAAAAAAAAD//AAAAAAAAAAAAAP//AAAAAAAAAAAAA///AAAAAAAAAAAAH///AAAAAAAAAAAAf//+AAAAAAAAAAAD///8AAAAAAAAAAAP///wAAAAAAAAAAB///+AAAAAAAAAAAH///4AAAAAAAAAAA////gAAAAAAAAAAD///8AAAAAAAAAAAP///wAAAAAAAAAAB///+AAAAAAAAAAAH///4AAAAAAAAAAA////AAAAAAAAAAAD///8AAAAAAAAAAAf///gAAAAAAAAAAB///+AAAAAAAAAAAP///wAAAAAAAAAAA////AAAAAAAAAAAH///8AAAAAAAAAAAf///gAAAAAAAAAAB///+AAAAAAAAAAAP///wAAAAAAAAAAA////AAAAAAAAAAAH///4AAAAAAAAAAAP///gAAAAAAAAAAAf//8AAAAAAAAAAAAf//wAAAAAAAAAAAAf/+AAAAAAAAAAAAAf/4AAAAAAAAAAAAAf/gAAAAAAAAAAAAAP8AAAAAAAAAAAAAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///////////4AAAf///////////8AAAf///////////8AAA////////////+AAA////////////+AAA////////////+AAA////////////+AAA////////////+AAA//gAAAAB////+AAA/+AAAAAD////+AAA/8AAAAAP////+AAA/4AAAAA/////+AAA/4AAAAD/////+AAA/4AAAAH/////+AAA/4AAAAf/////+AAA/4AAAB//+f//+AAA/4AAAD//8f//+AAA/4AAAP//wf//+AAA/4AAA///Af//+AAA/4AAB//+Af//+AAA/4AAH//4Af//+AAA/4AAf//gAf//+AAA/4AB///AAf//+AAA/4AD//8AAf//+AAA/4AP//wAAf//+AAA/4A///gAAf//+AAA/4B//+AAAf//+AAA/4H//4AAAf//+AAA/4f//wAAAf//+AAA/4///AAAAf//+AAA/7//8AAAAf//+AAA////wAAAAf//+AAA////gAAAAf//+AAA///+AAAAAf//+AAA///4AAAAA///+AAA///wAAAAA///+AAA///AAAAAB///+AAA//+AAAAAP///+AAA////////////+AAA////////////+AAA////////////+AAA////////////+AAA////////////+AAAf///////////8AAAP///////////8AAAH///////////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwAAAAAAAB//8AAAf4AAAAAAAD//+AAAf4AAAAAAAH//+AAAf4AAAAAAAP///AAAf8AAAAAAAP///AAAf8AAAAAAAP///AAAf8AAAAAAAP///AAAf8AAAAAAAP///AAAf8AAAAAAAP///AAAf8AAAAAAAf///AAAf+AAAAAAAf///AAAf/AAAAAAA////AAAf/4AAAAAP////AAAf////////////AAAf////////////AAAf////////////AAAf////////////AAAf////////////AAAP////////////AAAP////////////AAAD////////////AAAAAAAAAAAH////AAAAAAAAAAAA////AAAAAAAAAAAAf///AAAAAAAAAAAAP///AAAAAAAAAAAAP///AAAAAAAAAAAAP///AAAAAAAAAAAAP///AAAAAAAAAAAAP///AAAAAAAAAAAAP///AAAAAAAAAAAAP///AAAAAAAAAAAAH//+AAAAAAAAAAAAD//+AAAAAAAAAAAAB//4AAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfwAAAD//////4AAA/wAAAH//////8AAA/wAAAH//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP/4AAB/+AAA/4AAAP/gAAAf+AAA/4AAAP/AAAAf+AAA/4AAAP+AAAAP+AAA/4AAAP+AAAAP+AAA/4AAAP+AAAAP+AAA/4AAAP+AAAAP+AAA/4AAAP+AAAAP+AAA/8AAAf+AAAAP+AAA/+AAA/+AAAAP+AAA//////+AAAAP+AAA//////+AAAAP+AAA//////+AAAAP+AAA//////+AAAAP+AAA//////+AAAAP+AAA//////+AAAAH+AAAf/////8AAAAH+AAAP/////4AAAAH+AAAH/////wAAAAD8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwAAAAPwAAAB+AAAf4AAAAP4AAAD/AAAf4AAAAf8AAAD/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAAf8AAAH/AAAf8AAAA/+AAAH/AAAf+AAAB/+AAAP/AAAf/gAAD//gAAf/AAAf////////////AAAf////////////AAAf////////////AAAf////////////AAAf////////////AAAf////////////AAAP////////////AAAH////////////AAAD////////////AAAAAAAAH///////AAAAAAAAD///////AAAAAAAAB///////AAAAAAAAA///////AAAAAAAAA///////AAAAAAAAAf//////AAAAAAAAAf//////AAAAAAAAAf//////AAAAAAAAAP/////+AAAAAAAAAH/////+AAAAAAAAAD/////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP4AAAAAAAAAAAAAAf8AAAAAAAAAAAAAB/+AAAAAAAAAAAAAD/+AAAAAAAAAAAAAP//AAAAAAAAAAAAAf//AAAAAAAAAAAAB///AAAAAAAAAAAAD///AAAAAAAAAAAAP///AAAAAAAAAAAAf///AAAAAAAAAAAB////AAAAAAAAAAAD////AAAAAAAAAAAP////AAAAAAAAAAA//+P/AAAAAAAAAAB//4H/AAAAAAAAAAH//wH/AAAAAAAAAAP//AH/AAAAAAAAAA//+AH/AAAAAAAAAB//4AH/AAAAAAAAAH//wAH/AAAAAAAAAP//AAH/AAAAAAAAAP/+AAH/AAA//4AAAf/4AAH/AAB//8AAAf/wAAH/AAD//+AAAf/AAAH/AAH///AAAf+AAAH/AAH///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAP/AAf///AAAf8AAAP/AAf///AAAf+AAAf/gB////AAAf////////////AAAf////////////AAAf////////////AAAf////////////AAAf////////////AAAf////////////AAAP////////////AAAH////////////AAAD////////////AAAAAAAAAAAD////AAAAAAAAAAAA////AAAAAAAAAAAAP///AAAAAAAAAAAAP//+AAAAAAAAAAAAD//8AAAAAAAAAAAAB//wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH/////wAAAAD8AAAf/////4AAAAH+AAAf/////8AAAAH+AAA//////8AAAAH+AAA//////+AAAAP+AAA//////+AAAAP+AAA//////+AAAAP+AAA//////+AAAAP+AAA//wAH/+AAAAP+AAA/+AAA/+AAAAP+AAA/8AAAf+AAAAP+AAA/4AAAP+AAAAP+AAA/4AAAP+AAAAP+AAA/4AAAP+AAAAP+AAA/4AAAP+AAAAP+AAA/4AAAP+AAAAP+AAA/4AAAP/AAAAf+AAA/4AAAP/gAAAf+AAA/4AAAP/wAAB/+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/4AAAP//////+AAA/wAAAH//////+AAA/wAAAH//////8AAAfwAAAD//////4AAAPAAAAA//////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///////////8AAAP///////////+AAAf////////////AAAf////////////AAAf////////////AAAf////////////AAAf////////////AAAf////////////AAAf/AAA//4B////AAAf+AAAP/gAf///AAAf8AAAP/gAf///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/gAf///AAAf8AAAH/gAf///AAAf8AAAH/4B////AAAf8AAAH///////AAAf8AAAH///////AAAf8AAAH///////AAAf8AAAH///////AAAf8AAAH///////AAAf8AAAD///////AAAf4AAAD///////AAAf4AAAB///////AAAPwAAAA//////+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/+AAAAAAAAAAAAAf//AAAAAAAAAAAAA///gAAAAAAAAAAAA///gAAAAAAAAAAAA///gAAAAAAAAAAAA///gAAAAAAAAAAAA///gAAAAAAAAAAAA///gAAAAAAAAAAAA///gAAAAAAAAAAAA///gAAAAAAAAAAAA///gAAAAAAAAAAAA///gAAAAAAAAAAAA///gAAAAAAAAAAAA///gAAAAAAAAAAAA///gAAAAAAAAAAAA///gAAAH////4AAA///gAAAP////8AAA///gAAAf////+AAA///gAAA/////+AAA///gAAB/////+AAA///gAAD/////+AAA///gAAH/////+AAA///gAAP/////8AAA///gAAf/////4AAA///gAA//gAAAAAAA///gAB//AAAAAAAA///wAD/+AAAAAAAA///wAH/8AAAAAAAA///wAf/wAAAAAAAA///4A//gAAAAAAAA///8B//AAAAAAAAA//////+AAAAAAAAA//////8AAAAAAAAA//////4AAAAAAAAA//////wAAAAAAAAA//////gAAAAAAAAA//////AAAAAAAAAAf////+AAAAAAAAAAP////8AAAAAAAAAAH////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////8AAAAAAAAAf/////+AAAAAAAAA///////AAAAAAAAB///////AAAAAAAAD///////AAAAAAAAH///////AAAAAAAAP///////AAAAAAAA////////AAAAAAAD//4B////AAAD//////wA////AAAP//////gAf///AAAP//////AAP///AAAf//////AAP///AAAf//////AAP///AAAf//////AAP///AAAf//////AAP///AAAf//////AAP///AAAf//////AAP///AAAf/AAAf/AAP///AAAf+AAAP/AAP///AAAf8AAAP/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf+AAAP/AAP///AAAf/AAAf/AAP///AAAf/4AD//AAP///AAAf//////AAP///AAAf//////AAP///AAAf//////AAP///AAAf//////AAP///AAAf//////AAP///AAAP//////AAP///AAAP//////gAf///AAAD//////wA////AAAAf/////4B////AAAAAAAA////////AAAAAAAAP///////AAAAAAAAH///////AAAAAAAAD///////AAAAAAAAB///////AAAAAAAAA///////AAAAAAAAAf/////+AAAAAAAAAP/////8AAAAAAAAAH/////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/////8AAH//+AAAf/////+AAP///AAAf/////+AAP///AAAf//////AAP///AAAf//////AAP///AAAf//////AAP///AAAf//////AAP///AAAf//////AAP///AAAf/AAA//AAP///AAAf+AAAP/AAP///AAAf8AAAP/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAH/AAP///AAAf8AAAP/gAf///AAAf+AAAP/gAf///AAAf/AAAf/wA////AAAf////////////AAAf////////////AAAf////////////AAAf////////////AAAf////////////AAAf////////////AAAP///////////+AAAH///////////+AAAD///////////4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH///AAD///gAAAAAH///gAH///gAAAAAP///gAH///gAAAAAP///gAH///gAAAAAP///gAH///gAAAAAP///gAH///gAAAAAP///gAH///gAAAAAP///gAH///gAAAAAP///gAH///gAAAAAP///gAH///gAAAAAP///gAH///gAAAAAP///gAH///gAAAAAP///gAH///gAAAAAP///gAH///gAAAAAP///gAH///gAAAAAP///gAH///gAAAAAP///gAH///gAAAAAH///AAH///gAAAAAH///AAD///AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
  var scale = 1; // size multiplier for this font
  g.setFontCustom(font, 46, widths, 96+(scale<<8)+(1<<16));
};

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
  g.reset();  
  // work out locale-friendly date/time
  var date = new Date();
  var timeStr = require("locale").time(date,1);
  var hh = timeStr.substr(0,2);
  // Kludge to add leading zeros to hours - if recoding please implement leading zeros:
  // Leading zeroes are an integral part of the design.
  // If the hour is single digit the first character of the string will be 
  // space, in which case a zero is added. As there is no space in the font, 
  // spaces are ignored.
  if (hh.substr(0,1) == ' ') {
    hh = '0' + hh;
  }
  var mm = timeStr.substr(-3);
  var dayName = require("locale").dow(new Date(), 1);
  var longDateStr = date.getDate() + ' ' + require("locale").month(new Date(), 1);  
  // draw time
  g.setFont("BDGemini");
  g.clearRect(0,24,175,175); // clear the background
  g.drawString(hh,0,24);
  g.drawString(mm,49,98);
  // draw date
  g.setFont("6x8",2);
  g.drawString(dayName,106,35);
  g.drawString(longDateStr,106,51);
  g.drawString(date.getFullYear(),106,67);
  // queue draw in one minte
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