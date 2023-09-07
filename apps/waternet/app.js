// --------------------------------------------------------------------------------------------------
// images
// --------------------------------------------------------------------------------------------------
const blockTiles = {
  width : 8, height : 8, bpp : 1,
  buffer : atob("JCTnAADnJCQAAP8AAOckJCQk5AQE5CQkAAD8BATkJCQkJOcAAP8AAAAA/wAA/wAAJCTkBAT8AAAAAPwEBPwAACQkJyAgJyQkAAA/ICAnJCQkJCQkJCQkJAAAPCQkJCQkJCQnICA/AAAAAD8gID8AACQkJCQkPAAAAAA8JCQ8AAA8PP////88PAAA/////zw8PDz8/Pz8PDwAAPz8/Pw8PDw8/////wAAAAD/////AAA8PPz8/PwAAAAA/Pz8/AAAPDw/Pz8/PDwAAD8/Pz88PDw8PDw8PDw8AAA8PDw8PDw8PD8/Pz8AAAAAPz8/PwAAPDw8PDw8AAAAADw8PDwAADx+/////348AH7/////fjw8fv7+/v5+PAB+/v7+/n48PH7/////fgAAfv////9+ADx+/v7+/n4AAH7+/v7+fgA8fn9/f39+PAB+f39/f348PH5+fn5+fjwAfn5+fn5+PDx+f39/f34AAH5/f39/fgA8fn5+fn5+AAB+fn5+fn4AAAAAAAAAAADMzDMzzMwzMwD/MzPMzDMzzs4yMs7OMjLMzDMzzMz/AExMc3NMTHNzAH9zc0xMc3MA/jIyzs4yMs7OMjLOzv4ATExzc0xMfwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP8AAAAAAAAAAQEBAQEBAQH/AQEBAQEBAQAAAAAAAAD//wAAAAAAAP8BAQEBAQEB//8BAQEBAQH/gICAgICAgID/gICAgICAgIGBgYGBgYGB/4GBgYGBgYGAgICAgICA//+AgICAgID/gYGBgYGBgf8AAAAAAAAAAMAiROgWIUIHQEJESBYhQgcAAAAAAAAAADx+ZmZmfjwAGBgYGBgYGAB8fAx8YHx8AHx8DHwMfHwADBw8bHwMDAB8fGB8DHx8AGBgfHxsfHwAfHwMGDAwMAB8fGx8bHx8AHx8bHwMfHwAfn5mfn5mZgB8fmZsZn58AHx8YGBgfHwAeHxmZmZ8eAB8fGB8YHx8AHx8YHh4YGAAPn5gbmZ+PABsbHx8bGxsABgYGBgYGBgAPj4MDGx8OABubnx8fG5uAGBgYGBgfHwAQWN3f2tjYwBmdn5uZmZmADh8bGxsfDgAeHxsfHhgYAA8fmZmZn4+AHh8bGx4bGwAPHxwOAx8eAB+fhgYGBgYAGxsbGxsfHwAbGxsbGx8OABjY2Nja382AGZmfhh+ZmYAZmZ+PBgYGAB8fAwYMHx8AAAwMAAwMAAAPEZaRlpGPAAIBPIBAfIECDxmWkJaWjwAfufDgefn535+9/OBgfP3fn7n5+eBw+d+fu/PgYHP7348bk5ubkY8ADxOdm5eRjwA")
};


const congratsTiles = {
  width : 8, height : 8, bpp : 1,
  buffer : atob("PCQkJDwkJAA4JCQoJCQ4ADwgICAgIDwAOCQkJCQkOAA8ICA8ICA8ADwgIDggICAAHCAgLCQkHAAkJCQ8JCQkABAQEBAQEBAAHAgICAgoEAAkJCgwKCQkACAgICAgIDwAIjYqIiIiIgAkNCwkJCQkABgkJCQkJBgAOCQkJDggIAAYJCQkJCQcADgkJCQ4JCQAHCAgGAQEOAA+CAgICAgIACQkJCQkJDwAJCQkJCQkGAAiIiIiKjYiACQkJBgkJCQAIiIUHAgICAA8BAwYMCA8AAAAAAAAAAAA")
};


const congratsScreen= {
  width : 128, height : 64, bpp : 1,
  buffer : atob("AAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAADAAAwAAAAAA/gAAAAAAHAAwAOMAAAAAAMYcBgYDDBwAMGDgBgEAAADAPj8Pjz4+ZjHx4w8Px8AAwGY7H443HGYxuOMZjsfAAMBmMxmMHxxmMPjjGYzGAADGZjMZjD8cZjH44xmMx8AA5mYzGYx3HGYzuOMZjMDAAH5+Mx+MPx5+MfjjH4zHwAA8PDMPjD8MOjHYYw8Mx8AAAAAAA4AAAAAAAAAAAAAAAAAAAB8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAiGCQAPCA8PDg8OAA+JDwAIiQkACAgICQkICQACCQgABQkJAAgICAkJCAkAAgkIAAcJCQAICA8JCQ8JAAIPDwACCQkACAgIDw4ICQACCQgAAgkJAAgICAkJCAkAAgkIAAIGDwAPDw8JCQ8OAAIJDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4HAAAAAAAAAAAAAAAAAAAOBwAAAAAAAAAAAAMAAAAADgcAAAAAAAAAAAAHgAAAAA4HAAAAAAAABgAADMAAAAAPDwAAAAAAAA8GABhAAAAADw8AAAYAAAAZjwARYAAAAAeeAAAPAAAAEJmAESAAAAAHngAAGYAAADLSwBCgBgAAA/wAABLAAAAhckAQIA8AAAP8AAAyQAAAIWFAECAZgAAB+AAAIUABgCBgQBAgEIAAAfgAACBAA8AgYEAQIDLAAACQAAAgQAZgIGBAGGAhQAAB+AAAIEAMICBgQAhAIUAABw4AACBACLAwYEAMwCBAAAwDAAAgQAiQEPBAB4AgQAAYAYAAIMAIUBmQwAMAIEAAEGCAADCACBAPGYADACBAADDgwAAZgAgQBg8AAgAgwAAgYEAADwAIEAYGAAIAMIAAIGBAAAYACBAEBgABABmAACBgQAAGAAwwBAQAAQAPAAAg8EAABAAEIAIEAAEABgAAMPDAAAQABmACAgABgAYAABAAgAACAAPAAgIAAIAEAAAYAYAAAgABgAMCAAAABAAADAMAAAIAAYABAwAAAAIAAAcOAAADAAEAAAEAAAACAAAB+AAAAQABAAAAAAAAAgAAAAAAAAAAAIAAA==")
};



const selectorTiles = {
  width : 8, height : 8, bpp : 1,
  transparent : 0,
  buffer : atob("AAAAAAAAgYHAAAAAAAAAwIGBAAAAAAAAAwAAAAAAAAMAAAAAAACAwMCAAAAAAAAAAAAAAAAAAQMDAQAAAAAAAA==")
};

const title = {
  width : 128, height : 40, bpp : 1,
  buffer : atob("AAAAAAAAAAAAAAAAAAAAAAAHh8HAAAAAAAAAAAAAAAAAD4fDwAAAAAAAAAAAPAAAAA+Hw8AA+AAAAAAAAHwAAAAPj8PAAPwAAAAAAAD8AAAAD4/Dw/n8Hwc7n4H4/gAAAA+Pw8f//3+He7/H/f+AAAAHj8OP//5/x/v/z/3/YAAAB8/Hj/38/+fz/8///iAAAAPO54w8+PHn4+PPHvwwAAADzOeAPPDx58PDzx54MAAAA/x/h/zw/+eDw8/+eCAAAAP8fw/88P/nh8PP/nhgAAAD/H4PHPDwB4/HzwB4wAAAAfx+Hhzw8AePx88AeMAAAAH4fh/8/v/Hj8fP/nzAAAAB+H4f/P7/x4/Hz/7+wAAAAfD+H/x+/8ePx8f+/sAAAADA+BwAYGAGDwcHAGBgAAAAQNg2AHBwDg2FhYB5IAAAAGCIMwDY/A8JxczAz+AAAAAhBOPjnIY5kMzY447gAAAAHgOAfgMB4OB4cB4PAAAAAAAAAAAAAAAAAAAAD4AAAAAAAAAAAAAAAAAAAA/AAAAAAAAAAAAAAAAAAAAfwAAAAAAAAAAAAAAAAAAAH+AAAAAAAAAAAAAAAAAAAD/4AAAAAAAAAAAAAAAAAAA/+AAAAAAAAAAAAAAAAAAAP/gAAAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAA//AAAAAAAAAAAAAAAAAAAP/wAAAAAAAAAAAAAAAAAAD/8AAAAAAAAAAAAAAAAAAAf/AAAAAAAAAAAAAAAAAAAH/gAAAAAAAAAAAAAAAAAAA7wAAAAAAAAAAAAAAAAAAAH8AAAAAAAAAAAAAAAAAAAA8AAAAAAAAAAAAAAAAAAAAAAAA==")
};

// --------------------------------------------------------------------------------------------------
// global variables and consts
// --------------------------------------------------------------------------------------------------
//need to call this first otherwise 
//Bangle.apprect is not updated and i can't calculate screenoffsety
Bangle.loadWidgets();

const debugMode = 0;
const debugModeRamUse = 0;
const scaleScreen = 1;

const screenWidth = 176;
const screenHeight = 176;

const screenOffsetX = ((screenWidth - 16 * 8) >> 1);
const screenOffsetY = ((screenHeight + Bangle.appRect.y - 8 * 8) >> 1);
const maxBoardWidth = 10;
const maxBoardHeight = 8;

const  maxBoardBgWidth = 10;
const  maxBoardBgHeight = 8;

const  maxBoardSize = maxBoardWidth * maxBoardHeight;

const  tileSize = 8;

const  gsGame = 0;
const  gsTitle = 1;
const  gsLevelSelect = 2;
const  gsLevelsCleared = 3;
const  gsHelpRotate = 4;
const  gsHelpRotate2 = 5;
const  gsHelpRotate3 = 6;
const  gsHelpRotateSlide = 7;
const  gsHelpRotateSlide2 = 8;
const  gsHelpRotateSlide3 = 9;
const  gsHelpRotateSlide4 = 10;
const  gsHelpSlide = 11;
const  gsHelpSlide2 = 12;
const  gsHelpSlide3 = 13;
const  gsIntro = 14;

const  gsInitDiff = 50;

const  gsInitGame = gsInitDiff + gsGame;
const  gsInitTitle = gsInitDiff + gsTitle;
const  gsInitLevelSelect = gsInitDiff + gsLevelSelect;
const  gsInitLevelsCleared = gsInitDiff + gsLevelsCleared;
const  gsInitHelpRotate = gsInitDiff + gsHelpRotate;
const  gsInitHelpRotate2 = gsInitDiff + gsHelpRotate2;
const  gsInitHelpRotate3 = gsInitDiff + gsHelpRotate3;
const  gsInitHelpRotateSlide = gsInitDiff + gsHelpRotateSlide;
const  gsInitHelpRotateSlide2 = gsInitDiff + gsHelpRotateSlide2;
const  gsInitHelpRotateSlide3 = gsInitDiff + gsHelpRotateSlide3;
const  gsInitHelpRotateSlide4 = gsInitDiff + gsHelpRotateSlide4;
const  gsInitHelpSlide = gsInitDiff + gsHelpSlide;
const  gsInitHelpSlide2 = gsInitDiff + gsHelpSlide2;
const  gsInitHelpSlide3 = gsInitDiff + gsHelpSlide3;
const  gsInitIntro = gsInitDiff + gsIntro;


const  diffVeryEasy = 0;
const  diffEasy = 1;
const  diffNormal = 2;
const  diffHard = 3;
const  diffVeryHard = 4;
const  diffRandom = 5;
const  diffCount = 6;

const  gmRotate = 0;
const  gmSlide = 1;
const  gmRotateSlide = 2;
const  gmCount = 3;

const  mmStartGame = 0;
const  mmHelp = 1;
const  mmOptions = 2;
const  mmCredits = 3;
const  mmCount = 4;

const  opMusic = 0;
const  opSound = 1;
const  opCount = 2;

const  tsMainMenu = 0;
const  tsGameMode = 1;
const  tsDifficulty = 2;
const  tsOptions = 3;
const  tsCredits = 4;

const  levelCount = 25;

const  arrowDown = 122;
const  arrowUp = 120;
const  arrowLeft = 123;
const  arrowRight = 121;
const  leftMenu = 118;

const  frameRate = 15;

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
var level = new Uint8Array(maxBoardSize);

// Cursor
const maxCursorFrameCount = (10 * frameRate / 60);
const cursorAnimCount = 2; //blink on & off
const cursorNumTiles = 16; //for the max 2 cursors shown at once (on help screens) 

var cursorFrameCount, cursorFrame, showCursor;
var spritePos = []; 
for (var i = 0; i <cursorNumTiles; i++)
  spritePos.push(new Uint8Array(2));

//intro
var frames;
var titlePosY;
const frameDelay = 16 * frameRate / 15;

//savestate
const soundOptionBit = 0;
const musicOptionBit = 1; 

var levelLocksPacked = new Uint32Array(3);
var options = 0; //bit 0 sound on/off, bit 1 music on/off

//game

var paused;
var wasMusicOn;
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
  return ((al * bl) + (((ah * bl + al * bh) << 16) >>> 0)|0);
};

function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
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
    return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

//based on code from pracrand https://pracrand.sourceforge.net/ (public domain)
function sfc32(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
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

function srand(seed)
{
	// Create cyrb128 state:
	var aseed = cyrb128("applespairs" + seed.toString());
	// Four 32-bit component hashes provide the seed for sfc32.
	randfunc = sfc32(aseed[0], aseed[1], aseed[2], aseed[3]);
}

function random(value)
{
	return randomIntFromInterval(0,value-1);
}


// --------------------------------------------------------------------------------------------------
// Cursor stuff
// --------------------------------------------------------------------------------------------------


function move_sprite(sprite, x, y) 
{
    spritePos[sprite][0] = x;
    spritePos[sprite][1] = y;
}

function drawCursors()
{
    if((showCursor == 0) || (cursorFrame & 1)) // 2nd or to add blink effect, it will skip drawing if bit 1 is set
        return;
    g.setColor(1,0,0);
    for (var i=0; i<cursorNumTiles; i++)
        if (spritePos[i][1] < screenHeight)
            g.drawImage(selectorTiles,screenOffsetX + spritePos[i][0], screenOffsetY + spritePos[i][1], {frame: ((i % 8) )});
    g.setColor(1,1,1);
}

//returns 1 if cursor has changed / needs redraw
function updateCursorFrame()
{
    cursorFrameCount++;
    if (cursorFrameCount >= maxCursorFrameCount)
    {
        cursorFrame++;
        cursorFrameCount = 0;
        if (cursorFrame >= cursorAnimCount)
            cursorFrame = 0;
        return 1; 
    }
    return 0;
}

function hideCursors()
{
    //HIDE CURSOR SPRITES
    //cursor 0
    setCursorPos(0, 0, (screenHeight / 8) + 1);

    //cursor 1
    setCursorPos(1, 0, (screenHeight / 8) + 1);

    showCursor = 0;
}

function showCursors()
{
    showCursor = 1;
}

function setCursorPos(cursorNr, xPos, yPos)
{
    if (cursorNr > 1)
        return;

    move_sprite((cursorNr<<3) + 0, ((xPos) << 3),  ((yPos - 1) << 3));
    move_sprite((cursorNr<<3) + 1,  ((xPos + 1) << 3),  ((yPos) << 3));
    move_sprite((cursorNr<<3) + 2,  ((xPos) << 3),  ((yPos + 1) << 3));
    move_sprite((cursorNr<<3) + 3,  ((xPos - 1) << 3),  ((yPos) << 3)); 
    //corners
    move_sprite((cursorNr<<3) + 4, ((xPos + 1) << 3),  ((yPos - 1) << 3));
    move_sprite((cursorNr<<3) + 5, ((xPos + 1) << 3),  ((yPos + 1) << 3));
    move_sprite((cursorNr<<3) + 6, ((xPos - 1) << 3),  ((yPos - 1) << 3));
    move_sprite((cursorNr<<3) + 7, ((xPos - 1) << 3),  ((yPos + 1) << 3)); 
}

function initCursors()
{
    hideCursors();

    cursorFrameCount = 0;
    cursorFrame = 0;
}

// --------------------------------------------------------------------------------------------------
// helper funcs
// --------------------------------------------------------------------------------------------------

function set_bkg_tile_xy(x, y, tile)
{
  g.drawImage(currentTiles, screenOffsetX + x *8, screenOffsetY + y*8, {frame:tile}); //arduboy.drawBitmap(x * 8, y * 8, &currentTiles[2 + (tile * 8)] , 8, 8);
}

function set_bkg_data(tiles)
{
  currentTiles = tiles;
}

function get_bkg_data()
{
  return currentTiles;
}

function set_bkg_tiles(x, y, map)
{
  g.drawImage(map, screenOffsetX + x, screenOffsetY + y);  //arduboy.drawBitmap(x, y,  &map[2], pgm_read_byte(&map[0]), pgm_read_byte(&map[1]));
}

function setBlockTilesAsBackground()
{
  set_bkg_data(blockTiles);
}

// --------------------------------------------------------------------------------------------------
// help screens
// --------------------------------------------------------------------------------------------------


//LEGEND STATE
function inithelpLegend() 
{
    setBlockTilesAsBackground();
    //SelectMusic(musTitle);
    needRedraw = 1;
}

//LEGEND STATE
function helpLegend(nextState) 
{
    if ((gameState == gsInitHelpSlide) ||
        (gameState == gsInitHelpRotate) ||
        (gameState == gsInitHelpRotateSlide))
    {
        inithelpLegend();
        gameState -= gsInitDiff;
    }

    if (needRedraw)
    {
        g.clearRect(Bangle.appRect);
        switch(gameState)
        {
            case gsHelpSlide:
                printMessage(2, 0, "HELP: SLIDE");
                break;
            case gsHelpRotate:
                printMessage(2, 0, "HELP: ROTATE");
                break;
            case gsHelpRotateSlide:
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

        if((gameState == gsHelpRotateSlide) ||
        (gameState == gsHelpSlide))
        {
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
    if (btna)
    {
        //playMenuAcknowlege();
        gameState = nextState;
    }
}

//FINISH LEVEL STATE
function initHelpFinishLevel()
{
    setBlockTilesAsBackground();
    //SelectMusic(musTitle);
    needRedraw = 1;
}

//FINISH LEVEL STATE
function helpFinishLevel(nextState)
{
    if ((gameState == gsInitHelpSlide2) ||
        (gameState == gsInitHelpRotate2) ||
        (gameState == gsInitHelpRotateSlide2))
    {
        initHelpFinishLevel();
        gameState -= gsInitDiff;
    }

    if(needRedraw)
    {
        g.clearRect(Bangle.appRect);
        switch(gameState)
        {
            case gsHelpSlide2:
                printMessage(2, 0, "HELP: SLIDE");
                break;
            case gsHelpRotate2:
                printMessage(2, 0, "HELP: ROTATE");
                break;
            case gsHelpRotateSlide2:
                printMessage(2, 0, "HELP: ROSLID");
                break;
        }
        printMessage(0, 2, "LEVEL FINISH:");

        if((gameState == gsHelpSlide2) ||
        (gameState == gsHelpRotateSlide2))
        {
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

    if (btna)
    {
        //playMenuAcknowlege();
        gameState = nextState;
    }
}

function initHelpDoSlideRotate()
{
    setBlockTilesAsBackground();
    //SelectMusic(musTitle);

    //DRAW CURSOR SPRITES
    initCursors();

    if((gameState == gsInitHelpRotateSlide4) ||
      (gameState == gsInitHelpSlide3))
    {
        setCursorPos(0, 0, 5);
        setCursorPos(1, 11, 5);
    }
    else
    {
        setCursorPos(0, 1, 4);
        setCursorPos(1, 12, 4);
    }

    showCursors();
    needRedraw = 1;
}

function helpDoSlideRotate(nextState)
{
    if ((gameState == gsInitHelpSlide3) ||
        (gameState == gsInitHelpRotate3) ||
        (gameState == gsInitHelpRotateSlide3) ||
        (gameState == gsInitHelpRotateSlide4))
    {
        initHelpDoSlideRotate();
        gameState -= gsInitDiff;
    }

    if(needRedraw)
    {
        g.clearRect(Bangle.appRect);

        switch(gameState)
        {
            case gsHelpSlide3:
                printMessage(2, 0, "HELP: SLIDE");
                break;
            case gsHelpRotate3:
                printMessage(2, 0, "HELP: ROTATE");
                break;
            case gsHelpRotateSlide3:
            case gsHelpRotateSlide4:
                printMessage(2, 0, "HELP: ROSLID");
                break;
        }

        if((gameState == gsHelpRotateSlide3) || 
            (gameState == gsHelpRotate3))
            printMessage(5, 2, "ROTATE");
        else
            printMessage(6, 2, "SLIDE");

        // 'A' + '=>'
        set_bkg_tile_xy(6, 5, 119);
        printMessage(5, 5, "TOUCH");
        set_bkg_tile_xy(10, 5, 118);

        if((gameState == gsHelpSlide3) || 
        (gameState == gsHelpRotateSlide3) ||
        (gameState == gsHelpRotateSlide4))
        {
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
        if ((gameState == gsHelpRotate3) ||
            (gameState == gsHelpRotateSlide3)) 
        {
            set_bkg_tile_xy(1, 4, 12);
            set_bkg_tile_xy(2, 4, 7);
            set_bkg_tile_xy(3, 4, 27);

            set_bkg_tile_xy(1, 5, 28);
            set_bkg_tile_xy(2, 5, 33);
            set_bkg_tile_xy(3, 5, 22);

            set_bkg_tile_xy(1, 6, 29);
            set_bkg_tile_xy(2, 6, 20);
            set_bkg_tile_xy(3, 6, 23);
        }
        else
        {
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

    if (btna)
    {
        //playMenuAcknowlege();
        gameState = nextState;
        hideCursors();
    }
}


//LEGEND STATE
function helpRotateSlide()
{
    helpLegend(gsInitHelpRotateSlide2);
}

//FINISH LEVEL STATE
function helpRotateSlide2()
{
    helpFinishLevel(gsInitHelpRotateSlide3);
}

//SLIDE STATE
function helpRotateSlide3()
{
   helpDoSlideRotate(gsInitHelpRotateSlide4);
}

//ROTATE STATE
function helpRotateSlide4()
{
    helpDoSlideRotate(gsInitTitle);
}

function helpRotate()
{
    helpLegend(gsInitHelpRotate2);
}

//FINISH LEVEL STATE
function helpRotate2()
{
    helpFinishLevel(gsInitHelpRotate3);
}

//ROTATE STATE
function helpRotate3()
{
    helpDoSlideRotate(gsInitTitle);
}

//LEGEND STATE
function helpSlide()
{
    helpLegend(gsInitHelpSlide2);
}

//FINISH LEVEL STATE
function helpSlide2()
{
    helpFinishLevel(gsInitHelpSlide3);
}

//SLIDE STATE
function helpSlide3()
{
    helpDoSlideRotate(gsInitTitle);
}

// --------------------------------------------------------------------------------------------------
// Intro
// --------------------------------------------------------------------------------------------------

function initIntro()
{
    setBlockTilesAsBackground();
    titlePosY = g.getHeight();
    frames = 0;
}

function intro()
{
    if (gameState == gsInitIntro)
    {
        initIntro();
        gameState -= gsInitDiff;
    }
  
    frames++;
    g.clearRect(Bangle.appRect);
    if (frames < frameDelay)
    {
        //16-12
        printMessage(4 >> 1, 4, "WILLEMS DAVY");
        requiresFlip = 1;
    }
    else
    {
        if (frames < frameDelay *2)
        {
            //16-8
            printMessage(8 >> 1, 4, "PRESENTS");
            requiresFlip = 1;
        }
        else
        {
            requiresFlip = 1;
            g.drawImage(title, screenOffsetX, titlePosY);//arduboy.drawCompressed(0, (uint16_t)titlePosY, titlescreenMap);
            if(titlePosY > screenOffsetY)
            {
                titlePosY -= 60/frameRate;
            }
            else
            {
                gameState = gsInitTitle;
            }
        }
    }

    if (btna || btnb)
    {
        gameState = gsInitTitle;
    }
}

// --------------------------------------------------------------------------------------------------
// Level Stuff
// --------------------------------------------------------------------------------------------------


function moveBlockDown(aTile)
{
    var tmp = level[aTile + boardSize - boardWidth];
    for (var i= boardSize - boardWidth; i != 0 ; i -= boardWidth)
        level[aTile + i] = level[aTile + i -boardWidth];
    level[aTile] = tmp;
}

function moveBlockUp(aTile)
{
    var tmp = level[aTile - boardSize + boardWidth]; 
    for (var i= boardSize - boardWidth; i != 0; i -= boardWidth)
        level[aTile - i] = level[aTile - i + boardWidth];
    level[aTile] = tmp;
}

function moveBlockRight(aTile)
{
    var tmp = level[aTile + boardWidth - 1];
    for (var i= 0; i < boardWidth -1; i++)
      level[aTile + boardWidth - 1 - i] = level[aTile + boardWidth - 2 - i];
    level[aTile] = tmp;
}

function moveBlockLeft(aTile)
{
    var tmp = level[aTile - boardWidth + 1];
    for (var i= 0; i < boardWidth-1; i++)
      level[aTile - boardWidth + 1 + i] = level[aTile - boardWidth + 2 + i];
    level[aTile] = tmp;
}

//rotates a tile by change the tilenr in the level
//there are 16 tiles per set and there are 3 sets no water, water filled, and special start tiles
function rotateBlock(aTile)
{
    switch (level[aTile])
    {
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

function shuffleSlide(aTile)
{
    var rnd = random(3);
    switch (rnd)
    {
        case 0:
            moveBlockUp((aTile % boardWidth) + boardSize - boardWidth);
            break;
        case 1:
            moveBlockDown((aTile % boardWidth));
            break;
        case 2:
            moveBlockLeft(boardWidth - 1 + aTile -(aTile % boardWidth));
            break;
        case 3:
            moveBlockRight(aTile - (aTile % boardWidth));
            break;
    }
}

function shuffleRotate(aTile)
{
    var rnd = random(3);
    for (var i = 0; i < rnd; i++)
        rotateBlock(aTile);
}

function shuffleLevel()
{
    var rnd;
    var j = 0;
    while(j < boardSize)
    {
        switch(gameMode)
        {
            case gmRotate:
                shuffleRotate(j);
                j++;
                break;
            case gmSlide:
                shuffleSlide(j);
                //for speed up it should be fine as all slide levels are uneven in width / height (except random)
                j+=2;
                break;
            case gmRotateSlide:
                rnd = random(2);
                if(rnd == 0)
                {
                    shuffleSlide(j);
                    //for speed up
                    j+=2;
                }
                else
                {
                    shuffleRotate(j);
                    j++;
                }
                break;
        }
    }
}

function handleConnectPoint(currentPoint, cellStack, cc)
{
    var lookUpX = currentPoint % boardWidth;
    var lookUpY = Math.floor(currentPoint / boardWidth);
    var tmp;
    var tmp2;
    if ((lookUpY> 0) && (!(level[currentPoint] & 1)))
    {
        tmp = currentPoint - boardWidth;
        tmp2 = level[tmp];
        if (((tmp2 < 16) && (!(tmp2 & 4)) ) || 
        ((tmp2 > 15) && (!((tmp2 - 16) & 4))))
        {
            //adapt tile to filled tile
            if(level[currentPoint] < 16)
            {
                level[currentPoint] += 16;
            }

            //add neighbour to cellstack of to handle tiles
            if (tmp2 < 16)
            {
                cellStack[cc++] = tmp;
            }
        }

    }

    //if tile has passage to the east and east neigbour passage to the west 
    if  ((lookUpX  + 1 < boardWidth) && (!(level[currentPoint] & 2)))
    {
        tmp = currentPoint + 1;
        tmp2 = level[tmp];
        if (((tmp2 < 16) && (!(tmp2 & 8))) || 
        ((tmp2 > 15) && (!((tmp2 - 16) & 8))))
        {
            //adapt tile to filled tile
            if(level[currentPoint] < 16)
            {
                level[currentPoint] += 16;
            }

            //add neighbour to cellstack of to handle tiles
            if (tmp2 < 16)
            {
                cellStack[cc++] = tmp;
            }

        }
    }

    //if tile has passage to the south and south neigbour passage to the north 
    if ((lookUpY + 1 < boardHeight) && (!(level[currentPoint] & 4 )))
    {
        tmp = currentPoint + boardWidth;
        tmp2 = level[tmp];
        if (((tmp2 < 16) && (!(tmp2 & 1))) || 
        ((tmp2 > 15) && (!((tmp2 - 16) & 1))))
        {
            //adapt tile to filled tile
            if(level[currentPoint] < 16)
            { 
                level[currentPoint] += 16;
            }

            //add neighbour to cellstack of to handle tiles
            if (tmp2 < 16)
            {
                cellStack[cc++] = tmp; 
            }
        } 
    }

    //if tile has passage to the west and west neigbour passage to the east 
    if  ((lookUpX > 0) && (!(level[currentPoint] & 8)))
    {
        tmp = currentPoint - 1;
        tmp2 = level[tmp];
        if (((tmp2 < 16) && (!(tmp2 & 2))) ||
        ((tmp2 > 15) && (!((tmp2 - 16) & 2))))
        {
            //adapt tile to filled tile
            if(level[currentPoint] < 16)
            { 
                level[currentPoint] += 16;
            }

            //add neighbour to cellstack of to handle tiles
            if(tmp2 < 16)
            {
                cellStack[cc++] = tmp;
            }
        }
    }
  return cc;
}

function updateConnected()
{
    var cellStack = [];
    //reset all tiles to default not filled one
    for (var i= 0; i != boardSize; i++)
    {
        if (level[i] > 31)
        {
            level[i] -= 32;
        }
        else
        {
            if (level[i] > 15)
            {
                level[i] -= 16;
            }
        }
    } 

    //start with start tile
    var cc = 1;
    cc = handleConnectPoint(startPos, cellStack, cc);
    while(--cc > 0)
    {
        //if tile is bigger then 15 we already handled this one, continue with next one
        if ((level[cellStack[cc]] < 16))
        {
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

function generateLevel()
{
    var neighbours = new Uint8Array(4);
    var cellStack = new Uint8Array(maxBoardSize+1);
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
    for(tmp = 0; tmp < boardSize; tmp++)
      level[tmp] = 0xf;

    while (visitedRooms != boardSize)
    {
        neighboursFound = 0;
        lookUpX = currentPoint % boardWidth;
        lookUpY = Math.floor(currentPoint / boardWidth);

        tmp  = currentPoint+1; 
        //tile has neighbour to the right which we did not handle yet
        if (( lookUpX + 1 < boardWidth) && (level[tmp] == 0xf))
            neighbours[neighboursFound++] = tmp;

        tmp = currentPoint-1; 
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

        switch (neighboursFound)
        {
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
        if(tmp > lookUpX)
        {
            //remove west wall neighbour
            level[selectedNeighbour] &= ~(8);
            //remove east wall tile
            level[currentPoint] &= ~(2);
        }
        else // tile has neighbour to the west
        {
            if(tmp < lookUpX)
            {
                //remove east wall neighbour
                level[selectedNeighbour] &= ~(2);
                //remove west wall tile
                level[currentPoint] &= ~(8);
            }
            else // tile has neighbour to the north
            {
                tmp2 = selectedNeighbour / boardWidth;
                if(tmp2 < lookUpY)
                {
                    //remove south wall neighbour
                    level[selectedNeighbour] &= ~(4);
                    //remove north wall tile
                    level[currentPoint] &= ~(1);
                }
                else // tile has neighbour to the south
                {
                    if(tmp2 > lookUpY)
                    {
                        //remove north wall neighbour
                        level[selectedNeighbour] &= ~(1);
                        //remove south wall tile
                        level[currentPoint] &= ~(4);
                    }
                }
            }
        }

        //add tile to the cellstack
        if(neighboursFound > 1)
        {
            cellStack[cc++] = currentPoint;
        }
        //set tile to the neighbour
        currentPoint = selectedNeighbour;
        visitedRooms++;
    }
}

//when all board tiles are not below 16, the level is cleared
//as there are 16 tiles per tilegroup (no water, water, special start with water) 
function isLevelDone()
{
    for (var i=0; i != boardSize; i++)
        if(level[i] < 16)
            return 0;

    return 1;
}

function initLevel(aRandomSeed)
{
    levelDone = 0;
    moves = 0;
    if(difficulty != diffRandom)
        //use level number + fixed value based on difficulty as seed for the random function
        //this makes sure every level from a difficulty will remain the same
        srand(selectedLevel + (difficulty * 500) + (gameMode * 50));
    else
        srand(aRandomSeed);

    maxLevel = levelCount;
    //set boardsize and max level based on difficulty
    switch (difficulty)
    {
        case diffVeryEasy:
            boardWidth = 5;
            boardHeight = 5;
            break;
        case diffEasy:
            boardWidth = 6;
            boardHeight = 6;
            break;
        case diffNormal:
            boardWidth = 7;
            boardHeight = 7;
            break;
        case diffHard:
            boardWidth = 8;
            boardHeight = 8;
            break;
        case diffVeryHard:
            boardWidth = 10;
            boardHeight = 8;
            break;
        case diffRandom:
            var rnd = random(255);
            boardWidth = 5 + (rnd % (maxBoardWidth - 5 + 1)); //5 is smallest level width from very easy
            rnd = random(255);
            boardHeight = 5 + (rnd % (maxBoardHeight - 5 + 1)); //5 is smallest level height from very easy
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
    boardX = (maxBoardBgWidth - boardWidth) >> 1;
    boardY = (maxBoardBgHeight  - boardHeight) >> 1;
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


function initLevelsCleared()
{
    set_bkg_data(congratsTiles);
    g.clearRect(Bangle.appRect);
    g.drawImage(congratsScreen, screenOffsetX, screenOffsetY); //arduboy.drawCompressed(0, 0, congratsMap);
    switch (difficulty)
    {
        case diffVeryEasy:
            printCongratsScreen(0, 3, "VERY EASY LEVELS");
            break;

        case diffEasy:
            printCongratsScreen(3, 3, "EASY LEVELS");
            break;

        case diffNormal:
            printCongratsScreen(2, 3, "NORMAL LEVELS");
            break;

        case diffHard:
            printCongratsScreen(3, 3, "HARD LEVELS");
            break;

        case diffVeryHard:
            printCongratsScreen(0, 3, "VERY HARD LEVELS");
            break;
    }
//    SelectMusic(musAllLevelsClear);
    requiresFlip = 1;
}

function levelsCleared()
{
    if(gameState == gsInitLevelsCleared)
    {
        initLevelsCleared();
        gameState -= gsInitDiff;
    }

    if (btna || btnb) 
    {
        //playMenuAcknowlege();
        titleStep = tsMainMenu;
        gameState = gsInitTitle;
    }
    needRedraw = 0;
}


// --------------------------------------------------------------------------------------------------
// level select
// --------------------------------------------------------------------------------------------------

function drawLevelSelect() 
{
    g.clearRect(Bangle.appRect);
    //LEVEL:
    printMessage(maxBoardBgWidth  , 0 , "LEVEL:");

    //[LEVEL NR] 2 chars
    printNumber(maxBoardBgWidth + 4 , 1 , selectedLevel, 2);

    //B:BACK
    printMessage(maxBoardBgWidth  , 6 , "BTN:");
    printMessage(maxBoardBgWidth  , 7 , "BACK");

    //A:PLAY
    printMessage(maxBoardBgWidth  , 4 , "TOUCH:");
    printMessage(maxBoardBgWidth  , 5 , "PLAY");

    //Locked & Unlocked keywoard
    var tmpUnlocked = levelUnlocked(gameMode, difficulty, selectedLevel -1);
    if(!tmpUnlocked)
        printMessage(maxBoardBgWidth , 2 , "LOCKED");
    else
        printMessage(maxBoardBgWidth , 2 , "OPEN");

    //Draw arrows for vertical / horizontal movement
    if(gameMode != gmRotate)
    {
        for (var x = 0; x != boardWidth; x++)
        {
            set_bkg_tile_xy(boardX + x , boardY -1 , arrowDown);
            set_bkg_tile_xy(boardX + x , boardY + boardHeight , arrowUp);
        }

        for (var y = 0; y != boardHeight; y++)
        {
            set_bkg_tile_xy(boardX - 1 , boardY + y , arrowRight);
            set_bkg_tile_xy(boardX + boardWidth , boardY + y , arrowLeft);
        }
    }

    var i16 = 0;
    for (var yy = 0; yy < boardHeight; yy++)
    {
        for(var xx = 0; xx <boardWidth; xx++)
        {
            set_bkg_tile_xy(boardX  + xx , boardY  + yy, level[i16 + xx]);
        }
        i16 += boardWidth;
    }
}

function initLevelSelect()
{
    setBlockTilesAsBackground();
    //SelectMusic(musTitle);
    needRedraw = 1;
}

function levelSelect()
{
    if(gameState == gsInitLevelSelect)
    {
        initLevelSelect();
        gameState -= gsInitDiff;
    }

    if(needRedraw)
    {
        drawLevelSelect();
        needRedraw = 0;
        requiresFlip = 1;
    }

    var tmpUnlocked = levelUnlocked(gameMode, difficulty, selectedLevel -1);


    if (btnb)
    {
        //playMenuBackSound();
        gameState = gsInitTitle;
    }
    if (btna)
    {
        if(tmpUnlocked)
        {
            gameState = gsInitGame;
            //playMenuAcknowlege();
        }
        else
        {
            //playErrorSound();
        }
    }
    if (dragleft)
    {
        if (difficulty == diffRandom)
        {
            //playMenuSelectSound();
            randomSeedGame = Date.now();//arduboy.generateRandomSeed();
            initLevel(randomSeedGame);
            needRedraw = 1;
        }
        else
        {
            if (selectedLevel > 1)
            {
                //playMenuSelectSound();
                selectedLevel--;
                initLevel(randomSeedGame);
                needRedraw = 1;
            }
        } 
    }
    if (dragright)
    {
        if (difficulty == diffRandom)
        {
            //playMenuSelectSound();
            //need new seed based on time
            randomSeedGame = Date.now();
            initLevel(randomSeedGame);
            needRedraw = 1;
        }
        else
        {
            if (selectedLevel < maxLevel)
            {
                //playMenuSelectSound();
                selectedLevel++;
                initLevel(randomSeedGame);
                needRedraw = 1;
            }
        }
    }

}

// --------------------------------------------------------------------------------------------------
// printing functions
// --------------------------------------------------------------------------------------------------

function setCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substring(0,index) + chr + str.substring(index+1);
}

function formatInteger(valinteger)
{
    const maxDigits = 10;
    var array = "          ";

    const maxCharacters = (maxDigits);


    const lastIndex = (maxCharacters - 1);


    if(valinteger == 0)
    {
        array = setCharAt(array,lastIndex, '0');
        return {digits:1,string:array};
    }

    var digits = 0;
    var integer = valinteger;
    do
    {
        var digit = integer % 10;
        integer = Math.floor(integer / 10);

        array = setCharAt(array,lastIndex - digits, digit.toString());
        ++digits;
    }
    while(integer > 0);

    return {digits:digits,string:array};
}

//print a number on levelselect or game screen
function printNumber(ax, ay, aNumber, maxDigits)
{
    const buffSize = 10;

    var ret = formatInteger(aNumber);
    var maxFor = ret.digits;
    if (ret.digits > maxDigits)
        maxFor = maxDigits;
    for (var c=0; c < maxFor; c++)
    {
        if (ret.string.charAt(buffSize - ret.digits + c) == '')
            return;
        set_bkg_tile_xy(ax + (maxDigits-ret.digits) + c, ay, ret.string.charCodeAt(buffSize - ret.digits + c) + 32);
    }
}

function printDebug(ax,ay, amsg)
 {
    if(debugMode)
    {
        //rememvber current tiles
        var tiles = get_bkg_data();
        setBlockTilesAsBackground();
        g.clearRect(Bangle.appRect);
        printMessage(ax, ay, amsg);
        setTimeout(() => { g.flip(); }, 2500);
        //restore the previous tiles
        set_bkg_data(tiles);
    }
 }

//print a message on the title screen on ax,ay, the tileset from titlescreen contains an alphabet
function printMessage(ax, ay, amsg)
{
    var index = 0;
    var p = 0;
    while (1)
    {
        var fChar = amsg.charAt(p++);
        var tile = 61;
        switch (fChar)
        {
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
                if ((fChar.charCodeAt(0) >= 'A'.charCodeAt(0)) &&  (fChar.charCodeAt(0) <= 'Z'.charCodeAt(0)))
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
function printCongratsScreen(ax, ay, amsg)
{
    // based on input form @Pharap
    var index = 0;
    var p = 0;
    while (1)
    {
        var fChar = amsg.charAt(p++);
        var tile = 26;
        switch (fChar)
        {
            case '':
               return;

            default:
                if ((fChar.charCodeAt(0) >= 'A'.charCodeAt(0)) &&  (fChar.charCodeAt(0) <= 'Z'.charCodeAt(0)))
                    tile =  fChar.charCodeAt(0) - 'A'.charCodeAt(0);
                break;
        }
        set_bkg_tile_xy(ax + index, ay, tile);
        ++index;
    }
}

// --------------------------------------------------------------------------------------------------
// save state
// --------------------------------------------------------------------------------------------------


function clearBit8(val, bit)
{
    if(bit > 7)
        return val;
    return val & (~(1 << bit));
}

function setBit8(val, bit)
{
    if (bit > 7)
        return val;
    return val | (1 << bit);
}

function checkBit8(val, bit)
 {
    if (bit > 7)
        return 0; 
    return ((val >> bit) & 1);
 }

function clearBit32(val, bit)
{
    if(bit > 31)
        return val;
    return val & (~(1 << bit));
}

function setBit32(val, bit)
{
    if (bit > 31)
        return val;
    return val | (1 << bit);
}

function checkBit32(val, bit)
 {
    if (bit > 31)
        return 0; 
    return ((val >> bit) & 1);
 }

function packLevelLock(mode, diff, level)
{
    var levelIndex = (mode * diffCount) + diff;
    var pack = Math.floor(levelIndex / 6); // 6 x 5 bit nr in a pack so have to divide levelindex by 6 to get packnr
    var bit = (levelIndex * 5) - (pack * 30); //6 x 5 bit nr in a pack so level index * 5 = bit nr acrross all packs - pack * 30 to know bit for current pack 
    for (var i = 0; i<5; i++)
    {
        if (checkBit8(level, i))
            levelLocksPacked[pack] = setBit32(levelLocksPacked[pack], bit + i);
        else
            levelLocksPacked[pack] = clearBit32(levelLocksPacked[pack], bit + i);
    }
}

function unPackLevelLock(mode, diff)
{
    var levelIndex = (mode * diffCount) + diff;
    var pack = Math.floor(levelIndex / 6); // 6 x 5 bit nr in a pack so have to divide levelindex by 6 to get packnr
    var bit = (levelIndex * 5) - (pack * 30); //6 x 5 bit nr in a pack so level index * 5 = bit nr acrross all packs - pack * 30 to know bit for current pack 
    var result = 0;
    for (var i = 0; i<5; i++)
    {
        if (checkBit32(levelLocksPacked[pack], bit+i))
            result = setBit8(result, i);
    }
    return result;
}

function validateSaveState()
{
    var levelsUnlocked = 0;
    for (var j=0; j<gmCount; j++)
    {
        for (var i=0; i<diffCount; i++)
        {
            levelsUnlocked = unPackLevelLock(j, i);
            if ((levelsUnlocked == 0) || (levelsUnlocked > levelCount))
                return 0;
        }
    }
    if (options > 3) //bit 0 & 1 set = 3
        return 0;
    return 1;
}

function initSaveState()
{
    //read from file 

    //then
    if(true || !validateSaveState())
    {
        levelLocksPacked[0] = 0;
        levelLocksPacked[1] = 0;
        levelLocksPacked[2] = 0;
        for (var j=0; j<gmCount; j++)
            for (var i=0; i<diffCount; i++)
                packLevelLock(j, i, 1); //1st level unlocked
        options = 3; //bit 0 & 1 set = music & sound on
    }
}

function saveSaveState()
{
    //save to file
    //EEPROM.put(addrLevelLocksPacked, levelLocksPacked);
    //EEPROM.put(addrOptions, options);
}

function setMusicOnSaveState(value)
{
    if (value)
    {
        options = setBit8(options, musicOptionBit);
    }
    else
    {
        options = clearBit8(options, musicOptionBit);
    }
    saveSaveState();  
}

function isMusicOnSaveState()
{
    return checkBit8(options, musicOptionBit);
}

function setSoundOnSaveState(value)
{
    if (value)
        options = setBit8(options, soundOptionBit);
    else
        options = clearBit8(options, soundOptionBit);
    saveSaveState();
}

function isSoundOnSaveState()
{
    return checkBit8(options, soundOptionBit);
}

function levelUnlocked(mode, diff, level)
{
    return (unPackLevelLock(mode, diff) > level);
}

function lastUnlockedLevel(mode, diff)
{
    return unPackLevelLock(mode, diff);
}

function unlockLevel(mode, diff, level)
{
    if (level + 1> lastUnlockedLevel(mode, diff))
    {
        packLevelLock(mode, diff, level + 1);
        saveSaveState();
    }
}

// --------------------------------------------------------------------------------------------------
// titlescreen
// --------------------------------------------------------------------------------------------------

function drawTitleScreen()
{
    g.clearRect(Bangle.appRect);
    g.drawImage(title, screenOffsetX, screenOffsetY); //arduboy.drawCompressed(0, 0, titlescreenMap);

    switch (titleStep)
    {
        case tsMainMenu:
            printMessage(5, 4, "START");
            printMessage(5, 5, "HELP");
            printMessage(5, 6, "OPTIONS");
            printMessage(5, 7, "CREDITS");
            break;
        case tsDifficulty:
            printMessage(3, 3, "VERY EASY");
            printMessage(3, 4, "EASY");
            printMessage(3, 5, "NORMAL");
            printMessage(3, 6, "HARD");
            if(difficulty <= diffVeryHard)
                printMessage(3, 7, "VERY HARD");
            else
                printMessage(3, 7, "RANDOM");
            break;
        case tsGameMode:
            printMessage(5, 4, "ROTATE");
            printMessage(5, 5, "SLIDE");
            printMessage(5, 6, "ROSLID");
            break;
        case tsCredits:
            printMessage(3, 5, "CREATED BY");
            printMessage(2, 6, "WILLEMS DAVY");
            printMessage(2, 7, "JOYRIDER3774");
            break;
        case tsOptions:
            //if(isMusicOn())
                printMessage(4, 4, "MUSIC ON");
            //else
            //    printMessage(4, 4, "MUSIC OFF");

            //if(isSoundOn())
                printMessage(4, 5, "SOUND ON");
            //else
            //    printMessage(4, 5, "SOUND OFF");
            //break;
    }

    //set menu tile
    switch (titleStep)
    {
        case tsMainMenu:
            set_bkg_tile_xy(4, 4 + mainMenu, leftMenu);
            break;
        case tsGameMode:
            set_bkg_tile_xy(4, 4 + gameMode, leftMenu);
            break;
        case tsDifficulty:
            if(difficulty >= diffVeryHard)
                set_bkg_tile_xy(2, 7, leftMenu);
            else
                set_bkg_tile_xy(2, 3 + difficulty, leftMenu);
            break;
        case tsOptions:
            set_bkg_tile_xy(2, 4 + option, leftMenu);
            break;
    }
}

function initTitleScreen()
{
    setBlockTilesAsBackground();
    //SelectMusic(musTitle);
    needRedraw = 1;
}

function titleScreen()
{
    if(gameState == gsInitTitle)
    {
        initTitleScreen();
        gameState -= gsInitDiff;
    }

    if(needRedraw)
    {
        drawTitleScreen();
        needRedraw = 0;
        requiresFlip = 1;
    }

    if (dragup)
    {
        switch (titleStep)
        {
            case tsMainMenu:
                if(mainMenu > mmStartGame)
                {
                    //playMenuSelectSound();
                    mainMenu--;
                    needRedraw = 1;
                }
                break;
            case tsGameMode:
                if(gameMode > gmRotate)
                {
                    //playMenuSelectSound();
                    gameMode--;
                    needRedraw = 1;
                }
                break;
            case tsDifficulty:
                if(difficulty > diffVeryEasy)
                {
                    //playMenuSelectSound();
                    difficulty--;
                    needRedraw = 1;
                }
                break;
            case tsOptions:
                if(option > opMusic)
                {
                    //playMenuSelectSound();
                    option--;
                    needRedraw = 1;
                }
                break;
        }
    }

    if (dragdown)
    {
        switch (titleStep) 
        {
            case tsMainMenu:
                if(mainMenu < mmCount-1)
                {
                    //playMenuSelectSound();
                    mainMenu++;
                    needRedraw = 1;
                }
                break;
            case tsGameMode:
                if(gameMode < gmCount-1)
                {
                    //playMenuSelectSound();
                    gameMode++;
                    needRedraw = 1;
                }
                break; 
            case tsDifficulty:
                if(difficulty < diffCount-1)
                {
                    //playMenuSelectSound();
                    difficulty++;
                    needRedraw = 1;
                }
                break;
            case tsOptions:
                if(option < opCount-1)
                {
                    //playMenuSelectSound();
                    option++;
                    needRedraw = 1;
                }
                break;
        }
    }

    if (btnb)
    {
        switch (titleStep)
        {
            case tsOptions:
            case tsCredits:
                titleStep = tsMainMenu;
                //playMenuBackSound();
                needRedraw = 1;
                break;
            case tsGameMode:
            case tsDifficulty:
                titleStep--;
                //playMenuBackSound();
                needRedraw = 1;
                break;
        }
    }

    if (btna)
    {
        //playMenuAcknowlege();
        switch(mainMenu)
        {
            case mmOptions:
                if(titleStep != tsOptions)
                {
                    titleStep = tsOptions;
                    needRedraw = 1;
                }
                else
                {
                    switch(option)
                    {
                        case opMusic:
                            //setMusicOn(!isMusicOn());
                            //setMusicOnSaveState(isMusicOn());
                            needRedraw = 1;
                            break;
                        case opSound:
                            //setSoundOn(!isSoundOn());
                            //setSoundOnSaveState(isSoundOn());
                            needRedraw = 1;
                            break;
                    }
                }
                break;

            case mmCredits:
                if(titleStep != tsCredits)
                {
                    titleStep = tsCredits;
                    needRedraw = 1;
                }
                else
                {
                    titleStep = tsMainMenu;
                    needRedraw = 1;
                }
                break;

            case mmHelp:
                if (titleStep < tsGameMode)
                {
                    titleStep++;
                    needRedraw = 1;
                }
                else
                {
                    switch (gameMode)
                    {
                        case gmRotate:
                            gameState = gsInitHelpRotate;
                            break;
                        case gmSlide:
                            gameState = gsInitHelpSlide;
                            break;
                        case gmRotateSlide:
                            gameState = gsInitHelpRotateSlide;
                            break; 
                    }
                }
                break;

            case mmStartGame:
                if (titleStep < tsDifficulty)
                {
                    titleStep++;
                    needRedraw = 1;
                }
                else
                {
                    if (difficulty == diffRandom)
                        selectedLevel = 1;
                    else
                        selectedLevel = lastUnlockedLevel(gameMode, difficulty);

                    if (gameMode == gmRotate)
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

                    gameState = gsInitLevelSelect;
                }
                break;
        }
    }
}

// --------------------------------------------------------------------------------------------------
// game
// --------------------------------------------------------------------------------------------------

function drawGame()
{
    //background
    if(!paused && !redrawLevelDoneBit)
    {
        g.clearRect(Bangle.appRect);

         //LEVEL:
        printMessage(maxBoardBgWidth, 0, "LEVEL:");

        //[LEVEL NR] 2 chars
        printNumber(maxBoardBgWidth + 4, 1, selectedLevel, 2);


        //MOVES:
        printMessage(maxBoardBgWidth, 2, "MOVES:");

        printNumber(maxBoardBgWidth + 1, 3, moves, 5); 

        //A:XXXXXX (XXXXXX="ROTATE" or XXXXXX="SLIDE " or XXXXXX="ROSLID")
        switch (gameMode)
        {
            case gmRotate:
                printMessage(maxBoardBgWidth, 4, "TOUCH:");
                printMessage(maxBoardBgWidth, 5, "ROTATE");
                break;
            case gmSlide:
                printMessage(maxBoardBgWidth, 4, "TOUCH:");
                printMessage(maxBoardBgWidth, 5, "SLIDE");
                break;
            case gmRotateSlide:
                printMessage(maxBoardBgWidth, 4, "TOUCH:");
                printMessage(maxBoardBgWidth, 5, "ROSLID");
                break;
        }

        //B:BACK
        printMessage(maxBoardBgWidth, 6, "BTN:");
        printMessage(maxBoardBgWidth, 7, "BACK");

        //Draw arrows for vertical / horizontal movement
        if(gameMode != gmRotate)
        {

            for (var x = 0; x != boardWidth; x++)
            {
                set_bkg_tile_xy(boardX + x, boardY -1, arrowDown);
                set_bkg_tile_xy(boardX + x, boardY + boardHeight, arrowUp);
            }

            for (var y = 0; y != boardHeight; y++)
            {
                set_bkg_tile_xy(boardX - 1, boardY + y, arrowRight);
                set_bkg_tile_xy(boardX + boardWidth, boardY + y, arrowLeft);
            }
        }

        //level
        var i16 = 0; 
        for (var yy = 0; yy < boardHeight; yy++)
        {
            for(var xx = 0; xx <boardWidth; xx++)
            {
                set_bkg_tile_xy(boardX +xx , boardY + yy, level[i16 + xx]);
            }
            i16+=boardWidth;
        }
    }
}

function initGame()
{
    paused = 0;
    //SelectMusic(musGame);
    //set background tiles
    setBlockTilesAsBackground();
    //set sprite for selector / cursor
    initCursors();
    setCursorPos(0, boardX + selectionX, boardY + selectionY);
    showCursors();
    redrawLevelDoneBit = 0;
}

function doPause()
{
    
    drawGame();
    drawCursors();
    paused = 1;  
    //wasSoundOn = isSoundOn();
    //wasMusicOn = isMusicOn();
    //setMusicOn(0);
    //setSoundOn(0);
    hideCursors();
    g.setColor(0,0,0);
    g.fillRect(screenOffsetX, screenOffsetY + ((maxBoardBgHeight >> 1) - 3) * 8, screenOffsetX + 16*8, screenOffsetY 
+ ((maxBoardBgHeight >> 1) - 3) * 8 +  (6*8));
    g.setColor(1,1,1);
    printMessage(0, (maxBoardBgHeight >> 1) - 3, "[**************]");
    printMessage(0, (maxBoardBgHeight >> 1) - 2, "|PLEASE CONFIRM+"); 
    printMessage(0, (maxBoardBgHeight >> 1) - 1, "|              +"); 
    printMessage(0, (maxBoardBgHeight >> 1) + 0, "|  TOUCH PLAY  +");
    printMessage(0, (maxBoardBgHeight >> 1) + 1, "|  BTN TO QUIT +");
    printMessage(0, (maxBoardBgHeight >> 1) + 2, "<##############>");   
}

function doUnPause()
{
    paused = 0;
    //setMusicOn(wasMusicOn);
    //setSoundOn(wasSoundOn);
    setCursorPos(0, boardX + selectionX, boardY + selectionY);
    showCursors();
    needRedraw = 1;
}

function game()
{
    if(gameState == gsInitGame)
    {
        initGame();
        gameState -= gsInitDiff;
    }

    if(needRedraw)
    {
        drawGame();
        drawCursors();
        needRedraw = 0;
        requiresFlip = 1;
    }

    //needRedraw = updateCursorFrame();

    if (dragdown)
    {
        if(!levelDone && !paused)
        {
            //playGameMoveSound();
            //if not touching border on bottom
            if (selectionY + 1 < boardHeight + posAdd)
            {
                selectionY += 1;
                needRedraw = 1;
            }
            else
            //set to border on top
            {
                selectionY = -posAdd;
                needRedraw = 1;
            }
            setCursorPos(0, boardX + selectionX, boardY + selectionY);
        }
    } 

    if (dragup)
    {
        if (!levelDone && !paused)
        {
            //if not touching border on top
            //playGameMoveSound();
            if (selectionY -1 >= -posAdd)
            {
                selectionY -= 1;
                needRedraw = 1;
            }
            else
            //set to border on bottom
            {
                selectionY = boardHeight -1 +posAdd;
                needRedraw = 1;
            }
            setCursorPos(0, boardX + selectionX, boardY + selectionY);
        }
    }

    if (dragright)
    {
        if (!levelDone && !paused)
        {
            //playGameMoveSound();
            //if not touching border on right
            if(selectionX + 1 < boardWidth + posAdd)
            {
                selectionX += 1;
                needRedraw = 1;
            }
            else
            //set to border on left
            {
                selectionX = -posAdd;
                needRedraw = 1;
            }
            setCursorPos(0, boardX + selectionX, boardY + selectionY);
        }
    }

    if (dragleft)
    {
        if(!levelDone && !paused)
        {
            //playGameMoveSound();
            //if not touching border on left
            if( selectionX -1 >= -posAdd)
            {
                selectionX -= 1;
                needRedraw = 1;
            }
            //set to border on right
            else
            {
                selectionX = boardWidth -1 + posAdd;
                needRedraw = 1;
            }
            setCursorPos(0, boardX + selectionX, boardY + selectionY);
        }
    }

    if (btna)
    {
        if(paused)
        {
            doUnPause();
            //playMenuAcknowlege();
            needRedraw = 1;
        }
        else
        {
            if(!levelDone)
            {
                if ((selectionX > -1) && (selectionX < boardWidth) &&
                    (selectionY > -1) && (selectionY < boardHeight))
                {
                    if (gameMode != gmSlide)
                    {
                        rotateBlock(selectionX + (selectionY * boardWidth));
                        moves++;
                        //playGameAction();
                        needRedraw = 1;
                    }
                    else
                    {
                        //playErrorSound();
                    }
                }
                else
                {
                    if ((selectionX > -1) && (selectionX < boardWidth))
                    {
                        if (selectionY == -1)
                        {
                            moveBlockDown(selectionX + ((selectionY+1) * boardWidth));
                            moves++;
                            //playGameAction();
                            needRedraw = 1;
                        }
                        else
                        {
                            if (selectionY == boardHeight)
                            {
                                moveBlockUp(selectionX + ((selectionY-1) * boardWidth));
                                moves++;
                                //playGameAction();
                                needRedraw = 1;
                            }
                        }
                    }
                    else
                    {
                        if ((selectionY > -1) && (selectionY < boardHeight))
                        {
                            if (selectionX == -1)
                            {
                                moveBlockRight((selectionX + 1) + (selectionY * boardWidth));
                                moves++;
                                //playGameAction();
                                needRedraw = 1;
                            }
                            else
                            {
                                if (selectionX == boardWidth)
                                {
                                    moveBlockLeft((selectionX - 1) + (selectionY * boardWidth));
                                    moves++;
                                    //playGameAction();
                                    needRedraw = 1;
                                }
                            }
                        }
                        else
                        {
                            //playErrorSound();
                        }
                    }
                }
                updateConnected();
                levelDone = isLevelDone();
                if(levelDone)
                {
                    //update level one last time so we are at final state
                    //as it won't be updated anymore as long as level done is displayed
                    //1 forces level to be drawn (only) one last time the other call uses levelDone
                    drawGame();
                    //SelectMusic(musLevelClear);
                    //hide cursor it's only sprite we use
                    hideCursors();
                    g.setColor(0,0,0);
                    g.fillRect(screenOffsetX + ((16 - 13) >> 1) * 8,  screenOffsetY + ((maxBoardBgHeight >> 1) - 2) * 8, screenOffsetX + (((16 - 13) >> 1) * 8) + (14*8), screenOffsetY + (((maxBoardBgHeight >> 1) - 2) * 8) +(5*8));
                    g.setColor(1,1,1);
                    printMessage(((16 - 13) >> 1), (maxBoardBgHeight >> 1) - 2, "[************]");
                    printMessage(((16 - 13) >> 1), (maxBoardBgHeight >> 1) - 1, "| LEVEL DONE +");
                    printMessage(((16 - 13) >> 1), (maxBoardBgHeight >> 1)    , "|  TOUCH TO  +");
                    printMessage(((16 - 13) >> 1), (maxBoardBgHeight >> 1) + 1, "|  CONTINUE  +");
                    printMessage(((16 - 13) >> 1), (maxBoardBgHeight >> 1) + 2, "<############>");
                    redrawLevelDoneBit = 1;
                }
            }
            else
            {
                redrawLevelDoneBit = 0;
                //goto next level
                if (difficulty == diffRandom)
                {
                    //ned new seed based on time
                    randomSeedGame = Date.now();
                    initLevel(randomSeedGame);
                    //SelectMusic(musGame);
                    //show cursor again (it's actually to early but i'm not fixing that)
                    setCursorPos(0, boardX + selectionX, boardY + selectionY);
                    showCursors();
                    needRedraw = 1;
                }
                else
                {
                    //goto next level if any
                    if (selectedLevel < maxLevel)
                    {
                        selectedLevel++;
                        unlockLevel(gameMode, difficulty, selectedLevel-1);
                        initLevel(randomSeedGame);
                        //SelectMusic(musGame);
                        //show cursor again (it's actually to early but i'm not fixing that)
                        setCursorPos(0, boardX + selectionX, boardY + selectionY);
                        showCursors();
                        needRedraw = 1;
                    }
                    else //Goto some congrats screen
                    {
                        gameState = gsInitLevelsCleared;
                    }
                }
            }
        }
    }

    if(btnb)
    {
        if(!levelDone)
        {
            if(!paused)
            {
                //playMenuBackSound();
                doPause();
                needRedraw = 1;
            }
            else
            {
                //need to enable early again to play backsound
                //normally unpause does it but we only unpause
                //after fade
                //setSoundOn(wasSoundOn);
                hideCursors();
                //playMenuBackSound();
                gameState = gsInitLevelSelect;
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
}


// --------------------------------------------------------------------------------------------------
// main game start
// --------------------------------------------------------------------------------------------------
function setup()
{
    setBlockTilesAsBackground();
    option = 0;
    difficulty = diffNormal;
    selectedLevel = 1;
    mainMenu = mmStartGame;
    gameState = gsInitIntro;
    titleStep = tsMainMenu;
    gameMode = gmRotate;
    //has to be called first because initsound and initmusic read savestate sound to set intial flags
    initSaveState();
    //initSound();
    //initMusic();
    //setMusicOn(isMusicOnSaveState());
    //setSoundOn(isSoundOnSaveState());
 }

function loop()
{
    //soundTimer();

    g.reset();
    g.setColor(1,1,1);
    g.setBgColor(0,0,0);

    //gamestate handling
    var prevGameState = gameState;

    switch (gameState)
    {
        case gsInitTitle:
        case gsTitle:
            clearInterval(intervalTimer);
            titleScreen();
            break;
        case gsInitLevelSelect:
        case gsLevelSelect:
            levelSelect();
            break;
        case gsInitGame:
        case gsGame:
            game();
            break;
        case gsInitLevelsCleared:
        case gsLevelsCleared:
            levelsCleared();
            break;
        case gsInitHelpSlide:
        case gsHelpSlide:
            helpSlide();
            break;
        case gsInitHelpSlide2:
        case gsHelpSlide2:
            helpSlide2();
            break;
        case gsInitHelpSlide3:
        case gsHelpSlide3:
            helpSlide3();
            break;
        case gsHelpRotateSlide:
        case gsInitHelpRotateSlide:
            helpRotateSlide();
            break;
        case gsInitHelpRotateSlide2:
        case gsHelpRotateSlide2:
            helpRotateSlide2();
            break;
        case gsInitHelpRotateSlide3:
        case gsHelpRotateSlide3:
            helpRotateSlide3();
            break;
        case gsInitHelpRotateSlide4:
        case gsHelpRotateSlide4:
            helpRotateSlide4();
            break;
        case gsInitHelpRotate:
        case gsHelpRotate:
            helpRotate();
            break;
        case gsInitHelpRotate2:
        case gsHelpRotate2:
            helpRotate2();
            break;
        case gsInitHelpRotate3:
        case gsHelpRotate3:
            helpRotate3();
            break;
        case gsInitIntro:
        case gsIntro:
            intro();
            break;
    }
    if(requiresFlip)
    {
      if(scaleScreen)
      {
        //scale whats currently on screen to full size of the screen
        //128 was original games width (128x64)
        //var scale = (screenWidth - 8) / 128;
        //don't make this smaller than 1 or it won't work
        var scale = 1.25;
        g.drawImage(g.asImage(),((g.getWidth() / 2)-((g.getWidth() * scale) / 2)), Bangle.appRect.y/2 - Bangle.appRect.y/2*scale + ((g.getHeight()/2) - ((g.getHeight() * scale) / 2)),{scale:scale});

      }

      Bangle.drawWidgets();

      if(debugMode)
      {
        const offsetvalue = 0.20;
        var x1 = screenWidth * offsetvalue;
        var x2 = screenWidth - screenWidth * offsetvalue;
        var y1 = Bangle.appRect.y + screenHeight *offsetvalue;
        var y2 = screenHeight - screenHeight * offsetvalue;
        g.setColor(1,0,1);
        //up
        g.drawRect(0,Bangle.appRect.y,screenWidth-1,y1);
        //down
        g.drawRect(0,y2,screenWidth-1,screenHeight-1);
        //left
        g.drawRect(0,Bangle.appRect.y,x1,screenHeight-1);
        //right
        g.drawRect(x2,Bangle.appRect.y,screenWidth-1, screenHeight-1);
      }
      g.flip();
      requiresFlip = 0;
    }

    //when switching gamestate we need a redraw
    if(gameState != prevGameState)
      needRedraw = 1;
  debugLog("loop");
  if(debugModeRamUse)
  {
    var memTmp = process.memory(false);
    var used = memTmp.usage - memStart.usage;
    debugLog("Udiff:"+ used.toString() + " used:" + memTmp.usage.toString() + " free:" + memTmp.free.toString() + " total:" + memTmp.total.toString()  );
  }
}

function debugLog(val)
{
  if(debugMode)
    print(val);
}

function handleTouch(button, data)
{
  const offsetvalue = 0.20;
  var x1 = screenWidth * offsetvalue;
  var x2 = screenWidth - screenWidth * offsetvalue;
  var y1 = Bangle.appRect.y + screenHeight *offsetvalue;
  var y2 = screenHeight - screenHeight * offsetvalue;
  dragleft = data.x <x1;
  dragright = data.x > x2;
  dragup = data.y < y1;
  dragdown = data.y > y2;
  btna = ((data.x <= x2) && (data.x >= x1) && (data.y >= y1) && (data.y <= y2) && (data.type == 0));
  btnb = ((data.x <= x2) && (data.x >= x1) && (data.y >= y1) && (data.y <= y2) && (data.type == 2));
  debugLog("tap button:" + button.toString() + " x:" + data.x.toString() + " y:" + data.y.toString() + " x1:" + x1.toString() +" x2:" + x2.toString() +" y1:" + y1.toString() +" y2:" + y2.toString() +" type:" + data.type.toString());
  debugLog("l:" + dragleft.toString() + " u:" + dragup.toString() + " r:" + dragright.toString() + " d:" + dragdown.toString() + " a:" + btna.toString() + " b:" + btnb.toString());
  loop();
  dragleft = false;
  dragright = false;
  dragdown = false;
  dragup = false;
  btna = false;
  btnb = false;
  while(needRedraw)
      loop();
  debugLog("handleTouch done");
}

function btnPressed()
{
  dragleft = false;
  dragright = false;
  dragdown = false;
  dragup = false;
  btna = false;
  btnb = true;
  loop();
  btnb = false;
  while(needRedraw)
      loop();
  debugLog("btnPressed done");
}

var memStart;
if(debugModeRamUse)
  memStart = process.memory(true);


//clear one time entire screen
g.clear();
//setup game and run loop it will repeat during intro
//otherwise only as long as redraw is needed after input was detected
setup();
//for intro only
var intervalTimer = setInterval(loop, 66); // 15 fps
//for handling input
Bangle.on('touch', handleTouch);
setWatch(btnPressed, BTN, {edge:"rising", debounce:50, repeat:true});