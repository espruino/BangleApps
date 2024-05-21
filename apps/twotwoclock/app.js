/*
// to calculate 'numerals' by adding a border around text
require("Font4x5Numeric").add(Graphics);
function getImageForNumber(n) {
  g.setFont("4x5Numeric:3x2");
  var sz = g.stringMetrics(n), s=1;
  var b = Graphics.createArrayBuffer(12 + s*2, sz.height+s*2, 2, {msb:true});
  b.setFont("4x5Numeric:3x2").setFontAlign(0,-1);
  b.transparent = 2;
  b.setColor(b.transparent);
  b.fillRect(0,0,b.getWidth(),b.getHeight());
  b.setColor(0);
  var x = s+6, y = s;
  for (var ix=-s;ix<=s;ix++)
    for (var iy=-s;iy<=s;iy++)
      b.drawString(n, x+ix, y+iy);
  b.setColor(3);
  b.drawString(n, x, y);
  print('atob("'+btoa((b.asImage("string")))+'"),');
}
for (var i=0;i<10;i++)
  getImageForNumber(i);
*/
{
  let numerals = [
  atob("DgyCAgAAAqP//yo///Kj8D8qPyPyo/I/Kj8j8qPyPyo/A/Kj//8qP//yoAAAKg=="),
  atob("DgyCAqgAqqqPyqqo/Kqqj8qqqPyqqo/Kqqj8qqqPyqqo/Kqqj8qqqPyqqoAKqg=="),
  atob("DgyCAgAAAqP//yo///KgAD8qAAPyo///Kj//8qPwACo/AAKj//8qP//yoAAAKg=="),
  atob("DgyCAgAAAqP//yo///KgAD8qAAPyo///Kj//8qAAPyoAA/Kj//8qP//yoAAAKg=="),
  atob("DgyCAgAgAqPyPyo/I/Kj8j8qPwPyo///Kj//8qAAPyqqo/Kqqj8qqqPyqqoAKg=="),
  atob("DgyCAgAAAqP//yo///Kj8AAqPwACo///Kj//8qAAPyoAA/Kj//8qP//yoAAAKg=="),
  atob("DgyCAgAAAqP//yo///Kj8AAqPwACo///Kj//8qPwPyo/A/Kj//8qP//yoAAAKg=="),
  atob("DgyCAgAAAqP//yo///KgAD8qqqPyqqo/Kqqj8qqqPyqqo/Kqqj8qqqPyqqoAKg=="),
  atob("DgyCAgAAAqP//yo///Kj8D8qPwPyo///Kj//8qPwPyo/A/Kj//8qP//yoAAAKg=="),
  atob("DgyCAgAAAqP//yo///Kj8D8qPwPyo///Kj//8qAAPyoAA/Kj//8qP//yoAAAKg==")
  ];

  Graphics.prototype.setFontLECO1976Regular = function() {
    // Actual height 24 (23 - 0)
    return this.setFontCustom(
      E.toString(require('heatshrink').decompress(atob('ADX/+eA//3AQwUI/wCKByIAFh04HYP/GoICHj08gACFChYjCAAsf/FwAQPwAQsevHw/14/4CFBYUev4CGjk/+CSG4ACFwHh4ICB45HB55KCBwJ7BgP4gEDEQMHDQMfLIM/AQN9AQP54YgBAQPBBAMBAQjUJQZXzIIICMCIQCE8YCBgZKBd6gAJvxxBQ4JuB/H/86CD/kAn/gP4IZFBASOBDIJqCDQIgCEwQsCABESAQNzRwM/AQTOJBYd/CIMzLxUBCgMBJAICFh5dBARAUIAA0DfIQCHHaYCJaI4pBNIMHAQ4AICgUfwEBfAMPAQKyBSQbvCMhDJBCgICH+A1BARYaLfwxKBDqp0N/IRB/YCH+fHARn/ARHDKZnxExosGQCC8CAREDARosS54LBAQ5cPTAQCE8IsIHxQsg/ACH+ACNQaRWZFiXDBYIXCAQgsgh0DwEeg4CGCIoUE/EeAQ4UIgfgAQ0HUQICCh94AQcOnEAj08AQY7JCI4CXAAscjgOGh4vBI4UHuBWGMQsB4AmGPwQCI+P3wACG+YCBEAP/ART4G//4ARBJBvH3/4CKx4CDC4ICGVpALBwACI+ZHBARYaLFiXHARgXGv+A/0/FiXwg4CV8EDFj34h4RDv//gE//0Aj/8WaaGNAQpZXcBwCF+AjB8CDT+JTLHYQCE8ICBKyMDIgICLDRYsRYYx0CUILpLARA+dL4UPAQMfAQM/NAQCB/aVE4YCBwJrUJoICSEyBHCj/wDIP+CoQdBj4CEv5oBBwMf/AHBZz//BwKJCh/gfAIsBgBBCn6/edlnzLIICLU4QCIFI/AAQpKBARgRB/ACIFAN4AQhZM+KwB+LyB+P8AQKzB+IRC54CB44CB4ICB4CGH4YREAQnzARyYCAQnhWY5JBARLsMCg5tBbR8AfYICLDRgABb4S3C/4CCHIM/BIMHBIYXBj4CBv+AgYIBn62BC4QTCEYQpCLgTEBCIgGBj4mCAQU/EwhNCEIIQDEgP/GQIaCgJEEAoQLCFgQXCCwJBDCoOA8EDVoKGB/gdB/w7Bn4aBh50CW4IFCBYV+n4mBC4IdCEYQpCZAZQCAQ8DAQRNBAQwXKAQQAF8IXB+YCI44CM/4CI4ZWDAAV/f4IAIP4QCFuCLBDQTmCVoRZDSoMPZYqqBPYI4GFhA+IJQQXCA'))),
      32,
      atob("CAcMDw8WEAcKCg0NBwoHCg8NDw8PDw8ODw8HBw0NDQ8RDw8PDw8ODw8HDg8NFBAPDhAPDw0PDxYPDw8JCgk="),
      24|65536
    );
  };
  Graphics.prototype.setFontLECO1976Regular14 = function() {
    // Actual height 14 (13 - 0)
    return this.setFontCustom(
      atob('AAAAAAAAAAAD+w/sAAAAA8APAAAA8APAAAAMwP/D/wMwDMD/w/8DMAAAAAD8w/M8z/M/zPM/DPwAAAAPwD8QzcP/D/AHgD/D/wzMI/APwAAAAD/w/8MzDMwzMM/DPwDAAADwA8AAAAAAD8H/74f4BwAAAA4B/z8/8D8AAAAAeAPwD8AeAHgAAAAAAAAYAGAH4B+AGABgAAAAAAHgB4AAAAAYAGABgAYAAAAAABgAYAAAAQA8D/D+A8AAAAAA/8P/DAwwMMDD/w/8AAAAAwMMDD/w/8ADAAwAAO/DvwzMMzDMw/MPzAAAAAMDDMwzMMzDMw/8P/AAAAAPwD8ADAAwAMA/8P/AAAAAP3D9wzMMzDMwz8M/AAAAAP/D/wzMMzDMwz8M/AAA4AOADAAwAMAD/w/8AAAAA/8P/DMwzMMzD/w/8AAAAA/MPzDMwzMMzD/w/8AAAAAYYGGAAAAAGHhh4AABwAcAPgDYB3AYwAAAAAZgGYBmAZgGYBmAAAAABjAdwDYA+AHABwAAA4AOADOwzsMwD8A/AAAAAA//P/zAM37N+zZs/7P+wAAAAP/D/wzAMwDMA/8P/AAAAAP/D/wzMMzDMw/8P/AAAAAP/D/wwMMDDAwwMMDAAAAAP/D/wwMMDDhw/8H+AAAAAP/D/wzMMzDMwzMMDAAAAAP/D/wzAMwDMAzAMAAAA/8P/DAwzMMzDPwz8AAAAA/8P/AMADAAwD/w/8AAAAA/8P/AAAwMMDDAwwMMDD/w/8AAAAA/8P/AcAPAPwDvwj8AAAAA/8P/AAwAMADAAwAAP/D/w/AB+AHwA8B+B+A/8P/AAA/8P/D/wfAB8AHw/8P/AAAAAP/D/wwMMDDAw/8P/AAAAAP/D/wzAMwDMA/APwAAA/8P/DAwwMMDD/8//AAwAA/8P/DOAzwM/D9w/EAAAAA/MPzDMwzMMzDPwz8AADAAwAMAD/w/8MADAAwAAAD/w/8ADAAwAMP/D/wAAPAD8AP4AfAHwP4PwDgAAAPgD/gH8AfB/w/AP4A/wA8D/D/A8AAADAw4cP/A/APwH+DzwwMAAAAA/APwAPwD8A/D8A/AAAAAAz8M/DMwzMMzD8w/MAAAAA/////ADwA4ADwA/wB/ADwAAMAPAD////8A'),
      32,
      atob("BAQHCQkNCQQGBggIBAYEBgkHCQkJCQkICQkEBAcIBwkKCQkJCQkICQkECAkHDAkJCAkJCQgJCQ0JCQkFBgU="),
      14|65536
    );
  };

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

  let draw = function() {
    queueDraw();
    var d = new Date();
    var hr = d.getHours().toString().padStart(2,0);
    var mn = d.getMinutes().toString().padStart(2,0);
    var date = require("locale").date(new Date()).split(" ").slice(0,2).join(" ").toUpperCase();
    var x = 6, y = 16, w = 55, h = 67, datesz = 20, s=5;
    g.reset();
    background.fillRect(x, y, x + w*2, y + h*2 + datesz);
    var dx = x+w, dy = y+h+datesz-10;
    g.setFont("LECO1976Regular").setFontAlign(0,0);
    g.setColor(g.theme.bg).drawString(date, dx+3,dy-3).drawString(date, dx+3,dy+3);
    g.drawString(date, dx-3,dy-3).drawString(date, dx-3,dy+3);
    g.drawString(date, dx,dy-3).drawString(date, dx,dy+3);
    g.drawString(date, dx-3,dy).drawString(date, dx+3,dy);
    g.setColor(g.theme.fg).drawString(date, dx,dy);
    g.drawImage(numerals[hr[0]], x, y, {scale:s});
    g.drawImage(numerals[hr[1]], x+w, y, {scale:s});
    g.drawImage(numerals[mn[0]], x, y+h+datesz, {scale:s});
    g.drawImage(numerals[mn[1]], x+w, y+h+datesz, {scale:s});
  };

  let clockInfoMenuA, clockInfoMenuB;
  // Show launcher when middle button pressed
  Bangle.setUI({
    mode: "clock",
    redraw : draw,
    remove: function() {
      if (drawTimeout) clearTimeout(drawTimeout);
      drawTimeout = undefined;
      if (clockInfoMenuA) clockInfoMenuA.remove();
      if (clockInfoMenuB) clockInfoMenuB.remove();
      require("widget_utils").show(); // re-show widgets
    }
  });

  Bangle.loadWidgets();
  require("widget_utils").swipeOn();
  let R = Bangle.appRect;
  let background = require("clockbg");
  background.fillRect(R);
  draw();
  g.flip();

  // Load the clock infos
  let clockInfoW = 54;
  let clockInfoH = g.getHeight()>>1;
  let clockInfoItems = require("clock_info").load();
  let clockInfoDraw = (itm, info, options) => {
    // itm: the item containing name/hasRange/etc
    // info: data returned from itm.get() containing text/img/etc
    // options: options passed into addInteractive
    // Clear the background - if focussed, add a border
    g.reset().setBgColor(g.theme.bg).setColor(g.theme.fg);
    var b = 0; // border
    if (options.focus) { // white border
      b = 4;
      g.clearRect(options.x, options.y, options.x+options.w-1, options.y+options.h-1);
    }
    background.fillRect(options.x+b, options.y+b, options.x+options.w-1-b, options.y+options.h-1-b);
    // we're drawing center-aligned here
    if (info.img)
      require("clock_info").drawBorderedImage(info.img,options.x+3, options.y+3, {scale:2});
    g.setFont("LECO1976Regular").setFontAlign(0, -1);
    var txt = info.text.toString().toUpperCase();
    if (g.stringWidth(txt) > options.w) // if too big, smaller font
      g.setFont("LECO1976Regular14");
    if (g.stringWidth(txt) > options.w) {// if still too big, split to 2 lines
      var l = g.wrapString(txt, options.w);
      txt = l.slice(0,2).join("\n") + (l.length>2)?"...":"";
    }
    var x = options.x+options.w/2, y = options.y+54;
    g.setColor(g.theme.bg).drawString(txt, x-2, y). // draw the text background
                           drawString(txt, x+2, y).
                           drawString(txt, x, y-2).
                           drawString(txt, x, y+2);
    // draw the text, with border
    g.setColor(g.theme.fg).drawString(txt, x, y);
  };

  clockInfoMenuA = require("clock_info").addInteractive(clockInfoItems, {
    app:"pebblepp",
    x : g.getWidth()-clockInfoW, y: 0, w: clockInfoW, h:clockInfoH,
    draw : clockInfoDraw
  });
  clockInfoMenuB = require("clock_info").addInteractive(clockInfoItems, {
    app:"pebblepp",
    x : g.getWidth()-clockInfoW, y: clockInfoH, w: clockInfoW, h:clockInfoH,
    draw : clockInfoDraw
  });
  }