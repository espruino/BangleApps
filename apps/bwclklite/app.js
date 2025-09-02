{ // must be inside our own scope here so that when we are unloaded everything disappears

/************************************************
 * Includes
 */
const locale = require('locale');
const storage = require('Storage');
const clock_info = require("clock_info");
const widget_utils = require("widget_utils");

/************************************************
 * Globals
 */
const SETTINGS_FILE = "bwclklite.setting.json";
const W = g.getWidth();
const H = g.getHeight();

/************************************************
 * Settings
 */
let settings = {
  screen: "Normal",
  showLock: true,
  hideColon: false,
  menuPosX: 0,
  menuPosY: 0,
};

let saved_settings = storage.readJSON(SETTINGS_FILE, 1) || settings;
for (const key in saved_settings) {
  settings[key] = saved_settings[key];
}

let isFullscreen = function() {
  let s = settings.screen.toLowerCase();
  if(s == "dynamic"){
    return Bangle.isLocked();
  } else {
    return s == "full";
  }
};

let getLineY = function(){
  return H/5*2 + (isFullscreen() ? 0 : 8);
};

/************************************************
 * Assets
 */
let imgLock = function() {
  return {
    width : 16, height : 16, bpp : 1,
    transparent : 0,
    buffer : E.toArrayBuffer(atob("A8AH4A5wDDAYGBgYP/w//D/8Pnw+fD58Pnw//D/8P/w="))
  };
};


/************************************************
 * Clock Info
 */
let clockInfoItems = clock_info.load();

// Add some custom clock-infos
let weekOfYear = function() {
  let date = new Date();
  date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  let week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
};

clockInfoItems[0].items.unshift({ name : "weekofyear",
  get : function() { return { text : "Week " + weekOfYear(),
                              img : null};},
  show : function() {},
  hide : function() {},
});

// Empty for large time
clockInfoItems[0].items.unshift({ name : "nop",
  get : function() { return { text : null,
                              img : null};},
  show : function() {},
  hide : function() {},
});



let clockInfoMenu = clock_info.addInteractive(clockInfoItems, {
  app: "bwclklite",
  x : 0,
  y: 135,
  w: W+1,
  h: H-135,
  draw : (itm, info, options) => {
    let hideClkInfo = info.text == null;

    g.reset().setBgColor(g.theme.fg).clearRect(options.x, options.y, options.x+options.w, options.y+options.h);
    g.setFontAlign(-1,-1).setColor(g.theme.bg);

    if (options.focus){
      let y = hideClkInfo ? options.y+20 : options.y+2;
      let h = hideClkInfo ? options.h-20 : options.h-2;
      g.drawRect(options.x, y, options.x+options.w-2, y+h-1); // show if focused
      g.drawRect(options.x+1, y+1, options.x+options.w-3, y+h-2); // show if focused
    }

    // In case we hide the clkinfo, we show the time again as the time should
    // be drawn larger.
    if(hideClkInfo){
      drawTime();
      return;
    }

    // Set text and font, compute sizes.
    let image = info.img;
    let imgWidth = image == null ? 0 : 24;
    let imgWidthClear = parseInt(imgWidth*1.3);
    let text = String(info.text);
    let strWidth;
    if(text.split('\n').length > 1){
      g.setFont("6x8"); //g.setMiniFont();
      strWidth = g.stringWidth(text);
    } else {
      g.setFont("6x8:3"); //g.setSmallFont();
      strWidth = g.stringWidth(text);
      if (strWidth+imgWidthClear > options.w) {
        g.setFont("6x8"); //g.setMiniFont();
        text = g.wrapString(text, options.w-imgWidthClear).join("\n");
        strWidth = g.stringWidth(text);
      }
    }

    // Compute positions
    let midx = options.x+options.w/2;
    let imgPosX = Math.max(midx-Math.floor(imgWidthClear/2)-parseInt(strWidth/2), 0);
    let strPosX = imgPosX+imgWidthClear;

    // Draw
    if (image) {
      let scale = imgWidth / image.width;
      g.drawImage(image, imgPosX, options.y+6, {scale: scale});
    }
    g.drawString(text, strPosX, options.y+6);

    // In case we are in focus and the focus box changes (fullscreen yes/no)
    // we draw the time again. Otherwise it could happen that a while line is
    // not cleared correctly.
    if(options.focus) drawTime();
  }
});


/************************************************
 * Draw
 */
let draw = function() {
  // Queue draw again
  queueDraw();

  // Draw clock
  drawDate();
  drawTime();
  drawLock();
  drawWidgets();
};


let drawDate = function() {
    // Draw background
    let y = getLineY();
    g.reset().clearRect(0,0,W,y);

    // Draw date
    y = parseInt(y/2)+4;
    y += isFullscreen() ? 0 : 8;
    let date = new Date();
    let dateStr = date.getDate();
    dateStr = ("0" + dateStr).substr(-2);
    g.setFont("6x8:4"); //g.setMediumFont();  // Needed to compute the width correctly
    let dateW = g.stringWidth(dateStr);

    g.setFont("6x8:3"); //g.setSmallFont();
    let dayStr = locale.dow(date, true);
    let monthStr = locale.month(date, 1);
    let dayW = Math.max(g.stringWidth(dayStr), g.stringWidth(monthStr));
    let fullDateW = dateW + 10 + dayW;

    g.setFontAlign(-1,0);
    g.drawString(dayStr, W/2 - fullDateW/2 + 10 + dateW, y-12);
    g.drawString(monthStr, W/2 - fullDateW/2 + 10 + dateW, y+11);

    g.setFont("6x8:4"); //g.setMediumFont();
    g.setColor(g.theme.fg);
    g.drawString(dateStr, W/2 - fullDateW / 2, y+2);
};


let drawTime = function() {
  let hideClkInfo = clockInfoMenu.menuA == 0 && clockInfoMenu.menuB == 0;

  // Draw background
  let y1 = getLineY();
  let y = y1;
  let date = new Date();

  var timeStr = locale.time(date, 1);
  if (settings.hideColon)
    timeStr = timeStr.replace(":", "");

  // Set y coordinates correctly
  y += parseInt((H - y)/2) + 5;

  if (hideClkInfo){
    g.setFont("6x8:5"); //g.setLargeFont();
  } else {
    y -= 15;
    g.setFont("6x8:4"); //g.setMediumFont();
  }

  // Clear region and draw time
  g.setColor(g.theme.fg);
  g.fillRect(0,y1,W,y+20 + (hideClkInfo ? 1 : 0) + (isFullscreen() ? 3 : 0));

  g.setColor(g.theme.bg);
  g.setFontAlign(0,0);
  g.drawString(timeStr, W/2, y);
};


let drawLock = function() {
  if(settings.showLock && Bangle.isLocked()){
    g.setColor(g.theme.fg);
    g.drawImage(imgLock(), W-16, 2);
  }
};


let drawWidgets = function() {
  if(isFullscreen()){
    widget_utils.hide();
  } else {
    Bangle.drawWidgets();
  }
};


/************************************************
 * Listener
 */
// timeout used to update every minute
let drawTimeout;

// schedule a draw for the next minute
let queueDraw = function() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
};


// Stop updates when LCD is off, restart when on
let lcdListenerBw = function(on) {
  if (on) {
    draw(); // draw immediately, queue redraw
  } else { // stop draw timer
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }
};
Bangle.on('lcdPower', lcdListenerBw);

let lockListenerBw = function(isLocked) {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = undefined;

  if(!isLocked && settings.screen.toLowerCase() == "dynamic"){
    // If we have to show the widgets again, we load it from our
    // cache and not through Bangle.loadWidgets as its much faster!
    widget_utils.show();
  }

  draw();
};
Bangle.on('lock', lockListenerBw);

let charging = function(charging){
  // Jump to battery
  clockInfoMenu.setItem(0, 2);
  drawTime();
};
Bangle.on('charging', charging);

let kill = function(){
  clockInfoMenu.remove();
  delete clockInfoMenu;
};
E.on("kill", kill);

/************************************************
 * Startup Clock
 */

// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : function() {
    // Called to unload all of the clock app
    Bangle.removeListener('lcdPower', lcdListenerBw);
    Bangle.removeListener('lock', lockListenerBw);
    Bangle.removeListener('charging', charging);
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    // save settings
    kill();
    E.removeListener("kill", kill);
    Bangle.removeListener('charging', charging);
    widget_utils.show();
  }
});

// Load widgets and draw clock the first time
Bangle.loadWidgets();

// Draw first time
g.setColor(g.theme.fg).fillRect(0,135,W,H); // Otherwise this rect will wait for clock_info before updating
draw();

} // End of app scope
