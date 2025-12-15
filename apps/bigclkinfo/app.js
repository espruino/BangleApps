// TODO:
// Add setting to decide if the app shoud set Bangle.CLOCK=1 ?
// Make an updating analog clock info entry to use as start card. (update clkinfoclk or make a new one?)

let isClock = true; // TODO: make optional via setting.
if (isClock) {
  Bangle.setUI("clock");
}

// once at the start
let background = require("clockbg");
let clock_info = require("clock_info");

// Load the clock infos
let clockInfoItems = clock_info.load();
let clockInfoClockIdx = clockInfoItems[0].items.findIndex(c => c.name=="Clock");
if (clockInfoClockIdx>0) { // pull the clock to the front (if it exists and not there already)
  let clockInfoClock = clockInfoItems[0].items[clockInfoClockIdx];
  clockInfoItems[0].items.splice(clockInfoClockIdx,1); // remove
  clockInfoItems[0].items.unshift(clockInfoClock); // add to front
}
// Add the
let clockInfoMenu = clock_info.addInteractive(clockInfoItems, {
  app: "bigclkinfo",
  // Add the dimensions we're rendering to here - these are used to detect taps on the clock info area
  x : 0, y: 0, w: Bangle.appRect.w, h: Bangle.appRect.h,  // You can add other information here you want to be passed into 'options' in 'draw'
  // This function draws the info
  draw : (itm, info, options) => {
    // itm: the item containing name/hasRange/etc
    // info: data returned from itm.get() containing text/img/etc
    // options: options passed into addInteractive
    // Clear the background
    background.fillRect(options.x, options.y, options.x+options.w-1, options.y+options.h-1);
    // indicate focus - we're using a border, but you could change color?
    if (options.focus) g.fillRect(options.x, options.y, options.x+options.w-1, options.y+options.h-1); // show if focused
    background.fillRect(options.x+3, options.y+3, options.x+options.w-5, options.y+options.h-5);
    // we're drawing center-aligned here
    var midx = options.x+options.w/2;
    let scale = 4;
    if (info.img) clock_info.drawBorderedImage(info.img, midx-12*scale,options.y+10, {scale:scale}); // draw the image
    let foundFontText = g.findFont(info.text, {
      w : options.w-9,    // optional: width available (default = screen width)
      h : options.h*2/5,    // optional: height available (default = screen height)
      min : 10,   // optional: min font height
      max : 60,   // optional: max font height
      wrap : true, // optional: allow word wrap?
      trim : true // optional: trim to the specified height, add '...'
    }); // TODO: g.findFont returns max size 28px. Would be nice with bigger font if there's room.
    //print(foundFontText);
    g.setFont(foundFontText.font).setFontAlign(0,1).drawString(foundFontText.text, midx,options.y+165); // draw the text
  }
});
Bangle.on("lock", function(locked) {
  // ensure that when unlocked, we automatically focus the clockinfo by faking a tap on it
  if (!locked && !clockInfoMenu.focus)
    Bangle.emit("touch",0,{x:100,y:100});
});
E.prependListener("kill", ()=>{clockInfoMenu.menuA = 0; clockInfoMenu.menuB = 0;}) // reset to initial menu state to prepare for next launch.
