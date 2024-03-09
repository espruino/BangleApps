/************************************************
 * Happy Clock
 */


const storage = require('Storage');
const widget_utils = require("widget_utils");


/************************************************
 * Settings
 */
const SETTINGS_FILE = "happyclk.setting.json";

let settings = {
    color: "Dark",
    screen: "Dynamic"
};

let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
for (const key in saved_settings) {
    settings[key] = saved_settings[key];
}

var color_map = {
    "Dark":{
        fg: "#fff",
        bg: "#000",
        eye: "#fff",
        eyePupils: "#000"
    },
    "Black":{
        fg: "#fff",
        bg: "#000",
        eye: "#000",
        eyePupils: "#fff"
    },
    "White":{
        fg: "#000",
        bg: "#fff",
        eye: "#fff",
        eyePupils: "#000"
    },
    "Blue":{
        fg: "#fff",
        bg: "#00f",
        eye: "#fff",
        eyePupils: "#000"
    },
    "Green":{
        fg: "#000",
        bg: "#0f0",
        eye: "#fff",
        eyePupils: "#000"
    },
    "Red":{
        fg: "#fff",
        bg: "#f00",
        eye: "#fff",
        eyePupils: "#000"
    },
    "Purple":{
        fg: "#fff",
        bg: "#f0f",
        eye: "#fff",
        eyePupils: "#000"
    },
    "Yellow":{
        fg: "#000",
        bg: "#ff0",
        eye: "#fff",
        eyePupils: "#000"
    }
};
var colors = color_map[settings.color];

/************************************************
 * Globals
 */
var W = g.getWidth();
var H = g.getHeight();
var drawTimeout;


/*
 * HELPER
 */

let isFullscreen = function() {
    var s = settings.screen.toLowerCase();
    if(s == "dynamic"){
      return Bangle.isLocked();
    } else {
      return s == "full";
    }
  };


// Based on the great multi clock from https://github.com/jeffmer/BangleApps/
Graphics.prototype.drawPupils = function(cx, cy, r1, dx, dy, angle) {
    angle = angle % 360;
    var theta=angle*Math.PI/180;
    var x = parseInt(cx+r1*Math.sin(theta)*1.2);
    var y = parseInt(cy-r1*Math.cos(theta)*1.2);

    g.setColor(g.theme.fg);
    g.fillCircle(cx, cy, 32);

    g.setColor(colors.eye);
    g.fillCircle(cx, cy, 27);
    g.fillCircle(cx+dx, cy+dy, 28);

    g.setColor(colors.eyePupils);
    g.fillCircle(x, y, 8);
    g.fillCircle(x+1, y, 8);
};

let quadraticCurve = function(t, p0x, p0y, p1x, p1y, p2x, p2y){
    var t2 = t * t;
    var oneMinT = 1 - t;
    var oneMinT2 = oneMinT * oneMinT;
    return {
      x: p0x * oneMinT2 + 2 * p1x * t * oneMinT + p2x *t2,
      y: p0y * oneMinT2 + 2 * p1y * t * oneMinT + p2y *t2
    };
}

// Thanks to user stephaneAG from the Espruino forum!
// https://forum.espruino.com/conversations/330154/#comment14593349
let drawCurve = function(x1, y1, x2, y2, x3, y3){
    var p0 = { x: x1, y: y1};
    var p1 = { x: x2, y: y2};
    var p2 = { x: x3, y: y3};
    var time = 0;
    var stepping = 0.1; // Stepping defines the speed.

    for(var y = 0; y < 8; y++){
        var pathPts = [];
        for(time = 0; time <= 1; time+= stepping){
        var pos = quadraticCurve(time, p0.x, p0.y, p1.x, p1.y, p2.x, p2.y);
        pathPts.push(pos.x, pos.y+y);
        }
        g.drawPoly(pathPts, false);
    }
    g.flip();
}


/*
 * Draw the clock
 */
let drawEyes = function(){
    // And now the analog time
    var drawHour = g.drawPupils.bind(g,55,70,12,1,0);
    var drawMinute = g.drawPupils.bind(g,125,70,12,0,1);

    g.setFontAlign(0,0);

    // Compute angles
    var date = new Date();
    var m = parseInt(date.getMinutes() * 360 / 60);
    var h = date.getHours();
    h = h > 12 ? h-12 : h;
    h += date.getMinutes()/60.0;
    h = parseInt(h*360/12);

    // Draw minute and hour fg
    g.setColor(g.theme.fg);
    drawHour(h);
    drawMinute(m);
}


let drawSmile = function(isLocked){
    g.setColor(colors.fg);
    var y = 120;
    var o = parseInt(E.getBattery()*0.8);

    // Draw smile
    drawCurve(30, y, W/2+12, y+o, W-40, y);

    // And the two "mouth lines"
    var reachedSteps = Bangle.getHealthStatus("day").steps >= 10000;
    for(var i=0; i < 6; i++){
        if(isLocked) g.drawLine(25, y+6+i, 35, y-5+i);
        if(reachedSteps) g.drawLine(W-35, y+5+i, W-45, y-5+i);
    }
}

let drawEyeBrow = function(){
    if(!isFullscreen()) return;

    g.setColor(colors.fg);
    var w = 6;
    for(var i = 0; i < w; i++){
        g.drawLine(25, 25+i, 70, 15+i%3);
        g.drawLine(W-25, 28+i%3, W-68, 19+i);
    }
}


let drawWidgets = function(){
    if (isFullscreen()) {
        widget_utils.hide();
    } else {
        Bangle.drawWidgets();
    }
}



let draw = function(){
    // Queue draw in one minute
    queueDraw();

    var isLocked = Bangle.isLocked();
    drawHelper(isLocked);
}

let drawHelper = function(isLocked){
    g.setColor(g.theme.bg);

    g.fillRect(0, isFullscreen() ? 0 : 24, W, H);
    g.setColor(g.theme.fg);

    drawEyes();
    drawEyeBrow();
    drawSmile(isLocked);

    drawWidgets();
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

Bangle.on('lock', function(isLocked) {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;

    if(!isLocked && settings.screen.toLowerCase() == "dynamic"){
        // If we have to show the widgets again, we load it from our
        // cache and not through Bangle.loadWidgets as its much faster!
        widget_utils.show();
    }

    draw(isLocked);
});


/*
 * Some helpers
 */
let queueDraw = function() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      draw();
    }, 60000 - (Date.now() % 60000));
}


/*
 * Lets start widgets, listen for btn etc.
 */
// Show launcher when middle button pressed
Bangle.setUI("clock");
Bangle.loadWidgets();

// Clear the screen once, at startup and draw clock
g.setTheme({bg:colors.bg,fg:colors.fg,dark:false});
draw();

// After drawing the watch face, we can draw the widgets
// Bangle.drawWidgets();
