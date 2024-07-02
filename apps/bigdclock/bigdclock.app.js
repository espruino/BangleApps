// <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@600&display=swap" rel="stylesheet">

Graphics.prototype.setFontOpenSans = function(scale) {
  // Actual height 48 (50 - 3)
  this.setFontCustom(
    atob('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+AAAAAAAAAP8AAAAAAAAB/wAAAAAAAAH/gAAAAAAAAf+AAAAAAAAB/4AAAAAAAAH/gAAAAAAAAf8AAAAAAAAA/wAAAAAAAAB+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAPAAAAAAAAAH8AAAAAAAAD/wAAAAAAAA//AAAAAAAAf/8AAAAAAAP//wAAAAAAH///AAAAAAB///4AAAAAA///8AAAAAAf///AAAAAAH///gAAAAAD///wAAAAAB///4AAAAAAf//+AAAAAAP///AAAAAAH///gAAAAAA///4AAAAAAD//8AAAAAAAP/+AAAAAAAA//gAAAAAAAD/wAAAAAAAAP4AAAAAAAAA8AAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/gAAAAAAAP///AAAAAAH////gAAAAD/////gAAAAf/////gAAAH//////AAAA//////+AAAD//////8AAAf//////4AAD//4AH//gAAP/gAAAf/AAA/4AAAAf8AAH/AAAAA/4AAf4AAAAB/gAB/AAAAAD+AAH8AAAAAP4AAfwAAAAA/gAB/AAAAAD+AAH8AAAAAP4AAf4AAAAB/gAB/gAAAAH+AAD/gAAAB/wAAP/gAAAf/AAA//4AAf/8AAB///////gAAD//////8AAAH//////wAAAP/////+AAAAf/////wAAAA/////8AAAAAf////AAAAAAf///gAAAAAAB//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAAAAAAAAAHgAAAAAAAAA/AAAAAAAAAH+AAAAAAAAA/4AAAAAAAAD/AAAAAAAAAf8AAAAAAAAD/gAAAAAAAAf8AAAAAAAAB/gAAAAAAAAP8AAAAAAAAB/wAAAAAAAAP///////AAA///////8AAD///////wAAP///////AAA///////8AAD///////wAAP///////AAA///////8AAD///////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAD8AAAOAAAAAfwAAB+AAAAD/AAAH8AAAAf8AAA/wAAAH/wAAH/AAAA//AAAf4AAAH/8AAD/gAAA//wAAP8AAAH//AAA/gAAA//8AAD+AAAH//wAAf4AAA/9/AAB/AAAH/n8AAH8AAA/8fwAAfwAAH/h/AAB/AAA/8H8AAH8AAH/gfwAAfwAA/8B/AAB/gAH/gH8AAH+AB/8AfwAAP8Af/gB/AAA////8AH8AAD////gAfwAAH///8AB/AAAf///gAH8AAA///8AAfwAAB///gAB/AAAD//4AAH8AAAH/+AAAfwAAAH/gAAB/AAAAAAAAAH8AAAAAAAAAfwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwAAAYAAAAB/gAAB4AAAAD+AAAPwAAAAP4AAA/gAAAAfwAAH+AAAAB/AAAf4AAAAH8AAD/AB+AAfwAAP8AH4AA/gAA/gAfgAD+AAH+AB+AAP4AAfwAH4AA/gAB/AAfgAD+AAH8AB+AAP4AAfwAH4AA/gAB/AA/wAD+AAH8AD/AAP4AAfwAP8AA/gAB/AA/wAD+AAH+AH/AAf4AAf4Af+AB/AAA/wH/8AP8AAD////4D/wAAP//+////AAAf//7///4AAB///P///gAAD//8f//8AAAP//h///gAAAf/8D//+AAAA//gH//wAAAA/4AP/8AAAAAAAAP/AAAAAAAAAHgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAAAAA/wAAAAAAAAH/AAAAAAAAB/8AAAAAAAAP/wAAAAAAAD//AAAAAAAAf/8AAAAAAAH//wAAAAAAA/+/AAAAAAAP/z8AAAAAAB/8PwAAAAAAf/g/AAAAAAD/4D8AAAAAAf/APwAAAAAH/4A/AAAAAA/+AD8AAAAAP/wAPwAAAAB/8AA/AAAAAf/gAD8AAAAD/4AAPwAAAA//AAA/AAAAD///////wAAP///////AAA///////8AAD///////wAAP///////AAA///////8AAD///////wAAP///////AAAAAAAA/AAAAAAAAAD8AAAAAAAAAPwAAAAAAAAA/AAAAAAAAAD8AAAAAAAAAPwAAAAAAAAA/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwAAAAAAQAB/gAAAD//gAD+AAA////AAP8AAD///8AAfwAAP///wAB/AAA////AAH8AAD///8AAf4AAP///wAA/gAA////AAD+AAD/+H8AAP4AAP4AfwAA/gAA/gB+AAD+AAD+AH4AAP4AAP4AfwAA/gAA/gB/AAD+AAD+AH8AAP4AAP4AfwAB/gAA/gB/AAH+AAD+AH+AA/wAAP4Af8AD/AAA/gB/4A/8AAD+AD////gAAP4AP///+AAA/gAf///wAAD+AB////AAAP4AD///4AAA/gAH///AAAAAAAP//4AAAAAAAf/+AAAAAAAAf/gAAAAAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//AAAAAAAf///gAAAAAP////gAAAAD/////gAAAAf/////AAAAD/////+AAAA//////8AAAD//////4AAAf/8/4//gAAD/8H+Af/AAAP/AfgAf8AAB/wD+AA/wAAH+APwAB/gAA/wB/AAD+AAD+AH4AAP4AAP4AfgAA/gAB/gB+AAD+AAH8AH4AAP4AAfwAfgAA/gAB/AB/AAH+AAH8AH8AAf4AAfwAf4AD/AAB/AB/4A/8AAH8AH////wAAfwAP///+AAB/AA////4AAH8AB////AAAfwAD///4AAA/AAH///AAAAAAAP//4AAAAAAAP/+AAAAAAAAP/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP4AAAAAAAAA/gAAAAAAAAD+AAAAAAAAAP4AAAAAAAAA/gAAAAAAAAD+AAAAAAAAAP4AAAAADAAA/gAAAAB8AAD+AAAAAfwAAP4AAAAH/AAA/gAAAB/8AAD+AAAAf/wAAP4AAAP//AAA/gAAD//8AAD+AAA///wAAP4AAP//8AAA/gAD///AAAD+AB///wAAAP4Af//4AAAA/gH//+AAAAD+B///gAAAAP4f//wAAAAA/v//8AAAAAD////AAAAAAP///wAAAAAA///4AAAAAAD//+AAAAAAAP//gAAAAAAA//wAAAAAAAD/8AAAAAAAAP/AAAAAAAAA/wAAAAAAAAD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAH/wAAAAH8AB//gAAAB/8AP//gAAAf/8B//+AAAB//4P//8AAAP//w///4AAB///n///gAAH//+////AAA/////gf8AAD/h//4AfwAAP4B//AB/gAB/gD/4AD+AAH8AP/gAP4AAfwAf8AA/gAB/AA/wAB+AAH4AD/AAH4AAfwAP8AAfgAB/AB/4AD+AAH8AH/gAP4AAfwA//AA/gAA/gH/+AH+AAD/h//8AfwAAP//+/4D/AAAf//7///8AAB///H///gAAD//4P//+AAAP//g///wAAAf/8B//+AAAA//gD//wAAAA/4AH/+AAAAAAAAH/wAAAAAAAAH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8AAAAAAAAD//AAAAAAAA///AAAAAAAH//+AAPwAAB///8AA/gAAP///4AD+AAA////wAP4AAH////AA/gAAf///8AD+AAD/4B/4AP4AAP+AB/gA/gAA/gAD+AD+AAH+AAP4AP4AAfwAAfgA/gAB/AAB+AD+AAH8AAH4AP4AAfwAAfgB/AAB/AAB+AH8AAH8AAH4A/wAAf4AA/AH+AAA/gAD8A/4AAD/gAfwH/gAAP/AD+B/8AAAf/g/w//gAAB//////+AAAD//////wAAAH/////+AAAAP/////wAAAAf////8AAAAA/////AAAAAA////wAAAAAAf//4AAAAAAAH/gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+AAAfgAAAAP8AAD/AAAAA/4AAf8AAAAH/gAB/4AAAAf+AAH/gAAAB/4AAf+AAAAH/gAB/4AAAAf+AAH/AAAAA/wAAP8AAAAB+AAAfgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='),
    46,
    atob("EhklJSUlJSUlJSUlEg=="),
    64+(scale<<8)+(1<<16)
  );
};

var drawTimeout;
var lastBattCheck = 0;
var batteryUsedWidth = 0;

function queueDraw(millis_now) {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function () {
        drawTimeout = undefined;
        draw();
    }, 60000 - (millis_now % 60000));
}

function draw() {
    var date = new Date();
    var h = date.getHours(),
        m = date.getMinutes();
    var d = date.getDate();
    var is12Hour = (require("Storage").readJSON("setting.json", 1) || {})["12hour"];
    var dow = require("date_utils").dows(0,1)[date.getDay()];

    if ((date.getTime() >= lastBattCheck + 15*60000) || Bangle.isCharging()) {
      lastBattCheck = date.getTime();
      batteryUsedWidth = E.getBattery();
      batteryUsedWidth += batteryUsedWidth/2;
    }

    g.reset();
    g.clear();

    g.setFontOpenSans();
    g.setFontAlign(0, -1);
    if (is12Hour) {
      if (h > 12) h -= 12;
      if (h == 0) h = 12;
      g.drawString(h + ":" + ("0"+m).substr(-2), g.getWidth() / 2, 30);
    } else {
      g.drawString(("0"+h).substr(-2) + ":" + ("0"+m).substr(-2), g.getWidth() / 2, 30);
    }
    g.setFontAlign(1, -1);
    g.drawString(d, g.getWidth() -6, 98);
    g.setFont('Vector', 52);
    g.setFontAlign(-1, -1);
    g.drawString(dow.slice(0,2).toUpperCase(), 6, 103);

    g.fillRect(9,159,166,171);
    g.fillRect(167,163,170,167);
    if (Bangle.isCharging()) {
      g.setColor(1,1,0);
      g.fillRect(12,162,12+batteryUsedWidth,168);
    } else {
      g.setColor(1,0,0);
      g.fillRect(12,162,57,168);
      g.setColor(1,1,0);
      g.fillRect(58,162,72,168);
      g.setColor(0,1,0);
      g.fillRect(73,162,162,168);
    }
    if (batteryUsedWidth < 150) {
      g.setColor(g.theme.bg);
      g.fillRect(12+batteryUsedWidth+1,162,162,168);
    }

    if (Bangle.isCharging()) {
      g.setColor(1,1,0);
    } else if (batteryUsedWidth <= 45) {
      g.setColor(1,0,0);
    } else if (batteryUsedWidth <= 60) {
      g.setColor(1,1,0);
    } else {
      g.setColor(0, 1, 0);
    }
    g.fillRect(0, 90, g.getWidth(), 94);

    // widget redraw
    Bangle.drawWidgets();
    queueDraw(date.getTime());
}

Bangle.on('lcdPower', on => {
    if (on) {
        draw(); // draw immediately, queue redraw
    } else { // stop draw timer
        if (drawTimeout) clearTimeout(drawTimeout);
        drawTimeout = undefined;
    }
});

Bangle.on('charging', (charging) => {
    draw();
});

Bangle.setUI("clock");

Bangle.loadWidgets();
draw();

