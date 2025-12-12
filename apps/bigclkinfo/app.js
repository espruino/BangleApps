// TODO:
// Add setting to decide if the app shoud set Bangle.CLOCK=1 ?
// Make an updating analog clock info entry to use as start card. (update clkinfoclk or make a new one?)

let isClock = true; // TODO: make optional via setting.
if (isClock) {
  Bangle.setUI("clock");
}

// Load the clock infos
let clockInfoItems = require("clock_info").load();
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
    g.reset().clearRect(options.x, options.y, options.x+options.w-1, options.y+options.h-1);
    // indicate focus - we're using a border, but you could change color?
    if (options.focus) g.drawRect(options.x, options.y, options.x+options.w-1, options.y+options.h-1); // show if focused
    // we're drawing center-aligned here
    var midx = options.x+options.w/2;
    let scale = 5;
    if (info.img) g.drawImage(info.img, midx-12*scale,options.y+4, {scale:scale}); // draw the image
    g.setFont("6x8:2").setFontAlign(0,1).drawString(info.text, midx,options.y+160); // draw the text
  }
});
setTimeout(
  ()=>{
    clockInfoMenu.menuA = 0;
    if (clockInfoItems[0].items[6]) clockInfoMenu.menuB = 6; // Assume clkinfoclk is at indices (0,6)
    clockInfoMenu.redraw()
  }, 5
)
E.prependListener("kill", ()=>{clockInfoMenu.menuA = 0; clockInfoMenu.menuB = 6;}) // reset to initial menu state to prepare for next launch.
