/*
 * Demonstrate colours
 */


// BEGIN colour constants
const COLOUR_BLACK         = 0x0000;   // same as: g.setColor(0, 0, 0)
const COLOUR_DARK_GREY     = 0x4208;   // same as: g.setColor(0.25, 0.25, 0.25)
const COLOUR_GREY          = 0x8410;   // same as: g.setColor(0.5, 0.5, 0.5)
const COLOUR_LIGHT_GREY    = 0xc618;   // same as: g.setColor(0.75, 0.75, 0.75)
const COLOUR_WHITE         = 0xffff;   // same as: g.setColor(1, 1, 1)

const COLOUR_RED           = 0xf800;   // same as: g.setColor(1, 0, 0)
const COLOUR_GREEN         = 0x07e0;   // same as: g.setColor(0, 1, 0)
const COLOUR_BLUE          = 0x001f;   // same as: g.setColor(0, 0, 1)
const COLOUR_YELLOW        = 0xffe0;   // same as: g.setColor(1, 1, 0)
const COLOUR_MAGENTA       = 0xf81f;   // same as: g.setColor(1, 0, 1)
const COLOUR_CYAN          = 0x07ff;   // same as: g.setColor(0, 1, 1)

const COLOUR_LIGHT_RED     = 0xfc10;   // same as: g.setColor(1, 0.5, 0.5)
const COLOUR_LIGHT_GREEN   = 0x87f0;   // same as: g.setColor(0.5, 1, 0.5)
const COLOUR_LIGHT_BLUE    = 0x841f;   // same as: g.setColor(0.5, 0.5, 1)
const COLOUR_LIGHT_YELLOW  = 0xfff0;   // same as: g.setColor(1, 1, 0.5)
const COLOUR_LIGHT_MAGENTA = 0xfc1f;   // same as: g.setColor(1, 0.5, 1)
const COLOUR_LIGHT_CYAN    = 0x87ff;   // same as: g.setColor(0.5, 1, 1)

const COLOUR_DARK_RED      = 0x8000;   // same as: g.setColor(0.5, 0, 0)
const COLOUR_DARK_GREEN    = 0x0400;   // same as: g.setColor(0, 0.5, 0)
const COLOUR_DARK_BLUE     = 0x0010;   // same as: g.setColor(0, 0, 0.5)
const COLOUR_DARK_YELLOW   = 0x8400;   // same as: g.setColor(0.5, 0.5, 0)
const COLOUR_DARK_MAGENTA  = 0x8010;   // same as: g.setColor(0.5, 0, 0.5)
const COLOUR_DARK_CYAN     = 0x0410;   // same as: g.setColor(0, 0.5, 0.5)

const COLOUR_PINK          = 0xf810;   // same as: g.setColor(1, 0, 0.5)
const COLOUR_LIMEGREEN     = 0x87e0;   // same as: g.setColor(0.5, 1, 0)
const COLOUR_ROYALBLUE     = 0x041f;   // same as: g.setColor(0, 0.5, 1)
const COLOUR_ORANGE        = 0xfc00;   // same as: g.setColor(1, 0.5, 0)
const COLOUR_INDIGO        = 0x801f;   // same as: g.setColor(0.5, 0, 1)
const COLOUR_TURQUOISE     = 0x07f0;   // same as: g.setColor(0, 1, 0.5)
// END colour constants


// array of colours to be demoed:
//  [ colour value, label colour, label ]
const demo = [
  [ COLOUR_LIGHT_RED,      COLOUR_BLACK, 'LIGHT RED' ],
  [ COLOUR_RED,            COLOUR_WHITE, 'RED' ],
  [ COLOUR_DARK_RED,       COLOUR_WHITE, 'DARK RED' ],

  [ COLOUR_LIGHT_YELLOW,   COLOUR_BLACK, 'LIGHT YELLOW' ],
  [ COLOUR_YELLOW,         COLOUR_BLACK, 'YELLOW' ],
  [ COLOUR_DARK_YELLOW,    COLOUR_WHITE, 'DARK YELLOW' ],

  [ COLOUR_LIGHT_GREEN,    COLOUR_BLACK, 'LIGHT GREEN' ],
  [ COLOUR_GREEN,          COLOUR_BLACK, 'GREEN' ],
  [ COLOUR_DARK_GREEN,     COLOUR_WHITE, 'DARK GREEN' ],

  [ COLOUR_LIGHT_CYAN,     COLOUR_BLACK, 'LIGHT CYAN' ],
  [ COLOUR_CYAN,           COLOUR_BLACK, 'CYAN' ],
  [ COLOUR_DARK_CYAN,      COLOUR_WHITE, 'DARK CYAN' ],

  [ COLOUR_LIGHT_BLUE,     COLOUR_BLACK, 'LIGHT BLUE' ],
  [ COLOUR_BLUE,           COLOUR_WHITE, 'BLUE' ],
  [ COLOUR_DARK_BLUE,      COLOUR_WHITE, 'DARK BLUE' ],

  [ COLOUR_LIGHT_MAGENTA,  COLOUR_BLACK, 'LIGHT MAGENTA' ],
  [ COLOUR_MAGENTA,        COLOUR_WHITE, 'MAGENTA' ],
  [ COLOUR_DARK_MAGENTA,   COLOUR_WHITE, 'DARK MAGENTA' ],

  [ COLOUR_LIMEGREEN,      COLOUR_BLACK, 'LIMEGREEN' ],
  [ COLOUR_TURQUOISE,      COLOUR_BLACK, 'TURQUOISE' ],
  [ COLOUR_ROYALBLUE,      COLOUR_WHITE, 'ROYALBLUE' ],

  [ COLOUR_ORANGE,         COLOUR_BLACK, 'ORANGE' ],
  [ COLOUR_PINK,           COLOUR_WHITE, 'PINK' ],
  [ COLOUR_INDIGO,         COLOUR_WHITE, 'INDIGO' ],

  [ COLOUR_LIGHT_GREY,     COLOUR_BLACK, 'LIGHT GREY' ],
  [ COLOUR_GREY,           COLOUR_BLACK, 'GREY' ],
  [ COLOUR_DARK_GREY,      COLOUR_WHITE, 'DARK GREY' ],

  [ COLOUR_WHITE,          COLOUR_BLACK, 'WHITE' ],
  [ COLOUR_BLACK,          COLOUR_WHITE, 'BLACK' ],
];

const columns = 3;
const rows = 10;


// initialise
g.clear(true);
g.setFont('6x8').setFontAlign(-1, -1);

// calc some values required to draw the grid
const colWidth = Math.floor(g.getWidth() / columns);
const rowHeight = Math.floor(g.getHeight() / rows);
const xStart = Math.floor((g.getWidth() - (columns * colWidth)) / 2);
var x = xStart;
var y = Math.floor((g.getHeight() - (rows * rowHeight)) / 2);

// loop through the colours to be demoed
for (var idx in demo) {
  var colour = demo[idx][0];
  var labelColour = demo[idx][1];
  var label = demo[idx][2];

  // draw coloured box
  g.setColor(colour).fillRect(x, y, x + colWidth - 1, y + rowHeight - 1);

  // label it
  g.setColor(labelColour).drawString(g.wrapString(label, colWidth).join("\n"), x, y);

  x += colWidth;
  if ((x + colWidth) >= g.getWidth()) {
    x = xStart;
    y += rowHeight;
  }
}

// there's an "unused" box left - cross it out
g.setColor(COLOUR_RED);
g.drawLine(x, y, x + colWidth - 1, y + rowHeight - 1);
g.drawLine(x, y + rowHeight - 1, x + colWidth - 1, y);


// exit on button press
setWatch(e => { Bangle.showClock(); }, BTN1);

