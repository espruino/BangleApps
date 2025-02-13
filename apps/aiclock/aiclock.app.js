/************************************************
 * AI Clock
 */
 const clock_info = require("clock_info");



 /************************************************
 * Assets
 */
require("Font7x11Numeric7Seg").add(Graphics);
Graphics.prototype.setFontGochiHand = function(scale) {
    // Actual height 27 (29 - 3)
    this.setFontCustom(
      atob('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAA8AAAAADwAAAAAPAAAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfgAAAA/+AAAB//4AAH///gAH///gAAf//AAAB/+AAAAH8AAAAAAAAAAAAAAAAAAAAH8AAAAB/8AAAAP/4AAAB//wAAAPx/AAAB8B+AAAHgD4AAA+AHgAADwAeAAAPAB4AAA8AHgAAD4AeAAAPgB4AAAeAPgAAB8A8AAAH4HwAAAP/+AAAAf/wAAAA/+AAAAB/wAAAAB8AAAAAAAAAAADgAAAAAfAAAAAB4AAAAAPAAAAAB8AAAAAHgAAAAA8AAAAADwAAAAAf4AAAAB//8AAAD//4AAAH//gAAAD/+AAAAAHwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4AHgAAHgA+AAA/AD4AAD4AfgAAfAD+AAB4Af4AAHgD/gAAeAfeAAB4D54AAHw/HgAAf/4fAAA//B8AAD/4DwAAH+APAAAHgA8AAAAADwAAAAAOAAAAAAAAABgAAAAAPAAAAAB8AAAAAHwAYAAAeAD4AAD4APwAAPA4fgAA8Hw+AADwfB4AAPh4HwAA+HgPAAB/+A8AAH/4DwAAP/weAAAf/j4AAAc//gAAAB/8AAAAD/gAAAAD8AAAAAAAAAAAAAAAAAADAAAAAA+AAAAAP4AAAAB/wAAAAP/AAAAD+8AAAAfzwAAAf8HAAAB/gcAAAH/hwAAAf//gAAA//+AAAAf//gAAAP//gAAAD/+AAAAB/4AAAAH/AAAAAeAAAAAAgAAAAAAAAAAAAcAAAB8H8AAAP4f4AAA/x/wAAD/H/gAAf+A+AAB74B4AAHnwHgAAefAfAAB58A8AAHj4DwAAePgPAAB4fA8AAHh+HgAAeD8+AAB4P/4AAHgf/AAAeA/4AAAAA+AAAAAAAAAAAAAAAAAAHgAAAAD/wAAAA//gAAAH//AAAA//+AAAD4H8AAAfA/wAAB4D/AAAHgP+AAAeB54AAB4HngAAHweeAAAfB54AAA4HngAAAAeeAAAAB/4AAAAH/AAAAAP4AAAAAfAAADwAAAAAPAAAAAA8HgAAADweAAAAPB4AAAA8HgAAADweAAAAPh4AAAA+HgAAAB4eAAAAHx4AAAAf//8AAA///wAAD//+AAAH//4AAAAeAAAAAB4AAAAAHgAAAAAeAAAAAB4AAAAAHgAAAAAAAAAAAAAAAAAAD+AAAA+f+AAAH//8AAA///wAAH/4fgAAePgeAAB4+B4AAHj4HwAAePgPAAB4+A8AAHz4DwAAfngeAAA//B4AAD/+HgAAH//8AAAP//wAAAAf+AAAAA/wAAAAAYAAAAAAAAAAA/gAAAAH/AAAAA/8AAAAD34AAAAeHgAAAB4eAAAAHh4AAAA8HgAAADweAAAAPDwAAAA8PAAAADx4AAAAPvgAAAAf///AAB///8AAH///wAAP///AAA/wA4AABwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOA4AAAA8DwAAADwPAAAAPA8AAAAYBgAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='),
      46,
      atob("DQoXEBQVExUUFRYUDQ=="),
      40+(scale<<8)+(1<<16)
    );
    return this;
}


function drawBackground(start, end) {
    g.setFontAlign(0,0);
    g.setColor("#000");

    var bat = E.getBattery() / 100.0;
    var y = start;
    while(y < end){
        // Show less lines in case of small battery level.
        if(Math.random() > bat){
            y += 5;
            continue;
        }

        y += 3 + Math.floor(Math.random() * 10);
        g.drawLine(0, y, W, y);
        g.drawLine(0, y+1, W, y+1);
        g.drawLine(0, y+2, W, y+2);
        y += 2;
    }
}


/************************************************
 * Set some important constants such as width, height and center
 */
var W = g.getWidth(),R=W/2;
var H = g.getHeight();
var cx = W/2;
var cy = H/2;
var drawTimeout;

var clkInfoY = 60;


/*
 * Based on the great multi clock from https://github.com/jeffmer/BangleApps/
 */
Graphics.prototype.drawRotRect = function(w, r1, r2, angle) {
    angle = angle % 360;
    var w2=w/2, h=r2-r1, theta=angle*Math.PI/180;
    return this.fillPoly(this.transformVertices([-w2,0,-w2,-h,w2,-h,w2,0],
        {x:cx+r1*Math.sin(theta),y:cy-r1*Math.cos(theta),rotate:theta}));
};



function drawCircle(isLocked){
    g.setColor(g.theme.fg);
    g.fillCircle(cx, cy, 12);

    var c = isLocked ? "#f00" : g.theme.bg;
    g.setColor(c);
    g.fillCircle(cx, cy, 6);
}


function drawTime(){
    // Draw digital time first
    drawDigits();

    // And now the analog time
    var drawHourHand = g.drawRotRect.bind(g,8,12,R-38);
    var drawMinuteHand = g.drawRotRect.bind(g,6,12,R-12 );

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
    drawHourHand(h);
    drawMinuteHand(m);
}


function drawDigits(){
    var date = new Date();

    g.setFontAlign(0,0);
    g.setFont("7x11Numeric7Seg",3);

    var text = ("0"+date.getHours()).substr(-2) + ":" + ("0"+date.getMinutes()).substr(-2); //Bangle.getHealthStatus("day").steps;
    var w = g.stringWidth(text);
    g.setColor(g.theme.bg);
    g.fillRect(cx-w/2-4, 120, cx+w/2+4, 140+20);

    // Draw right line as designed by stable diffusion
    g.setColor(g.theme.fg);
    g.drawLine(cx+w/2+5, 120, cx+w/2+5, 140+20);
    g.drawLine(cx+w/2+6, 120, cx+w/2+6, 140+20);
    g.drawLine(cx+w/2+7, 120, cx+w/2+7, 140+20);

    // And the 7set text
    g.setColor("#BBB");
    g.drawString("88:88", cx, 140);
    g.drawString("88:88", cx+1, 140);
    g.drawString("88:88", cx, 141);

    g.setColor(g.theme.fg);
    g.drawString(text, cx, 140);
    g.drawString(text, cx+1, 140);
    g.drawString(text, cx, 141);
}


function draw(){
    // Note that we force a redraw also of the clock info as
    // we want to ensure (for design purpose) that the hands
    // are above the clkinfo section.
    clockInfoMenu.redraw();
}


function drawMainClock(){
    // Queue draw in one minute
    queueDraw();

    g.setColor("#fff");
    g.reset().clearRect(0, clkInfoY, g.getWidth(), g.getHeight());

    drawBackground(clkInfoY, H);
    drawTime();
    drawCircle(Bangle.isLocked());
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
    drawCircle(isLocked);
});


E.on("kill", function(){
    clockInfoMenu.remove();
    delete clockInfoMenu;
});


/*
 * Some helpers
 */
function queueDraw() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function() {
      drawTimeout = undefined;
      draw();
    }, 60000 - (Date.now() % 60000));
}


/************************************************
 * Clock Info
 */
let clockInfoItems = clock_info.load();
let clockInfoMenu = clock_info.addInteractive(clockInfoItems, {
  app : "aiclock",
  x : 0,
  y: 0,
  w: W,
  h: clkInfoY,
  draw : (itm, info, options) => {
    g.setFontAlign(0,0);
    g.setFont("Vector", 20);

    g.setColor("#fff");
    g.fillRect(options.x, options.y, options.x+options.w, options.y+options.h);
    drawBackground(0, clkInfoY+2);

    // Set text and font
    var image = info.img;
    var text = String(info.text);

    var imgWidth = image == null ? 0 : 24;
    var strWidth = g.stringWidth(text);
    var strHeight = text.split('\n').length > 1 ? 40 : Math.max(24, imgWidth+2);
    var w = imgWidth + strWidth;

    // Draw right line as designed by stable diffusion
    g.setColor(options.focus ? "#0f0" : "#fff");
    g.fillRect(cx-w/2-8, 40-strHeight/2-1, cx+w/2+4, 40+strHeight/2)

    g.setColor("#000");
    g.drawLine(cx+w/2+5, 40-strHeight/2-1, cx+w/2+5, 40+strHeight/2);
    g.drawLine(cx+w/2+6, 40-strHeight/2-1, cx+w/2+6, 40+strHeight/2);
    g.drawLine(cx+w/2+7, 40-strHeight/2-1, cx+w/2+7, 40+strHeight/2);

    // Draw text and image
    g.drawString(text, cx+imgWidth/2, 42);
    g.drawString(text, cx+1+imgWidth/2, 41);

    if(image != null) {
        var scale = image.width ? imgWidth / image.width : 1;
        g.drawImage(image, W/2 + -strWidth/2-4 - parseInt(imgWidth/2), 41-12, {scale: scale});
    }

    drawMainClock();
  }
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
require('widget_utils').hide();

// Clear the screen once, at startup and draw clock
g.setTheme({bg:"#fff",fg:"#000",dark:false});
draw();

// After drawing the watch face, we can draw the widgets
// Bangle.drawWidgets();
