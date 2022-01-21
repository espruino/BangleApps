const locale = require('locale');


/*
 * Set some important constants such as width, height and center
 */
var W = g.getWidth(),R=W/2;
var H = g.getHeight();
var cx = W/2;
var cy = H/2;
var drawTimeout;

var stepsImg =  {
    width : 32, height : 32, bpp : 1,
    transparent : 0,
    buffer : require("heatshrink").decompress(atob("gPAAYMD+ADBg4DD/ADG/gDBh4DCA4YDBg/AAYMP8ADBj4DIgf8n4DB/ADBgIDDwADBgE8AYQTCgH+AYV+n5RBAYkfAYM8g+AIIMwMoU+AYV/AY1+AY08AYU4gAA="))
};

var chargeImg = {
    width : 32, height : 32, bpp : 1,
    transparent : 0,
    buffer : require("heatshrink").decompress(atob("AAMMAYUeAYUzAYVjAYXGAQMPxwDBj8cAYM73ADBuPwEAPg8E+gHAuFzgOAnHjAYMd40BwOPxkBwfHjEBw1j2ADBsPgBYPAAYIYBsEDFoPgg+AgPAg/AgeAhgJBgEYuf+AYM//BhBnAYBh1wKQXAAYM5wADBBQQoBAYQOCgA="))
};


/*
 * Based on the great multi clock from https://github.com/jeffmer/BangleApps/
 */
Graphics.prototype.drawRotRect = function(w, r1, r2, angle) {
    angle = angle % 360;
    var w2=w/2, h=r2-r1, theta=angle*Math.PI/180;
    return this.fillPoly(this.transformVertices([-w2,0,-w2,-h,w2,-h,w2,0],
        {x:cx+r1*Math.sin(theta),y:cy-r1*Math.cos(theta),rotate:theta}));
};

// The following font was used:
// <link href="https://fonts.googleapis.com/css2?family=Staatliches&display=swap" rel="stylesheet">
Graphics.prototype.setTimeFont = function(scale) {
    // Actual height 26 (26 - 1)
    this.setFontCustom(atob("AAAAAAAAAD4AAAAD4AAAAD4AAAAD4AAAAB4AAAAAAAAAAAAAAAAD4AAAD/4AAD//4AD///4Af///gAf//gAAf/gAAAfwAAAAQAAAAAAAAAAAAAAAAAB//+AAH///gAP///wAP///wAfwAP4AfAAD4AfAAD4AfAAD4AfAAD4AfAAD4AfgAH4AP///wAP///wAH///gAB//+AAAP/wAAAAAAAAAAAAAAf///4Af///4Af///4Af///4Af///4AAAAAAAAAAAAAAAAAAAB+AD4AH+AP4AP+Af4AP+B/4AfwD/4AfAH/4AfAf74AfA/z4AfD/j4Af/+D4AP/8D4AH/wD4AD/gD4AB+AD4AAAAAAAB8B8AAD8B/AAH8B/gAP8B/wAf8A/4AfAAD4AfB8D4AfB8D4AfD8D4Af3/P4AP///wAP///wAH///gAB/H+AAAAAAAAAAAAAAAAB+AAAAP+AAAA/+AAAD/+AAAP/+AAA/8+AAD/w+AAf/A+AAf///4Af///4Af///4Af///4AD///4AAAA+AAAAA+AAAAAAAAAAAYAAf/8/AAf/8/gAf/8/wAf/8/wAfD4H4AfD4D4AfD4D4AfD4D4AfD8H4AfD//4AfB//wAfA//gAeAf/AAAAH8AAAAAAAAAAAAAAB//+AAD///AAH///gAP///wAf///4AfD4D4AfD4D4AfD4D4AfD4D4Afz+P4AP5//wAP5//wAH4//gAB4P+AAAAAAAAAAAAAAfAAAAAfAAAAAfAAAIAfAAB4AfAAP4AfAB/4AfAP/4AfA//4AfH//AAf//4AAf/+AAAf/wAAAf+AAAAfwAAAAAAAAAAAAAAAAB8P+AAH///gAP///wAP///wAf/+P4AfH4D4AfD4D4AfD4D4Afn8D4Af///4AP///wAH///gAD/f/AAA4P+AAAAAAAAAAAQAAB/w+AAH/4/gAP/8/wAP/+/wAfh+P4AfA/D4AfAfD4AfAfD4AfA+H4Af///4AP///wAH///gAD///AAA//8AAAAAAAAAAAAAAAB8D4AAB8D4AAB8D4AAB8D4AAA8B4AAAAAAA=="), 46, atob("BwsSCBAQEBAQEBAQBw=="), 36+(scale<<8)+(1<<16));
    return this;
};

Graphics.prototype.setNormalFont = function(scale)  {
    // Actual height 20 (20 - 1)
    this.setFontCustom(atob("AAAAAAAAAAAAAAAAAAAAf/nAf/3Af/nAAAAAAAAAfgAAfgAAfAAAAAAAfgAAfgAAfgAAAAAADMAAHOAAf/gAf/gADMAADMAAf/gAf/gAf/gADMAAAAAAAggAD54AH98AfefAeOPAeHPAH38AHz8ABxwAPwAAf4BAYYHAcYfAf4/APz8AAPwAA/gAB+AAH5+Afj/AeDnAcDDAQD/AAB+AAAYAH38AP/+Af//Ae+HAccHAccHAcf/Acf/AAf/AAcAAAcAAAAAAAAAAfgAAfgAAfgAAAAAAAAAAH/8AP/+Af//AeAPAcAHAcAHAAAAAAAAAcAHAcAHAeAPAf//AP/+AH/8AAAAAAAAANgAAPgAAfwAAfwAAPgAANgAAAAAAAMAAAMAAAMAAAOAAD/4AD/4AAMAAAMAAAMAAAMAAAAAAAAAAAAHYAAH4AAHwAAAAAAAAAOAAAOAAAOAAAOAAAOAAAAAAAAAAAAHAAAHAAAHAAAAAAADAAB/AB//Af/+Af/AAfAAAAAAAAAAAH/8AP/+Af//AeAPAcAHAcAHAeAPAf//AP/+AH/8AB/wAAAAAf//Af//Af//AAAAAHgPAPgfAfh/AeD/AcH3AcfnAf/HAP8HAH4HAAAAAAAAAHg8APg+Afg/AeOPAcOHAceHAf//AP/+AH78AAAwAAAAAAD4AAP4AA/4AD+4AP44Af//Af//Af//AAA4AAA4AAAAAAAAAf+8Af++Af+/AccPAccHAcePAcf/AcP+AcH8AAAAAH/8AP/+Af//AeePAccHAccHAff/APv+AHn8ABBwAYAAAcAAAcABAcAPAcB/AcP/Ac/8Af/gAf8AAfgAAAAAAAAAAH38AP/+Af//Ae+HAccHAe+PAf//AP/+AH38AAAAAAAAAH88AP++Af/fAcPPAcHHAePPAf//AP/+AH/8AAAAAAAAAAOHAAOHAAOHAAAAAAAAAAOHYAOH4AOHwAAAAAEAAAOAAAfAAA/AAA7gABxwADg4ADA4AAAQAAAAAAAAAAZgAAZgAAZgAAZgAAZgAAZgAAZgAAZgAAZgAAZgAAAAADAYADg4ABxwAB7gAA/gAAfAAAOAAAEAAAAAAHwAAPwAAfwAAeD3AcP3Aef3Af+AAP8AAH4AAAAAAD/4AP/+Af//AeAPAc/HAc/nAc/3AeB3Af/3AP/nAH/PAAAHAAAAAAA/AA//Af//Af/8AfwcAf/8Af//AA//AAA/AAAAAAAAAf//Af//Af//AcOHAcOHAcfPAf//AP/+AH78ABgwAAAAAH/8AP/+Af//AeAPAcAHAcAHAfg/APg+AHg8ABgwAAAAAf//Af//Af//AcAHAcAHAcAHAf//AP/+AP/8AD/4AAAAAf//Af//Af//AcOHAcOHAcOHAcOHAcOHAAAAAAAAAf//Af//Af//AcOAAcOAAcOAAcOAAcOAAAAAAAAAAH/8AP/+Af//AeAPAcHHAcHHAfn/APn+AHn8ABnwAf//Af//Af//Af//AAOAAAOAAAOAAf//Af//Af//AAAAAAAAAf//Af//Af//AAAAAAA8AAA+AAA/AAAHAAAHAAAPAf//Af/+Af/8AAAAAAAAAf//Af//Af//AA+AAD/gAP/4Afj+AeA/AYAPAQADAAAAAf//Af//Af//AAAHAAAHAAAHAAAHAAAHAAAAAAAAAf//Af//Af//AfgAAHwAAD4AAPwAAfgAAf//Af//Af//AAAAAAAAAf//Af//Af//AH+AAA/wAAP8Af//Af//Af//AAAAAB/wAH/8AP/+Af//AcAHAcAHAeAPAf//AP/+AH/8AAAAAAAAAf//Af//Af//AcHAAcHAAcPAAf/AAP+AAP8AADwAAB/wAH/8AP/+Af//AcAHAcAHAeAPAf//AP//gH//gAABAAAAAf//Af//Af//AcOAAcOAAcOAAefgAf//AP//AH5/AAAAAH48AP8+Af8/AeePAcPHAcPPAf3/APz+AHx8AAAAAcAAAcAAAcAAAf//Af//Af//AcAAAcAAAcAAAAAAAf/wAf/8Af/+Af//AAAHAAAHAAAPAf//Af/+Af/8AAAAAfAAAf+AAf/8AB//AAD/AA//Af/+Af/AAfgAAQAAAcAAAf8AAf/8AP//AAH/AD//Af/+Af/AAf//AB//AAP/Af//Af/4Af4AAYAAAYADAfAfAf7/AP/+AB/gAH/8Af//Afh/AcAHAAAAAcAAAfgAAf8AAH//AA//AH//Af8AAfgAAcAAAAAAAcAfAcB/AcH/Acf/Ad/nAf+HAf4HAfgHAeAHAAAAAAAAAf//Af//Af//AcAHAcAHAcAHAcAHAcAAAf4AAf/4AH//AAP/AAAPAAAAAcAHAcAHAcAHAcAHAf//Af//Af//AAAAA"), 32, atob("BAUJCwkQDAUICAgLBQcFBwwFCwsLCgsLCwsFBQoLCgoNCgsLCwoKCwsFCgsKDQsLCwsMCgoLCg8KCgoIBwg="), 24+(scale<<8)+(1<<16));
    return this;
};



function getSteps() {
    var steps = 0;
    let health;
    try {
        health = require("health");
    } catch(ex) {
        return steps;
    }

    health.readDay(new Date(), h=>steps+=h.steps);
    return steps;
}


function drawBackground() {
    g.setFontAlign(0,0,0);
    g.setNormalFont();

    g.setColor(g.theme.fg);
    for (let a=0;a<360;a+=6){
        if (a % 30 == 0 || (a > 345 || a < 15) || (a > 90-15 && a < 90+15) || (a > 180-15 && a < 180+15) || (a > 270-15 && a < 270+15)) {
            continue;
        }

        var theta=a*Math.PI/180;
        g.drawLine(cx,cy,cx+125*Math.sin(theta),cy-125*Math.cos(theta));
    }

    g.clearRect(10,10,W-10,H-10);
    for (let a=0;a<360;a+=30){
        if(a == 0 || a == 90 || a == 180 || a == 270){
            continue;
        }
        g.drawRotRect(6,R-80,125,a);
    }

    g.clearRect(16,16,W-16,H-16);

    var topStr = "B-JS";
    if(Bangle.isLocked()){
        topStr = "LOCK";
    }
    g.drawString(topStr, cx/2, cy/2);
}



function drawData() {
    g.setFontAlign(0,0,0);
    g.setNormalFont();

    // Set hand functions
    var drawBatteryHand = g.drawRotRect.bind(g,6,12,R-38);
    var drawStepsHand = g.drawRotRect.bind(g,5,12,R-24);

    // Draw weather if possible
    g.setColor(g.theme.fg);
    var dataStr = "";
    try {
        weather = require('weather').get();
        dataStr = locale.temp(Math.round(weather.temp-273.15));
    } catch(ex) {
        // NOP
    }
    g.setFontAlign(1,0,0);
    g.drawString(dataStr, cx+cx/2+15, cy+cy/2+10);

    // Draw battery hand
    g.setFontAlign(0,0,0);
    var bat = E.getBattery();
    var maxBat = 100;
    drawBatteryHand(parseInt(bat*360/maxBat));

    // Draw step hand and icon
    var steps = getSteps();
    var maxSteps = 10000;
    var stepsColor = steps > 10000 ? "#00ff00" : "#ff0000";

    var img = stepsImg;
    var imgColor = stepsColor;
    if(Bangle.isCharging()){
        img = chargeImg;
        imgColor = "#ffffff";
    }
    g.setColor(imgColor);
    g.drawImage(img, cx/2 - stepsImg.width/2 - 5, cy+cy/2 - stepsImg.height/2+5);

    g.setColor(stepsColor);
    drawStepsHand(parseInt(steps*360/maxSteps));

    // Draw circle
    g.setColor(g.theme.fg);
    g.fillCircle(cx, cy, 7);
    g.setColor(g.theme.bg);
    g.fillCircle(cx, cy, 4);
}


function drawTime(){
    g.setTimeFont();
    g.setFontAlign(0,0,0);
    g.setColor(g.theme.fg);

    var currentDate = new Date();
    var posX = 14;
    var posY = 14;

    // Hour
    var h = currentDate.getHours();
    var h1 = parseInt(h / 10);
    var h2 = h < 10 ? h : h - h1*10;
    g.drawString(h1, cx, posY+8);
    g.drawString(h2, W-posX, cy+5);

    // Minutes
    var m = currentDate.getMinutes();
    var m1 = parseInt(m / 10);
    var m2 = m < 10 ? m : m - m1*10;
    g.drawString(m2, cx, H-posY);
    g.drawString(m1, posX-2, cy+5);
}


function drawDate(){
    var currentDate = new Date();

    // Date
    g.setFontAlign(1,0,0);
    g.setNormalFont();
    g.setColor(g.theme.fg);
    var dayStr = locale.dow(currentDate, true).toUpperCase();
    g.drawString(dayStr, cx+cx/2+15, cy/2);
    g.drawString(currentDate.getDate(), cx+cx/2+15, cy/2+22);
}

function draw(){
  // Clear watch face
  g.reset();
  g.clearRect(0, 0, g.getWidth(), g.getHeight());

  // Draw again
  g.setColor(1,1,1);

  drawBackground();
  drawDate();
  drawData();
  drawTime();

  // Queue draw in one minute
  queueDraw();
}


/*
 * Listeners
 */
Bangle.on('lcdPower',on=>{
  if (on) {
    draw();
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
});


function queueDraw() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      draw();
    }, 60000 - (Date.now() % 60000));
}


Bangle.on('charging',function(charging) {
    draw();
});

Bangle.on('lock', function(isLocked) {
    draw();
});


/*
 * Lets start widgets, listen for btn etc.
 */
// Show launcher when middle button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();
/*
 * we are not drawing the widgets as we are taking over the whole screen
 * so we will blank out the draw() functions of each widget and change the
 * area to the top bar doesn't get cleared.
 */
for (let wd of WIDGETS) {wd.draw=()=>{};wd.area="";}

// Clear the screen once, at startup and draw clock
// g.setTheme({bg:"#fff",fg:"#000",dark:false}).clear();
draw();

// After drawing the watch face, we can draw the widgets
// Bangle.drawWidgets();
