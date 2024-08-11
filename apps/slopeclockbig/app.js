{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global

let settings = Object.assign(
  require("Storage").readJSON("slopeclockbig.default.json", true) || {},
  require("Storage").readJSON("slopeclockbig.json", true) || {}
);
// Actual height 71 (81 - 11)
//const fontBitmap = E.toString(require('heatshrink').decompress(atob('AFv4BZU/+ALJh//wALIgP//gYJj//8ALIgf//4YJv//HxMHDAI+JDAJkJDBgLBDBJvBDEZKYDBaVMn6VKY4P+cBfAXZQ9JEoIkKAGcDBZUBPhJkCBZU/DBSJBBZLUBDBLHMBYIYJdgIYJj4YKJAIYJHgQYIe4IYKBYYYHn4YKJAQYIQoIYJJAYYHJAgYHQoQYIJAn//iFIAAP+JBX/wBIJ//AQpAAB8BIK/CFJJAxtMDApIEDAxIFW5gYEJAoYFQooYGBYwYEJAoYFQooYFJAwYEQooYFJA4YEBZAYCQowYEJBAYCQo4YDJBIYCBZUBQo4A5WBKYDOhLWCDJE/cZUPBYT8HgYLDTY4LDGQ7VBEpIkEfw9/EpRJEEox6CJZJuDOI8HBYo+FBYo+FHow+EHoy9FHo3/4B7IK4wYHK4ZWGK4qUC/BCDK4ZWCIoIMDN4o4CIYQYGApAYCIgY3BOAYSBLoYlCRIQ4CR4b+BDAYFFCQoYGFYIYFYIgYHZooYebQhjTPhKVOVwwYFY5gGCcAz5CGQIECDAcHCYQAD/wYGAAhQDHAQYJn4MG4DaFAAiCDRIQAFN4ZeDAAbNEK44LDHw5WDK449EHw49EHww9EHwx7EEo57DEo7rDEo4kGEopJFZIpuEWAwwGPwh6FBgoLJAH4AVSgKRDRoKHFQoazBcIgYaX4oYFCQYYSXAIYKn74DAATeGAAgYEFYIYJFYIYWh4YLBYwYEN4IYJRAIYKN44YDN46bGDBJvHDH4Y0AAwSBBZIrBDH4YhAHF4BZUPLghjG//gAohjEh//4AFCj4YEgISBwAFBgYYFCQqIBAoYSFFQIYEn4+DFQQYF/wREDAgrBJQRiBDAgGB/hiEDBJPBDBJPCDAhvEDoIYELoP4MQgYIMQQYJMQQYIMQQYJBYQYIEgYYHEgYYG4BJDDAyuBEgRxBDAvwSYX3DAwAD/wYHAAfHDBX8DBeHY4xUEDArCCHoQSBDBPgDBX8DAr0DUoQYFVQYVBDAqeETAIYFSQSxCDApwEZQIYFaAoYGHwfgDAw+D/gYHV4Z2DBYZ9D4AYHEoRJBDA4TBGAIYHGQILCDA4A/ABMHBhd+Aws8NwjpBTYiZBcAZ7DBYIFEfILRBbIYFDVoIlDAooYCFYYeFgYxEDAwrBDAbyBY4YYB/AVBBAL9DZoeAFwIYGcwIYQCQQYE+AYDCQSIDCoIYIG4RNBDBRmBDEgIBDBWADBAIDDBAICDBACBZQIYHwACB4APBDAv8RAP+TAIYG+4CB/BNBDAoAGDAoAFDBjgFAAr5FDCyrBAAv+DAZdBAAvgDA3vAYSYBAASGBEAI1D4AMDA4XHN4xwDSYSIFK4Y1DKwY+D8A1DBYYlCFgI9HEoSNDHohLCHAI+CBYpbFPYYAFIQIkGIQiHEAH4ADPgKgEAAkBPZaIBDBLXCEhYYJVpYkCDBAkCDBIkCDBAkCDBAkDDBF/DBQkDDA4kDDBAkDDA4kC34YHgYLB8YYIEgP8OIIkJDYIYGEgXgDBAkB/AYIj5gCDA4kC4AYIEgQYIEgP+DgQYFEgYYIEgIUBDA8HVgawHVgYADIYIYKwAY/DH4Y/DF4AEn//BI4ABgf/+AMJDH4YjAH4AJj/ABRDiB/jzCdgcBdIfgOIIPBAAQLD/wnB/4oDh4MD+AeBDBCgBDAPgDBASBFAIYHwASBDBH4CQQYI4ASBZIYYEI4J0BDBJ8BDBAxBDAKJDJQoYBB4JjIDBSuCDAvwBAJsBDAyCBAQQYH8CFDDBLgDDAzQDDA7QDDBQxBOYQYGGgISBDBD5CDBAIBn4YJ/ybCDBClEDAylEDEZzBVwwACOYKuGAAalBDBKlBDAq3BAARvDDAS3BAASIDDAaSBKwwYCK4hWDDAY+DHogIBG4I9HgFgAQMDSgwAESwR7EAAh7GAAglCEhBCCJIgMGBZQA9j5JKcAKHJaYQMIUATrFAAT4Eb4gABdYjTFGAjsGVYYlJEgv/EhRLGJIjtHBYpxFNwYACfQkDBYpkFT4I+JHow+FBYx9EHox9EPYxXFPYoYFKw6WEDAXh/+DOApWC+E/+AFCN4v8FAJQCOAYSDv4hBRIpECcQISCDAYIBOwJTCIgIYFwEfNgI0BDAv4P4IYV+AIBDBIICDBZjBDCwIBR4IYIwBdCDA/8cwQYI+AkBY4YYEcA4SBfgrgF/AYLwAYERgIYJUoIACCoPAewIAC4ALCMAoABcwIYKN4YVBFYJWHgAVB8BBBKwyJDLQJWFRIXgK4Y9ECoIrBHwY9DOALACHo8AniADPYoAESwR7DAAokHAAaNCBZAMBBZQA5PAKoENYyDJXQYYQjgYKg4FEDAsDAogYGAowSEZIIYJfYLIEDAjuCwAYHagP//AYIBYIYJv4LBcQgYDHgIAB4AYGHgRdFAoQ8CAAJdDDAYLDOAgYCHgQABOAYYCHgYYHBwIADOAYJB8YLEOAgYBBYoYFAApjFAAzHFAAqIDDA7TEDAzGEDAw8EDA4LEDAw8EDAy4DDA48FDAr2EDA4LGDAiqDDA48GDAiFEDAw8HDAaFFDAw8HDAY8HDAY8IDAQ8IAH4AFv5nJgE/QBMAg6ZKgKBLEgIlGEIICCRwwhBFoN/WY4IB+DxDZA/Bfo5GC/0fco5GC+YLCHwhGC/+/AYXAdooAEDAhGDAAZXDHoQAESwhGDAAZXDgYLGOAhWCDBBWDDBCdCDB2DRIt//gzC8BpB/BvEwALBBAIrBDAYqBE4RdCDArVDLoQYE8ByCwCPBDAiOBCgIIBR4IYFUgXADBAUBYgIYHawQYJJoIcDMYoYCGoRjGOAZjGCIKJCPg/AUQWADA3/z4CB/goBDAoAD+LHGfMa4CDBJUCAAicBDBKYBAASbBDBJwC/5BDZQJwF+YYD4BXF/xBDRAY+D4IYDRAY+C/CZDN4Y+DQAZWEEoXAM4Y9EUYIGBHwRWEFAyUEDYp7GAAglBEhJLBJIoyGBZQA/MBDPEPI7DFfQy3FAAUBaAkBUQrdCGQSKFewYlBv41EEgQlCj//wBJFAAPwaoJbEbgTqCCIJOEHoQVBgbhFHoYuBGIJXDHoYVBAoLuECQJXDDAorBDAZvBOAhWDCoI3BOAYYEFwIYFKwYYBNIIYDN4gYBCQKJDAoPwAQIYCRIY3BMAgYFPIQPBDBA3Bv4YIBAIVBDBCCBn4YKOYIYY4ASBDBCuDDCn4cwR8FDAWAZoIYFAoM/+C0CY4b2CBIIFCY4xgB8DyCcAv+g/8j7jCcA7jEfI78DBYRTBAAp/BAAQ4CAAnABYR2CAAhvDgBFCAAgLDNQQAEN4aJCKxJXHHoZXHHog+HBYg+GPYY+HPYh9HdYZ9HEgolFEgwlFBYxLENwhxGGAzvET4gZGC5AA/ABl8AYV4BY0fdIU/OQx8BSYIDDUQv+AYokESgQDDcI2AWQTUHHwIDDY43AXwWADAz3Bv4YGCgQYJCgIYDAYIYKOAoYYJRZjOPhKVGDAqqBCgKuHYYKqBDgLHGHQPggEPcA8/NYU/HoolCIQQkGAEIA==')));
// Actual height 35 (34 - 0)
const fontBitmap = E.toString(require('heatshrink').decompress(atob('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')));

Graphics.prototype.setFontPaytoneOne = function(scale) {
  //this.setFontCustom(fontBitmap,32, atob("HTBFLTQ0PzU/Lz8+HQ=="),100+(scale<<8)+(1<<16));
  this.setFontCustom(
      fontBitmap,
      32,
      atob("BwsQFhQhGgkPEBIWCw0LEhkRExQYFBYTFxYLCxUVFhIfGxsWGxUVFxsLDxwUHxwdGB0ZFRUbGSUYFhMQEg8XERIYGRIYFA8aGA4MFw8lGBcZGBEREBYWIBUXExELEBY="),
      100+(scale<<8)+(1<<16)
  );
  return this;
};

let drawTimeout;

//let g2 = Graphics.createArrayBuffer(g.getWidth(),90,1,{msb:true});
let g2 = Graphics.createArrayBuffer(g.getWidth() / 2,g.getHeight() / 2,1,{msb:true});
// let g2img = {
//   width:g2.getWidth(), height:g2.getHeight(), bpp:1,
//   buffer:g2.buffer, transparent:0
// };
let g2img = {
   width:g2.getWidth() / 2, height:g2.getHeight() / 2, bpp:1,
   buffer:g2.buffer, transparent:0
};
const slope = 20;
const offsY = 20; // offset of numbers from middle
const fontBorder = 4; // offset from left/right
const slopeBorder = 10, slopeBorderUpper = 4; // fudge-factor to move minutes down from slope
let R,x,y; // middle of the clock face
let dateStr = "";
let bgColors = [];
if (g.theme.dark) {
   if (settings.colorYellow) bgColors.push("#ff0");
   if (settings.colorCyan) bgColors.push("#0ff");
   if (settings.colorMagenta) bgColors.push("#f0f");
   if (settings.colorWhite) bgColors.push("#fff");
} else {
   if (settings.colorRed) bgColors.push("#f00");
   if (settings.colorGreen) bgColors.push("#0f0");
   if (settings.colorBlue) bgColors.push("#00f");
   if (settings.colorBlack) bgColors.push("#000");
}
let bgColor = bgColors[(Math.random()*bgColors.length)|0]||"#000";


// Draw the hour, and the minute into an offscreen buffer
let draw = function() {
  // queue next draw
  if (drawTimeout) clearTimeout(drawTimeout);

  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    animate(false, function() {
      draw();
    });

  }, 60000 - (Date.now() % 60000));
  // Now draw this one
  const rRaw = Bangle.appRect;
  R = { x: rRaw.x, y: rRaw.y, w: rRaw.w / 2, h:rRaw.h / 2, x2: rRaw.x + rRaw.w / 2, y2: rRaw.y + rRaw.h / 2 };
  x = R.w / 2;
  y = R.y + R.h / 2 - 6;
  if (!settings.hideWidgets) y-= 6; // extra room for date
  const date = new Date();
  const local_time = require("locale").time(date, 1);
  const hourStr = local_time.split(":")[0].trim().padStart(2, '0');
  const minStr = local_time.split(":")[1].trim().padStart(2, '0');
  dateStr = require("locale").dow(date, 1).toUpperCase()+ " " + require("locale").date(date, 0).toUpperCase();

  // Draw hour
  g.reset().clearRect(rRaw); // clear whole background (w/o widgets)
  g.setFontAlign(-1, 0).setFont("PaytoneOne");
  g.drawString(hourStr, fontBorder, y-offsY).setFont("4x6"); // draw and unload custom font
  // add slope in background color
  g.setColor(g.theme.bg)
      .fillPoly([0,y+slope-slopeBorderUpper, R.w,y-slope-slopeBorderUpper, R.w,y-slope, 0,y+slope]);

  // Draw minute to offscreen buffer
  g2.setColor(0).fillRect(0,0,g2.getWidth(),g2.getHeight()).setFontAlign(1, 0).setFont("PaytoneOne");
  g2.setColor(1).drawString(minStr, g2.getWidth()-fontBorder, g2.getHeight()/2).setFont("4x6"); // draw and unload custom font
  g2.setColor(0).fillPoly([0,0, g2.getWidth(),0, 0,slope*2]);
  // redraw the top widget
  clockInfoMenu.redraw();
  // start the animation *in*
  animate(true);
};

let isAnimIn = true;
let animInterval;
let minuteX;
// Draw *just* the minute image
let drawMinute = function() {
  const yo = slopeBorder + offsY + y - 2 * slope * minuteX / R.w;
  // draw over the slanty bit
  g.setColor(bgColor).fillPoly([0,y+slope, R.w,y-slope, R.w,R.h+R.y, 0,R.h+R.y]);
  // draw the minutes
  g.setColor(g.theme.bg).drawImage(g2img, x+minuteX-(g2.getWidth()/2), yo-(g2.getHeight()/2));
};
let animate = function(isIn, callback) {
  if (animInterval) clearInterval(animInterval);
  isAnimIn = isIn;
  minuteX = isAnimIn ? -g2.getWidth() : 0;
  drawMinute();
  animInterval = setInterval(function() {
    minuteX += 8;
    let stop = false;
    if (isAnimIn && minuteX>=0) {
      minuteX=0;
      stop = true;
    } else if (!isAnimIn && minuteX>=R.w)
      stop = true;
    drawMinute();
    if (stop) {
      clearInterval(animInterval);
      animInterval=undefined;
      if (isAnimIn) {
        // draw the date
        g.setColor(g.theme.bg).setFontAlign(0, 0).setFont("6x15").drawString(dateStr, R.x + R.w/2, R.y+R.h-9);
        // draw the menu items
        clockInfoMenu.redraw();
        clockInfoMenu2.redraw();
      }
      if (callback) callback();
    }
  }, 20);
};

// clock info menus (scroll up/down for info)
let clockInfoDraw = (itm, info, options) => {
  let textY = options.y+41;
  // set a cliprect to stop us drawing outside our box
  g.reset().setClipRect(options.x, options.y, options.x+options.w-1, options.y+options.h-1);
  g.setFont("6x15").setBgColor(options.bg).clearRect(options.x, textY-15, options.x+options.w-2, textY);

  g.setColor(options.focus ? options.hl : options.fg);
  if (options.x < g.getWidth()/2) { // left align
    let x = options.x+2;
    if (info.img) g.clearRect(x, options.y, x+23, options.y+23).drawImage(info.img, x, options.y);
    g.setFontAlign(-1,1).drawString(info.text, x,textY);
  } else { // right align
    let x = options.x+options.w-3;
    if (info.img) g.clearRect(x-23, options.y, x, options.y+23).drawImage(info.img, x-23, options.y);
    g.setFontAlign(1,1).drawString(info.text, x,textY);
  }
  // return ClipRect
  g.setClipRect(0,0,g.getWidth()-1, g.getHeight()-1);
};
let clockInfoItems = require("clock_info").load();
let clockInfoMenu = require("clock_info").addInteractive(clockInfoItems, {  // top right
  app:"slopeclockbig",x:132, y:settings.hideWidgets ? 12 : 24, w:44, h:40,
  draw : clockInfoDraw, bg : g.theme.bg, fg : g.theme.fg, hl : "#f00"/*red*/
});
let clockInfoMenu2 = require("clock_info").addInteractive(clockInfoItems, { // bottom left
  app:"slopeclockbig",x:0, y:115, w:50, h:40,
  draw : clockInfoDraw, bg : bgColor, fg : g.theme.bg, hl : (g.theme.fg===g.toColor(bgColor))?"#f00"/*red*/:g.theme.fg
});

// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : function() {
    // Called to unload all of clock app
    if (animInterval) clearInterval(animInterval);
    animInterval = undefined;
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    delete Graphics.prototype.setFontPaytoneOne;
    // remove info menu
    clockInfoMenu.remove();
    delete clockInfoMenu;
    clockInfoMenu2.remove();
    delete clockInfoMenu2;
  }
});

// Load widgets
Bangle.loadWidgets();
if (settings.hideWidgets) require("widget_utils").swipeOn();
else setTimeout(Bangle.drawWidgets,0);
draw();
}
