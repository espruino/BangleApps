// --------------------------------------------------------------------------------------------------
// global variables and consts
// --------------------------------------------------------------------------------------------------
const DEBUGMODERAMUSE = 0;

let memStart;
if (DEBUGMODERAMUSE)
  memStart = process.memory(true);

const DEBUGMODE = 0;
const DEBUGMODEINPUT = 0;
const DEBUGMODESPEED = 0;

const TILESIZE = 10;
const SCREENWIDTH = g.getWidth();
const SCREENHEIGHT = g.getHeight();
const SCREENOFFSETX = ((SCREENWIDTH - 16 * TILESIZE) >> 1);

const MAXBOARDWIDTH = 10;
const MAXBOARDHEIGHT = 8;
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
const OPINPUTRECTS = 1;
const OPTHEMING = 2;
const OPCOUNT = 3;

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
const EMPTY = 61;

let startPos;
let maxLevel;
let selectedLevel;
let boardX;
let boardY;
let difficulty;
let gameState;
let boardWidth;
let boardHeight;
let boardSize;
let levelDone;
let titleStep;
let gameMode;
let posAdd;
let mainMenu;
let option;
let needRedraw;
let requiresFlip;
let selectionX, selectionY;
let moves;
let randomSeedGame;
let level = new Uint8Array(MAXBOARDSIZE);
let redrawPartial;
let screenOffsetY;

// Cursor
const cursorNumTiles = 16; //for the max 2 cursors shown at once (on help screens)
let showCursor;
let spritePos = [];

//intro
let frames;
let titlePosY;

//savestate
let levelLocks = new Uint8Array(GMCOUNT * DIFFCOUNT);
let options = new Uint8Array(OPCOUNT);

//sound
let soundon = 1; // TODO: Should this be 'soundOn' ?

//game
let paused;
let wasSoundOn;
let redrawLevelDoneBit;
let currentTiles = {};

//general input
let dragleft = false;
let dragright = false;
let dragup = false;
let dragdown = false;
let btna = false;
let btnb = false;


// --------------------------------------------------------------------------------------------------
// images
// --------------------------------------------------------------------------------------------------
const BLOCKTILESSIXTEEN = {
  width:16,
  height: 16,
  bpp:1,
  buffer: require("heatshrink").decompress(atob("hkwAIv8n4BBCY4LDC44TH/4ACD6Y/IAIUAAIwLDH6HwAIIfTP6ZrLCaYLLP6ZrEH55/KD5aBIaIIBBBoIBFBYa/Oh//AIIfTAL4/I+ABBFLh/KNYa/PP5YfLJaZrDH6B/KD5YLDAIf/ABwXHE44fXH5ABOH6AfWP66/PD65/XH6AfWQJDRBAJq/OD64BfM6ABXL5y/PD653fE64XLn/8AIP/ABwTDE44fbH5ABOH6AfWP7ajHD7Z/bH5gfWH48/KIIBNX5wfXH5ABSH5gfWP7a/LD65/bH5gfaADfwAA0PAAwPPEYf/AAQfX+H8AIsPhgBFB6BfWKYZbDmHwAIs/h4BFB57fE/4BCD7X//gBBP7APWGYZ/cOYQfDAH4A//4ACEDkDALo/EELZ7eP7ZbfH5Afa4EAALojggYBdH4ghbPbx/bLb77EAD3wAIUMAAUwAAX84ABBgc8AIMMgYBBmARBhkAn4BBmEAAIQLCD4cw4ABBD55ffh/wAIM//gBBngAKB4YXDD4a+acAIACn49BAIioDA4c8gABBCZAfSA44fHB4cDAIRvDngBCEY4BEH5RXHH54XDOZZDHP6azDh7xBAJBfMG4w/XTZYfM/gBFngACBZYADH5ATHIoYnHL57JIZZIfE4ABCD4YAKDogXCH54HLL6ZLEAIRnHAAcP/gBBT4gRDAoLHIh/wAIIfDWYj7GI4gBKD4cD4ABZL44BDgAtBAIhLHh/AAIJfEOYYBCL45jECYwfEAKTfLmEDAIM8h4BBn4AD/4BBnnPAIQPCAIY/EZ4YBDcYbfGAA6fEQ4TXPT5c/DoIfIOogPCQ44/EFIITBLYYAKB4bzEH5xDEH4YLGH5ABDFIKLEgAVBM5A/EJYQBDgfAAKLfEXJi/JAIYfbb488h4BO54BBn//AIIKDD4jTKOYbrLD57LDT56LIAIQTDh7lBCZIAGCYYBDBZ4PEKYUwngBBmfMAIIHLC4YgEMoIBBmABB/8MAIMAgYBFBYgTCDYYnDT4Y3EhgBBA4YBDH463DAQSMBCAS0DBYYBHBA//n4BCh4BBbA4LDCYYfHGZYfDJYY/LIAIBB+ABCH44LDCYYbDT4n8AIMwAIQHDBYjfKf4gbCn88AIIbDmYBCD5YA=="))
};

const BLOCKTILES = {
  width: 10,
  height: 10,
  bpp: 2,
  transparent: -1,
  palette: new Uint16Array([0, 65535, 0, 0]),
  buffer: require("heatshrink").decompress(atob("gsFgFQqFVgtVAYIOEBIgTEBwoADDBwxGgoiCBIIKBBIgxLFAQYOMZ5UIMZ4JIMZ5UEGJRjIDBBoGGoYXCBwQ/ESo57DDB4EYGIxmBESxjIKgaVJMZQYIHZ5UDGJZjIDBAJEHoIAMDpIYTGIx+FAgwxLDCJjTSpIYTMaYxLDCJoGGhzlJDCIEYJ5YETJRiVJDCZeYDqYTGgNVqg9BABkVqtADoYYWGI1FAhYxLDCJjWPwYYWgtUJSgxIDCJjEBINRIAYEJSo4YTGI1BAhoxJDCJjWSowYTMawxIDCYAWqEUgsBoEFoNQEwIEBKoNABwMABIYOCModVDCdQitFgNUBINAqg5BoIJCBwIJEAgRKQIAQABe4UQikBBwMVoNRDAIECBIIOCBIhjDVwLRBDCg7BMap8PoonBIQLgCMaJZCPgYA/AEblEACsQcQIETGIYYUIqsFF4JjVDARFVfYIxEDClAgEEA4IETDQNUDCoEBig7BAiYxDDChFVY4hjTDARFVVwT2SAAreBAQMUiEEagNAqraBglUgsAiIzBiAzCBoQTBDAsQDBpKYgtUZQJLBgojBAhAOBCYJkFHwIERAAMVGISjFBIQIEBwIJBDBzGEDA8AAgMVoEFBwNBSoITGG4gxGdooxNCYhZGGwUUDBBjJRYQlHAgJKHMYYxTDAxjMitVfI4JJAgIxGBwwsBCYYOCJRR0IfJVQDAcVFgoECBIIYCT4LgNGJoYJHYRPHAAUFRYcVBwhPDiqQBE4MFGIbCEawwJFAgYyDNAK1CAiBKDoFVHIJaFfwpoBBYRKCUgwTCXBQYDbZauLGIkVawQEBT4NEcowxELINRSAZFCSpsFLIizGXAwTBfIxAFJQQiCfJIYCqjvBoNQAgyuDYQQxCJRYTBfwwxGPgIHBFIMBegTlDBwRjEqtBfIQTCBQIELVwiQJfwRAEcAgYPPgYxEdQoEFfIKzDqEFPgbWJDYKfJDBhFCbwwECSoY7CAoKpCVwQaBBAIOCCYL6DYQa/CRAYJKAAgiBO4NBopOBqJTBqgEEgoxEIAJSBqsFUIJwCbgRYBotQAwILBcoQxDioxHAgYJBGIoYGCYMQgFBgEEBIVQJQwYGJQIYFXgIYPqgYEaoQYORYIYFJREFqkBqITBitBgNUioEBBITIBqtACYIYFCYVFoNUDAYMBDBIA=="))
};

const CONGRATSTILES = {
  width: 10,
  height: 10,
  bpp: 2,
  transparent: -1,
  palette: new Uint16Array([0, 65535, 0, 0]),
  buffer: require("heatshrink").decompress(atob("gtUgFQoEFggEFqoJIDAVQDBEQDowTDGIoEBA4IEJGwQTBGJhPHGKAJGGI4YJHYRPIAAQYJihKFgtACYQxCLxK4LAAQfBAwQEQJQkBAgLCBAgzMCDAzbHqJbDAgT5JbZauMgNAqlUgsRoFRigJCqAEIJQlUEQKpBqL+NAATWCCZpSEGIQYLqr5LGKL5GGJxjJDoKpGAQb3DDoRjEWwL5LAg75HAhbgHDCCuHd5b+Cor5KFgy4MGI0AoiNBXoZ8MNAQTBDQI9CGIILBMAR8GADAA=="))
};

const CONGRATSSCREEN = {
  width: 160,
  height: 80,
  bpp: 2,
  transparent: -1,
  palette: new Uint16Array([0, 65535, 0, 0]),
  buffer: require("heatshrink").decompress(atob("AFUECaVUAokVCRcFqoUFB5FAE40FqAn1CgQWCAQIgCDAMUE44KBE4I0EgInIKQVAqtVDINUgNVBIdUiodBBQVAipPCAYIIBqAUBE4wYCqoTBEAMBqkFooVBEAInDBAQnCqEUCYInMIgITDMoI9CE4gIDE4tACIQntSAgTFMQJ3HE5Z3FqAnKiqfHBAYnHOQYABHIIUBbgInCY4RPEBwhPGCYZPGBYIdBRwInCionFAgVRE4VQBAInCioOCE94AHgItBAEhKBE8oAegkBQoIEBggJCUwVAAgawCLQIEECYSbBoC/DE9gJBE4gDCE4IEDBwYJCCYcAFgIOCcwgTCE8htCE5R8DBwZ3BE46BCO4YxFJ5aaEJ6An5T6oJCiqVDAAIECRYifGKgQnGT4oA/AH4A/AH4A/AH4A/AH4A/AH4AOqoCBqgn/E88UE81VoAndgoGGoNQGZcFE6BHGE8YhDisAiAnTNowABgNQqgTEiEEZBQRBipdGWpEBdAMVgoMCE4MEE6RFCCQ8BisQiIUCiEBogNCIo0BqpHGgIdBE4xFBoInnqEQYQQCBO4S9HE5BtBS4InIoEEE46pEXwlVDpAGDHwQJBgIbBE458BE6BPDLwInOqCpDAAcUCIQnJPoIiBE97XBigEBVIh3RTwInJgoEDE47OBgpYFE4tQigNBD4InGoIZCBIjfFLoQnKCwIHBiogBDodVdQQnGgIyCKQInFR4InCgInCqFUE88QC4ZoEE46LCRoSoDCwhIEI4MVHYgnKDoMVE4LIEIoQnHCgMFBYYhEDoy9CaI6NDE44HCE4yIBSownIDoQnGCgIntA4SWBco4nNS4IhCD4QcGCoSpEBQUVIQgVGAgQhCgInKLIrvDQIIKFCokFRwYnCHQhyEDgoSCPIYKHAgNVBIonsDAgcGFwTRFE4rICD4iyFAAYcFC4cUBIonJDYQTGAAQxGJgMFQIp+GHwzUEE5cAqqRDMJInuABKpJABiYFA=="))
};

const SELECTORTILES = {
  width: 10,
  height: 10,
  bpp: 2,
  transparent: 0,
  palette: new Uint16Array([63519, 0, 65535, 0]),
  buffer: require("heatshrink").decompress(atob("ACeAgEogEC0AaUhQdGHCozYFSYWCAggApGd9AgEUgEBqAaUgodGHCozYFSYWCAggApGbYA=="))
};

const SELECTORTILESSIXTEEN = {
  width: 16,
  height: 16,
  bpp: 2,
  transparent: 0,
  palette : new Uint16Array([63519, 0, 65535, 0]),
  buffer : require("heatshrink").decompress(atob("AGegAQMKAY+oB4QDDAF43HJZaO2lQDGG/67wAZ4A/XeQDPAH4AkqACBgoDHqgPCAYYAvG45LLR20VAYw3/XeADPAH67yAZ4AwA=="))
};

const TITLE = {
  width: 160,
  height: 50,
  bpp: 2,
  transparent: 0,
  palette: new Uint16Array([63519, 65535, 0, 0]),
  buffer: require("heatshrink").decompress(atob("AAUC1WglQCBhWoE78KqtoktV0GprREXBQ8JE4mVE61VsAnSHoJ9PNgInL0onHqtawAnNlInMyonD1QABxVVqzTCwACBAAOgAQJMBLwJpBtQnP1NVqoCBq2qLYICBrVVytqBQQOBrQNBHIInOCQIADrICBtWlAgOVsoHB1QCBqwZBPBAnftSyGaQNqBoOiNAISCAAVpAQIxDBgaICE4eVE4zkCBoI7BE4YkBqxVDSgQnGAAQRBUA0COQJlBXINqywrCJYVWDwInBHIQGBAIIRBPwKFBUA4nByzhCtWqE4YVBE4mqfwYnDMIL9BE+CDBRQQhBAYQFEE4NWE4yxDE4KfGE4waBE5ahBE5DvHE4pCD0p3EP4J7DBgJ3D1QDCrQnHEgQnDEYQnUrAmGgEJE9CMCE4SfDqtlAQIiBE46fDtQnkBwNWE5TlCE4rSBE5QRDE4THIhVaSIKKCTATzBSAIMBBoNqSwWlBAKfDAoOVE48CE8+aCgOlAQNltQnCEIIuCAoVptWmy2qAgLvC1OlE48AIoOm1InBtJJCrSWCDgOVa4JHB02V1NqNATMCE5BMBzUKdQK7CJANW0x/BOIOW02KAYJjB0QTBq2JqwnJlVVtECEQOKFANW0RHBgQGB1ApBB4NYlNWwShBtUJUgInIgVVsB7BAQISBqwDBrAGCwElAoInBhINBDAQNB0AmHBwOqBYICChSfBAYOoAwWAlQFB1WoA4IYDE4NoE5AAblNVLYIAjkrdBT5Andd5IAagWlE4KsBE8QmBUEgnrrQnmqwn/E/4n/E4elE8sAkonprQnjlNWqtoE8cKJ4NgE8cCyta0AnjgGVrAmkgGq1AFDA="))
};

// --------------------------------------------------------------------------------------------------
// C Code
//
// random stuff
// https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript#72732727
// https://www.ams.org/journals/mcom/1999-68-225/S0025-5718-99-00996-5/S0025-5718-99-00996-5.pdf
//
// power2 function
// https://www.geeksforgeeks.org/write-a-c-program-to-calculate-powxn/
// --------------------------------------------------------------------------------------------------

//this will give an uncaught exception in emulator
//but code will still run fine as i'll run javascript versions then
var c = E.compiledC(`
  //void srand(int)
  //int random(int)
  //void generateLevel(int,int,int)

  unsigned int m;
  unsigned int a;
  unsigned int s;

  int power2 (int x, unsigned int y)
  {
      int temp;
      if (y == 0)
          return 1;

      temp = power2 (x, y / 2);
      if ((y % 2) == 0)
          return temp * temp;
      else
          return x * temp * temp;
  }

  void srand(int seed)
  {
    m = power2(2, 16) - 15;
    a = 33285;
    s = seed % m;
  }

  int random(int value)
  {
    s = s * a % m;
    return s % value;
  }

  void generateLevel(unsigned char* level, int boardWidth, int boardHeight ) {
  int cc = 0;
  int currentPoint = 0;
  int visitedRooms = 1;
  int tmp, tmp2;
  int selectedNeighbour;
  int neighboursFound;
  int lookUpX, lookUpY;
  int rnd;
  int neighbours[4];
  int cellStack[(boardWidth*boardHeight) +1];


  //intial all walls value in every room we will remove bits of this value to remove walls
  for (int i = 0; i < boardWidth*boardHeight; i++)
    level[i] = 0xf;

  while (visitedRooms != boardWidth * boardHeight) {
    neighboursFound = 0;
    lookUpX = currentPoint % boardWidth;
    lookUpY = (currentPoint / boardWidth) | 0;

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

    if (neighboursFound == 0)
    {
      currentPoint = cellStack[--cc];
      continue;
    } else {
      rnd = random(neighboursFound);
    }

    selectedNeighbour = neighbours[rnd];
    tmp = (selectedNeighbour % boardWidth);
    //tile has neighbour to the east
    if (tmp > lookUpX) {
      //remove west wall neighbour
      level[selectedNeighbour] &= ~(8);
      //remove east wall tile
      level[currentPoint] &= ~(2);
    } else {
      // tile has neighbour to the west
      if (tmp < lookUpX) {
        //remove east wall neighbour
        level[selectedNeighbour] &= ~(2);
        //remove west wall tile
        level[currentPoint] &= ~(8);
      } else {
        // tile has neighbour to the north
        tmp2 = selectedNeighbour / boardWidth;
        if (tmp2 < lookUpY) {
          //remove south wall neighbour
          level[selectedNeighbour] &= ~(4);
          //remove north wall tile
          level[currentPoint] &= ~(1);
        } else {
          // tile has neighbour to the south
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
}`);

//when using C Code it will generate levels
//a lot faster on the device.
//levels generated by the C Code are not the same
//as levels generated by the JS Code!
const USECCODE = c !== undefined;
print("Using C Code:" + USECCODE.toString());

// --------------------------------------------------------------------------------------------------
// random stuff
// --------------------------------------------------------------------------------------------------

let randfunc;

function srandjs(seed) {
  var m = Math.pow(2, 35) - 31;
  var a = 185852;
  var s = seed % m;
  randfunc = function() {
    return (s = s * a % m);
  };
}

function randomjs(value) {
  return Math.floor(randfunc()) % value;
}

function srand(seed) {
  "RAM";
  if(USECCODE)
    c.srand(seed);
  else
    srandjs(seed);
}

function random(value) {
  "RAM";
  if(USECCODE)
    return c.random(value);
  else
    return randomjs(value);
}

srand(Date().getTime());

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

function drawCursors(clear, useSixteenSize) {
  if (showCursor == 0)
    return;
  for (let i = 0; i < cursorNumTiles; i++)
    if (spritePos[i][1] < SCREENHEIGHT)
      if(!useSixteenSize)
        g.drawImage(SELECTORTILES, SCREENOFFSETX + spritePos[i][0], screenOffsetY + spritePos[i][1], {
          frame: ((clear ? 8 : 0) + (i % 8))
        });
      else
        g.drawImage(SELECTORTILESSIXTEEN, 8 + spritePos[i][0], 12 + spritePos[i][1], {
          frame: ((clear ? 8 : 0) + (i % 8))
        });
}

function hideCursors() {
  //HIDE CURSOR SPRITES
  //cursor 0
  setCursorPos(0, -10, -10);

  //cursor 1
  setCursorPos(1, -10, -10);

  showCursor = 0;
}

function showCursors() {
  showCursor = 1;
}

function setCursorPos(cursorNr, xPos, yPos, useSixteenSize) {
  if (cursorNr > 1)
    return;
  let size = TILESIZE;
  if (useSixteenSize)
    size = 16;
  move_sprite((cursorNr << 3) + 0, ((xPos) * size), ((yPos - 1) * size));
  move_sprite((cursorNr << 3) + 1, ((xPos + 1) * size), ((yPos) * size));
  move_sprite((cursorNr << 3) + 2, ((xPos) * size), ((yPos + 1) * size));
  move_sprite((cursorNr << 3) + 3, ((xPos - 1) * size), ((yPos) * size));
  //corners
  move_sprite((cursorNr << 3) + 4, ((xPos + 1) * size), ((yPos - 1) * size));
  move_sprite((cursorNr << 3) + 5, ((xPos + 1) * size), ((yPos + 1) * size));
  move_sprite((cursorNr << 3) + 6, ((xPos - 1) * size), ((yPos - 1) * size));
  move_sprite((cursorNr << 3) + 7, ((xPos - 1) * size), ((yPos + 1) * size));
}

function initCursors() {
  hideCursors();
}

// --------------------------------------------------------------------------------------------------
// helper funcs
// --------------------------------------------------------------------------------------------------
function set_bkg_tile_xy(x, y, tile, noScreenOffset) {
  "RAM";
  if(!noScreenOffset)
    g.drawImage(currentTiles, SCREENOFFSETX + x * TILESIZE, screenOffsetY + y * TILESIZE, {
      frame: tile
    });
  else
    g.drawImage(currentTiles, x * TILESIZE, y * TILESIZE, {
      frame: tile
    });
}

function set_bkg_tile_xy_sixteen(x, y, tile) {
  "RAM";
    g.drawImage(BLOCKTILESSIXTEEN, 8 + x * 16, 12+ y * 16, {
      frame: tile
    });
}

function set_bkg_data(tiles) {
  currentTiles = tiles;
}

/*
function get_bkg_data() {
  return currentTiles;
}
*/

/*
function set_bkg_tiles(x, y, map) {
  "RAM";
  g.drawImage(map, SCREENOFFSETX + x, screenOffsetY + y);
}
*/

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

  if (btnb) {
    playMenuBackSound();
    gameState = GSINITTITLE;
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

    set_bkg_tile_xy(0, 2, 33);
    printMessage(1, 2, ":WATER SOURCE");
    set_bkg_tile_xy(0, 3, 11);
    set_bkg_tile_xy(1, 3, 6);
    set_bkg_tile_xy(2, 3, 12);
    printMessage(3, 3, ":NOT FILLED");
    set_bkg_tile_xy(0, 4, 27);
    set_bkg_tile_xy(1, 4, 22);
    set_bkg_tile_xy(2, 4, 28);
    printMessage(3, 4, ":FILLED");

    if ((gameState == GSHELPROTATESLIDE) ||
      (gameState == GSHELPSLIDE)) {
      set_bkg_tile_xy(0, 5, 121);
      printMessage(1, 5, ":SLID ROW RIGHT");
      set_bkg_tile_xy(0, 6, 123);
      printMessage(1, 6, ":SLID ROW LEFT");
      set_bkg_tile_xy(0, 7, 122);
      printMessage(1, 7, ":SLID COL DOWN");
      set_bkg_tile_xy(0, 8, 120);
      printMessage(1, 8, ":SLID COL UP");
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

  if (btnb) {
    playMenuBackSound();
    gameState = GSINITTITLE;
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

  if (btnb) {
    playMenuBackSound();
    gameState = GSINITTITLE;
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
  if (frames < 16) {
    //16-12
    printMessage(4 >> 1, 4, "WILLEMS DAVY");
    requiresFlip = 1;
  } else {
    if (frames < 16 * 2) {
      //16-8
      printMessage(8 >> 1, 4, "PRESENTS");
      requiresFlip = 1;
    } else {
      requiresFlip = 1;
      g.drawImage(TITLE, SCREENOFFSETX, titlePosY);
      if (titlePosY > screenOffsetY) {
        titlePosY -= 4;
      } else {
        gameState = GSINITTITLE;
      }
    }
  }
}

// --------------------------------------------------------------------------------------------------
// Level Stuff
// --------------------------------------------------------------------------------------------------

function generateLeveljs() {
  let neighbours = new Uint8Array(4);
  let cellStack = [];//new Uint8Array(boardSize + 1);
  let cc = 0;
  let currentPoint = 0;
  let visitedRooms = 1;
  let tmp, tmp2;
  let selectedNeighbour;
  let neighboursFound;
  let lookUpX, lookUpY;
  let rnd;

  //intial all walls value in every room we will remove bits of this value to remove walls
  level.fill(0xf, 0, boardSize);

  while (visitedRooms != boardSize) {
    neighboursFound = 0;
    lookUpX = currentPoint % boardWidth;
    lookUpY = (currentPoint / boardWidth) | 0;

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

    if (neighboursFound == 0)
    {
      currentPoint = cellStack[--cc];
      continue;
    } else {
      rnd = random(neighboursFound);
    }

    selectedNeighbour = neighbours[rnd];
    tmp = (selectedNeighbour % boardWidth);
    //tile has neighbour to the east
    if (tmp > lookUpX) {
      //remove west wall neighbour
      level[selectedNeighbour] &= ~(8);
      //remove east wall tile
      level[currentPoint] &= ~(2);
    } else {
      // tile has neighbour to the west
      if (tmp < lookUpX) {
        //remove east wall neighbour
        level[selectedNeighbour] &= ~(2);
        //remove west wall tile
        level[currentPoint] &= ~(8);
      } else {
        // tile has neighbour to the north
        tmp2 = selectedNeighbour / boardWidth;
        if (tmp2 < lookUpY) {
          //remove south wall neighbour
          level[selectedNeighbour] &= ~(4);
          //remove north wall tile
          level[currentPoint] &= ~(1);
        } else {
          // tile has neighbour to the south
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

function generateLevel()
{
  "RAM";
  if(USECCODE)
  {
    //var cellstack = new Uint8Array(MAXBOARDSIZE + 1);
    //var neighbours = new Uint8Array(4);
    var addrLevel = E.getAddressOf(level,true);
    c.generateLevel(addrLevel, boardWidth, boardHeight);
  }
  else
  {
    generateLeveljs();
  }
}

function moveBlockDown(aTile) {
  let tmp = level[aTile + boardSize - boardWidth];
  for (let i = boardSize - boardWidth; i != 0; i -= boardWidth)
    level[aTile + i] = level[aTile + i - boardWidth];
  level[aTile] = tmp;
}

function moveBlockUp(aTile) {
  let tmp = level[aTile - boardSize + boardWidth];
  for (let i = boardSize - boardWidth; i != 0; i -= boardWidth)
    level[aTile - i] = level[aTile - i + boardWidth];
  level[aTile] = tmp;
}

function moveBlockRight(aTile) {
  let tmp = level[aTile + boardWidth - 1];
  for (let i = 0; i < boardWidth - 1; i++)
    level[aTile + boardWidth - 1 - i] = level[aTile + boardWidth - 2 - i];
  level[aTile] = tmp;
}

function moveBlockLeft(aTile) {
  let tmp = level[aTile - boardWidth + 1];
  for (let i = 0; i < boardWidth - 1; i++)
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
  let rnd = random(3);
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
  let rnd = random(3);
  for (let i = 0; i < rnd; i++)
    rotateBlock(aTile);
}

function shuffleLevel() {
  let rnd;
  let j = 0;
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
  let lookUpX = currentPoint % boardWidth;
  let lookUpY = (currentPoint / boardWidth) | 0;
  let tmp;
  let tmp2;
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
  let cellStack = [];//new Uint8Array(boardSize + 1);
  //reset all tiles to default not filled one
  for (let i = 0; i != boardSize; i++) {
    if (level[i] > 31) {
      level[i] -= 32;
    } else {
      if (level[i] > 15) {
        level[i] -= 16;
      }
    }
  }

  //start with start tile
  let cc = 1;
  cc = handleConnectPoint(startPos, cellStack, cc);
  while (--cc > 0) {
    //if tile is bigger then 15 we already handled this one, continue with next one
    if ((level[cellStack[cc]] < 16)) {
      cc = handleConnectPoint(cellStack[cc], cellStack, cc);
    }
  }

  //add start pos special tile
  if (level[startPos] > 15) {
    level[startPos] += 16;
  } else {
    if (level[startPos] < 16)
      level[startPos] += 32;
  }
}



//when all board tiles are not below 16, the level is cleared
//as there are 16 tiles per tilegroup (no water, water, special start with water)
function isLevelDone() {
  for (let i = 0; i != boardSize; i++)
    if (level[i] < 16)
      return 0;

  return 1;
}

function initLevel(aRandomSeed, noLoading) {
  let startTime = Date().getTime();
  if (!noLoading) {
    printMessage(((16 - 10) >> 1), (MAXBOARDHEIGHT >> 1) - 1, "[*********]");
    printMessage(((16 - 10) >> 1), (MAXBOARDHEIGHT >> 1) - 0, "| LOADING +");
    printMessage(((16 - 10) >> 1), (MAXBOARDHEIGHT >> 1) + 1, "<#########>");
    g.flip();
  }
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
    case DIFFRANDOM: {
      let rnd = random(255);
      boardWidth = 5 + (rnd % (MAXBOARDWIDTH - 5 + 1)); //5 is smallest level width from very easy
      rnd = random(255);
      boardHeight = 5 + (rnd % (MAXBOARDHEIGHT - 5 + 1)); //5 is smallest level height from very easy
      maxLevel = 0; //special value with random
      break;
    }
  }
  //add space for arrows based on same posadd value (1 or 0 depending if sliding is allowed)
  boardWidth -= posAdd + posAdd;
  boardHeight -= posAdd + posAdd;
  boardSize = boardWidth * boardHeight;
  //generate the level
  generateLevel();
  //startpoint of of level in center of screen
  boardX = (MAXBOARDWIDTH - boardWidth) >> 1;
  boardY = (MAXBOARDHEIGHT - boardHeight) >> 1;
  startPos = (boardWidth >> 1) + (boardHeight >> 1) * (boardWidth);
  //startpoint of tile with water and our cursor
  selectionX = boardWidth >> 1;
  selectionY = boardHeight >> 1;

  //level is currently the solution so we still need to shuffle it
  shuffleLevel();
  //update possibly connected tiles already starting from startpoint
  updateConnected();
  if (DEBUGMODESPEED)
    debugLog("Level Generated in " + (Date().getTime() - startTime).toString() + " ms");
}

// --------------------------------------------------------------------------------------------------
// levels cleared
// --------------------------------------------------------------------------------------------------
function initLevelsCleared() {
  set_bkg_data(CONGRATSTILES);
  g.clearRect(Bangle.appRect);
  g.drawImage(CONGRATSSCREEN, SCREENOFFSETX, screenOffsetY);
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
function drawLevelSelect(partial) {
  if (partial > 2) {
    g.clearRect(Bangle.appRect);
    //LEVEL:
    printMessage(0, 15, "LEVEL:", true);
  }

  if (partial == 2) {
    //clear parts of loading text
    printMessage(((16 - 10) >> 1), (MAXBOARDHEIGHT >> 1) - 1, "           ");
    printMessage(((16 - 10) >> 1), (MAXBOARDHEIGHT >> 1) - 0, "           ");
    printMessage(((16 - 10) >> 1), (MAXBOARDHEIGHT >> 1) + 1, "           ");
  }

  //[LEVEL NR] 2 chars
  if (partial == 2)
    set_bkg_tile_xy(7, 15, EMPTY, true);

  printMessage(6, 15, selectedLevel.toString(), true);

  if (partial > 2) {
    //B:BACK
    printMessage(9, 16, "BTN:BACK", true);
  }

  if (partial > 1) {
    //A:PLAY
    printMessage(0, 16, "TCH:PLAY", true);
  }

  //Locked & Unlocked keywoard
  let tmpUnlocked = levelUnlocked(gameMode, difficulty, selectedLevel - 1);
  if (!tmpUnlocked)
    printMessage(9, 15, "LOCKED", true);
  else
    printMessage(9, 15, "OPEN  ", true);

  if (partial > 2) {
    //Draw arrows for vertical / horizontal movement
    if (gameMode != GMROTATE) {
      for (let x = 0; x != boardWidth; x++) {
        set_bkg_tile_xy_sixteen(boardX + x, boardY - 1, ARROWDOWN);
        set_bkg_tile_xy_sixteen(boardX + x, boardY + boardHeight, ARROWUP);
      }

      for (let y = 0; y != boardHeight; y++) {
        set_bkg_tile_xy_sixteen(boardX - 1, boardY + y, ARROWRIGHT);
        set_bkg_tile_xy_sixteen(boardX + boardWidth, boardY + y, ARROWLEFT);
      }
    }
  }

  //only draw right and bottom arrows 
  if (partial == 2) {
    //Draw arrows for vertical / horizontal movement
    if (gameMode != GMROTATE) {
      for (let x = 0; x != boardWidth; x++) {
        set_bkg_tile_xy_sixteen(boardX + x, boardY + boardHeight, ARROWUP);
      }

      for (let y = 0; y != boardHeight; y++) {
        set_bkg_tile_xy_sixteen(boardX + boardWidth, boardY + y, ARROWLEFT);
      }
    }
  }

  let i16 = 0;
  for (let yy = 0; yy < boardHeight; yy++) {
    for (let xx = 0; xx < boardWidth; xx++) {
      set_bkg_tile_xy_sixteen(boardX + xx, boardY + yy, level[i16 + xx]);
    }
    i16 += boardWidth;
  }
  redrawPartial = 3;
}

function initLevelSelect() {
  setBlockTilesAsBackground();
  needRedraw = 1;
  redrawPartial = 3;
}

function levelSelect() {
  if (gameState == GSINITLEVELSELECT) {
    initLevelSelect();
    gameState -= GSINITDIFF;
  }

  let tmpUnlocked = levelUnlocked(gameMode, difficulty, selectedLevel - 1);

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
      redrawPartial = 3;
    } else {
      if (selectedLevel > 1) {
        playMenuSelectSound();
        selectedLevel--;
        initLevel(randomSeedGame);
        needRedraw = 1;
        redrawPartial = 2;
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
      redrawPartial = 3;
    } else {
      if (selectedLevel < maxLevel) {
        playMenuSelectSound();
        selectedLevel++;
        initLevel(randomSeedGame);
        needRedraw = 1;
        redrawPartial = 2;
      }
    }
  }

  if (needRedraw) {
    drawLevelSelect(redrawPartial);
    needRedraw = 0;
    requiresFlip = 1;
  }
}

// --------------------------------------------------------------------------------------------------
// printing functions
// --------------------------------------------------------------------------------------------------
/*
function setCharAt(str, index, chr) {
  "RAM";
  if (index > str.length - 1) return str;
  return str.substring(0, index) + chr + str.substring(index + 1);
}

function formatInteger(valinteger) {
  "RAM";
  const maxDigits = 10;
  let array = "          ";

  const maxCharacters = (maxDigits);

  const lastIndex = (maxCharacters - 1);

  if (valinteger == 0) {
    array = setCharAt(array, lastIndex, '0');
    return {
      digits: 1,
      string: array
    };
  }

  let digits = 0;
  let integer = valinteger;
  do {
    let digit = integer % 10;
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
function printNumber(ax, ay, aNumber, maxDigits, noScreenOffset) {
  "RAM";
  const buffSize = 10;

  let ret = formatInteger(aNumber);
  let maxFor = ret.digits;
  if (ret.digits > maxDigits)
    maxFor = maxDigits;
  for (let c = 0; c < maxFor; c++) {
    if (ret.string.charAt(buffSize - ret.digits + c) == '')
      return;
    set_bkg_tile_xy(ax + (maxDigits - ret.digits) + c, ay, ret.string.charCodeAt(buffSize - ret.digits + c) + 32, noScreenOffset);
  }
}
*/

//print a message on the title screen on ax,ay, the tileset from titlescreen contains an alphabet
function printMessage(ax, ay, amsg, noScreenOffset) {
  "RAM";
  let aCode = 'A'.charCodeAt(0);
  let zCode = 'Z'.charCodeAt(0);
  let zeroCode = '0'.charCodeAt(0);
  let nineCode = '9'.charCodeAt(0);
  for (let p = 0; p < amsg.length; p++) {
    let fCharCode = amsg.charCodeAt(p);
    let tile = 61;
    switch (fCharCode) {
      case -1:
      case 0:
        return;

        // '['
      case 91:
        tile = 70;
        break;

        //']'
      case 93:
        tile = 64;
        break;

        //'<'
      case 60:
        tile = 73;
        break;

        //'>'
      case 62:
        tile = 67;
        break;

        //'+'
      case 43:
        tile = 63;
        break;

        //'*'
      case 42:
        tile = 62;
        break;

        //'|'
      case 124:
        tile = 69;
        break;

        //'#'
      case 35:
        tile = 65;
        break;

        //':'
      case 58:
        tile = 116;
        break;

        //'a'
      case 97:
        tile = 119;
        break;

        //'b'
      case 98:
        tile = 117;
        break;

      default:
        if ((fCharCode >= aCode) && (fCharCode <= zCode)) {
          tile = fCharCode + 25;
        } else {
          if ((fCharCode >= zeroCode) && (fCharCode <= nineCode))
            tile = fCharCode + 32;
        }
        break;
    }
    set_bkg_tile_xy(ax + p, ay, tile, noScreenOffset);
  }
}

//print a message on the CongratsScreen on ax,ay, the tileset from Congrats Screen contains an alphabet in another font
function printCongratsScreen(ax, ay, amsg) {
  // based on input from @Pharap
  let aCode = 'A'.charCodeAt(0);
  let zCode = 'Z'.charCodeAt(0);
  for (let p = 0; p < amsg.length; p++) {
    let fCharCode = amsg.charCodeAt(p);
    let tile = 26;
    if ((fCharCode == 0) || (fCharCode == -1))
      return;
    if ((fCharCode >= aCode) && (fCharCode <= zCode))
      tile = fCharCode - aCode;
    set_bkg_tile_xy(ax + p, ay, tile);
  }
}

// --------------------------------------------------------------------------------------------------
// save state
// --------------------------------------------------------------------------------------------------
function validateSaveState() {
  for (let j = 0; j < GMCOUNT; j++) {
    for (let i = 0; i < DIFFCOUNT; i++) {
      if ((levelLocks[(j * DIFFCOUNT) + i] == 0) || (levelLocks[(j * DIFFCOUNT) + i] > LEVELCOUNT))
        return 0;
    }
  }
  if (options[OPSOUND] > 1)
    return 0;
  if (options[OPINPUTRECTS] > 1)
    return 0;
  if (options[OPTHEMING] > 1)
    return 0;

  return 1;
}

function initSaveState() {
  //read from file
  let file = require("Storage").open("waternet.data.dat", "r");
  let index = 0;
  for (index = 0; index < GMCOUNT * DIFFCOUNT; index++) {
    tmp = file.readLine();
    if (tmp !== undefined)
      levelLocks[index] = Number(tmp);
  }

  for (index = 0; index < OPCOUNT; index++) {
    tmp = file.readLine();
    if (tmp !== undefined)
      options[index] = Number(tmp);
  }
  //then
  if (!validateSaveState()) {
    for (let j = 0; j < GMCOUNT; j++)
      for (let i = 0; i < DIFFCOUNT; i++)
        levelLocks[(j * DIFFCOUNT) + i] = 1; //1st level unlocked
    options[OPSOUND] = 1;
    options[OPINPUTRECTS] = 0;
    options[OPTHEMING] = 1;
  }
}

function saveSaveState() {
  //save to file
  let file = require("Storage").open("waternet.data.dat", "w");
  let index;
  for (index = 0; index < GMCOUNT * DIFFCOUNT; index++)
    file.write(levelLocks[index].toString() + "\n");
  for (index = 0; index < OPCOUNT; index++)
    file.write(options[index].toString() + "\n");
}

function setSoundOnSaveState(value) {
  options[OPSOUND] = value;
  saveSaveState();
}

function isSoundOnSaveState() {
  return options[OPSOUND] == 1;
}

function setThemingOnSaveState(value) {
  options[OPTHEMING] = value;
  saveSaveState();
}

function isThemingOnSaveState() {
  return options[OPTHEMING] == 1;
}

function setInputRectsOnSaveState(value) {
  options[OPINPUTRECTS] = value;
  saveSaveState();
}

function isInputRectsOnSaveState() {
  return options[OPINPUTRECTS] == 1;
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
function drawMenuSelector(tile) {
  //set menu tile
  switch (titleStep) {
    case TSMAINMENU:
      set_bkg_tile_xy(4, 4 + mainMenu, tile);
      break;
    case TSGAMEMODE:
      set_bkg_tile_xy(4, 4 + gameMode, tile);
      break;
    case TSDIFFICULTY:
      set_bkg_tile_xy(2, 3 + difficulty, tile);
      break;
    case TSOPTIONS:
      set_bkg_tile_xy(1, 4 + option, tile);
      break;
  }
}

function drawMenuItems(clear) {
  if (clear) {
    g.setColor(g.getBgColor());
    switch (titleStep) {
      case TSMAINMENU:
        g.fillRect(SCREENOFFSETX + 5 * TILESIZE, screenOffsetY + 4 * TILESIZE, SCREENOFFSETX + 13 * TILESIZE, screenOffsetY + 8 * TILESIZE);
        break;
      case TSDIFFICULTY:
        g.fillRect(SCREENOFFSETX + 3 * TILESIZE, screenOffsetY + 3 * TILESIZE, SCREENOFFSETX + 12 * TILESIZE, screenOffsetY + 9 * TILESIZE);
        break;
      case TSGAMEMODE:
        g.fillRect(SCREENOFFSETX + 5 * TILESIZE, screenOffsetY + 4 * TILESIZE, SCREENOFFSETX + 12 * TILESIZE, screenOffsetY + 7 * TILESIZE);
        break;
      case TSCREDITS:
        g.fillRect(SCREENOFFSETX + 2 * TILESIZE, screenOffsetY + 5 * TILESIZE, SCREENOFFSETX + 15 * TILESIZE, screenOffsetY + 8 * TILESIZE);
        break;
      case TSOPTIONS:
        g.fillRect(SCREENOFFSETX + 3 * TILESIZE, screenOffsetY + 4 * TILESIZE, SCREENOFFSETX + 11 * TILESIZE, screenOffsetY + 5 * TILESIZE);
        g.fillRect(SCREENOFFSETX + 1 * TILESIZE, screenOffsetY + 5 * TILESIZE, SCREENOFFSETX + 16 * TILESIZE, screenOffsetY + 11 * TILESIZE);
        break;
    }
  } else {
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
        printMessage(3, 7, "VERY HARD");
        printMessage(3, 8, "RANDOM");
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
          printMessage(3, 4, "BUZZ ON");
        else
          printMessage(3, 4, "BUZZ OFF");
        if (isInputRectsOnSaveState())
          printMessage(3, 5, "INPUTRECT ON");
        else
          printMessage(3, 5, "INPUTRECT OFF");
        if (isThemingOnSaveState()) {
          printMessage(3, 6, "THEMING ON");
        } else {
          printMessage(3, 6, "THEMING OFF");
        }
        break;
    }
  }
}

function drawTitleScreen(partial) {
  if (partial > 2) {
    g.clearRect(Bangle.appRect);
    g.drawImage(TITLE, SCREENOFFSETX, screenOffsetY);
  }

  if (partial > 1)
    drawMenuItems(false);

  drawMenuSelector(LEFTMENU);
  redrawPartial = 3;
}

function initTitleScreen() {
  setBlockTilesAsBackground();
  needRedraw = 1;
  redrawPartial = 3;
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
          //clear
          drawMenuSelector(EMPTY);
          mainMenu--;
          needRedraw = 1;
          redrawPartial = 1;
        }
        break;
      case TSGAMEMODE:
        if (gameMode > GMROTATE) {
          playMenuSelectSound();
          //clear
          drawMenuSelector(EMPTY);
          gameMode--;
          needRedraw = 1;
          redrawPartial = 1;
        }
        break;
      case TSDIFFICULTY:
        if (difficulty > DIFFVERYEASY) {
          playMenuSelectSound();
          //clear
          drawMenuSelector(EMPTY);
          difficulty--;
          needRedraw = 1;
          redrawPartial = 1;
        }
        break;
      case TSOPTIONS:
        if (option > OPSOUND) {
          playMenuSelectSound();
          //clear
          drawMenuSelector(EMPTY);
          option--;
          needRedraw = 1;
          redrawPartial = 1;
        }
        break;
    }
  }

  if (dragdown) {
    switch (titleStep) {
      case TSMAINMENU:
        if (mainMenu < MMCOUNT - 1) {
          playMenuSelectSound();
          //clear
          drawMenuSelector(EMPTY);
          mainMenu++;
          needRedraw = 1;
          redrawPartial = 1;
        }
        break;
      case TSGAMEMODE:
        if (gameMode < GMCOUNT - 1) {
          playMenuSelectSound();
          //clear
          drawMenuSelector(EMPTY);
          gameMode++;
          needRedraw = 1;
          redrawPartial = 1;
        }
        break;
      case TSDIFFICULTY:
        if (difficulty < DIFFCOUNT - 1) {
          playMenuSelectSound();
          //clear
          drawMenuSelector(EMPTY);
          difficulty++;
          needRedraw = 1;
          redrawPartial = 1;
        }
        break;
      case TSOPTIONS:
        if (option < OPCOUNT - 1) {
          playMenuSelectSound();
          //clear
          drawMenuSelector(EMPTY);
          option++;
          needRedraw = 1;
          redrawPartial = 1;
        }
        break;
    }
  }

  if (btnb) {
    switch (titleStep) {
      case TSOPTIONS:
      case TSCREDITS:
        //clear
        drawMenuSelector(EMPTY);
        drawMenuItems(true);
        titleStep = TSMAINMENU;
        playMenuBackSound();
        needRedraw = 1;
        redrawPartial = 2;
        break;
      case TSGAMEMODE:
      case TSDIFFICULTY:
        //clear
        drawMenuSelector(EMPTY);
        drawMenuItems(true);
        titleStep--;
        playMenuBackSound();
        needRedraw = 1;
        redrawPartial = 2;
        break;
    }
  }

  if (btna) {
    playMenuAcknowlege();
    switch (mainMenu) {
      case MMOPTIONS:
        if (titleStep != TSOPTIONS) {
          //clear
          drawMenuSelector(EMPTY);
          drawMenuItems(true);
          titleStep = TSOPTIONS;
          needRedraw = 1;
          redrawPartial = 2;
        } else {
          switch (option) {
            case OPSOUND:
              setSoundOn(!isSoundOn());
              setSoundOnSaveState(isSoundOn());
              //clear
              drawMenuItems(true);
              needRedraw = 1;
              redrawPartial = 2;
              break;
            case OPINPUTRECTS:
              setInputRectsOnSaveState(!isInputRectsOnSaveState());
              needRedraw = 1;
              //needs 3 because text crosses input rect lines
              redrawPartial = 3;
              break;
            case OPTHEMING:
              setThemingOnSaveState(!isThemingOnSaveState());
              setThemingOn(isThemingOnSaveState());
              //needs a clear to set background color
              if (isThemingOnSaveState()) {
                g.setBgColor(g.theme.bg);
              } else {
                g.setBgColor(0x0000);
              }
              g.clearRect(g.appRect);
              //probably need to call this again as i think
              //a copy is kept in currenttiles but i'm not sure of that
              //but it's a small call so should be fine
              setBlockTilesAsBackground();
              needRedraw = 1;
              //needs 3 because we need to redraw everything
              redrawPartial = 3;

          }
        }
        break;

      case MMCREDITS:
        if (titleStep != TSCREDITS) {
          //clear
          drawMenuSelector(EMPTY);
          drawMenuItems(true);
          titleStep = TSCREDITS;
          needRedraw = 1;
          redrawPartial = 2;
        } else {
          //clear
          drawMenuItems(true);
          titleStep = TSMAINMENU;
          needRedraw = 1;
          redrawPartial = 2;
        }
        break;

      case MMHELP:
        if (titleStep < TSGAMEMODE) {
          //clear
          drawMenuSelector(EMPTY);
          drawMenuItems(true);
          titleStep++;
          needRedraw = 1;
          redrawPartial = 2;
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
          //clear
          drawMenuSelector(EMPTY);
          drawMenuItems(true);
          titleStep++;
          needRedraw = 1;
          redrawPartial = 2;
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
    drawTitleScreen(redrawPartial);
    needRedraw = 0;
    requiresFlip = 1;
  }

}

// --------------------------------------------------------------------------------------------------
// game
// --------------------------------------------------------------------------------------------------
function drawGame(partial) {
  //background
  if (!paused && !redrawLevelDoneBit) {
    if (partial > 2)
      g.clearRect(Bangle.appRect);

    //LEVEL:
    if (partial > 2) {
      printMessage(0, 15, "LEVEL:", true);
      //[LEVEL NR] 2 chars
      printMessage(6, 15, selectedLevel.toString(), true);
    }

    //MOVES:
    if (partial > 2)
      printMessage(9, 15, "MVS:", true);

    if (partial > 1)
      printMessage(13, 15, moves.toString(), true);

    //A:XXXXXX (XXXXXX="ROTATE" or XXXXXX="SLIDE " or XXXXXX="ROSLID")
    if (partial > 2) {
      switch (gameMode) {
        case GMROTATE:
          printMessage(0, 16, "TCH:ROTA BTN:BACK", true);
          break;
        case GMSLIDE:
          printMessage(0, 16, "TCH:SLID BTN:BACK", true);
          break;
        case GMROTATESLIDE:
          printMessage(0, 16, "TCH:ROSL BTN:BACK", true);
          break;
      }
    }

    if (partial > 2) {
      //Draw arrows for vertical / horizontal movement
      if (gameMode != GMROTATE) {

        for (let x = 0; x != boardWidth; x++) {
          set_bkg_tile_xy_sixteen(boardX + x, boardY - 1, ARROWDOWN);
          set_bkg_tile_xy_sixteen(boardX + x, boardY + boardHeight, ARROWUP);
        }

        for (let y = 0; y != boardHeight; y++) {
          set_bkg_tile_xy_sixteen(boardX - 1, boardY + y, ARROWRIGHT);
          set_bkg_tile_xy_sixteen(boardX + boardWidth, boardY + y, ARROWLEFT);
        }
      }
    }

    //complete level
    let i16 = 0;
    let yy;
    let xx;
    if (partial > 1) {
      for (yy = 0; yy < boardHeight; yy++) {
        for (xx = 0; xx < boardWidth; xx++) {
          set_bkg_tile_xy_sixteen(boardX + xx, boardY + yy, level[i16 + xx]);
        }
        i16 += boardWidth;
      }
    }
  }
  redrawPartial = 3;
}

function initGame() {
  paused = 0;
  //set background tiles
  setBlockTilesAsBackground();
  //set sprite for selector / cursor
  initCursors();
  setCursorPos(0, boardX + selectionX, boardY + selectionY, true);
  showCursors();
  redrawLevelDoneBit = 0;
  needRedraw = 1;
  redrawPartial = 3;
}

function doPause() {
  paused = 1;
  wasSoundOn = isSoundOn();
  setSoundOn(0);
  hideCursors();
  printMessage(0, (MAXBOARDHEIGHT >> 1) - 3, "[**************]");
  printMessage(0, (MAXBOARDHEIGHT >> 1) - 2, "|PLEASE CONFIRM+");
  printMessage(0, (MAXBOARDHEIGHT >> 1) - 1, "|              +");
  printMessage(0, (MAXBOARDHEIGHT >> 1) + 0, "|  TOUCH PLAY  +");
  printMessage(0, (MAXBOARDHEIGHT >> 1) + 1, "|  BTN TO QUIT +");
  printMessage(0, (MAXBOARDHEIGHT >> 1) + 2, "<##############>");
  requiresFlip = 1;
}

function doUnPause() {
  paused = 0;
  setSoundOn(wasSoundOn);
  setCursorPos(0, boardX + selectionX, boardY + selectionY, true);
  showCursors();
}

function game() {
  if (gameState == GSINITGAME) {
    initGame();
    gameState -= GSINITDIFF;
  }

  if (dragdown) {
    if (!levelDone && !paused) {
      playGameMoveSound();
      //if not touching border on bottom
      if (selectionY + 1 < boardHeight + posAdd) {
        //clear cursor
        drawCursors(true, true);
        selectionY += 1;
        needRedraw = 1;
        redrawPartial = 0;
      } else {
        //set to border on top
        //clear cursor
        drawCursors(true, true);
        selectionY = -posAdd;
        needRedraw = 1;
        redrawPartial = 0;
      }
      setCursorPos(0, boardX + selectionX, boardY + selectionY, true);
    }
  } else {
    if (dragup) {
      if (!levelDone && !paused) {
        //if not touching border on top
        playGameMoveSound();
        if (selectionY - 1 >= -posAdd) {
          //clear cursor
          drawCursors(true, true);
          selectionY -= 1;
          needRedraw = 1;
          redrawPartial = 0;
        } else {
          //set to border on bottom
          //clear cursor
          drawCursors(true, true);
          selectionY = boardHeight - 1 + posAdd;
          needRedraw = 1;
          redrawPartial = 0;
        }
        setCursorPos(0, boardX + selectionX, boardY + selectionY, true);
      }
    } else {
      if (dragright) {
        if (!levelDone && !paused) {
          playGameMoveSound();
          //if not touching border on right
          if (selectionX + 1 < boardWidth + posAdd) {
            //clear cursor
            drawCursors(true, true);
            selectionX += 1;
            needRedraw = 1;
            redrawPartial = 0;
          } else {
            //set to border on left
            //clear cursor
            drawCursors(true, true);
            selectionX = -posAdd;
            needRedraw = 1;
            redrawPartial = 0;
          }
          setCursorPos(0, boardX + selectionX, boardY + selectionY, true);
        }
      } else {
        if (dragleft) {
          if (!levelDone && !paused) {
            playGameMoveSound();
            //if not touching border on left
            if (selectionX - 1 >= -posAdd) {
              //clear cursor
              drawCursors(true, true);
              selectionX -= 1;
              needRedraw = 1;
              redrawPartial = 0;
            } else { //set to border on right
              //clear cursor
              drawCursors(true, true);
              selectionX = boardWidth - 1 + posAdd;
              needRedraw = 1;
              redrawPartial = 0;
            }
            setCursorPos(0, boardX + selectionX, boardY + selectionY, true);
          }
        }
      }
    }
  }

  if (btna) {
    if (paused) {
      doUnPause();
      playMenuAcknowlege();
      needRedraw = 1;
      redrawPartial = 3;
    } else {
      if (!levelDone) {
        if ((selectionX > -1) && (selectionX < boardWidth) &&
          (selectionY > -1) && (selectionY < boardHeight)) {
          if (gameMode != GMSLIDE) {
            rotateBlock(selectionX + (selectionY * boardWidth));
            moves++;
            playGameAction();
            needRedraw = 1;
            redrawPartial = 2;
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
              redrawPartial = 2;
            } else {
              if (selectionY == boardHeight) {
                moveBlockUp(selectionX + ((selectionY - 1) * boardWidth));
                moves++;
                playGameAction();
                needRedraw = 1;
                redrawPartial = 2;
              }
            }
          } else {
            if ((selectionY > -1) && (selectionY < boardHeight)) {
              if (selectionX == -1) {
                moveBlockRight((selectionX + 1) + (selectionY * boardWidth));
                moves++;
                playGameAction();
                needRedraw = 1;
                redrawPartial = 2;
              } else {
                if (selectionX == boardWidth) {
                  moveBlockLeft((selectionX - 1) + (selectionY * boardWidth));
                  moves++;
                  playGameAction();
                  needRedraw = 1;
                  redrawPartial = 2;
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
          //2 forces level to be drawn (only) one last time the other call uses levelDone
          drawGame(2);
          //hide cursor it's only sprite we use
          hideCursors();
          printMessage(((16 - 13) >> 1), (MAXBOARDHEIGHT >> 1) - 2, "[************]");
          printMessage(((16 - 13) >> 1), (MAXBOARDHEIGHT >> 1) - 1, "| LEVEL DONE +");
          printMessage(((16 - 13) >> 1), (MAXBOARDHEIGHT >> 1) - 0, "|  TOUCH TO  +");
          printMessage(((16 - 13) >> 1), (MAXBOARDHEIGHT >> 1) + 1, "|  CONTINUE  +");
          printMessage(((16 - 13) >> 1), (MAXBOARDHEIGHT >> 1) + 2, "<############>");
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
          setCursorPos(0, boardX + selectionX, boardY + selectionY, true);
          showCursors();
          needRedraw = 1;
          redrawPartial = 3;
        } else {
          //goto next level if any
          if (selectedLevel < maxLevel) {
            selectedLevel++;
            unlockLevel(gameMode, difficulty, selectedLevel - 1);
            initLevel(randomSeedGame);
            //show cursor again (it's actually to early but i'm not fixing that)
            setCursorPos(0, boardX + selectionX, boardY + selectionY, true);
            showCursors();
            needRedraw = 1;
            redrawPartial = 3;
          } else {
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
    drawGame(redrawPartial);
    drawCursors(false, true);
    needRedraw = 0;
    requiresFlip = 1;
  }
}

// --------------------------------------------------------------------------------------------------
// main game start
// --------------------------------------------------------------------------------------------------
function setThemingOn(value) {
  //change color palette to theming options for the images
  if (value && (g.theme.bg != g.theme.fg)) {
    SELECTORTILES.palette[1] = g.theme.bg;
    SELECTORTILES.palette[2] = g.theme.fg;
    SELECTORTILESSIXTEEN.palette[1] = g.theme.bg;
    SELECTORTILESSIXTEEN.palette[2] = g.theme.fg;
    TITLE.palette[3] = g.theme.bg;
    TITLE.palette[2] = g.theme.bg;
    TITLE.palette[1] = g.theme.fg;
    BLOCKTILES.palette[0] = g.theme.bg;
    BLOCKTILES.palette[1] = g.theme.fg;
    CONGRATSSCREEN.palette[0] = g.theme.bg;
    CONGRATSSCREEN.palette[1] = g.theme.fg;
    CONGRATSTILES.palette[0] = g.theme.bg;
    CONGRATSTILES.palette[1] = g.theme.fg;
  } else {
    SELECTORTILES.palette[1] = 0x0000;
    SELECTORTILES.palette[2] = 0xFFFF;
    SELECTORTILESSIXTEEN.palette[1] = 0x0000;
    SELECTORTILESSIXTEEN.palette[2] = 0xFFFF;
    TITLE.palette[3] = 0x0000;
    TITLE.palette[2] = 0x0000;
    TITLE.palette[1] = 0xFFFF;
    BLOCKTILES.palette[0] = 0x0000;
    BLOCKTILES.palette[1] = 0xFFFF;
    CONGRATSSCREEN.palette[0] = 0x0000;
    CONGRATSSCREEN.palette[1] = 0xFFFF;
    CONGRATSTILES.palette[0] = 0x0000;
    CONGRATSTILES.palette[1] = 0xFFFF;
  }
}

function setup() {
  redrawPartial = 0;
  option = 0;
  difficulty = DIFFNORMAL;
  selectedLevel = 1;
  mainMenu = MMSTARTGAME;
  gameState = GSINITINTRO;
  titleStep = TSMAINMENU;
  gameMode = GMROTATE;
  posAdd = 0;
  //has to be called first because initsound read savestate sound to set intial flags
  initSaveState();
  //initSound();
  setSoundOn(isSoundOnSaveState());
  setThemingOn(isThemingOnSaveState());
  //has to be called after applying theming
  setBlockTilesAsBackground();
  //calculate screenoffset y position taking apprect into account
  screenOffsetY = ((SCREENHEIGHT + Bangle.appRect.y - 8 * TILESIZE) >> 1);
}

function loop() {
  //soundTimer();
  let startTime = Date().getTime();
  g.reset();
  if (isThemingOnSaveState()) {
    g.setColor(g.theme.fg);
    g.setBgColor(g.theme.bg);
  } else {
    g.setColor(0xFFFF);
    g.setBgColor(0x0000);
  }

  //gamestate handling
  let prevGameState = gameState;

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
    if (isInputRectsOnSaveState()) {
      const offsetvalue = 0.20;
      let x1 = SCREENWIDTH * offsetvalue;
      let x2 = SCREENWIDTH - SCREENWIDTH * offsetvalue;
      let y1 = Bangle.appRect.y + SCREENHEIGHT * offsetvalue;
      let y2 = SCREENHEIGHT - SCREENHEIGHT * offsetvalue;
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
  if (DEBUGMODESPEED)
    debugLog("loop done: " + (Date().getTime() - startTime).toString());
  else
    debugLog("loop done");

  if (DEBUGMODERAMUSE) {
    let memTmp = process.memory(false);
    let used = memTmp.usage - memStart.usage;
    debugLog("Udiff:" + used.toString() + " used:" + memTmp.usage.toString() + " free:" + memTmp.free.toString() + " total:" + memTmp.total.toString());
  }
}

function debugLog(val) {
  if (DEBUGMODE)
    print(val);
}

function handleTouch(button, data) {
  const offsetvalue = 0.20;
  let x1 = SCREENWIDTH * offsetvalue;
  let x2 = SCREENWIDTH - SCREENWIDTH * offsetvalue;
  let y1 = Bangle.appRect.y + SCREENHEIGHT * offsetvalue;
  let y2 = SCREENHEIGHT - SCREENHEIGHT * offsetvalue;
  dragleft = data.x < x1;
  dragright = data.x > x2;
  dragup = data.y < y1;
  dragdown = data.y > y2;
  btna = ((data.x <= x2) && (data.x >= x1) && (data.y >= y1) && (data.y <= y2) && (data.type == 0));
  btnb = ((data.x <= x2) && (data.x >= x1) && (data.y >= y1) && (data.y <= y2) && (data.type == 2));
  if (DEBUGMODEINPUT) {
    debugLog("tap button:" + button.toString() + " x:" + data.x.toString() + " y:" + data.y.toString() + " x1:" + x1.toString() + " x2:" + x2.toString() + " y1:" + y1.toString() + " y2:" + y2.toString() + " type:" + data.type.toString());
    debugLog("l:" + dragleft.toString() + " u:" + dragup.toString() + " r:" + dragright.toString() + " d:" + dragdown.toString() + " a:" + btna.toString() + " b:" + btnb.toString());
  }
  loop();
  dragleft = false;
  dragright = false;
  dragdown = false;
  dragup = false;
  btna = false;
  btnb = false;
  while (needRedraw)
    loop();
  if (DEBUGMODEINPUT)
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
  if (DEBUGMODEINPUT)
    debugLog("btnPressed done");
}

//initialize spritepos arrays
for (let i = 0; i < cursorNumTiles; i++)
  spritePos.push(new Int16Array(2));

//clear one time entire screen
g.clear();
//setup game and run loop it will repeat during intro
//otherwise only as long as redraw is needed after input was detected
setup();
//for intro only
let intervalTimer = setInterval(loop, 66); // 15 fps
//for handling input
Bangle.on('touch', handleTouch);
setWatch(btnPressed, BTN, {
  edge: "rising",
  debounce: 50,
  repeat: true
});