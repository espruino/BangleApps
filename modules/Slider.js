try { // for making it possiblie to run the test app in the following catch statement. It would complain on `exports` not being defined.

exports.create = function(cb, conf) {

const R = Bangle.appRect;

let o = {};
o.v = {}; // variables go here.
o.f = {}; // functions go here.

// configuration for the indicator:

o.c = Object.assign({ // constants go here.
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
  immediatedraw:false,
  autoProgress:false,
  outerBorderSize:2,
  innerBorderSize:2,
  drawableSlider:true,
  dragableSlider:true,
  currLevel:undefined,
},conf);

let totalBorderSize = o.c.outerBorderSize + o.c.innerBorderSize;
o.c._xStart = o.c.xStart + totalBorderSize;
o.c._width = o.c.width - 2*totalBorderSize;
o.c._yStart = o.c.yStart + totalBorderSize;
o.c._height = o.c.height - 2*totalBorderSize;
if (o.c.rounded) o.c.rounded = 40;

o.c.STEP_SIZE = o.c._height/o.c.steps;

if (o.c.horizontal) {
  let mediator = o.c._xStart;
  o.c._xStart = o.c._yStart;
  o.c._yStart = mediator;
  mediator = o.c._width;
  o.c._width = o.c._height;
  o.c._height = mediator;

  mediator = o.c.xStart;
  o.c.xStart = o.c.yStart;
  o.c.yStart = mediator;
  mediator = o.c.width;
  o.c.width = o.c.height;
  o.c.height = mediator;
  delete mediator;
}

o.c.r = {x:o.c.xStart, y:o.c.yStart, x2:o.c.xStart+o.c.width, y2:o.c.yStart+o.c.height, w:o.c.width, h:o.c.height};

// Initialize the level
o.v.level = (o.c.currLevel||o.c.currLevel===0)?o.c.currLevel:o.c.steps/2;

o.v.firstRun = true;
o.v.ebLast = 0;

if (o.c.dragableSlider) { 
  o.f.wasOnIndicator = (exFirst)=>{
    "ram";
    if (!o.c.horizontal) return exFirst>o.c._xStart-o.c.oversizeL*o.c._width && exFirst<o.c._xStart+o.c._width+o.c.oversizeR*o.c._width;
    if (o.c.horizontal) return exFirst>o.c._yStart-o.c.oversizeL*o.c._height && exFirst<o.c._yStart+o.c._height+o.c.oversizeR*o.c._height;
  };

  o.f.dragSlider = e=>{
    "ram";
    o.v.dragActive = true;
    if (!o.c.propagateDrag) E.stopEventPropagation&&E.stopEventPropagation();

    if (o.v.timeoutID) {clearTimeout(o.v.timeoutID); o.v.timeoutID = undefined;}
    if (e.b==0 && !o.v.timeoutID && (o.c.timeout || o.c.timeout===0)) o.v.timeoutID = setTimeout(o.f.remove, 1000*o.c.timeout);

    let input = Math.min(o.c.horizontal?175-e.x:e.y, 170);
    input = Math.round(input/o.c.STEP_SIZE);

    if (o.v.ebLast==0) exFirst = o.c.horizontal?e.y:e.x;

    if (o.c.useMap && o.f.wasOnIndicator(exFirst)) { // If draging starts on the indicator, adjust one-to-one.

      o.v.level = Math.min(Math.max(o.c.steps-input,0),o.c.steps);

      if (o.v.level != o.v.prevLevel) cb("map",o.v.level);
      o.f.draw&&o.f.draw(o.v.level);

    } else if (o.c.useIncr) { // Heavily inspired by "updown" mode of setUI.

      o.v.dy += o.c.horizontal?-e.dx:e.dy;
      //if (!e.b) o.v.dy=0;

      let incr;
      while (Math.abs(o.v.dy)>32) {
        if (o.v.dy>0) { o.v.dy-=32; incr = 1;}
        else { o.v.dy+=32; incr = -1;}
        Bangle.buzz(20);

        o.v.level = Math.min(Math.max(o.v.level-incr,0),o.c.steps);
        cb("incr",incr);
        o.f.draw&&o.f.draw(o.v.level);
      }
    }
    o.v.ebLast = e.b;
  };

  o.f.remove = ()=> {
    Bangle.removeListener('drag', o.f.dragSlider);
    o.v.dragActive = false;
    cb("remove", o.v.prevLevel);
  };
}

if (o.c.drawableSlider) { 

  o.f.updateBar = (levelHeight)=>{
    "ram";
    if (!o.c.horizontal) return {x:o.c._xStart,y:o.c._yStart+o.c._height-levelHeight,w:o.c._width,y2:o.c._yStart+o.c._height,r:o.c.rounded};
    if (o.c.horizontal) return {x:o.c._xStart,y:o.c._yStart,w:levelHeight,h:o.c._height,r:o.c.rounded};
  };

  o.c.borderRect = {x:o.c._xStart-totalBorderSize,y:o.c._yStart-totalBorderSize,w:o.c._width+2*totalBorderSize,h:o.c._height+2*totalBorderSize,r:o.c.rounded};

  o.c.hollowRect = {x:o.c._xStart-o.c.innerBorderSize,y:o.c._yStart-o.c.innerBorderSize,w:o.c._width+2*o.c.innerBorderSize,h:o.c._height+2*o.c.innerBorderSize,r:o.c.rounded};

  o.f.draw = (level)=>{
    "ram";

    if (true || o.v.firstRun || !o.c.lazy) {
      g.setColor(o.c.colorFG).fillRect(o.c.borderRect); // To get outer border...
    }
    if (false && level == o.v.prevLevel) {if (!o.v.firstRun) return; if (o.v.firstRun) o.v.firstRun = false;}

    o.v.prevLevel = level;

    g.setColor(o.c.colorBG).
      fillRect(o.c.hollowRect). // ... and here it's made hollow.
      setColor(0==level?o.c.colorBG:o.c.colorFG).
      fillRect(o.f.updateBar(level*o.c.STEP_SIZE)); // Here the bar is drawn.

    //print(level);
    //print(process.memory().usage);
  };
}

if (o.c.autoProgress) {
  o.v.shouldAutoDraw = true;
  o.f.autoUpdate = ()=>{
    //if (o.v.level===undefined) o.v.level = -1;
    o.v.level = o.v.level+1;
    if (o.v.shouldAutoDraw) o.f.draw&&o.f.draw(o.v.level);
    cb("auto");
    if (o.v.level==o.c.steps) {o.f.stopAutoUpdate();}
  };
  o.f.startAutoUpdate = ()=>{
      o.f.stopAutoUpdate();
      if (o.v.shouldAutoDraw) o.f.draw&&o.f.draw(o.v.level);
      o.v.autoIntervalID = setInterval(o.f.autoUpdate,1000);
  };
  o.f.stopAutoUpdate = ()=>{if (o.v.autoIntervalID) {clearInterval(o.v.autoIntervalID); o.v.autoIntervalID = undefined;}};
}

//o.f.printThis = ()=>(print(this));

return o;
}

} catch (e) {
print(e);
let appName = "spotrem";
eval(require("Storage").read(appName+".app.js"));
}
