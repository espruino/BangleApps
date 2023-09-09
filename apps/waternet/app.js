// --------------------------------------------------------------------------------------------------
// images
// --------------------------------------------------------------------------------------------------
const BLOCKTILES = {
  width: 10,
  height: 10,
  bpp: 8,
  buffer: require("heatshrink").decompress(atob("AAPX64DFBJIDBAo4JJHKonTJ6I7XAB5j9Y7IJLeZL9LE6bHtBJZj9Y7JpLRbYALWqo75MdLHZBJYrJGpbpLYtY7bMe7HRZuIJRJ5rJnMfYJ/BMbHZBJ5t/fLqRNBJaDHBJIAnHaZj7fPpXHYt47VMfYnRe44AzO85j/MaLHZBObHvMf7HjAGa1VY7Jj/KJ7HTBObHvMf7HbMvpPTZP5jjBP4JjY7IJ/BMb5JBNYAnMf5PVBP7FvMf5PadxAIHAGZFJO6hj/MbTHaBOTHwMf7HjAGRjLACRj/MbTQOfJgJnLJTHvNvpaQMZZk6MZhsYMfptLMZTHaBPrHlMf7HjfJIJxXxjHaMf5aOMagJ9Y8pj/AH4AqOAgEORggEYGOJtLeBhj/GKIGCBJIdIBKgx4SuIEOACJIEAApZJBJRUIBKgxwNpSBIMf5jYchYdGBKgMHBJYx/GMafJVJa+JfOAxXMjQA/AH4A/AH4A/AH4AN64AIJP5sjBP4JZY6QJ/BLIA/ACC+KY6IA/MaD56BLzHcBP5jRKH5utJ/4JhMZIJ/BKLHRBP4JZfOIJfACZZ/MbL55BL68RAH4AaMpYLEAgYTEAhqPEUhIPDHpIZHHZBWJG5onPNCZj2AH4AkNIapFAAqFHAlxGNMqQJ/BK7GLY5QyXE5YjTIqpj3QL5jRCwpvJHA6zJBIxPgBKbHZG6rH5Q7qBXBKJjdfNAIRBLyp7Y/5FhWqZjjCgYJLAiYnnQRjHUGzbbJQL7HTBJ4dJBM5FRMZwnQBojRabZa9NMSTHqDs7HWMc4JQE6bEOLRgIFBIw7UDo4EJCgiCXMRQmJBKblVBMZmQBP4JVCJKhHBJI8ccqYKEMTQEVOw5PMShRtJICxjPBP53MaRTHcAoKfHGQ4JLAQL+YY7CBIBJKVQOxAxMBLZkMCQxPMIsifMIxZiSE5b+ZDpKLLIo4JRMh5jKTYgEoXqKMJMSKfOBLYxlY7IJGDpQKfHaBiVfJSiIIhoJ1CBTvZBL69MBJxj/J6BYJMSItFAl4BCBIpkHBJIeEY9ygLVBLljMeJtTBL4RJd6QNFBFJFYACBgSBJQnxMayLHGo4DCAQoJNDqZnHY6oRKEpAKFOZYrPSJYxJEhprTGpBfFY7QTRBIzHWMbpPHEYwJME5QEHMeYPFMbTHGMfwEFMajlIMfgOIMa70RMaISIAwYLFFQ4JMDpInMLJZPNMahPLIwgJOLJIzGMcwA="))
};

const CONGRATSTILES = {
  width: 10,
  height: 10,
  bpp: 8,
  buffer: require("heatshrink").decompress(atob("AAP/AAYJGAYQJkGMpjNBI5jeE7hFJBI7HXIpIJvIpJkRY9QJcY/4njY75jnDrYJRMpw7lE5QJPIpIJLIpY7ZBJaLLBMZlMBP4JYZJYVII1w4CHThhJd6hFQRJIdMHaZlQYhQJ8QY4JJMZwEGUAQOHBQYJPAlxjNQJDvJSpAJKDpIJkZKBF0J5a6JYhy9FMeAxLMMLH/Y5YJRY/53jMpj5kBZgJOO5bGQCYggJIjAJ1TpTvZBNKnHWJRj/BJwLFBJ4RMAl4BCBIoIDE67HxHBIxpY7YlDLJBjKHZBEJBLo5JbJRFJBKLHJCJ5FLJ5oA/AE4A="))
};

const CONGRATSSCREEN = {
  width: 160,
  height: 80,
  bpp: 1,
  buffer: atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAAAAAAAAAA4AAAcAAAAAAAA/4AAAAAAAADgADgADxwAAAAAAAD/gAAAAAAAAOAAOAAPHAAAAAAAAMODgDgOAcGA4AA4HA8ADgBAAAAAwA/j/B+Hz+P5zjh+HxwfB/D8AADAHOPcP4eO8OHOOG8PHDGHsPwAAMAc45wxhgPw4c44Pw8cMYYw4AAAwBzjnDGGA/Dhzjg/DxwxhjDgAADDnOOcMYYP8OHOOH8PHDGGMPwAAPOc45wxhh7w4c457w8cMYYwDAAAf5/jnD+GD/D5/jh/Dxw/hjD8AAA+D4OcH4YP8GD2OHMHHB8GMPwAAD4Pg5wfhg/wYPY4cwccHwYw/AAAAAAAAAeAAAAAAAAAAAAAAAAAAAAAAAAAPwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhBwIgAD4IA+D4PA+DwAA/CIPgACEHAiAAPggD4Pg8D4PAAD8Ig+AAIQiCIAAgCAIAiCIIAiAADAiCAAASCIIgACAIAgCIIggCIAAMCIIAAB4IgiAAIAgD4IgiD4IgAAwPg+AADAiCIAAgCAIA+DwIAiAADAiCAAAMCIIgACAIAgD4PAgCIAAMCIIAAAwIgiAAIAgCAIgiCAIgAAwIggAADAcD4AA+D4PgiCIPg8AADAiD4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8A4AAAAAAAAAAAAAAAAAAAAAAADwDgAAAAAAAAAAAAAAAAAAAAAAAPAOAAAAAAAAAAAAAAAAYAAAAAAA8A4AAAAAAAAAAAAAAAD4AAAAAADwDgAAAAAAAAAAMAAAA5wAAAAAAPg+AAAAAAAAAAD4AAADnAAAAAAA+D4AAAAAAAAAAPgMAAcEAAAAAAD4PgAAADAAAAABzj4ABCYAAAAAAD58AAAA+AAAAAEGc4AEIgAAAAAAPnwAAAHOAAAAAxdFwAQaAAwAAAAf+AAAARcAAAACCUXABBoADAAAAB/4AAABFwAAAAIJxEAEAgA+AAAAH/gAAAMRAAAAAgmCQAQCAHOAAAAP8AAAAgkAAOACAYBABAIAQYAAAA/wAAACAQAB8AIBgEAEAgDFwAAABkAAAAIBAAMYAgGAQAQCAMXAAAAGQAAAAgEAAxgCAYBABwYAgkAAAA/wAAACAQAOCAIBgEADBACCQAAAODwAAAIBAAxsAwGAQAOcAIBAAADgBgAAAgEADGQBB8BAAPgAgEAAAcADgAACBwAMFAHOwEAA+ACAQAABwAOAAAIHAAwUAc5BwABgAIBAAAEBgYAAAwYADAQA+HOAAGAAgEAAAweBwAABzgAMBAAwPgAAQACBwAACAYBAAAD4AAwEADAMAABAAMGAAAIBgEAAADAADAQAIAwAAEAAwYAAAgGAQAAAMAAMBAAgDAAAIABzgAACAYBAAAAwAA4MACAIAAAgAD4AAAIHwEAAACAAAggAEAgAACAADAAAAwfBwAAAIAADGAAQBAAAOAAMAAABAAGAAAAQAAHwABAEAAA4AAwAAAEAAYAAABAAAfAAEAQAABgACAAAAcADgAAAEAAA4AAYBAAAAAAIAAAA4AYAAAAQAADgAAgGAAAAAAQAAAA4PAAAABgAAIAAAAIAAAAABAAAAA/wAAAACAAAgAAAAgAAAAAEAAAAD/AAAAAIAACAAAAAAAAAAAQAAAAAAAAAAAAAAGAAAA==")
};

const SELECTORTILES = {
  width: 10,
  height: 10,
  bpp: 8,
  transparent: 0,
  buffer: require("heatshrink").decompress(atob("AH4AP64IIBJQKIAH5tQMhISaAH51ZAH5Z/KNYJdAH4A/Z/7P/AC4"))
};

const TITLE = {
  width: 160,
  height: 50,
  bpp: 1,
  buffer: atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAPg/AcAAAAAAAAAAAAAAAAAAAAAB+D8HwAAAAAAAAAAAAAAPgAAAAAH4PwfAAAAAAAAAAAAAAA+AAAAAAfg/B8AAD8AAAAAAAAAAH4AAAAAB+H8HwAAP4AAAAAAAAAA/gAAAAAH4fwfB/x/gPwPPeP4B/D/gAAAAAfh/B8P///3/g997/w/+f/gAAAAB+H8Hw////f+D33v/D/5/+AAAAAD4fweH///5/8P/f/8f/n/3AAAAAPx/D4f/n+P/8/5//x///+MAAAAAfHvPhg+Pw+Hz/H8fHw+/g4AAAAB8Y8+AD4+D4fPwfB8fD58DgAAAAHxjz4APj4Ph8/B8Hx8PnwOAAAAAf+H/g/+Pg//z4HwfH/+fAwAAAAB/4f8H/4+D//Pg/B8f/58HAAAAAH/h/gfDj4PgA+H8Px8AHwwAAAAAH+H+D4OPg+AD4fw/HwAfDAAAAAAf4f4Pg4+D4APh/D8fAB8MAAAAAB/B/g//j/v/w+H8Px//n4wAAAAAH8H+D/+P+//D4fw/H/+/7AAAAAAfg/4P/4f7/8Ph/D8P/7/sAAAAAAwD8A4ABwHAA4HwPA8AHAcAAAAADAPwDgAHAcADgfA8DwAcBwAAAAAEAzA7gAeB4AeBmCYJgB8TAAAAAAcCEDnADMP4B8EcJxjAMf8AAAAAAwQI8fx44g48YgxjMPHh7wAAAAAA+AeAH+AcAfA8B8HgD4HwAAAAAAD4B4Af4BwB8DwHweAPgfAAAAAAAAAAAAAAAAAAAAAAAAAB+AAAAAAAAAAAAAAAAAAAAAAAAAH8AAAAAAAAAAAAAAAAAAAAAAAAA/wAAAAAAAAAAAAAAAAAAAAAAAAD/wAAAAAAAAAAAAAAAAAAAAAAAAP/AAAAAAAAAAAAAAAAAAAAAAAAD//AAAAAAAAAAAAAAAAAAAAAAAAP/8AAAAAAAAAAAAAAAAAAAAAAAA//wAAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAP/+AAAAAAAAAAAAAAAAAAAAAAAA//4AAAAAAAAAAAAAAAAAAAAAAAD//gAAAAAAAAAAAAAAAAAAAAAAAP/+AAAAAAAAAAAAAAAAAAAAAAAAP/4AAAAAAAAAAAAAAAAAAAAAAAA//gAAAAAAAAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAAAAAAHvgAAAAAAAAAAAAAAAAAAAAAAAAP+AAAAAAAAAAAAAAAAAAAAAAAAAfAAAAAAAAAAAAAAAAAAAAAAAAAB8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==")
};

// --------------------------------------------------------------------------------------------------
// global variables and consts
// --------------------------------------------------------------------------------------------------
//need to call this first otherwise 
//Bangle.apprect is not updated and i can't calculate SCREENOFFSETY
Bangle.loadWidgets();

const DEBUGMODE = 0;
const DEBUGMODERAMUSE = 0;

const SCREENWIDTH = 176;
const SCREENHEIGHT = 176;

const TILESIZE = 10;

const SCREENOFFSETX = ((SCREENWIDTH - 16 * TILESIZE) >> 1);
const SCREENOFFSETY = ((SCREENHEIGHT + Bangle.appRect.y - 8 * TILESIZE) >> 1);
const MAXBOARDWIDTH = 10;
const MAXBOARDHEIGHT = 8;

const MAXBOARDBGWIDTH = 10;
const MAXBOARDBGHEIGHT = 8;

const MAXBOARDSIZE = MAXBOARDWIDTH * MAXBOARDHEIGHT;



const GSGAME = 0;
const GSTITLE = 1;
const GSLEVELSELECT = 2;
const GSLEVELSCLEARED = 3;
const GSHELPROTATE = 4;
const GSHELPROTATE2 = 5;
const GSHELPROTATE3 = 6;
const GSHELPROTATESLIDE = 7;
const GSHELPROTATESLIDE2 = 8;
const GSHELPROTATESLIDE3 = 9;
const GSHELPROTATESLIDE4 = 10;
const GSHELPSLIDE = 11;
const GSHELPSLIDE2 = 12;
const GSHELPSLIDE3 = 13;
const GSINTRO = 14;

const GSINITDIFF = 50;

const GSINITGAME = GSINITDIFF + GSGAME;
const GSINITTITLE = GSINITDIFF + GSTITLE;
const GSINITLEVELSELECT = GSINITDIFF + GSLEVELSELECT;
const GSINITLEVELSCLEARED = GSINITDIFF + GSLEVELSCLEARED;
const GSINITHELPROTATE = GSINITDIFF + GSHELPROTATE;
const GSINITHELPROTATE2 = GSINITDIFF + GSHELPROTATE2;
const GSINITHELPROTATE3 = GSINITDIFF + GSHELPROTATE3;
const GSINITHELPROTATESLIDE = GSINITDIFF + GSHELPROTATESLIDE;
const GSINITHELPROTATESLIDE2 = GSINITDIFF + GSHELPROTATESLIDE2;
const GSINITHELPROTATESLIDE3 = GSINITDIFF + GSHELPROTATESLIDE3;
const GSINITHELPROTATESLIDE4 = GSINITDIFF + GSHELPROTATESLIDE4;
const GSINITHELPSLIDE = GSINITDIFF + GSHELPSLIDE;
const GSINITHELPSLIDE2 = GSINITDIFF + GSHELPSLIDE2;
const GSINITHELPSLIDE3 = GSINITDIFF + GSHELPSLIDE3;
const GSINITINTRO = GSINITDIFF + GSINTRO;


const DIFFVERYEASY = 0;
const DIFFEASY = 1;
const DIFFNORMAL = 2;
const DIFFHARD = 3;
const DIFFVERYHARD = 4;
const DIFFRANDOM = 5;
const DIFFCOUNT = 6;

const GMROTATE = 0;
const GMSLIDE = 1;
const GMROTATESLIDE = 2;
const GMCOUNT = 3;

const MMSTARTGAME = 0;
const MMHELP = 1;
const MMOPTIONS = 2;
const MMCREDITS = 3;
const MMCOUNT = 4;

const OPSOUND = 0;
const OPCOUNT = 1;

const TSMAINMENU = 0;
const TSGAMEMODE = 1;
const TSDIFFICULTY = 2;
const TSOPTIONS = 3;
const TSCREDITS = 4;

const LEVELCOUNT = 25;

const ARROWDOWN = 122;
const ARROWUP = 120;
const ARROWLEFT = 123;
const ARROWRIGHT = 121;
const LEFTMENU = 118;

const FRAMERATE = 15;

var startPos;
var menuPos;
var maxLevel;
var selectedLevel;
var boardX;
var boardY;
var difficulty;
var gameState;
var boardWidth;
var boardHeight;
var boardSize;
var levelDone;
var titleStep;
var gameMode;
var posAdd;
var mainMenu;
var option;
var needRedraw;
var requiresFlip;
var selectionX, selectionY;
var moves;
var randomSeedGame;
var level = new Uint8Array(MAXBOARDSIZE);

// Cursor
const maxCursorFrameCount = (10 * FRAMERATE / 60);
const cursorAnimCount = 2; //blink on & off
const cursorNumTiles = 16; //for the max 2 cursors shown at once (on help screens) 

var cursorFrameCount, cursorFrame, showCursor;
var spritePos = [];
for (var i = 0; i < cursorNumTiles; i++)
  spritePos.push(new Int8Array(2));

//intro
var frames;
var titlePosY;
const frameDelay = 16 * FRAMERATE / 15;

//savestate
const soundOptionBit = 0;

var levelLocks = new Uint8Array(GMCOUNT * DIFFCOUNT);
var options = new Uint8Array(2);

//sound
var soundon = 1;


//game

var paused;
var wasSoundOn;
var redrawLevelDoneBit;
var currentTiles = {};

//general input
var dragleft = false;
var dragright = false;
var dragup = false;
var dragdown = false;
var btna = false;
var btnb = false;

// --------------------------------------------------------------------------------------------------
// random stuff
// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
// --------------------------------------------------------------------------------------------------

var randfunc;

Math.imul = Math.imul || function(a, b) {
  var ah = (a >>> 16) & 0xffff;
  var al = a & 0xffff;
  var bh = (b >>> 16) & 0xffff;
  var bl = b & 0xffff;
  // the shift by 0 fixes the sign on the high part
  // the final |0 converts the unsigned value into a signed value
  return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0) | 0);
};

function cyrb128(str) {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= (h2 ^ h3 ^ h4);
  h2 ^= h1;
  h3 ^= h1;
  h4 ^= h1;
  return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

//based on code from pracrand https://pracrand.sourceforge.net/ (public domain)
function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    var t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };
}

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(randfunc() * (max - min + 1) + min);
}

function srand(seed) {
  // Create cyrb128 state:
  var aseed = cyrb128("applespairs" + seed.toString());
  // Four 32-bit component hashes provide the seed for sfc32.
  randfunc = sfc32(aseed[0], aseed[1], aseed[2], aseed[3]);
}

function random(value) {
  return randomIntFromInterval(0, value - 1);
}

// --------------------------------------------------------------------------------------------------
// Sound stuff
// --------------------------------------------------------------------------------------------------

function setSoundOn(val) {
  soundOn = val;
}

function isSoundOn() {
  return soundOn;
}

function playErrorSound() {
  if (soundOn) {
    Bangle.buzz(150, 1);
  }
}

function playMenuAcknowlege() {
  if (soundOn) {
    Bangle.buzz(100, 0.75);
  }
}

function playMenuBackSound() {
  if (soundOn) {
    Bangle.buzz(50, 0.4);
  }
}

function playMenuSelectSound() {
  if (soundOn) {
    Bangle.buzz(50, 0.6);
  }
}

function playGameMoveSound() {
  if (soundOn) {
    Bangle.buzz(50, 0.6);
  }
}

function playGameAction() {
  if (soundOn) {
    Bangle.buzz(100, 0.75);
  }
}

// --------------------------------------------------------------------------------------------------
// Cursor stuff
// --------------------------------------------------------------------------------------------------


function move_sprite(sprite, x, y) {
  spritePos[sprite][0] = x;
  spritePos[sprite][1] = y;
}

function drawCursors() {
  if ((showCursor == 0) || (cursorFrame & 1)) // 2nd or to add blink effect, it will skip drawing if bit 1 is set
    return;
  g.setColor(1, 0, 0);
  for (var i = 0; i < cursorNumTiles; i++)
    if (spritePos[i][1] < SCREENHEIGHT)
      g.drawImage(SELECTORTILES, SCREENOFFSETX + spritePos[i][0], SCREENOFFSETY + spritePos[i][1], {
        frame: ((i % 8))
      });
  g.setColor(1, 1, 1);
}

//returns 1 if cursor has changed / needs redraw
function updateCursorFrame() {
  cursorFrameCount++;
  if (cursorFrameCount >= maxCursorFrameCount) {
    cursorFrame++;
    cursorFrameCount = 0;
    if (cursorFrame >= cursorAnimCount)
      cursorFrame = 0;
    return 1;
  }
  return 0;
}

function hideCursors() {
  //HIDE CURSOR SPRITES
  //cursor 0
  setCursorPos(0, 0, (SCREENHEIGHT / TILESIZE) + 1);

  //cursor 1
  setCursorPos(1, 0, (SCREENHEIGHT / TILESIZE) + 1);

  showCursor = 0;
}

function showCursors() {
  showCursor = 1;
}

function setCursorPos(cursorNr, xPos, yPos) {
  if (cursorNr > 1)
    return;

  move_sprite((cursorNr << 3) + 0, ((xPos) * TILESIZE), ((yPos - 1) * TILESIZE));
  move_sprite((cursorNr << 3) + 1, ((xPos + 1) * TILESIZE), ((yPos) * TILESIZE));
  move_sprite((cursorNr << 3) + 2, ((xPos) * TILESIZE), ((yPos + 1) * TILESIZE));
  move_sprite((cursorNr << 3) + 3, ((xPos - 1) * TILESIZE), ((yPos) * TILESIZE));
  //corners
  move_sprite((cursorNr << 3) + 4, ((xPos + 1) * TILESIZE), ((yPos - 1) * TILESIZE));
  move_sprite((cursorNr << 3) + 5, ((xPos + 1) * TILESIZE), ((yPos + 1) * TILESIZE));
  move_sprite((cursorNr << 3) + 6, ((xPos - 1) * TILESIZE), ((yPos - 1) * TILESIZE));
  move_sprite((cursorNr << 3) + 7, ((xPos - 1) * TILESIZE), ((yPos + 1) * TILESIZE));
}

function initCursors() {
  hideCursors();

  cursorFrameCount = 0;
  cursorFrame = 0;
}

// --------------------------------------------------------------------------------------------------
// helper funcs
// --------------------------------------------------------------------------------------------------

function set_bkg_tile_xy(x, y, tile) {
  g.drawImage(currentTiles, SCREENOFFSETX + x * TILESIZE, SCREENOFFSETY + y * TILESIZE, {
    frame: tile
  });
}

function set_bkg_data(tiles) {
  currentTiles = tiles;
}

function get_bkg_data() {
  return currentTiles;
}

function set_bkg_tiles(x, y, map) {
  g.drawImage(map, SCREENOFFSETX + x, SCREENOFFSETY + y);
}

function setBlockTilesAsBackground() {
  set_bkg_data(BLOCKTILES);
}

// --------------------------------------------------------------------------------------------------
// help screens
// --------------------------------------------------------------------------------------------------


//LEGEND STATE
function inithelpLegend() {
  setBlockTilesAsBackground();
  needRedraw = 1;
}

//LEGEND STATE
function helpLegend(nextState) {
  if ((gameState == GSINITHELPSLIDE) ||
    (gameState == GSINITHELPROTATE) ||
    (gameState == GSINITHELPROTATESLIDE)) {
    inithelpLegend();
    gameState -= GSINITDIFF;
  }

  if (btna) {
    playMenuAcknowlege();
    gameState = nextState;
  }

  if (needRedraw) {
    g.clearRect(Bangle.appRect);
    switch (gameState) {
      case GSHELPSLIDE:
        printMessage(2, 0, "HELP: SLIDE");
        break;
      case GSHELPROTATE:
        printMessage(2, 0, "HELP: ROTATE");
        break;
      case GSHELPROTATESLIDE:
        printMessage(2, 0, "HELP: ROSLID");
        break;
    }

    set_bkg_tile_xy(0, 1, 33);
    printMessage(1, 1, ":WATER SOURCE");
    set_bkg_tile_xy(0, 2, 11);
    set_bkg_tile_xy(1, 2, 6);
    set_bkg_tile_xy(2, 2, 12);
    printMessage(3, 2, ":NOT FILLED");
    set_bkg_tile_xy(0, 3, 27);
    set_bkg_tile_xy(1, 3, 22);
    set_bkg_tile_xy(2, 3, 28);
    printMessage(3, 3, ":FILLED");

    if ((gameState == GSHELPROTATESLIDE) ||
      (gameState == GSHELPSLIDE)) {
      set_bkg_tile_xy(0, 4, 121);
      printMessage(1, 4, ":SLID ROW RIGHT");
      set_bkg_tile_xy(0, 5, 123);
      printMessage(1, 5, ":SLID ROW LEFT");
      set_bkg_tile_xy(0, 6, 122);
      printMessage(1, 6, ":SLID COL DOWN");
      set_bkg_tile_xy(0, 7, 120);
      printMessage(1, 7, ":SLID COL UP");
    }
    needRedraw = 0;
    requiresFlip = 1;
  }
}

//FINISH LEVEL STATE
function initHelpFinishLevel() {
  setBlockTilesAsBackground();
  needRedraw = 1;
}

//FINISH LEVEL STATE
function helpFinishLevel(nextState) {
  if ((gameState == GSINITHELPSLIDE2) ||
    (gameState == GSINITHELPROTATE2) ||
    (gameState == GSINITHELPROTATESLIDE2)) {
    initHelpFinishLevel();
    gameState -= GSINITDIFF;
  }

  if (btna) {
    playMenuAcknowlege();
    gameState = nextState;
  }

  if (needRedraw) {
    g.clearRect(Bangle.appRect);
    switch (gameState) {
      case GSHELPSLIDE2:
        printMessage(2, 0, "HELP: SLIDE");
        break;
      case GSHELPROTATE2:
        printMessage(2, 0, "HELP: ROTATE");
        break;
      case GSHELPROTATESLIDE2:
        printMessage(2, 0, "HELP: ROSLID");
        break;
    }
    printMessage(0, 2, "LEVEL FINISH:");

    if ((gameState == GSHELPSLIDE2) ||
      (gameState == GSHELPROTATESLIDE2)) {
      //arrows top
      set_bkg_tile_xy(2, 3, 122);
      set_bkg_tile_xy(3, 3, 122);
      set_bkg_tile_xy(4, 3, 122);

      //arrows left / right row 1
      set_bkg_tile_xy(1, 4, 121);
      set_bkg_tile_xy(5, 4, 123);

      //arrows left / right row 2
      set_bkg_tile_xy(1, 5, 121);
      set_bkg_tile_xy(5, 5, 123);

      //arrows left / right row 3
      set_bkg_tile_xy(1, 6, 121);
      set_bkg_tile_xy(5, 6, 123);

      //arrows bottom
      set_bkg_tile_xy(2, 7, 120);
      set_bkg_tile_xy(3, 7, 120);
      set_bkg_tile_xy(4, 7, 120);
    }

    set_bkg_tile_xy(2, 4, 25);
    set_bkg_tile_xy(3, 4, 23);
    set_bkg_tile_xy(4, 4, 27);
    printMessage(7, 4, "ALL WATER");

    set_bkg_tile_xy(2, 5, 28);
    set_bkg_tile_xy(3, 5, 33);
    set_bkg_tile_xy(4, 5, 22);
    printMessage(7, 5, "PIPES ARE");

    set_bkg_tile_xy(2, 6, 29);
    set_bkg_tile_xy(3, 6, 20);
    set_bkg_tile_xy(4, 6, 23);
    printMessage(7, 6, "FILLED");
    needRedraw = 0;
    requiresFlip = 1;
  }
}

function initHelpDoSlideRotate() {
  setBlockTilesAsBackground();

  //DRAW CURSOR SPRITES
  initCursors();

  if ((gameState == GSINITHELPROTATESLIDE4) ||
    (gameState == GSINITHELPSLIDE3)) {
    setCursorPos(0, 0, 5);
    setCursorPos(1, 11, 5);
  } else {
    setCursorPos(0, 1, 4);
    setCursorPos(1, 12, 4);
  }

  showCursors();
  needRedraw = 1;
}

function helpDoSlideRotate(nextState) {
  if ((gameState == GSINITHELPSLIDE3) ||
    (gameState == GSINITHELPROTATE3) ||
    (gameState == GSINITHELPROTATESLIDE3) ||
    (gameState == GSINITHELPROTATESLIDE4)) {
    initHelpDoSlideRotate();
    gameState -= GSINITDIFF;
  }

  if (btna) {
    playMenuAcknowlege();
    gameState = nextState;
    hideCursors();
  }

  if (needRedraw) {
    g.clearRect(Bangle.appRect);

    switch (gameState) {
      case GSHELPSLIDE3:
        printMessage(2, 0, "HELP: SLIDE");
        break;
      case GSHELPROTATE3:
        printMessage(2, 0, "HELP: ROTATE");
        break;
      case GSHELPROTATESLIDE3:
      case GSHELPROTATESLIDE4:
        printMessage(2, 0, "HELP: ROSLID");
        break;
    }

    if ((gameState == GSHELPROTATESLIDE3) ||
      (gameState == GSHELPROTATE3))
      printMessage(5, 2, "ROTATE");
    else
      printMessage(6, 2, "SLIDE");

    // 'A' + '=>'
    set_bkg_tile_xy(6, 5, 119);
    printMessage(5, 5, "TOUCH");
    set_bkg_tile_xy(10, 5, 118);

    if ((gameState == GSHELPSLIDE3) ||
      (gameState == GSHELPROTATESLIDE3) ||
      (gameState == GSHELPROTATESLIDE4)) {
      //Top Arrows
      set_bkg_tile_xy(1, 3, 122);
      set_bkg_tile_xy(2, 3, 122);
      set_bkg_tile_xy(3, 3, 122);

      //arrows 1st row
      set_bkg_tile_xy(0, 4, 121);
      set_bkg_tile_xy(4, 4, 123);

      //arrows 2nd row
      set_bkg_tile_xy(0, 5, 121);
      set_bkg_tile_xy(4, 5, 123);

      //arrows 3rd row
      set_bkg_tile_xy(0, 6, 121);
      set_bkg_tile_xy(4, 6, 123);

      //arrows bottom
      set_bkg_tile_xy(1, 7, 120);
      set_bkg_tile_xy(2, 7, 120);
      set_bkg_tile_xy(3, 7, 120);

      //2nd grid

      //Top Arrows
      set_bkg_tile_xy(12, 3, 122);
      set_bkg_tile_xy(13, 3, 122);
      set_bkg_tile_xy(14, 3, 122);

      //arrows 1st row
      set_bkg_tile_xy(11, 4, 121);
      set_bkg_tile_xy(15, 4, 123);

      //arrows 2nd row
      set_bkg_tile_xy(11, 5, 121);
      set_bkg_tile_xy(15, 5, 123);

      //arrows 3rd row
      set_bkg_tile_xy(11, 6, 121);
      set_bkg_tile_xy(15, 6, 123);

      //bottoms arrows
      set_bkg_tile_xy(12, 7, 120);
      set_bkg_tile_xy(13, 7, 120);
      set_bkg_tile_xy(14, 7, 120);
    }

    //1st grid
    if ((gameState == GSHELPROTATE3) ||
      (gameState == GSHELPROTATESLIDE3)) {
      set_bkg_tile_xy(1, 4, 12);
      set_bkg_tile_xy(2, 4, 7);
      set_bkg_tile_xy(3, 4, 27);

      set_bkg_tile_xy(1, 5, 28);
      set_bkg_tile_xy(2, 5, 33);
      set_bkg_tile_xy(3, 5, 22);

      set_bkg_tile_xy(1, 6, 29);
      set_bkg_tile_xy(2, 6, 20);
      set_bkg_tile_xy(3, 6, 23);
    } else {
      set_bkg_tile_xy(1, 4, 9);
      set_bkg_tile_xy(2, 4, 7);
      set_bkg_tile_xy(3, 4, 11);

      set_bkg_tile_xy(1, 5, 17);
      set_bkg_tile_xy(2, 5, 38);
      set_bkg_tile_xy(3, 5, 12);

      set_bkg_tile_xy(1, 6, 13);
      set_bkg_tile_xy(2, 6, 4);
      set_bkg_tile_xy(3, 6, 7);
    }


    //2nd grid

    set_bkg_tile_xy(12, 4, 25);
    set_bkg_tile_xy(13, 4, 23);
    set_bkg_tile_xy(14, 4, 27);

    set_bkg_tile_xy(12, 5, 28);
    set_bkg_tile_xy(13, 5, 33);
    set_bkg_tile_xy(14, 5, 22);

    set_bkg_tile_xy(12, 6, 29);
    set_bkg_tile_xy(13, 6, 20);
    set_bkg_tile_xy(14, 6, 23);

    drawCursors();
    needRedraw = 0;
    requiresFlip = 1;
  }

  //needRedraw = updateCursorFrame();
}


//LEGEND STATE
function helpRotateSlide() {
  helpLegend(GSINITHELPROTATESLIDE2);
}

//FINISH LEVEL STATE
function helpRotateSlide2() {
  helpFinishLevel(GSINITHELPROTATESLIDE3);
}

//SLIDE STATE
function helpRotateSlide3() {
  helpDoSlideRotate(GSINITHELPROTATESLIDE4);
}

//ROTATE STATE
function helpRotateSlide4() {
  helpDoSlideRotate(GSINITTITLE);
}

function helpRotate() {
  helpLegend(GSINITHELPROTATE2);
}

//FINISH LEVEL STATE
function helpRotate2() {
  helpFinishLevel(GSINITHELPROTATE3);
}

//ROTATE STATE
function helpRotate3() {
  helpDoSlideRotate(GSINITTITLE);
}

//LEGEND STATE
function helpSlide() {
  helpLegend(GSINITHELPSLIDE2);
}

//FINISH LEVEL STATE
function helpSlide2() {
  helpFinishLevel(GSINITHELPSLIDE3);
}

//SLIDE STATE
function helpSlide3() {
  helpDoSlideRotate(GSINITTITLE);
}

// --------------------------------------------------------------------------------------------------
// Intro
// --------------------------------------------------------------------------------------------------

function initIntro() {
  setBlockTilesAsBackground();
  titlePosY = g.getHeight();
  frames = 0;
}

function intro() {
  if (gameState == GSINITINTRO) {
    initIntro();
    gameState -= GSINITDIFF;
  }

  if (btna || btnb) {
    gameState = GSINITTITLE;
  }

  frames++;
  g.clearRect(Bangle.appRect);
  if (frames < frameDelay) {
    //16-12
    printMessage(4 >> 1, 4, "WILLEMS DAVY");
    requiresFlip = 1;
  } else {
    if (frames < frameDelay * 2) {
      //16-8
      printMessage(8 >> 1, 4, "PRESENTS");
      requiresFlip = 1;
    } else {
      requiresFlip = 1;
      g.drawImage(TITLE, SCREENOFFSETX, titlePosY);
      if (titlePosY > SCREENOFFSETY) {
        titlePosY -= 60 / FRAMERATE;
      } else {
        gameState = GSINITTITLE;
      }
    }
  }
}

// --------------------------------------------------------------------------------------------------
// Level Stuff
// --------------------------------------------------------------------------------------------------


function moveBlockDown(aTile) {
  var tmp = level[aTile + boardSize - boardWidth];
  for (var i = boardSize - boardWidth; i != 0; i -= boardWidth)
    level[aTile + i] = level[aTile + i - boardWidth];
  level[aTile] = tmp;
}

function moveBlockUp(aTile) {
  var tmp = level[aTile - boardSize + boardWidth];
  for (var i = boardSize - boardWidth; i != 0; i -= boardWidth)
    level[aTile - i] = level[aTile - i + boardWidth];
  level[aTile] = tmp;
}

function moveBlockRight(aTile) {
  var tmp = level[aTile + boardWidth - 1];
  for (var i = 0; i < boardWidth - 1; i++)
    level[aTile + boardWidth - 1 - i] = level[aTile + boardWidth - 2 - i];
  level[aTile] = tmp;
}

function moveBlockLeft(aTile) {
  var tmp = level[aTile - boardWidth + 1];
  for (var i = 0; i < boardWidth - 1; i++)
    level[aTile - boardWidth + 1 + i] = level[aTile - boardWidth + 2 + i];
  level[aTile] = tmp;
}

//rotates a tile by change the tilenr in the level
//there are 16 tiles per set and there are 3 sets no water, water filled, and special start tiles
function rotateBlock(aTile) {
  switch (level[aTile]) {
    case 1:
    case 17:
    case 33:
      level[aTile] = 2;
      break;
    case 2:
    case 18:
    case 34:
      level[aTile] = 4;
      break;
    case 3:
    case 19:
    case 35:
      level[aTile] = 6;
      break;
    case 4:
    case 20:
    case 36:
      level[aTile] = 8;
      break;
    case 5:
    case 21:
    case 37:
      level[aTile] = 10;
      break;
    case 6:
    case 22:
    case 38:
      level[aTile] = 12;
      break;
    case 7:
    case 23:
    case 39:
      level[aTile] = 14;
      break;
    case 8:
    case 24:
    case 40:
      level[aTile] = 1;
      break;
    case 9:
    case 25:
    case 41:
      level[aTile] = 3;
      break;
    case 10:
    case 26:
    case 42:
      level[aTile] = 5;
      break;
    case 11:
    case 27:
    case 43:
      level[aTile] = 7;
      break;
    case 12:
    case 28:
    case 44:
      level[aTile] = 9;
      break;
    case 13:
    case 29:
    case 45:
      level[aTile] = 11;
      break;
    case 14:
    case 30:
    case 46:
      level[aTile] = 13;
      break;
    default:
      break;
  }
}

function shuffleSlide(aTile) {
  var rnd = random(3);
  switch (rnd) {
    case 0:
      moveBlockUp((aTile % boardWidth) + boardSize - boardWidth);
      break;
    case 1:
      moveBlockDown((aTile % boardWidth));
      break;
    case 2:
      moveBlockLeft(boardWidth - 1 + aTile - (aTile % boardWidth));
      break;
    case 3:
      moveBlockRight(aTile - (aTile % boardWidth));
      break;
  }
}

function shuffleRotate(aTile) {
  var rnd = random(3);
  for (var i = 0; i < rnd; i++)
    rotateBlock(aTile);
}

function shuffleLevel() {
  var rnd;
  var j = 0;
  while (j < boardSize) {
    switch (gameMode) {
      case GMROTATE:
        shuffleRotate(j);
        j++;
        break;
      case GMSLIDE:
        shuffleSlide(j);
        //for speed up it should be fine as all slide levels are uneven in width / height (except random)
        j += 2;
        break;
      case GMROTATESLIDE:
        rnd = random(2);
        if (rnd == 0) {
          shuffleSlide(j);
          //for speed up
          j += 2;
        } else {
          shuffleRotate(j);
          j++;
        }
        break;
    }
  }
}

function handleConnectPoint(currentPoint, cellStack, cc) {
  var lookUpX = currentPoint % boardWidth;
  var lookUpY = Math.floor(currentPoint / boardWidth);
  var tmp;
  var tmp2;
  if ((lookUpY > 0) && (!(level[currentPoint] & 1))) {
    tmp = currentPoint - boardWidth;
    tmp2 = level[tmp];
    if (((tmp2 < 16) && (!(tmp2 & 4))) ||
      ((tmp2 > 15) && (!((tmp2 - 16) & 4)))) {
      //adapt tile to filled tile
      if (level[currentPoint] < 16) {
        level[currentPoint] += 16;
      }

      //add neighbour to cellstack of to handle tiles
      if (tmp2 < 16) {
        cellStack[cc++] = tmp;
      }
    }

  }

  //if tile has passage to the east and east neigbour passage to the west 
  if ((lookUpX + 1 < boardWidth) && (!(level[currentPoint] & 2))) {
    tmp = currentPoint + 1;
    tmp2 = level[tmp];
    if (((tmp2 < 16) && (!(tmp2 & 8))) ||
      ((tmp2 > 15) && (!((tmp2 - 16) & 8)))) {
      //adapt tile to filled tile
      if (level[currentPoint] < 16) {
        level[currentPoint] += 16;
      }

      //add neighbour to cellstack of to handle tiles
      if (tmp2 < 16) {
        cellStack[cc++] = tmp;
      }

    }
  }

  //if tile has passage to the south and south neigbour passage to the north 
  if ((lookUpY + 1 < boardHeight) && (!(level[currentPoint] & 4))) {
    tmp = currentPoint + boardWidth;
    tmp2 = level[tmp];
    if (((tmp2 < 16) && (!(tmp2 & 1))) ||
      ((tmp2 > 15) && (!((tmp2 - 16) & 1)))) {
      //adapt tile to filled tile
      if (level[currentPoint] < 16) {
        level[currentPoint] += 16;
      }

      //add neighbour to cellstack of to handle tiles
      if (tmp2 < 16) {
        cellStack[cc++] = tmp;
      }
    }
  }

  //if tile has passage to the west and west neigbour passage to the east 
  if ((lookUpX > 0) && (!(level[currentPoint] & 8))) {
    tmp = currentPoint - 1;
    tmp2 = level[tmp];
    if (((tmp2 < 16) && (!(tmp2 & 2))) ||
      ((tmp2 > 15) && (!((tmp2 - 16) & 2)))) {
      //adapt tile to filled tile
      if (level[currentPoint] < 16) {
        level[currentPoint] += 16;
      }

      //add neighbour to cellstack of to handle tiles
      if (tmp2 < 16) {
        cellStack[cc++] = tmp;
      }
    }
  }
  return cc;
}

function updateConnected() {
  var cellStack = [];
  //reset all tiles to default not filled one
  for (var i = 0; i != boardSize; i++) {
    if (level[i] > 31) {
      level[i] -= 32;
    } else {
      if (level[i] > 15) {
        level[i] -= 16;
      }
    }
  }

  //start with start tile
  var cc = 1;
  cc = handleConnectPoint(startPos, cellStack, cc);
  while (--cc > 0) {
    //if tile is bigger then 15 we already handled this one, continue with next one
    if ((level[cellStack[cc]] < 16)) {
      cc = handleConnectPoint(cellStack[cc], cellStack, cc);
    }
  }

  //add start pos special tile
  if (level[startPos] > 15)
    level[startPos] += 16;
  else
  if (level[startPos] < 16)
    level[startPos] += 32;
}

function generateLevel() {
  var neighbours = new Uint8Array(4);
  var cellStack = new Uint8Array(MAXBOARDSIZE + 1);
  var cc = 0;
  var currentPoint = 0;
  var visitedRooms = 1;
  var tmp, tmp2;
  var selectedNeighbour;
  var neighboursFound;
  var lookUpX, lookUpY;
  var rnd;
  //generate a lookup table so we don't have to use modulus or divide constantly
  //generateLookupTable(boardWidth, boardHeight);

  //intial all walls value in every room we will remove bits of this value to remove walls
  for (tmp = 0; tmp < boardSize; tmp++)
    level[tmp] = 0xf;

  while (visitedRooms != boardSize) {
    neighboursFound = 0;
    lookUpX = currentPoint % boardWidth;
    lookUpY = Math.floor(currentPoint / boardWidth);

    tmp = currentPoint + 1;
    //tile has neighbour to the right which we did not handle yet
    if ((lookUpX + 1 < boardWidth) && (level[tmp] == 0xf))
      neighbours[neighboursFound++] = tmp;

    tmp = currentPoint - 1;
    //tile has neighbour to the left which we did not handle yet
    if ((lookUpX > 0) && (level[tmp] == 0xf))
      neighbours[neighboursFound++] = tmp;

    tmp = currentPoint - boardWidth;
    //tile has neighbour the north which we did not handle yet
    if ((lookUpY > 0) && (level[tmp] == 0xf))
      neighbours[neighboursFound++] = tmp;

    tmp = currentPoint + boardWidth;
    //tile has neighbour the south which we did not handle yet
    if ((lookUpY + 1 < boardHeight) && (level[tmp] == 0xf))
      neighbours[neighboursFound++] = tmp;

    switch (neighboursFound) {
      case 0:
        currentPoint = cellStack[--cc];
        continue;
      default:
        rnd = random(neighboursFound);
        break;
    }
    selectedNeighbour = neighbours[rnd];
    tmp = (selectedNeighbour % boardWidth);
    //tile has neighbour to the east
    if (tmp > lookUpX) {
      //remove west wall neighbour
      level[selectedNeighbour] &= ~(8);
      //remove east wall tile
      level[currentPoint] &= ~(2);
    } else // tile has neighbour to the west
    {
      if (tmp < lookUpX) {
        //remove east wall neighbour
        level[selectedNeighbour] &= ~(2);
        //remove west wall tile
        level[currentPoint] &= ~(8);
      } else // tile has neighbour to the north
      {
        tmp2 = selectedNeighbour / boardWidth;
        if (tmp2 < lookUpY) {
          //remove south wall neighbour
          level[selectedNeighbour] &= ~(4);
          //remove north wall tile
          level[currentPoint] &= ~(1);
        } else // tile has neighbour to the south
        {
          if (tmp2 > lookUpY) {
            //remove north wall neighbour
            level[selectedNeighbour] &= ~(1);
            //remove south wall tile
            level[currentPoint] &= ~(4);
          }
        }
      }
    }

    //add tile to the cellstack
    if (neighboursFound > 1) {
      cellStack[cc++] = currentPoint;
    }
    //set tile to the neighbour
    currentPoint = selectedNeighbour;
    visitedRooms++;
  }
}

//when all board tiles are not below 16, the level is cleared
//as there are 16 tiles per tilegroup (no water, water, special start with water) 
function isLevelDone() {
  for (var i = 0; i != boardSize; i++)
    if (level[i] < 16)
      return 0;

  return 1;
}

function initLevel(aRandomSeed) {
  //g.setColor(0,0,0);
  //g.fillRect(SCREENOFFSETX + ((16 - 10) >> 1) * TILESIZE,  SCREENOFFSETY + ((MAXBOARDBGHEIGHT >> 1) - 1) * TILESIZE, SCREENOFFSETX + (((16 - 10) >> 1) * TILESIZE) + (10*TILESIZE), SCREENOFFSETY + (((MAXBOARDBGHEIGHT >> 1) - 1) * TILESIZE) +(3*TILESIZE));
  //g.setColor(1,1,1);
  printMessage(((16 - 10) >> 1), (MAXBOARDBGHEIGHT >> 1) - 1, "[*********]");
  printMessage(((16 - 10) >> 1), (MAXBOARDBGHEIGHT >> 1) - 0, "| LOADING +");
  printMessage(((16 - 10) >> 1), (MAXBOARDBGHEIGHT >> 1) + 1, "<#########>");
  g.flip();

  levelDone = 0;
  moves = 0;
  if (difficulty != DIFFRANDOM)
    //use level number + fixed value based on difficulty as seed for the random function
    //this makes sure every level from a difficulty will remain the same
    srand(selectedLevel + (difficulty * 500) + (gameMode * 50));
  else
    srand(aRandomSeed);

  maxLevel = LEVELCOUNT;
  //set boardsize and max level based on difficulty
  switch (difficulty) {
    case DIFFVERYEASY:
      boardWidth = 5;
      boardHeight = 5;
      break;
    case DIFFEASY:
      boardWidth = 6;
      boardHeight = 6;
      break;
    case DIFFNORMAL:
      boardWidth = 7;
      boardHeight = 7;
      break;
    case DIFFHARD:
      boardWidth = 8;
      boardHeight = 8;
      break;
    case DIFFVERYHARD:
      boardWidth = 10;
      boardHeight = 8;
      break;
    case DIFFRANDOM:
      var rnd = random(255);
      boardWidth = 5 + (rnd % (MAXBOARDWIDTH - 5 + 1)); //5 is smallest level width from very easy
      rnd = random(255);
      boardHeight = 5 + (rnd % (MAXBOARDHEIGHT - 5 + 1)); //5 is smallest level height from very easy
      maxLevel = 0; //special value with random
      break;
  }
  //add space for arrows based on same posadd value (1 or 0 depending if sliding is allowed)
  boardWidth -= posAdd + posAdd;
  boardHeight -= posAdd + posAdd;
  boardSize = boardWidth * boardHeight;
  //generate the level
  generateLevel();
  //startpoint of of level in center of screen
  boardX = (MAXBOARDBGWIDTH - boardWidth) >> 1;
  boardY = (MAXBOARDBGHEIGHT - boardHeight) >> 1;
  startPos = (boardWidth >> 1) + (boardHeight >> 1) * (boardWidth);
  //startpoint of tile with water and our cursor
  selectionX = boardWidth >> 1;
  selectionY = boardHeight >> 1;

  //level is currently the solution so we still need to shuffle it
  shuffleLevel();
  //update possibly connected tiles already starting from startpoint
  updateConnected();
}

// --------------------------------------------------------------------------------------------------
// levels cleared
// --------------------------------------------------------------------------------------------------


function initLevelsCleared() {
  set_bkg_data(CONGRATSTILES);
  g.clearRect(Bangle.appRect);
  g.drawImage(CONGRATSSCREEN, SCREENOFFSETX, SCREENOFFSETY);
  switch (difficulty) {
    case DIFFVERYEASY:
      printCongratsScreen(0, 3, "VERY EASY LEVELS");
      break;

    case DIFFEASY:
      printCongratsScreen(3, 3, "EASY LEVELS");
      break;

    case DIFFNORMAL:
      printCongratsScreen(2, 3, "NORMAL LEVELS");
      break;

    case DIFFHARD:
      printCongratsScreen(3, 3, "HARD LEVELS");
      break;

    case DIFFVERYHARD:
      printCongratsScreen(0, 3, "VERY HARD LEVELS");
      break;
  }

  requiresFlip = 1;
}

function levelsCleared() {
  if (gameState == GSINITLEVELSCLEARED) {
    initLevelsCleared();
    gameState -= GSINITDIFF;
  }

  if (btna || btnb) {
    playMenuAcknowlege();
    titleStep = TSMAINMENU;
    gameState = GSINITTITLE;
  }
  needRedraw = 0;
}


// --------------------------------------------------------------------------------------------------
// level select
// --------------------------------------------------------------------------------------------------

function drawLevelSelect() {
  g.clearRect(Bangle.appRect);
  //LEVEL:
  printMessage(MAXBOARDBGWIDTH, 0, "LEVEL:");

  //[LEVEL NR] 2 chars
  printNumber(MAXBOARDBGWIDTH + 4, 1, selectedLevel, 2);

  //B:BACK
  printMessage(MAXBOARDBGWIDTH, 6, "BTN:");
  printMessage(MAXBOARDBGWIDTH, 7, "BACK");

  //A:PLAY
  printMessage(MAXBOARDBGWIDTH, 4, "TOUCH:");
  printMessage(MAXBOARDBGWIDTH, 5, "PLAY");

  //Locked & Unlocked keywoard
  var tmpUnlocked = levelUnlocked(gameMode, difficulty, selectedLevel - 1);
  if (!tmpUnlocked)
    printMessage(MAXBOARDBGWIDTH, 2, "LOCKED");
  else
    printMessage(MAXBOARDBGWIDTH, 2, "OPEN");

  //Draw arrows for vertical / horizontal movement
  if (gameMode != GMROTATE) {
    for (var x = 0; x != boardWidth; x++) {
      set_bkg_tile_xy(boardX + x, boardY - 1, ARROWDOWN);
      set_bkg_tile_xy(boardX + x, boardY + boardHeight, ARROWUP);
    }

    for (var y = 0; y != boardHeight; y++) {
      set_bkg_tile_xy(boardX - 1, boardY + y, ARROWRIGHT);
      set_bkg_tile_xy(boardX + boardWidth, boardY + y, ARROWLEFT);
    }
  }

  var i16 = 0;
  for (var yy = 0; yy < boardHeight; yy++) {
    for (var xx = 0; xx < boardWidth; xx++) {
      set_bkg_tile_xy(boardX + xx, boardY + yy, level[i16 + xx]);
    }
    i16 += boardWidth;
  }
}

function initLevelSelect() {
  setBlockTilesAsBackground();
  needRedraw = 1;
}

function levelSelect() {
  if (gameState == GSINITLEVELSELECT) {
    initLevelSelect();
    gameState -= GSINITDIFF;
  }

  var tmpUnlocked = levelUnlocked(gameMode, difficulty, selectedLevel - 1);


  if (btnb) {
    playMenuBackSound();
    gameState = GSINITTITLE;
  }

  if (btna) {
    if (tmpUnlocked) {
      gameState = GSINITGAME;
      playMenuAcknowlege();
    } else {
      playErrorSound();
    }
  }

  if (dragleft) {
    if (difficulty == DIFFRANDOM) {
      playMenuSelectSound();
      randomSeedGame = Date.now();
      initLevel(randomSeedGame);
      needRedraw = 1;
    } else {
      if (selectedLevel > 1) {
        playMenuSelectSound();
        selectedLevel--;
        initLevel(randomSeedGame);
        needRedraw = 1;
      }
    }
  }
  if (dragright) {
    if (difficulty == DIFFRANDOM) {
      playMenuSelectSound();
      //need new seed based on time
      randomSeedGame = Date.now();
      initLevel(randomSeedGame);
      needRedraw = 1;
    } else {
      if (selectedLevel < maxLevel) {
        playMenuSelectSound();
        selectedLevel++;
        initLevel(randomSeedGame);
        needRedraw = 1;
      }
    }
  }

  if (needRedraw) {
    drawLevelSelect();
    needRedraw = 0;
    requiresFlip = 1;
  }
}

// --------------------------------------------------------------------------------------------------
// printing functions
// --------------------------------------------------------------------------------------------------

function setCharAt(str, index, chr) {
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
}

function formatInteger(valinteger) {
  const maxDigits = 10;
  var array = "          ";

  const maxCharacters = (maxDigits);


  const lastIndex = (maxCharacters - 1);


  if (valinteger == 0) {
    array = setCharAt(array, lastIndex, '0');
    return {
      digits: 1,
      string: array
    };
  }

  var digits = 0;
  var integer = valinteger;
  do {
    var digit = integer % 10;
    integer = Math.floor(integer / 10);

    array = setCharAt(array, lastIndex - digits, digit.toString());
    ++digits;
  }
  while (integer > 0);

  return {
    digits: digits,
    string: array
  };
}

//print a number on levelselect or game screen
function printNumber(ax, ay, aNumber, maxDigits) {
  const buffSize = 10;

  var ret = formatInteger(aNumber);
  var maxFor = ret.digits;
  if (ret.digits > maxDigits)
    maxFor = maxDigits;
  for (var c = 0; c < maxFor; c++) {
    if (ret.string.charAt(buffSize - ret.digits + c) == '')
      return;
    set_bkg_tile_xy(ax + (maxDigits - ret.digits) + c, ay, ret.string.charCodeAt(buffSize - ret.digits + c) + 32);
  }
}

function printDebug(ax, ay, amsg) {
  if (DEBUGMODE) {
    //rememvber current tiles
    var tiles = get_bkg_data();
    setBlockTilesAsBackground();
    g.clearRect(Bangle.appRect);
    printMessage(ax, ay, amsg);
    setTimeout(() => {
      g.flip();
    }, 2500);
    //restore the previous tiles
    set_bkg_data(tiles);
  }
}

//print a message on the title screen on ax,ay, the tileset from titlescreen contains an alphabet
function printMessage(ax, ay, amsg) {
  var index = 0;
  var p = 0;
  while (1) {
    var fChar = amsg.charAt(p++);
    var tile = 61;
    switch (fChar) {
      case '':
        return;

      case '[':
        tile = 70;
        break;

      case ']':
        tile = 64;
        break;

      case '<':
        tile = 73;
        break;

      case '>':
        tile = 67;
        break;

      case '+':
        tile = 63;
        break;

      case '*':
        tile = 62;
        break;

      case '|':
        tile = 69;
        break;

      case '#':
        tile = 65;
        break;

      case ':':
        tile = 116;
        break;

      case 'a':
        tile = 119;
        break;

      case 'b':
        tile = 117;
        break;

      default:
        if ((fChar.charCodeAt(0) >= 'A'.charCodeAt(0)) && (fChar.charCodeAt(0) <= 'Z'.charCodeAt(0)))
          tile = fChar.charCodeAt(0) + 25;

        if ((fChar.charCodeAt(0) >= '0'.charCodeAt(0)) && (fChar.charCodeAt(0) <= '9'.charCodeAt(0)))
          tile = fChar.charCodeAt(0) + 32;
        break;
    }
    set_bkg_tile_xy(ax + index, ay, tile);
    ++index;
  }
}

//print a message on the CongratsScreen on ax,ay, the tileset from Congrats Screen contains an alphabet in another font
function printCongratsScreen(ax, ay, amsg) {
  // based on input form @Pharap
  var index = 0;
  var p = 0;
  while (1) {
    var fChar = amsg.charAt(p++);
    var tile = 26;
    switch (fChar) {
      case '':
        return;

      default:
        if ((fChar.charCodeAt(0) >= 'A'.charCodeAt(0)) && (fChar.charCodeAt(0) <= 'Z'.charCodeAt(0)))
          tile = fChar.charCodeAt(0) - 'A'.charCodeAt(0);
        break;
    }
    set_bkg_tile_xy(ax + index, ay, tile);
    ++index;
  }
}

// --------------------------------------------------------------------------------------------------
// save state
// --------------------------------------------------------------------------------------------------

function validateSaveState() {
  for (var j = 0; j < GMCOUNT; j++) {
    for (var i = 0; i < DIFFCOUNT; i++) {
      if ((levelLocks[(j * DIFFCOUNT) + i] == 0) || (levelLocks[(j * DIFFCOUNT) + i] > LEVELCOUNT))
        return 0;
    }
  }
  if (options[soundOptionBit] > 1)
    return 0;

  return 1;
}

function initSaveState() {
  //read from file 
  var file = require("Storage").open("waternet.data.dat", "r");
  {
    var index = 0;
    for (index = 0; index < GMCOUNT * DIFFCOUNT; index++) {
      tmp = file.readLine();
      if (tmp !== undefined)
        levelLocks[index] = Number(tmp);
    }

    for (index = 0; index < 2; index++) {
      tmp = file.readLine();
      if (tmp !== undefined)
        options[index] = Number(tmp);
    }
  }
  //then
  if (!validateSaveState()) {
    for (var j = 0; j < GMCOUNT; j++)
      for (var i = 0; i < DIFFCOUNT; i++)
        levelLocks[(j * DIFFCOUNT) + i] = 1; //1st level unlocked
    options[soundOptionBit] = 1;
  }
}

function saveSaveState() {
  //save to file
  var file = require("Storage").open("waternet.data.dat", "w");
  for (var index = 0; index < GMCOUNT * DIFFCOUNT; index++)
    file.write(levelLocks[index].toString() + "\n");
  file.write(options[soundOptionBit].toString() + "\n");
}

function setSoundOnSaveState(value) {
  options[soundOptionBit] = value;
  saveSaveState();
}

function isSoundOnSaveState() {
  return options[soundOptionBit] == 1;
}

function levelUnlocked(mode, diff, level) {
  return levelLocks[(mode * DIFFCOUNT) + diff] > level;
}

function lastUnlockedLevel(mode, diff) {
  return levelLocks[(mode * DIFFCOUNT) + diff];
}

function unlockLevel(mode, diff, level) {
  if (level + 1 > lastUnlockedLevel(mode, diff)) {
    levelLocks[(mode * DIFFCOUNT) + diff] = level + 1;
    saveSaveState();
  }
}

// --------------------------------------------------------------------------------------------------
// titlescreen
// --------------------------------------------------------------------------------------------------

function drawTitleScreen() {
  g.clearRect(Bangle.appRect);
  g.drawImage(TITLE, SCREENOFFSETX, SCREENOFFSETY);

  switch (titleStep) {
    case TSMAINMENU:
      printMessage(5, 4, "START");
      printMessage(5, 5, "HELP");
      printMessage(5, 6, "OPTIONS");
      printMessage(5, 7, "CREDITS");
      break;
    case TSDIFFICULTY:
      printMessage(3, 3, "VERY EASY");
      printMessage(3, 4, "EASY");
      printMessage(3, 5, "NORMAL");
      printMessage(3, 6, "HARD");
      if (difficulty <= DIFFVERYHARD)
        printMessage(3, 7, "VERY HARD");
      else
        printMessage(3, 7, "RANDOM");
      break;
    case TSGAMEMODE:
      printMessage(5, 4, "ROTATE");
      printMessage(5, 5, "SLIDE");
      printMessage(5, 6, "ROSLID");
      break;
    case TSCREDITS:
      printMessage(3, 5, "CREATED BY");
      printMessage(2, 6, "WILLEMS DAVY");
      printMessage(2, 7, "JOYRIDER3774");
      break;
    case TSOPTIONS:
      if (isSoundOn())
        printMessage(4, 4, "SOUND ON");
      else
        printMessage(4, 4, "SOUND OFF");
      break;
  }

  //set menu tile
  switch (titleStep) {
    case TSMAINMENU:
      set_bkg_tile_xy(4, 4 + mainMenu, LEFTMENU);
      break;
    case TSGAMEMODE:
      set_bkg_tile_xy(4, 4 + gameMode, LEFTMENU);
      break;
    case TSDIFFICULTY:
      if (difficulty >= DIFFVERYHARD)
        set_bkg_tile_xy(2, 7, LEFTMENU);
      else
        set_bkg_tile_xy(2, 3 + difficulty, LEFTMENU);
      break;
    case TSOPTIONS:
      set_bkg_tile_xy(2, 4 + option, LEFTMENU);
      break;
  }
}

function initTitleScreen() {
  setBlockTilesAsBackground();
  needRedraw = 1;
}

function titleScreen() {
  if (gameState == GSINITTITLE) {
    initTitleScreen();
    gameState -= GSINITDIFF;
  }

  if (dragup) {
    switch (titleStep) {
      case TSMAINMENU:
        if (mainMenu > MMSTARTGAME) {
          playMenuSelectSound();
          mainMenu--;
          needRedraw = 1;
        }
        break;
      case TSGAMEMODE:
        if (gameMode > GMROTATE) {
          playMenuSelectSound();
          gameMode--;
          needRedraw = 1;
        }
        break;
      case TSDIFFICULTY:
        if (difficulty > DIFFVERYEASY) {
          playMenuSelectSound();
          difficulty--;
          needRedraw = 1;
        }
        break;
      case TSOPTIONS:
        if (option > OPSOUND) {
          playMenuSelectSound();
          option--;
          needRedraw = 1;
        }
        break;
    }
  }

  if (dragdown) {
    switch (titleStep) {
      case TSMAINMENU:
        if (mainMenu < MMCOUNT - 1) {
          playMenuSelectSound();
          mainMenu++;
          needRedraw = 1;
        }
        break;
      case TSGAMEMODE:
        if (gameMode < GMCOUNT - 1) {
          playMenuSelectSound();
          gameMode++;
          needRedraw = 1;
        }
        break;
      case TSDIFFICULTY:
        if (difficulty < DIFFCOUNT - 1) {
          playMenuSelectSound();
          difficulty++;
          needRedraw = 1;
        }
        break;
      case TSOPTIONS:
        if (option < OPCOUNT - 1) {
          playMenuSelectSound();
          option++;
          needRedraw = 1;
        }
        break;
    }
  }

  if (btnb) {
    switch (titleStep) {
      case TSOPTIONS:
      case TSCREDITS:
        titleStep = TSMAINMENU;
        playMenuBackSound();
        needRedraw = 1;
        break;
      case TSGAMEMODE:
      case TSDIFFICULTY:
        titleStep--;
        playMenuBackSound();
        needRedraw = 1;
        break;
    }
  }

  if (btna) {
    playMenuAcknowlege();
    switch (mainMenu) {
      case MMOPTIONS:
        if (titleStep != TSOPTIONS) {
          titleStep = TSOPTIONS;
          needRedraw = 1;
        } else {
          switch (option) {
            case OPSOUND:
              setSoundOn(!isSoundOn());
              setSoundOnSaveState(isSoundOn());
              needRedraw = 1;
              break;
          }
        }
        break;

      case MMCREDITS:
        if (titleStep != TSCREDITS) {
          titleStep = TSCREDITS;
          needRedraw = 1;
        } else {
          titleStep = TSMAINMENU;
          needRedraw = 1;
        }
        break;

      case MMHELP:
        if (titleStep < TSGAMEMODE) {
          titleStep++;
          needRedraw = 1;
        } else {
          switch (gameMode) {
            case GMROTATE:
              gameState = GSINITHELPROTATE;
              break;
            case GMSLIDE:
              gameState = GSINITHELPSLIDE;
              break;
            case GMROTATESLIDE:
              gameState = GSINITHELPROTATESLIDE;
              break;
          }
        }
        break;

      case MMSTARTGAME:
        if (titleStep < TSDIFFICULTY) {
          titleStep++;
          needRedraw = 1;
        } else {
          if (difficulty == DIFFRANDOM)
            selectedLevel = 1;
          else
            selectedLevel = lastUnlockedLevel(gameMode, difficulty);

          if (gameMode == GMROTATE)
            posAdd = 0;
          else
            posAdd = 1;
          //set randomseet to systime here
          //it will be reused all the time
          //with the level generating
          //but not when going back from
          //level playing to level selector
          //when calling init level there
          randomSeedGame = Date.now();
          initLevel(randomSeedGame);

          gameState = GSINITLEVELSELECT;
        }
        break;
    }
  }

  if (needRedraw) {
    drawTitleScreen();
    needRedraw = 0;
    requiresFlip = 1;
  }

}

// --------------------------------------------------------------------------------------------------
// game
// --------------------------------------------------------------------------------------------------

function drawGame() {
  //background
  if (!paused && !redrawLevelDoneBit) {
    g.clearRect(Bangle.appRect);

    //LEVEL:
    printMessage(MAXBOARDBGWIDTH, 0, "LEVEL:");

    //[LEVEL NR] 2 chars
    printNumber(MAXBOARDBGWIDTH + 4, 1, selectedLevel, 2);


    //MOVES:
    printMessage(MAXBOARDBGWIDTH, 2, "MOVES:");

    printNumber(MAXBOARDBGWIDTH + 1, 3, moves, 5);

    //A:XXXXXX (XXXXXX="ROTATE" or XXXXXX="SLIDE " or XXXXXX="ROSLID")
    switch (gameMode) {
      case GMROTATE:
        printMessage(MAXBOARDBGWIDTH, 4, "TOUCH:");
        printMessage(MAXBOARDBGWIDTH, 5, "ROTATE");
        break;
      case GMSLIDE:
        printMessage(MAXBOARDBGWIDTH, 4, "TOUCH:");
        printMessage(MAXBOARDBGWIDTH, 5, "SLIDE");
        break;
      case GMROTATESLIDE:
        printMessage(MAXBOARDBGWIDTH, 4, "TOUCH:");
        printMessage(MAXBOARDBGWIDTH, 5, "ROSLID");
        break;
    }

    //B:BACK
    printMessage(MAXBOARDBGWIDTH, 6, "BTN:");
    printMessage(MAXBOARDBGWIDTH, 7, "BACK");

    //Draw arrows for vertical / horizontal movement
    if (gameMode != GMROTATE) {

      for (var x = 0; x != boardWidth; x++) {
        set_bkg_tile_xy(boardX + x, boardY - 1, ARROWDOWN);
        set_bkg_tile_xy(boardX + x, boardY + boardHeight, ARROWUP);
      }

      for (var y = 0; y != boardHeight; y++) {
        set_bkg_tile_xy(boardX - 1, boardY + y, ARROWRIGHT);
        set_bkg_tile_xy(boardX + boardWidth, boardY + y, ARROWLEFT);
      }
    }

    //level
    var i16 = 0;
    for (var yy = 0; yy < boardHeight; yy++) {
      for (var xx = 0; xx < boardWidth; xx++) {
        set_bkg_tile_xy(boardX + xx, boardY + yy, level[i16 + xx]);
      }
      i16 += boardWidth;
    }
  }
}

function initGame() {
  paused = 0;
  //set background tiles
  setBlockTilesAsBackground();
  //set sprite for selector / cursor
  initCursors();
  setCursorPos(0, boardX + selectionX, boardY + selectionY);
  showCursors();
  redrawLevelDoneBit = 0;
  needRedraw = 1;
}

function doPause() {
  //drawGame();
  //drawCursors();
  paused = 1;
  wasSoundOn = isSoundOn();
  setSoundOn(0);
  hideCursors();
  //g.setColor(0,0,0);
  // g.fillRect(SCREENOFFSETX, SCREENOFFSETY + ((MAXBOARDBGHEIGHT >> 1) - 3) * TILESIZE, SCREENOFFSETX + 16* TILESIZE, SCREENOFFSETY + ((MAXBOARDBGHEIGHT >> 1) - 3) * TILESIZE +  (6* TILESIZE));
  //g.setColor(1,1,1);
  printMessage(0, (MAXBOARDBGHEIGHT >> 1) - 3, "[**************]");
  printMessage(0, (MAXBOARDBGHEIGHT >> 1) - 2, "|PLEASE CONFIRM+");
  printMessage(0, (MAXBOARDBGHEIGHT >> 1) - 1, "|              +");
  printMessage(0, (MAXBOARDBGHEIGHT >> 1) + 0, "|  TOUCH PLAY  +");
  printMessage(0, (MAXBOARDBGHEIGHT >> 1) + 1, "|  BTN TO QUIT +");
  printMessage(0, (MAXBOARDBGHEIGHT >> 1) + 2, "<##############>");
  requiresFlip = 1;
}

function doUnPause() {
  paused = 0;
  setSoundOn(wasSoundOn);
  setCursorPos(0, boardX + selectionX, boardY + selectionY);
  showCursors();
}

function game() {
  if (gameState == GSINITGAME) {
    initGame();
    gameState -= GSINITDIFF;
  }

  //needRedraw = updateCursorFrame();

  if (dragdown) {
    if (!levelDone && !paused) {
      playGameMoveSound();
      //if not touching border on bottom
      if (selectionY + 1 < boardHeight + posAdd) {
        selectionY += 1;
        needRedraw = 1;
      } else
      //set to border on top
      {
        selectionY = -posAdd;
        needRedraw = 1;
      }
      setCursorPos(0, boardX + selectionX, boardY + selectionY);
    }
  }

  if (dragup) {
    if (!levelDone && !paused) {
      //if not touching border on top
      playGameMoveSound();
      if (selectionY - 1 >= -posAdd) {
        selectionY -= 1;
        needRedraw = 1;
      } else
      //set to border on bottom
      {
        selectionY = boardHeight - 1 + posAdd;
        needRedraw = 1;
      }
      setCursorPos(0, boardX + selectionX, boardY + selectionY);
    }
  }

  if (dragright) {
    if (!levelDone && !paused) {
      playGameMoveSound();
      //if not touching border on right
      if (selectionX + 1 < boardWidth + posAdd) {
        selectionX += 1;
        needRedraw = 1;
      } else
      //set to border on left
      {
        selectionX = -posAdd;
        needRedraw = 1;
      }
      setCursorPos(0, boardX + selectionX, boardY + selectionY);
    }
  }

  if (dragleft) {
    if (!levelDone && !paused) {
      playGameMoveSound();
      //if not touching border on left
      if (selectionX - 1 >= -posAdd) {
        selectionX -= 1;
        needRedraw = 1;
      }
      //set to border on right
      else {
        selectionX = boardWidth - 1 + posAdd;
        needRedraw = 1;
      }
      setCursorPos(0, boardX + selectionX, boardY + selectionY);
    }
  }

  if (btna) {
    if (paused) {
      doUnPause();
      playMenuAcknowlege();
      needRedraw = 1;
    } else {
      if (!levelDone) {
        if ((selectionX > -1) && (selectionX < boardWidth) &&
          (selectionY > -1) && (selectionY < boardHeight)) {
          if (gameMode != GMSLIDE) {
            rotateBlock(selectionX + (selectionY * boardWidth));
            moves++;
            playGameAction();
            needRedraw = 1;
          } else {
            playErrorSound();
          }
        } else {
          if ((selectionX > -1) && (selectionX < boardWidth)) {
            if (selectionY == -1) {
              moveBlockDown(selectionX + ((selectionY + 1) * boardWidth));
              moves++;
              playGameAction();
              needRedraw = 1;
            } else {
              if (selectionY == boardHeight) {
                moveBlockUp(selectionX + ((selectionY - 1) * boardWidth));
                moves++;
                playGameAction();
                needRedraw = 1;
              }
            }
          } else {
            if ((selectionY > -1) && (selectionY < boardHeight)) {
              if (selectionX == -1) {
                moveBlockRight((selectionX + 1) + (selectionY * boardWidth));
                moves++;
                playGameAction();
                needRedraw = 1;
              } else {
                if (selectionX == boardWidth) {
                  moveBlockLeft((selectionX - 1) + (selectionY * boardWidth));
                  moves++;
                  playGameAction();
                  needRedraw = 1;
                }
              }
            } else {
              playErrorSound();
            }
          }
        }
        updateConnected();
        levelDone = isLevelDone();
        if (levelDone) {
          //update level one last time so we are at final state
          //as it won't be updated anymore as long as level done is displayed
          //1 forces level to be drawn (only) one last time the other call uses levelDone
          drawGame();
          //hide cursor it's only sprite we use
          hideCursors();
          //g.setColor(0,0,0);
          //g.fillRect(SCREENOFFSETX + ((16 - 13) >> 1) * TILESIZE,  SCREENOFFSETY + ((MAXBOARDBGHEIGHT >> 1) - 2) * TILESIZE, SCREENOFFSETX + (((16 - 13) >> 1) * TILESIZE) + (14*TILESIZE), SCREENOFFSETY + (((MAXBOARDBGHEIGHT >> 1) - 2) * TILESIZE) +(5*TILESIZE));
          //g.setColor(1,1,1);
          printMessage(((16 - 13) >> 1), (MAXBOARDBGHEIGHT >> 1) - 2, "[************]");
          printMessage(((16 - 13) >> 1), (MAXBOARDBGHEIGHT >> 1) - 1, "| LEVEL DONE +");
          printMessage(((16 - 13) >> 1), (MAXBOARDBGHEIGHT >> 1) - 0, "|  TOUCH TO  +");
          printMessage(((16 - 13) >> 1), (MAXBOARDBGHEIGHT >> 1) + 1, "|  CONTINUE  +");
          printMessage(((16 - 13) >> 1), (MAXBOARDBGHEIGHT >> 1) + 2, "<############>");
          redrawLevelDoneBit = 1;
        }
      } else {
        redrawLevelDoneBit = 0;
        //goto next level
        if (difficulty == DIFFRANDOM) {
          //ned new seed based on time
          randomSeedGame = Date.now();
          initLevel(randomSeedGame);
          //show cursor again (it's actually to early but i'm not fixing that)
          setCursorPos(0, boardX + selectionX, boardY + selectionY);
          showCursors();
          needRedraw = 1;
        } else {
          //goto next level if any
          if (selectedLevel < maxLevel) {
            selectedLevel++;
            unlockLevel(gameMode, difficulty, selectedLevel - 1);
            initLevel(randomSeedGame);
            //show cursor again (it's actually to early but i'm not fixing that)
            setCursorPos(0, boardX + selectionX, boardY + selectionY);
            showCursors();
            needRedraw = 1;
          } else //Goto some congrats screen
          {
            gameState = GSINITLEVELSCLEARED;
          }
        }
      }
    }
  }

  if (btnb) {
    if (!levelDone) {
      if (!paused) {
        playMenuBackSound();
        doPause();
        needRedraw = 0;
      } else {
        //need to enable early again to play backsound
        //normally unpause does it but we only unpause
        //after fade
        setSoundOn(wasSoundOn);
        hideCursors();
        playMenuBackSound();
        gameState = GSINITLEVELSELECT;
        doUnPause();
        //unpause sets cursor visible !
        hideCursors();
        //need to reset the level to initial state when going back to level selector
        //could not find a better way unfortunatly
        //also we do not want to reset the randomseed used for random level generating
        //or a new level would have been created when going back we only want the level
        //with random to change when pressing left and right in the level selector
        //this way it stays consistent with the normal levels
        //and the player can replay the level if he wants to
        initLevel(randomSeedGame);
      }
    }
  }

  if (needRedraw) {
    drawGame();
    drawCursors();
    needRedraw = 0;
    requiresFlip = 1;
  }
}


// --------------------------------------------------------------------------------------------------
// main game start
// --------------------------------------------------------------------------------------------------
function setup() {
  setBlockTilesAsBackground();
  option = 0;
  difficulty = DIFFNORMAL;
  selectedLevel = 1;
  mainMenu = MMSTARTGAME;
  gameState = GSINITINTRO;
  titleStep = TSMAINMENU;
  gameMode = GMROTATE;
  //has to be called first because initsound read savestate sound to set intial flags
  initSaveState();
  //initSound();
  setSoundOn(isSoundOnSaveState());
}

function loop() {
  //soundTimer();

  g.reset();
  g.setColor(1, 1, 1);
  g.setBgColor(0, 0, 0);


  //gamestate handling
  var prevGameState = gameState;

  switch (gameState) {
    case GSINITTITLE:
    case GSTITLE:
      clearInterval(intervalTimer);
      titleScreen();
      break;
    case GSINITLEVELSELECT:
    case GSLEVELSELECT:
      levelSelect();
      break;
    case GSINITGAME:
    case GSGAME:
      game();
      break;
    case GSINITLEVELSCLEARED:
    case GSLEVELSCLEARED:
      levelsCleared();
      break;
    case GSINITHELPSLIDE:
    case GSHELPSLIDE:
      helpSlide();
      break;
    case GSINITHELPSLIDE2:
    case GSHELPSLIDE2:
      helpSlide2();
      break;
    case GSINITHELPSLIDE3:
    case GSHELPSLIDE3:
      helpSlide3();
      break;
    case GSHELPROTATESLIDE:
    case GSINITHELPROTATESLIDE:
      helpRotateSlide();
      break;
    case GSINITHELPROTATESLIDE2:
    case GSHELPROTATESLIDE2:
      helpRotateSlide2();
      break;
    case GSINITHELPROTATESLIDE3:
    case GSHELPROTATESLIDE3:
      helpRotateSlide3();
      break;
    case GSINITHELPROTATESLIDE4:
    case GSHELPROTATESLIDE4:
      helpRotateSlide4();
      break;
    case GSINITHELPROTATE:
    case GSHELPROTATE:
      helpRotate();
      break;
    case GSINITHELPROTATE2:
    case GSHELPROTATE2:
      helpRotate2();
      break;
    case GSINITHELPROTATE3:
    case GSHELPROTATE3:
      helpRotate3();
      break;
    case GSINITINTRO:
    case GSINTRO:
      intro();
      break;
  }

  if (requiresFlip) {
    if (DEBUGMODE) {
      const offsetvalue = 0.20;
      var x1 = SCREENWIDTH * offsetvalue;
      var x2 = SCREENWIDTH - SCREENWIDTH * offsetvalue;
      var y1 = Bangle.appRect.y + SCREENHEIGHT * offsetvalue;
      var y2 = SCREENHEIGHT - SCREENHEIGHT * offsetvalue;
      g.setColor(1, 0, 1);
      //up
      g.drawRect(0, Bangle.appRect.y, SCREENWIDTH - 1, y1);
      //down
      g.drawRect(0, y2, SCREENWIDTH - 1, SCREENHEIGHT - 1);
      //left
      g.drawRect(0, Bangle.appRect.y, x1, SCREENHEIGHT - 1);
      //right
      g.drawRect(x2, Bangle.appRect.y, SCREENWIDTH - 1, SCREENHEIGHT - 1);
    }
    g.flip();
    requiresFlip = 0;
  }

  //when switching gamestate we need a redraw
  if ((gameState != prevGameState) && (gameState >= GSINITDIFF))
    needRedraw = 1;

  debugLog("loop");
  if (DEBUGMODERAMUSE) {
    var memTmp = process.memory(false);
    var used = memTmp.usage - memStart.usage;
    debugLog("Udiff:" + used.toString() + " used:" + memTmp.usage.toString() + " free:" + memTmp.free.toString() + " total:" + memTmp.total.toString());
  }
}

function debugLog(val) {
  if (DEBUGMODE)
    print(val);
}

function handleTouch(button, data) {
  const offsetvalue = 0.20;
  var x1 = SCREENWIDTH * offsetvalue;
  var x2 = SCREENWIDTH - SCREENWIDTH * offsetvalue;
  var y1 = Bangle.appRect.y + SCREENHEIGHT * offsetvalue;
  var y2 = SCREENHEIGHT - SCREENHEIGHT * offsetvalue;
  dragleft = data.x < x1;
  dragright = data.x > x2;
  dragup = data.y < y1;
  dragdown = data.y > y2;
  btna = ((data.x <= x2) && (data.x >= x1) && (data.y >= y1) && (data.y <= y2) && (data.type == 0));
  btnb = ((data.x <= x2) && (data.x >= x1) && (data.y >= y1) && (data.y <= y2) && (data.type == 2));
  debugLog("tap button:" + button.toString() + " x:" + data.x.toString() + " y:" + data.y.toString() + " x1:" + x1.toString() + " x2:" + x2.toString() + " y1:" + y1.toString() + " y2:" + y2.toString() + " type:" + data.type.toString());
  debugLog("l:" + dragleft.toString() + " u:" + dragup.toString() + " r:" + dragright.toString() + " d:" + dragdown.toString() + " a:" + btna.toString() + " b:" + btnb.toString());
  loop();
  dragleft = false;
  dragright = false;
  dragdown = false;
  dragup = false;
  btna = false;
  btnb = false;
  while (needRedraw)
    loop();
  debugLog("handleTouch done");
}

function btnPressed() {
  dragleft = false;
  dragright = false;
  dragdown = false;
  dragup = false;
  btna = false;
  btnb = true;
  loop();
  btnb = false;
  while (needRedraw)
    loop();
  debugLog("btnPressed done");
}

var memStart;
if (DEBUGMODERAMUSE)
  memStart = process.memory(true);

//clear one time entire screen
g.clear();
//only once they update themselves
Bangle.drawWidgets();
//setup game and run loop it will repeat during intro
//otherwise only as long as redraw is needed after input was detected
setup();
//for intro only
var intervalTimer = setInterval(loop, 66); // 15 fps
//for handling input
Bangle.on('touch', handleTouch);
setWatch(btnPressed, BTN, {
  edge: "rising",
  debounce: 50,
  repeat: true
});