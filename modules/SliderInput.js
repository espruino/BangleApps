exports.interface = function(cb, conf) {
// Configuration for the indicator:
conf = conf?conf:{};
const USE_MAP = conf.useMap || false;
const USE_INCR = conf.useIncr || true;
const X_START = conf.xStart || 176-55;
const WIDTH = conf.width-9 || 50-9; // -9 to compensate for the border.
const Y_START = conf.yStart || 5;
const HEIGHT = conf.height-5 || 165-5; // -5 to compensate for the border.
const STEPS = conf.steps || 30; //Default corresponds to my phones volume range, [0,30]. Maybe it should be 31. Math is hard sometimes...
const OVERSIZE_R = conf.oversizeR || 0;
const OVERSIZE_L = conf.oversizeL || 0;
const TIMEOUT = conf.timeout || 1;

const STEP_SIZE = HEIGHT/STEPS;

// Initialize the level
let level;
let prevLevel = conf.currLevel || 0;
let levelHeight;

let firstRun = true;
let ebLast = 0;
let exFirst;

let dragSlider = e=>{
  "ram";
  E.stopEventPropagation&&E.stopEventPropagation();

  if (timeout) {clearTimeout(timeout); timeout = setTimeout(remove, 1000*TIMEOUT);}
  let input = Math.min(e.y,170);
  input = Math.round(input/STEP_SIZE);

  if (ebLast==0) exFirst = e.x;

  // If draging on the indicator, adjust one-to-one.
    if (USE_MAP && exFirst>X_START-OVERSIZE_L*WIDTH && exFirst<X_START+WIDTH+OVERSIZE_R*WIDTH) {

      level = Math.min(Math.max(STEPS-input,0),STEPS);

      if (level != prevLevel) cb("map",level);
      draw(level);

    } else if (USE_INCR) { // Heavily inspired by "updown" mode of setUI.

      dy += e.dy;
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

let ovr = Graphics.createArrayBuffer(WIDTH+9,HEIGHT+5,1,{msb:true});

let draw = (level)=>{
  "ram";
  // Draw the indicator.
    // Should be displayed when a relevant drag event is detected.
    // Should time out.
    // If user drags directly on the draw area, adjust level one-to-one.
    // Pauses and resets the time out when interacted with.

  if (firstRun) {
    ovr.setColor(1).
    fillRect({x:0,y:0,w:WIDTH+9,y2:HEIGHT+5,r:0}); // To get outer border...
  }

  if (level == prevLevel) {if (!firstRun) return; if (firstRun) firstRun = false;}

  levelHeight = level==0?WIDTH:level*STEP_SIZE; // Math.max(level*STEP_SIZE,STEP_SIZE);
  prevLevel = level;

    ovr.setColor(0).
    fillRect({x:2,y:2,w:WIDTH+4,y2:HEIGHT+2,r:0}). // ... and here it's made hollow.
    setColor(0==level?0:1).
    fillRect({x:4,y:4+HEIGHT-levelHeight,w:WIDTH,y2:HEIGHT,r:0}); // Here the bar is drawn.
    Bangle.setLCDOverlay({
      width:WIDTH+9, height:HEIGHT+5,
      bpp:1, transparent:0,
      buffer:ovr.buffer
    },X_START,Y_START);

  //print(level);
  //print(process.memory().usage);
};

let remove = ()=> {
  ovr.clear().reset();
  Bangle.setLCDOverlay();
  Bangle.removeListener('drag', dragSlider);
  cb("remove", prevLevel);
};

let timeout;
if (TIMEOUT!=='no') timeout = setTimeout(remove, 1000*TIMEOUT);

let dy = 0;
g.reset();
Bangle.prependListener('drag', dragSlider);
}
