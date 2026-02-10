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

function drawProgBar(x,y,w,val,col){
  g.setColor(col)
    .fillRect({x:x,y:y-2,w:w*Math.max(1,val),h:3,r:8})
}

let drawInlineClockInfo = function(itm, info, options, left) {
  background.fillRect(options.x, options.y, options.x + options.w, options.y + options.h);
  let font = g.findFont(info.text, {
    w: options.w - 28,
    h: 40,
    max: 35,
    wrap: true,
    trim: true
  });
  const mid = options.y + (options.h /2);
  g.setFont(font.font)
    .setColor(options.focus ? highlightColor : g.theme.bg)
    .drawImage(info.img,
      left ? options.x + options.w - 24-3 : options.x+3,
      mid - 12)
    .setFontAlign(left ? 1 : -1, 0)
    .drawString(font.text,
      left ? options.x + options.w - 28  // right-aligned: just before icon
           : options.x + 28,             // left-aligned: just after icon
      mid);
};
let drawRectClockInfo=function(itm,info,options,top){
    background.fillRect(options.x, options.y, options.x+options.w, options.y+options.h)
  
    drawProgBar(options.x+3,top?options.y+options.h-3:options.y+3,options.w-6,1,"#000")
    if(info.max){
    
      drawProgBar(options.x+3,top?options.y+options.h-3:options.y+3,options.w-6,+parseFloat((""+info.text).match(/[\d.]+/))/info.max,highlightColor)
    }
    let font=g.findFont(info.text,{w : options.w-5,
                            h : 30, 
                            max:15,
                            wrap : true,
                            trim : true 
                           })
    g.setFont(font.font)
        .setColor(options.focus?highlightColor:g.theme.bg)
        .drawImage(info.img,options.x+(options.w/2)-12,options.y+(options.h/2)+(top?-3:2),)
        .setFontAlign(0,0)
        .drawString(font.text,options.x+(options.w/2),options.y+(options.h/2)+(top?-15:2-10))
}

  
// Option 2: Larger edge gaps (3px), smaller internal gaps (2px)
const edge = 0;
const gap = 2;
const itemW = (g.getWidth() - 2*edge - 2*gap) / 3;

let tlClkInfo = require("clock_info").addInteractive(clockInfoItems, {
  x: edge, y: 3, w: itemW, h: 60,
  draw: function(itm, info,options){drawRectClockInfo(itm,info,options,true)}
});

let tmClkInfo = require("clock_info").addInteractive(clockInfoItems, {
  x: edge + itemW + gap, y: 3, w: itemW, h: 60,
  draw: function(itm, info,options){drawRectClockInfo(itm,info,options,true)}
});

let trClkInfo = require("clock_info").addInteractive(clockInfoItems, {
  x: edge + itemW + gap + itemW + gap, y: 3, w: itemW, h: 60,
  draw: function(itm, info,options){drawRectClockInfo(itm,info,options,true)}
});

let blClkInfo = require("clock_info").addInteractive(clockInfoItems, {
  x: edge, y: g.getHeight()-60-3, w: itemW, h: 60,
  draw: function(itm, info,options){drawRectClockInfo(itm,info,options,false)}
});

let bmClkInfo = require("clock_info").addInteractive(clockInfoItems, {
  x: edge + itemW + gap, y: g.getHeight()-60-3, w: itemW, h: 60,
  draw: function(itm, info,options){drawRectClockInfo(itm,info,options,false)}
});

let brClkInfo = require("clock_info").addInteractive(clockInfoItems, {
  x: edge + itemW + gap + itemW + gap, y: g.getHeight()-60-3, w: itemW, h: 60,
  draw: function(itm, info,options){drawRectClockInfo(itm,info,options,false)}
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


