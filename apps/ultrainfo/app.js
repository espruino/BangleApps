// Load fonts
let background = require("clockbg");
require("Font7x11Numeric7Seg").add(Graphics);
// X/Y are the position of the bottom right of the HH:MM text - make it central!
const X = g.getWidth()/2 + 45,
      Y = g.getHeight()/2 + 20;

let drawTimeout;




// Clear the screen once, at startup
g.clear();
// draw immediately at first
background.fillRect(Bangle.appRect);

/* Show launcher when middle button pressed
This should be done *before* Bangle.loadWidgets so that
widgets know if they're being loaded into a clock app or not */


let highlightColor="#f00"

// CLOCKINFOS:

let clockInfoItems = require("clock_info").load();

// helper function made by gemini
function drawRectGauge(x, y, val, s) {
  // TUNING PARAMETERS
  const arcSteps = 3;        // Steps per corner (2-6)
  const fastMode = true;   // Skip expensive sqrt calculations
  const simpleEdges = true; // Use 2 points for edges vs interpolation
  const skipSmallArcs = 0.5; // Skip arcs shorter than this fraction
  
  const w = s.w || 100;
  const h = s.h || 60;
  const r = s.r || 10;
  const t = s.t;
  
  // Pre-calc
  const hw = w >> 1, hh = h >> 1;
  const sw = w - (r << 1), sh = h - (r << 1);
  const cp = 1.57 * r;
  const total = 2 * sw + 2 * sh + 4 * cp;  // FIXED: was using bitwise ops incorrectly
  const target = total * val;
  
  const l = x - hw, rt = x + hw;
  const tp = y - hh, b = y + hh;
  
  let p = [];
  let len = 0;
  
  // Inline optimized arc
  function addArc(cx, cy, rad, startAngle, fraction) {
    const steps = fraction < skipSmallArcs ? 1 : arcSteps;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps * fraction;
      const a = startAngle + 1.57 * t;
      p.push(cx + rad * Math.cos(a), cy + rad * Math.sin(a));
    }
  }
  
  // Top edge
  if (len < target) {
    const d = sw < target - len ? sw : target - len;
    p.push(l + r, tp, l + r + d, tp);
    len += d;  // FIXED: add actual drawn amount, not full segment
  }
  
  // Top-right corner
  if (len < target) {
    const d = cp < target - len ? cp : target - len;
    addArc(rt - r, tp + r, r, -1.57, d / cp);
    len += d;  // FIXED
  }
  
  // Right edge
  if (len < target) {
    const d = sh < target - len ? sh : target - len;
    p.push(rt, tp + r, rt, tp + r + d);
    len += d;  // FIXED
  }
  
  // Bottom-right corner
  if (len < target) {
    const d = cp < target - len ? cp : target - len;
    addArc(rt - r, b - r, r, 0, d / cp);
    len += d;  // FIXED
  }
  
  // Bottom edge
  if (len < target) {
    const d = sw < target - len ? sw : target - len;
    p.push(rt - r, b, rt - r - d, b);
    len += d;  // FIXED
  }
  
  // Bottom-left corner
  if (len < target) {
    const d = cp < target - len ? cp : target - len;
    addArc(l + r, b - r, r, 1.57, d / cp);
    len += d;  // FIXED
  }
  
  // Left edge
  if (len < target) {
    const d = sh < target - len ? sh : target - len;
    p.push(l, b - r, l, b - r - d);
    len += d;  // FIXED
  }
  
  // Top-left corner
  if (len < target) {
    const d = cp < target - len ? cp : target - len;
    addArc(l + r, tp + r, r, 3.14, d / cp);
  }
  
  // Inner edge
  const n = p.length;
  if (fastMode) {
    const scale = 1 - t / r;
    for (let i = n - 2; i >= 0; i -= 2) {
      p.push(x + (p[i] - x) * scale, y + (p[i + 1] - y) * scale);
    }
  } else {
    for (let i = n - 2; i >= 0; i -= 2) {
      const dx = p[i] - x, dy = p[i + 1] - y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const f = (d - t) / d;
      p.push(x + dx * f, y + dy * f);
    }
  }
  
  g.setColor(s.fg).fillPoly(p);
}
let drawInlineClockInfo=function(itm,info,options,left){
    background.fillRect(options.x, options.y, options.x+options.w, options.y+options.h)
    let font=g.findFont(info.text,{w : options.w-26,
                            h : 35, 
                            max:20,
                            wrap : true,
                            trim : true 
                           })
     g.setFont(font.font)
        .setColor(options.focus?highlightColor:g.theme.bg)
        .drawImage(info.img,left?options.x+options.w-24:options.x,options.y+(options.h/2)-12)
        .setFontAlign(left?-1:1,0)
        .drawString(font.text,left?options.x+(options.w/2)-28:options.x+4,options.y+(options.h/2))
    
}
let drawRectClockInfo=function(itm,info,options){
    background.fillRect(options.x, options.y, options.x+options.w, options.y+options.h)
    g.setColor("#fff").fillRect({x:options.x,y:options.y,w:options.w,h:options.h,r:10});
    drawRectGauge(options.x+((options.w-1)/2),options.y+((options.h-1)/2),1,{
        w: options.w,      // width
        h: options.h,      // height
        r: 9,       // corner radius
        t: 1,       // thickness
        fg: '#000'
      });
    if(info.max){
      drawRectGauge(options.x+(options.w/2),options.y+(options.h/2),+parseFloat((""+info.text).match(/[\d.]+/))/info.max,{
        w: options.w,      // width
        h: options.h,      // height
        r: 9,       // corner radius
        t: 1,       // thickness
        fg: highlightColor
      });
    }
    let font=g.findFont(info.text,{w : options.w-5,
                            h : 30, 
                            max:15,
                            wrap : true,
                            trim : true 
                           })
    g.setFont(font.font)
        .setColor(options.focus?highlightColor:g.theme.bg)
        .drawImage(info.img,options.x+(options.w/2)-(12*0.9),options.y+(options.h/2)+2,{scale:0.9})
        .setFontAlign(0,0)
        .drawString(font.text,options.x+(options.w/2),options.y+(options.h/2)-10)
}

  
// Option 2: Larger edge gaps (3px), smaller internal gaps (2px)
const edge = 3;
const gap = 2;
const itemW = (g.getWidth() - 2*edge - 2*gap) / 3;

let tlClkInfo = require("clock_info").addInteractive(clockInfoItems, {
  x: edge, y: 3, w: itemW, h: 60,
  draw: drawRectClockInfo
});

let tmClkInfo = require("clock_info").addInteractive(clockInfoItems, {
  x: edge + itemW + gap, y: 3, w: itemW, h: 60,
  draw: drawRectClockInfo
});

let trClkInfo = require("clock_info").addInteractive(clockInfoItems, {
  x: edge + itemW + gap + itemW + gap, y: 3, w: itemW, h: 60,
  draw: drawRectClockInfo
});

let blClkInfo = require("clock_info").addInteractive(clockInfoItems, {
  x: edge, y: g.getHeight()-60-3, w: itemW, h: 60,
  draw: drawRectClockInfo
});

let bmClkInfo = require("clock_info").addInteractive(clockInfoItems, {
  x: edge + itemW + gap, y: g.getHeight()-60-3, w: itemW, h: 60,
  draw: drawRectClockInfo
});

let brClkInfo = require("clock_info").addInteractive(clockInfoItems, {
  x: edge + itemW + gap + itemW + gap, y: g.getHeight()-60-3, w: itemW, h: 60,
  draw: drawRectClockInfo
});

let leftInlineClkInfo = require("clock_info").addInteractive(clockInfoItems, {
  x: 0, y: g.getHeight()/2-20, w: g.getWidth()/2-5, h: 40,
  draw: function(itm,info,options){
    drawInlineClockInfo(itm,info,options,false)
  }
});
let rightInlineClkInfo = require("clock_info").addInteractive(clockInfoItems, {
  x: g.getWidth()/2+5, y: g.getHeight()/2-20, w: g.getWidth()/2-5, h: 40,
  draw: function(itm,info,options){
    drawInlineClockInfo(itm,info,options,true)
  }
});


Bangle.setUI("clock");


