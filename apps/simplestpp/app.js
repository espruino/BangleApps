// Simplestpp Clock, see comments 'clock_info_support'

function draw() {
  var date = new Date();
  var timeStr = require("locale").time(date,1);
  var h = g.getHeight();
  var w = g.getWidth();

  g.reset();
  g.setColor(g.theme.bg);
  g.fillRect(Bangle.appRect);

  g.setFont('Vector', w/3);
  g.setFontAlign(0, 0);
  g.setColor(g.theme.fg);
  g.drawString(timeStr, w/2, h/2);

  clockInfoMenu.redraw();   // clock_info_support
  queueDraw(); // queue draw in one minute
}

// timeout used to update every minute
var drawTimeout;

// schedule a draw for the next minute
function queueDraw() {
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
}

/**
 * clock_info_support
 * this is the callback function that get invoked by clockInfoMenu.redraw();
 *
 * We will display the image and text on the same line and centre the combined
 * length of the image+text
 *
 */
function clockInfoDraw(itm, info, options) {

  g.reset().setFont('Vector',24).setBgColor(options.bg).setColor(options.fg);

  //use info.text.toString(), steps does not have length defined
  var text_w = g.stringWidth(info.text.toString());
  // gap between image and text
  var gap = 10;
  // width of the image and text combined
  var w = gap + (info.img ? 24 :0) + text_w;
  // different fg color if we tapped on the menu
  if (options.focus) g.setColor(options.hl);

  // clear the whole info line
  g.clearRect(0, options.y -1, g.getWidth(), options.y+24);

  // draw the image if we have one
  if (info.img) {
    // image start
    var x = (g.getWidth() / 2) - (w/2);
    g.drawImage(info.img, x, options.y);
    // draw the text to the side of the image (left/centre alignment)
    g.setFontAlign(-1,0).drawString(info.text, x + 23 + gap, options.y+12);
  } else {
    // text only option, not tested yet
    g.setFontAlign(0,0).drawString(info.text, g.getWidth() / 2, options.y+12);
  }

}

/**
 * clock_info_support: retrieve all the clock_info modules that are
 * installed
 *
 */
let clockInfoItems = require("clock_info").load();

/**
 * clock_info_support: setup the way we wish to interact with the menu
 * the hl property defines the color the of the info when the menu is
 * selected after tapping on it
 *
 */
let clockInfoMenu = require("clock_info").addInteractive(clockInfoItems, { app:"simplestpp", x:64, y:132, w:50, h:40, draw : clockInfoDraw, bg : g.theme.bg, fg : g.theme.fg, hl : "#0ff"} );

// Clear the screen once, at startup
g.clear();

// Show launcher when middle button pressed
Bangle.setUI("clock");
// Load widgets
Bangle.loadWidgets();
Bangle.drawWidgets();
draw();
