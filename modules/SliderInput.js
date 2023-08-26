exports.interface = function(cb, conf) {
// Configuration for the indicator:
conf = conf?conf:{};
const USE_MAP = conf.useMap || false;
const USE_INCR = conf.useIncr || true;
const ROTATE = conf.horizontal || false;
let X_START = (conf.xStart || 176-55);
let WIDTH = conf.width-9 || 50-9; // -9 to compensate for the border.
let Y_START = (conf.yStart || 5);
let HEIGHT = conf.height-5 || 165-5; // -5 to compensate for the border.
const STEPS = conf.steps || 30; //Default corresponds to my phones volume range, [0,30]. Maybe it should be 31. Math is hard sometimes...
const OVERSIZE_R = conf.oversizeR || 0;
const OVERSIZE_L = conf.oversizeL || 0;
const TIMEOUT = conf.timeout || 1;
const COL_FG = conf.colorFG || g.theme.fg2;
const COL_BG = conf.colorBG || g.theme.bg2;
const LAZY = conf.lazy || true;

const STEP_SIZE = HEIGHT/STEPS;

if (ROTATE) {
  let mediator = X_START;
  X_START = Y_START;
  Y_START = mediator;
  mediator = WIDTH;
  WIDTH = HEIGHT;
  HEIGHT = mediator;
  delete mediator;
}

// Initialize the level
let level;
let prevLevel = conf.currLevel || STEPS/2;

let firstRun = true;
let ebLast = 0;
let exFirst;

const borderRect = {x:X_START,y:Y_START,w:WIDTH+8,y2:Y_START+HEIGHT+5,r:0};
const hollowRect = {x:X_START+2,y:Y_START+2,w:WIDTH+4,y2:Y_START+HEIGHT+2,r:0};

let wasOnIndicator = (exFirst)=>{
  "ram";
  if (!ROTATE) return exFirst>X_START-OVERSIZE_L*WIDTH && exFirst<X_START+WIDTH+OVERSIZE_R*WIDTH;
  if (ROTATE) return exFirst>Y_START-OVERSIZE_L*HEIGHT && exFirst<Y_START+HEIGHT+OVERSIZE_R*HEIGHT;
};

let updateBar = (levelHeight)=>{
  "ram";
  if (!ROTATE) return {x:X_START+4,y:Y_START+4+HEIGHT-levelHeight,w:WIDTH,y2:Y_START+HEIGHT,r:0};
  if (ROTATE) return {x:X_START+4,y:Y_START+4,w:X_START+4+levelHeight-2,y2:Y_START+HEIGHT,r:0};
};


let dragSlider = e=>{
  "ram";
  E.stopEventPropagation&&E.stopEventPropagation();

  if (timeout) {clearTimeout(timeout); timeout = undefined;}
  if (e.b==0 && !timeout) timeout = setTimeout(remove, 1000*TIMEOUT);

  let input = Math.min(ROTATE?175-e.x:e.y, 170);
  input = Math.round(input/STEP_SIZE);

  if (ebLast==0) exFirst = ROTATE?e.y:e.x;

  // If draging on the indicator, adjust one-to-one.
    if (USE_MAP && wasOnIndicator(exFirst)) {

      level = Math.min(Math.max(STEPS-input,0),STEPS);

      if (level != prevLevel) cb("map",level);
      draw(level);

    } else if (USE_INCR) { // Heavily inspired by "updown" mode of setUI.

      dy += ROTATE?-e.dx:e.dy;
      //if (!e.b) dy=0;

      let incr;
      while (Math.abs(dy)>32) {
        if (dy>0) { dy-=32; incr = 1;}
        else { dy+=32; incr = -1;}
        Bangle.buzz(20);

        level = Math.min(Math.max(prevLevel-incr,0),STEPS);
        cb("incr",incr);
        draw(level);
      }
    }
  ebLast = e.b;
};

let draw = (level)=>{
  "ram";
  // Draw the indicator.
    // Should be displayed when a relevant drag event is detected.
    // Should time out.
    // If user drags directly on the draw area, adjust level one-to-one.
    // Pauses and resets the time out when interacted with.

  if (firstRun || !LAZY) {
    g.setColor(COL_FG).fillRect(borderRect); // To get outer border...
  }
  if (level == prevLevel) {if (!firstRun) return; if (firstRun) firstRun = false;}

  prevLevel = level;

    g.setColor(COL_BG).
    fillRect(hollowRect). // ... and here it's made hollow.
    setColor(0==level?COL_BG:COL_FG).
    fillRect(updateBar(level*STEP_SIZE)); // Here the bar is drawn.

  //print(level);
  //print(process.memory().usage);
};

let remove = ()=> {
  Bangle.removeListener('drag', dragSlider);
  cb("remove", prevLevel);
};

let timeout;
if (TIMEOUT!=='no') timeout = setTimeout(remove, 1000*TIMEOUT);

let dy = 0;
g.reset();
Bangle.prependListener('drag', dragSlider);
}
