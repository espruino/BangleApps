try { // for making it possiblie to run the test app in the following catch statement. It would complain on `exports` not being defined.

exports.interface = function(cb, conf) {

const R = Bangle.appRect;

// configuration for the indicator:

let c = Object.assign({
useMap:false,
useIncr:true,
horizontal:false,
xStart:R.x2-R.w/4-4,
width:R.w/4,
yStart:R.y+4,
height:R.h-10,
steps:30, // Default corresponds to my phones volume range, [0,30]. Maybe it should be 31. Math is hard sometimes...
oversizeR:0,
oversizeL:0,
timeout:1,
colorFG:g.theme.fg2,
colorBG:g.theme.bg2,
lazy:true,
rounded:0,
propagateDrag:false,
immediateDraw:false,
autoProgress:false,
},conf);

if (c.xStart) c.xStart += 4; // +4 to compensate for the border.
if (c.width) c.width -= 8; // +8 to compensate for the border.
if (c.yStart) c.yStart += 4; // +4 to compensate for the border.
if (c.height) c.height -= 8; // +8 to compensate for the border.
if (c.rounded) c.rounded = 40;

const STEP_SIZE = c.height/c.steps;

if (c.horizontal) {
  let mediator = c.xStart;
  c.xStart = c.yStart;
  c.yStart = mediator;
  mediator = c.width;
  c.width = c.height;
  c.height = mediator;
  delete mediator;
}

// Initialize the level
let level = c.currLevel || c.steps/2;
let prevLevel;

let firstRun = true;
let ebLast = 0;
let exFirst;

let wasOnIndicator = (exFirst)=>{
  "ram";
  if (!c.horizontal) return exFirst>c.xStart-c.oversizeL*c.width && exFirst<c.xStart+c.width+c.oversizeR*c.width;
  if (c.horizontal) return exFirst>c.yStart-c.oversizeL*c.height && exFirst<c.yStart+c.height+c.oversizeR*c.height;
};

const borderRect = {x:c.xStart-4,y:c.yStart-4,w:c.width+8,h:c.height+8,r:c.rounded};
const hollowRect = {x:c.xStart-2,y:c.yStart-2,w:c.width+4,h:c.height+4,r:c.rounded};

let updateBar = (levelHeight)=>{
  "ram";
  if (!c.horizontal) return {x:c.xStart,y:c.yStart+c.height-levelHeight,w:c.width,y2:c.yStart+c.height,r:c.rounded};
  if (c.horizontal) return {x:c.xStart,y:c.yStart,w:levelHeight,h:c.height,r:c.rounded};
};

let dragSlider = e=>{
  "ram";
  if (!c.propagateDrag) E.stopEventPropagation&&E.stopEventPropagation();

  if (timeout) {clearTimeout(timeout); timeout = undefined;}
  if (e.b==0 && !timeout && (c.timeout || c.timeout===0)) timeout = setTimeout(remove, 1000*c.timeout);

  let input = Math.min(c.horizontal?175-e.x:e.y, 170);
  input = Math.round(input/STEP_SIZE);

  if (ebLast==0) exFirst = c.horizontal?e.y:e.x;

  // If draging on the indicator, adjust one-to-one.
    if (c.useMap && wasOnIndicator(exFirst)) {

      level = Math.min(Math.max(c.steps-input,0),c.steps);

      if (level != prevLevel) cb("map",level);
      draw(level);

    } else if (c.useIncr) { // Heavily inspired by "updown" mode of setUI.

      dy += c.horizontal?-e.dx:e.dy;
      //if (!e.b) dy=0;

      let incr;
      while (Math.abs(dy)>32) {
        if (dy>0) { dy-=32; incr = 1;}
        else { dy+=32; incr = -1;}
        Bangle.buzz(20);

        level = Math.min(Math.max(level-incr,0),c.steps);
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

  if (firstRun || !c.lazy) {
    g.setColor(c.colorFG).fillRect(borderRect); // To get outer border...
  }
  if (level == prevLevel) {if (!firstRun) return; if (firstRun) firstRun = false;}

  prevLevel = level;

    g.setColor(c.colorBG).
    fillRect(hollowRect). // ... and here it's made hollow.
    setColor(0==level?c.colorBG:c.colorFG).
    fillRect(updateBar(level*STEP_SIZE)); // Here the bar is drawn.

  print(level);
  //print(process.memory().usage);
};

let remove = ()=> {
  Bangle.removeListener('drag', dragSlider);
  cb("remove", prevLevel);
};

let timeout;
if (c.timeout || c.timeout===0) timeout = setTimeout(remove, 1000*c.timeout);

let dy = 0;
g.reset();
Bangle.prependListener('drag', dragSlider);
if (c.immediateDraw) draw(level);

if (c.autoProgress) {
  draw(level);
  let autoUpdate = ()=>{
    level = level?level+1:0;
    draw(level);
    if (level==c.steps) {clearInterval(autoInterval); return;}
  };
  let autoInterval;
  autoInterval = setInterval(autoUpdate,1000);
}
}

} catch (e) {
  print(e);
  eval(require("Storage").read("slidertest.app.js"));
}
