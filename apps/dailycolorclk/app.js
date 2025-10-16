{ // must be inside our own scope here so that when we are unloaded everything disappears

let settings;
let getSettings=function(){
  settings = Object.assign(
    require("Storage").readJSON("dailycolorclk.default.json", true) || {},
    require("Storage").readJSON("dailycolorclk.json", true) || {}
  );
}
let writeSettings=function(){
  require("Storage").writeJSON("dailycolorclk.json", settings);
}
getSettings();

const fontBitmap = E.toString(require('heatshrink').decompress(atob('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')));

Graphics.prototype.setFontPaytoneOne = function(scale) {
  this.setFontCustom(fontBitmap, 46, atob("ER0mGCMjJiMkIiUkEg=="), 70|65536);
  return this;
}

let drawTimeout;


const slopeHeight = 90;
const fontBorder = 13;
const hoursYPos=68; 
const minOffset=4; //offset from slope
const slopeBorder = 4;

let R;
let dateStr = "";
let bgColor = settings.colorSaved;
print(settings);
let changeBGColor = function() {
  let bgColors = [];
  if (settings.colorYellow) bgColors.push("#ff0");
  if (settings.colorCyan) bgColors.push("#0ff");
  if (settings.colorMagenta) bgColors.push("#f0f");
  if (settings.colorWhite) bgColors.push("#fff");
  if (settings.colorRed) bgColors.push("#f00");
  if (settings.colorGreen) bgColors.push("#0f0");
  if (settings.colorBlue) bgColors.push("#00f");
  if (settings.colorOrange) bgColors.push("#FC6A03");
  if (settings.colorPurple) bgColors.push("#B200ED");
  if (settings.colorBlack) bgColors.push("#000");

  let oldColorIdx = bgColors.indexOf(settings.colorSaved);
  print("idx old color: ",oldColorIdx);
  if (oldColorIdx !== -1) bgColors.splice(oldColorIdx, 1);
  let col = bgColors[(Math.random()*bgColors.length)|0] || "#000";
  print("Colors Available: "+bgColors);
  
  settings.colorSaved = col;
  writeSettings();
}

let checkForColorChange = function() {
  let dayNow = new Date().getDay();
  if (settings.dayChanged != dayNow) {
    settings.dayChanged = dayNow;
    changeBGColor();
    load();
  }
}

//draws bg color once, erases background
let preDraw=function(){
  g.setColor(g.theme.bg).fillRect(0,0,g.getWidth(),g.getHeight());
  g.setColor(bgColor).fillRect(
    0,slopeHeight,g.getWidth(), g.getHeight()
  );

}
// Draw the hour, minute, and date
let draw = function() {
  
  checkForColorChange();
  
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(draw, 60000 - (Date.now() % 60000));

  R = Bangle.appRect;
  x = R.w / 2;
  y = R.y + R.h / 2 - 6;
  if (!settings.hideWidgets) y -= 6;

  var date = new Date();
  var local_time = require("locale").time(date, 1);
  var hourStr = " "+local_time.split(":")[0].padStart(2,'0')+" ";
  var minStr = " "+local_time.split(":")[1].padStart(2,'0')+" ";

  dateStr = require("locale").dow(date,1) + ', ' +
            require("locale").month(date,1) + " " + date.getDate();

  //clear old hour
  g.setColor(g.theme.bg);
  g.fillRect(0,24,90,88);
  // Draw hour
  g.setColor(g.theme.fg)
  .setFontAlign(-1, 0)
  .setFont("PaytoneOne")
  .drawString(hourStr, fontBorder, hoursYPos);

  
  

 

  // draw minutes
  var yo = slopeHeight + minOffset;
  g.setColor(bgColor);
  g.fillRect(98,92,g.getWidth(),152);
  g.setFontAlign(-1, -1).setFont("PaytoneOne")
    .setColor(g.theme.bg).drawString(minStr,95, yo);
  
  // Transition bar
  g.setColor(g.theme.bg).fillRect(
    0,slopeHeight-slopeBorder,g.getWidth(), slopeHeight
  );
  // Draw date
  g.setColor(g.theme.bg)
   .setFontAlign(0, 0)
   .setFont("Vector",16)
   .drawString(dateStr, R.x + R.w/2, R.y+R.h-13);

};



// Clock info menus
let clockInfoDraw = (itm, info, options) => {
  let texty = options.y+41;
  g.reset().setClipRect(options.x, options.y, options.x+options.w-1, options.y+options.h-1);
  g.setFont("Vector",15).setBgColor(options.bg).clearRect(options.x, texty-15, options.x+options.w-2, texty);

  g.setColor(options.focus ? options.hl : options.fg);
  if (options.x < g.getWidth()/2) { 
    let x = options.x+2;
    if (info.img) g.clearRect(x, options.y, x+23, options.y+23).drawImage(info.img, x, options.y);
    g.setFontAlign(-1,1).drawString(info.text, x,texty);
  } else {
    let x = options.x+options.w-3;
    if (info.img) g.clearRect(x-23, options.y, x, options.y+23).drawImage(info.img, x-23, options.y);
    g.setFontAlign(1,1).drawString(info.text, x,texty);
  }
  g.setClipRect(0,0,g.getWidth()-1, g.getHeight()-1);
};

let clockInfoItems = require("clock_info").load();
let clockInfoMenu = require("clock_info").addInteractive(clockInfoItems, {  
  app:"slopeclockpp",x:102, y:38, w:70, h:50,
  draw : clockInfoDraw, bg : g.theme.bg, fg : g.theme.fg, hl : bgColor
});
let clockInfoMenu2 = require("clock_info").addInteractive(clockInfoItems, { 
  app:"slopeclockpp",x:10, y:102, w:70, h:50,
  draw : clockInfoDraw, bg : bgColor, fg : g.theme.bg, hl : (g.theme.fg===g.toColor(bgColor))?"#f00":g.theme.fg
});

// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : function() {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    delete Graphics.prototype.setFontPaytoneOne;
    clockInfoMenu.remove();
    delete clockInfoMenu;
    clockInfoMenu2.remove();
    delete clockInfoMenu2;
  },
  redraw: draw,
});

Bangle.loadWidgets();
if (settings.hideWidgets) require("widget_utils").swipeOn();
else setTimeout(Bangle.drawWidgets,0);
preDraw();
draw();
clockInfoMenu.redraw();
clockInfoMenu2.redraw();

}
