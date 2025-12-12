// TODO:
// Add setting to decide if the app shoud set Bangle.CLOCK=1 ?
// Make an updating analog clock info entry to use as start card. (update clkinfoclk or make a new one?)

let isClock = true; // TODO: make optional via setting.
if (isClock) {
  Bangle.setUI("clock");
}

// once at the start
let background = require("clockbg");

// to fill the whole area
background.fillRect(Bangle.appRect.x+3, Bangle.appRect.y+3, Bangle.appRect.x+Bangle.appRect.w-5, Bangle.appRect.y+Bangle.appRect.h-5);
// if you ever need to reload to a new background (this could take ~100ms)
//background.reload();

// Call this to unload (free memory - eg in .remove when fast loading)
//background.unload();

// If .unload has been called and you might have fast-loaded back, call .load to ensure everything is loaded again!
// It won't reload if it's already been loaded
//background.load();

// Load the clock infos
let clockInfoItems = require("clock_info").load();
if (clockInfoItems[0].items[6]) { // TODO: Should maybe be more robust against changes to clock info, i.e. search for "clock" among items.
  let clockItem = clockInfoItems[0].items.pop();
  clockInfoItems[0].items.unshift(clockItem);
}
// Add the
let clockInfoMenu = require("clock_info").addInteractive(clockInfoItems, {
  // Add the dimensions we're rendering to here - these are used to detect taps on the clock info area
  x : 0, y: 0, w: Bangle.appRect.w, h: Bangle.appRect.h, app: "bigclkinfo",
  // You can add other information here you want to be passed into 'options' in 'draw'
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
    if (info.img) require("clock_info").drawBorderedImage(info.img, midx-12*scale,options.y+10, {scale:scale}); // draw the image
    let foundFontText = g.findFont(info.text, { 
      w : Bangle.appRect.w-9,    // optional: width available (default = screen width)
      h : Bangle.appRect.h*2/5,    // optional: height available (default = screen height)
      min : 10,   // optional: min font height
      max : 60,   // optional: max font height
      wrap : true, // optional: allow word wrap?
      trim : true // optional: trim to the specified height, add '...'
    }); // TODO: g.findFont returns max size 28px. Would be nice with bigger font if there's room.
    //print(foundFontText);
    g.setFont(foundFontText.font).setFontAlign(0,1).drawString(foundFontText.text, midx,options.y+165); // draw the text
  }
});

E.prependListener("kill", ()=>{clockInfoMenu.menuA = 0; clockInfoMenu.menuB = 0;}) // reset to initial menu state to prepare for next launch.
