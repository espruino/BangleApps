/************************************************
 * AI Clock
 */
 const storage = require('Storage');
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

/************************************************
 * Set some important constants such as width, height and center
 */
var W = g.getWidth(),R=W/2;
var H = g.getHeight();
var cx = W/2;
var cy = H/2;
var drawTimeout;
var lock_input = false;


/************************************************
 * SETTINGS
 */
const SETTINGS_FILE = "aiclock.setting.json";
let settings = {
    menuPosX: 0,
    menuPosY: 0,
};
let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
for (const key in saved_settings) {
  settings[key] = saved_settings[key]
}


/************************************************
 * Menu
 */
function getDate(){
    var date = new Date();
    return ("0"+date.getDate()).substr(-2) + "/" + ("0"+(date.getMonth()+1)).substr(-2)
}


// Custom clockItems menu - therefore, its added here and not in a clkinfo.js file.
var clockItems = {
    name: getDate(),
    img: null,
    items: [
    { name: "Week",
      get: () => ({ text: "Week " + weekOfYear(), img: null}),
      show: function() { clockItems.items[0].emit("redraw"); },
      hide: function () {}
    },
    ]
  };

function weekOfYear() {
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                            - 3 + (week1.getDay() + 6) % 7) / 7);
}



// Load menu
var menu = clock_info.load();
menu = menu.concat(clockItems);


  // Ensure that our settings are still in range (e.g. app uninstall). Otherwise reset the position it.
  if(settings.menuPosX >= menu.length || settings.menuPosY > menu[settings.menuPosX].items.length ){
    settings.menuPosX = 0;
    settings.menuPosY = 0;
  }

  // Set draw functions for each item
  menu.forEach((menuItm, x) => {
    menuItm.items.forEach((item, y) => {
      function drawItem() {
        // For the clock, we have a special case, as we don't wanna redraw
        // immediately when something changes. Instead, we update data each minute
        // to save some battery etc. Therefore, we hide (and disable the listener)
        // immedeately after redraw...
        item.hide();

        // After drawing the item, we enable inputs again...
        lock_input = false;

        var info = item.get();
        drawMenuItem(info.text, info.img);
      }

      item.on('redraw', drawItem);
    })
  });


  function canRunMenuItem(){
    if(settings.menuPosY == 0){
      return false;
    }

    var menuEntry = menu[settings.menuPosX];
    var item = menuEntry.items[settings.menuPosY-1];
    return item.run !== undefined;
  }


  function runMenuItem(){
    if(settings.menuPosY == 0){
      return;
    }

    var menuEntry = menu[settings.menuPosX];
    var item = menuEntry.items[settings.menuPosY-1];
    try{
      var ret = item.run();
      if(ret){
        Bangle.buzz(300, 0.6);
      }
    } catch (ex) {
      // Simply ignore it...
    }
  }


/*
 * Based on the great multi clock from https://github.com/jeffmer/BangleApps/
 */
Graphics.prototype.drawRotRect = function(w, r1, r2, angle) {
    angle = angle % 360;
    var w2=w/2, h=r2-r1, theta=angle*Math.PI/180;
    return this.fillPoly(this.transformVertices([-w2,0,-w2,-h,w2,-h,w2,0],
        {x:cx+r1*Math.sin(theta),y:cy-r1*Math.cos(theta),rotate:theta}));
};


function drawBackground() {
    g.setFontAlign(0,0);
    g.setColor(g.theme.fg);

    var bat = E.getBattery() / 100.0;
    var y = 0;
    while(y < H){
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


function drawCircle(isLocked){
    g.setColor(g.theme.fg);
    g.fillCircle(cx, cy, 12);

    var c = isLocked ? "#f00" : g.theme.bg;
    g.setColor(c);
    g.fillCircle(cx, cy, 6);
}

function toAngle(a){
    if (a < 0){
        return 360 + a;
    }

    if(a > 360) {
        return 360 - a;
    }

    return a
}


function drawMenuItem(text, image){
    if(text == null){
        drawTime();
        return
    }
    // image = atob("GBiBAAD+AAH+AAH+AAH+AAH/AAOHAAYBgAwAwBgwYBgwYBgwIBAwOBAwOBgYIBgMYBgAYAwAwAYBgAOHAAH/AAH+AAH+AAH+AAD+AA==");

    text = String(text);

    g.reset().setBgColor("#fff").setColor("#000");
    g.setFontAlign(0,0);
    g.setFont("Vector", 20);

    var imgWidth = image == null ? 0 : 24;
    var strWidth = g.stringWidth(text);
    var strHeight = text.split('\n').length > 1 ? 40 : Math.max(24, imgWidth+2);
    var w = imgWidth + strWidth;

    g.clearRect(cx-w/2-8, 40-strHeight/2-1, cx+w/2+4, 40+strHeight/2)

    // Draw right line as designed by stable diffusion
    g.drawLine(cx+w/2+5, 40-strHeight/2-1, cx+w/2+5, 40+strHeight/2);
    g.drawLine(cx+w/2+6, 40-strHeight/2-1, cx+w/2+6, 40+strHeight/2);
    g.drawLine(cx+w/2+7, 40-strHeight/2-1, cx+w/2+7, 40+strHeight/2);

    // And finally the text
    g.drawString(text, cx+imgWidth/2, 42);
    g.drawString(text, cx+1+imgWidth/2, 41);

    if(image != null) {
        var scale = image.width ? imgWidth / image.width : 1;
        g.drawImage(image, W/2 + -strWidth/2-4 - parseInt(imgWidth/2), 41-12, {scale: scale});
    }

    drawTime();
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


function drawDate(){
    var menuEntry = menu[settings.menuPosX];

    // The first entry is the overview...
    if(settings.menuPosY == 0){
        drawMenuItem(menuEntry.name, menuEntry.img);
        return;
    }

    // Draw item if needed
    lock_input = true;
    var item = menuEntry.items[settings.menuPosY-1];
    item.show();
}





function draw(){
    // Queue draw in one minute
    queueDraw();

    g.reset();
    g.clearRect(0, 0, g.getWidth(), g.getHeight());
    g.setColor(1,1,1);

    drawBackground();
    drawDate();
    drawCircle(Bangle.isLocked());
}


/*
 * Listeners
 */
Bangle.on('lcdPower',on=>{
    if (on) {
        draw(true);
    } else { // stop draw timer
        if (drawTimeout) clearTimeout(drawTimeout);
        drawTimeout = undefined;
    }
});

Bangle.on('lock', function(isLocked) {
    drawCircle(isLocked);
});

Bangle.on('touch', function(btn, e){
    var left = parseInt(g.getWidth() * 0.22);
    var right = g.getWidth() - left;
    var upper = parseInt(g.getHeight() * 0.22);
    var lower = g.getHeight() - upper;

    var is_upper = e.y < upper;
    var is_lower = e.y > lower;
    var is_left = e.x < left && !is_upper && !is_lower;
    var is_right = e.x > right && !is_upper && !is_lower;
    var is_center = !is_upper && !is_lower && !is_left && !is_right;

    if(lock_input){
        return;
    }

    if(is_lower){
        Bangle.buzz(40, 0.6);
        settings.menuPosY = (settings.menuPosY+1) % (menu[settings.menuPosX].items.length+1);

        draw();
    }

    if(is_upper){
        Bangle.buzz(40, 0.6);
        settings.menuPosY  = settings.menuPosY-1;
        settings.menuPosY = settings.menuPosY < 0 ? menu[settings.menuPosX].items.length : settings.menuPosY;

        draw();
    }

    if(is_right){
        Bangle.buzz(40, 0.6);
        settings.menuPosX = (settings.menuPosX+1) % menu.length;
        settings.menuPosY = 0;
        draw();
    }

    if(is_left){
        Bangle.buzz(40, 0.6);
        settings.menuPosY = 0;
        settings.menuPosX  = settings.menuPosX-1;
        settings.menuPosX = settings.menuPosX < 0 ? menu.length-1 : settings.menuPosX;
        draw();
    }

    if(is_center){
        if(canRunMenuItem()){
            runMenuItem();
        }
    }
});


E.on("kill", function(){
    try{
        storage.write(SETTINGS_FILE, settings);
    } catch(ex){
        // If this fails, we still kill the app...
    }
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
g.setTheme({bg:"#fff",fg:"#000",dark:false}).clear();
draw();

// After drawing the watch face, we can draw the widgets
// Bangle.drawWidgets();
