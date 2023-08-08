exports.interface = function(cb, useMap, useIncr) {
// TODO: make configurable
// Constants for the indicator: 
const X_START = 176-55;
const WIDTH = 50;
const Y_START = 5;
const HEIGHT = 165;
const STEPS = 30; //Currently corresponds to my phones volume range, from 0 to 30. Maybe it should be 31. Math is hard sometimes...
const STEP_SIZE = HEIGHT/STEPS;
const OVERSIZE = 0.65;

// Initialize the level
let level; // TODO: Depend on parameter.
let lastLevel=10;
let levelHeight;

let continDrag = e=>{
  "ram";
  if (timeout) {clearTimeout(timeout); timeout = setTimeout(remove, 1000*1);}
  let input = Math.min(e.y,170);
  input = Math.round(input/STEP_SIZE);

  // If draging on the indicator, adjust one-to-one.
    if (useMap && e.x>X_START-OVERSIZE*WIDTH && e.x<X_START+OVERSIZE*WIDTH) {

      level = Math.min(Math.max(STEPS-input,0),STEPS);

      cb("map",level);
      draw(level);

    } else if (useIncr) { // Heavily inspired by "updown" mode of setUI.

      dy += e.dy;
      //if (!e.b) dy=0;

      let incr;
      while (Math.abs(dy)>32) {
        if (dy>0) { dy-=32; incr = 1;}
        else { dy+=32; incr = -1;}
        Bangle.buzz(20);

        level = Math.min(Math.max(lastLevel-incr,0),STEPS);
        cb("incr",incr);
        draw(level);
      }
    }
 E.stopEventPropagation&&E.stopEventPropagation();
};

let ovr = Graphics.createArrayBuffer(WIDTH,HEIGHT,1,{msb:true});

let draw = (level)=>{
  "ram";
  // Draw the indicator.
    // Should be displayed when a relevant drag event is detected.
    // Should time out.
    // If user drags directly on the draw area, adjust level one-to-one.
    // Pauses and resets the time out when interacted with.
    // TODO: Lazy, keep track of last level and only draw again if it changed.

  if (level == lastLevel) {print("hi"); return;}

  levelHeight = level==0?WIDTH:level*STEP_SIZE; // Math.max(level*STEP_SIZE,STEP_SIZE);
  lastLevel = level;

  ovr.clear().setColor(1).
    fillRect({x:0,y:0,w:WIDTH,y2:ovr.getHeight(),r:30}). // To get outer border...
    setColor(0).
    fillRect({x:2,y:2,w:WIDTH-5,y2:ovr.getHeight()-2,r:30}). // ... and here it's made hollow.
    setColor(0==level?0:1).
    fillRect({x:4,y:ovr.getHeight()-levelHeight+4,w:WIDTH-9,y2:ovr.getHeight()-4,r:30}); // Here the bar is drawn.
    Bangle.setLCDOverlay({
      width:ovr.getWidth(), height:ovr.getHeight(),
      bpp:1, transparent:0,
      buffer:ovr.buffer
    },X_START,Y_START);

  //print(level, input);
  //print(process.memory().usage);
};

let remove = ()=> {
  ovr.clear().reset();
  Bangle.setLCDOverlay();
  Bangle.removeListener('drag', continDrag);
};

let timeout = setTimeout(remove, 1000*1);

let dy = 0;
g.reset();
Bangle.prependListener('drag', continDrag);
}
