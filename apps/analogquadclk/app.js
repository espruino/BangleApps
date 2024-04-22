const W = g.getWidth();
const H = g.getHeight();
const background = require("clockbg"); // image backgrounds
let drawTimeout; // timeout used to update every minute
let date = new Date(); // date at last draw
let lastModified = {x1:0,y1:0,x2:W-1,y2:H-1,first:true}; // rect that was covered by hands

const HOUR_LEN = 55; // how far forwards does hand go?
const MIN_LEN = 72;
const HOUR_BACK = 10; // how far backwards dows hand go?
const MIN_BACK = 10;
const HOUR_W = 10; // width of cleared area
const MIN_W = 8;

function get_hand(len, w, cornerw, overhang) {
  return new Int8Array([
    0, overhang+w,
    -cornerw, overhang+cornerw,
    -w, overhang,
    -w, -len,
    -cornerw, -len - cornerw,
    0, -len - w,
    cornerw, -len - cornerw,
    w, -len,
    w, overhang,
    cornerw, overhang+cornerw
  ]);
}
const hand_hour = get_hand(HOUR_LEN, 6, 4, HOUR_BACK);
const hand_hour_bg = get_hand(HOUR_LEN, HOUR_W, 8, HOUR_BACK);
const hand_minute = get_hand(MIN_LEN, 4, 3, MIN_BACK);
const hand_minute_bg = get_hand(MIN_LEN, MIN_W, 6, MIN_BACK);


// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

// draw the clock hands
function drawHands() {
  let h = date.getHours()*Math.PI/6, m = date.getMinutes()*Math.PI/30;
  g.setColor(g.theme.bg).fillPolyAA(g.transformVertices(hand_hour_bg,{x:W/2,y:H/2,rotate:h}));
  g.fillPolyAA(g.transformVertices(hand_minute_bg,{x:W/2,y:H/2,rotate:m}));
  g.setColor("#f00").fillPolyAA(g.transformVertices(hand_hour,{x:W/2,y:H/2,rotate:h}));
  g.setColor(g.theme.fg).fillPolyAA(g.transformVertices(hand_minute,{x:W/2,y:H/2,rotate:m}));
}

// return the screen area covered by clock hands (used for filling in background)
function getHandBounds() {
  let h = date.getHours()*Math.PI/6, m = date.getMinutes()*Math.PI/30;
  let sh = Math.sin(h), ch = Math.cos(h), sm = Math.sin(m), cm = Math.cos(m);
  return {
    x1 : Math.round((W/2)+Math.min(sh*HOUR_LEN, sm*MIN_LEN, -sh*HOUR_BACK, -sm*MIN_BACK)-HOUR_W),
    y1 : Math.round((H/2)-Math.max(ch*HOUR_LEN, cm*MIN_LEN, -ch*HOUR_BACK, -cm*MIN_BACK)-HOUR_W),
    x2 : Math.round((W/2)+Math.max(sh*HOUR_LEN, sm*MIN_LEN, -sh*HOUR_BACK, -sm*MIN_BACK)+HOUR_W),
    y2 : Math.round((H/2)-Math.min(ch*HOUR_LEN, cm*MIN_LEN, -ch*HOUR_BACK, -cm*MIN_BACK)+HOUR_W),
  };
}

function draw() {
  // queue next draw in one minute
  queueDraw();
  // work out locale-friendly date/time
  date = new Date();
  //var timeStr = require("locale").time(date,1);
  //var dateStr = require("locale").date(date);
  // fill in area that we changed last time
  background.fillRect(lastModified.x1, lastModified.y1, lastModified.x2, lastModified.y2);
  if (!lastModified.first) { // first draw we don't have clockInfoMenuA/etc defined
    if (lastModified.y1<30) {
      if (lastModified.x1 < 30) clockInfoMenuA.redraw();
      if (lastModified.x2 > W-30) clockInfoMenuB.redraw();
    }
    if (lastModified.y2>W-20) {
      if (lastModified.x1 < 30) clockInfoMenuD.redraw();
      if (lastModified.x2 > W-30) clockInfoMenuC.redraw();
    }
  }
  // draw hands
  drawHands();
  lastModified = getHandBounds();
  //g.drawRect(lastModified); // debug
}

// Clear the screen once, at startup
background.fillRect(0, 0, W - 1, H - 1);
// draw immediately at first, queue update
draw();

// used for clockinfo image rendering
let clockInfoG = Graphics.createArrayBuffer(28, 28, 2, {msb:true});
clockInfoG.transparent = 3;
// render clockinfos
let clockInfoDraw = function(itm, info, options) {
  // itm: the item containing name/hasRange/etc
  // info: data returned from itm.get() containing text/img/etc
  // options: options passed into addInteractive
  const left = options.x < 88,
      top = options.y < 88,
      imgx = left ? 1 : W - 28, imgy = top ? 19 : H - 42,
      textx = left ? 2 : W - 1, texty = top ? 2 : H - 16;
  let bg = g.theme.bg, fg = g.theme.fg;
  // Clear the background
  g.reset();
  background.fillRect(imgx, imgy, imgx+25, imgy+25); // erase image
  background.fillRect(left?0:W/2, texty-1, left?W/2:W-1, texty+15); // erase text
  // indicate focus - change colours
  if (options.focus) {
    bg = g.theme.fg;
    fg = g.toColor("#f00");
  }

  if (info.img) {
    //g.drawImage(info.img, left ? 2 : W - 27, top ? 18 : H - 41); // draw the image
    // fiddle around colouring the border and inside of the image
    clockInfoG.clear(1);
    // do a border - images need to be transparent for this
    clockInfoG.setColor(2).drawImage(info.img, 1,1).drawImage(info.img, 3,1).
                           drawImage(info.img, 1,3).drawImage(info.img, 3,3);
    clockInfoG.setColor(1).drawImage(info.img, 2,2); // main image
    clockInfoG.floodFill(27,27,3); // flood fill edge to transparent
    clockInfoG.palette = new Uint16Array([bg,fg,bg/*border*/, g.toColor("#888")]);
    g.drawImage(clockInfoG, imgx-1, imgy-1);
  }

  g.setFont("6x8:2").setFontAlign(left ? -1 : 1, -1);
  g.setColor(bg).drawString(info.text, textx-2, texty). // draw the text background
                 drawString(info.text, textx+2, texty).
                 drawString(info.text, textx, texty-2).
                 drawString(info.text, textx, texty+2);
  g.setColor(fg).drawString(info.text, textx, texty); // draw the text
  // redraw hands if needed
  if ((top && lastModified.x1<texty+15) ||
      (!top && lastModified.y2>=texty)) {
    g.reset();
    drawHands();
  }
};

// Load the clock infos
let clockInfoItems = require("clock_info").load();
let clockInfoItemsBangle = clockInfoItems.find(i=>i.name=="Bangle");
// Add extra Calendar and digital clock ClockInfos
if (clockInfoItemsBangle) {
  if (!clockInfoItemsBangle.items.find(i=>i.name=="Date")) {
    clockInfoItemsBangle.items.push({ name : "Date",
        get : () => {
          let d = new Date();
          let g = Graphics.createArrayBuffer(24,24,1,{msb:true});
          g.drawImage(atob("FhgBDADAMAMP/////////////////////8AADwAAPAAA8AADwAAPAAA8AADwAAPAAA8AADwAAPAAA8AADwAAP///////"),1,0);
          g.setFont("6x15").setFontAlign(0,0).drawString(d.getDate(),11,17);
          return {
            text : require("locale").dow(d,1).toUpperCase(),
            img : g.asImage("string")
          };
        },
        show : function() {
          this.interval = setTimeout(()=>{
            this.emit("redraw");
            this.interval = setInterval(()=>{
              this.emit("redraw");
            }, 86400000);
          }, 86400000 - (Date.now() % 86400000));
        },
       hide : function() {
          clearInterval(this.interval);
          this.interval = undefined;
        }
      });
  }
  if (!clockInfoItemsBangle.items.find(i=>i.name=="Clock")) {
    clockInfoItemsBangle.items.push({ name : "Clock",
        get : () => {
          return {
            text : require("locale").time(new Date(),1),
            img : atob("GBiBAAAAAAB+AAD/AAD/AAH/gAP/wAP/wAYAYAYAYAYAYAYAYAYAcAYAcAYAYAYAYAYAYAYAYAP/wAP/wAH/gAD/AAD/AAB+AAAAAA==")
          };
        },
        show : function() {
          this.interval = setTimeout(()=>{
            this.emit("redraw");
            this.interval = setInterval(()=>{
              this.emit("redraw");
            }, 60000);
          }, 60000 - (Date.now() % 60000));
        },
       hide : function() {
          clearInterval(this.interval);
          this.interval = undefined;
        }
      });
  }
}


// Add the 4 clockinfos
const CLOCKINFOSIZE = 50;
let clockInfoMenuA = require("clock_info").addInteractive(clockInfoItems, {
  x: 0,
  y: 0,
  w: CLOCKINFOSIZE,
  h: CLOCKINFOSIZE,
  draw: clockInfoDraw
});
let clockInfoMenuB = require("clock_info").addInteractive(clockInfoItems, {
  x: W - CLOCKINFOSIZE,
  y: 0,
  w: CLOCKINFOSIZE,
  h: CLOCKINFOSIZE,
  draw: clockInfoDraw
});
let clockInfoMenuC = require("clock_info").addInteractive(clockInfoItems, {
  x: W - CLOCKINFOSIZE,
  y: H - CLOCKINFOSIZE,
  w: CLOCKINFOSIZE,
  h: CLOCKINFOSIZE,
  draw: clockInfoDraw
});
let clockInfoMenuD = require("clock_info").addInteractive(clockInfoItems, {
  x: 0,
  y: H - CLOCKINFOSIZE,
  w: CLOCKINFOSIZE,
  h: CLOCKINFOSIZE,
  draw: clockInfoDraw
});

// Show launcher when middle button pressed
Bangle.setUI({
  mode: "clock",
  remove: function() {
    if (drawTimeout) clearTimeout(drawTimeout);
    clockInfoMenuA.remove();
  }
});
// Load widgets
Bangle.loadWidgets();
require("widget_utils").hide();