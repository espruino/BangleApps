/* Copyright (c) 2023 Bangle.js contributors. See the file LICENSE for copying permission. */

// At time of writing in October 2023 this module is new and things are more likely to change during the coming weeks than in a month or two.

// See Slider.md for documentation

/* Minify to 'Slider.min.js' by: // TODO: Should we do this for Slider module?

   * checking out: https://github.com/espruino/EspruinoDocs
   * run: ../EspruinoDocs/bin/minify.js modules/Slider.js modules/Slider.min.js

*/

exports.create = function(cb, conf) {

  const R = Bangle.appRect;

  // Empty function added to cb if it's undefined.
  if (!cb) cb = ()=>{};

  let o = {};
  o.v = {}; // variables go here.
  o.f = {}; // functions go here.

  // Default configuration for the indicator, modified by parameter `conf`:
  o.c = Object.assign({ // constants go here.
    initLevel:0,
    horizontal:false,
    xStart:R.x2-R.w/4-4,
    width:R.w/4,
    yStart:R.y+4,
    height:R.h-10,
    steps:30,

    dragableSlider:true,
    dragRect:R,
    mode:"incr",
    oversizeR:0,
    oversizeL:0,
    propagateDrag:false,
    timeout:1,

    drawableSlider:true,
    colorFG:g.theme.fg2,
    colorBG:g.theme.bg2,
    rounded:true,
    outerBorderSize:Math.round(2*R.w/176), // 176 is the # of pixels in a row on the Bangle.js 2's screen and typically also its app rectangles, used here to rescale to whatever pixel count is on the current app rectangle.
    innerBorderSize:Math.round(2*R.w/176),

    autoProgress:false,
  },conf);

  // If borders are bigger than the configured width, make them smaller to avoid glitches.
  while (o.c.width <= 2*(o.c.outerBorderSize+o.c.innerBorderSize)) {
    o.c.outerBorderSize--;
    o.c.innerBorderSize--;
  }
  o.c.outerBorderSize = Math.max(0,o.c.outerBorderSize);
  o.c.innerBorderSize = Math.max(0,o.c.innerBorderSize);

  let totalBorderSize = o.c.outerBorderSize + o.c.innerBorderSize;
  o.c.rounded = o.c.rounded?o.c.width/2:0;
  if (o.c.rounded) o.c._rounded = (o.c.width-2*totalBorderSize)/2;

  o.c.STEP_SIZE = ((o.c.height-2*totalBorderSize)-(!o.c.rounded?0:(2*o.c._rounded)))/o.c.steps;

  // If horizontal, flip things around.
  if (o.c.horizontal) {
    let mediator = o.c.xStart;
    o.c.xStart = o.c.yStart;
    o.c.yStart = mediator;
    mediator = o.c.width;
    o.c.width = o.c.height;
    o.c.height = mediator;
    delete mediator;
  }

  // Make room for the border. Underscore indicates the area for the actual indicator bar without borders.
  o.c._xStart = o.c.xStart + totalBorderSize;
  o.c._width = o.c.width - 2*totalBorderSize;
  o.c._yStart = o.c.yStart + totalBorderSize;
  o.c._height = o.c.height - 2*totalBorderSize;

  // Add a rectangle object with x, y, x2, y2, w and h values.
  o.c.r = {x:o.c.xStart, y:o.c.yStart, x2:o.c.xStart+o.c.width, y2:o.c.yStart+o.c.height, w:o.c.width, h:o.c.height};

  // Initialize the level
  o.v.level = o.c.initLevel;

  // Only add interactivity if wanted.
  if (o.c.dragableSlider) {

    let useMap = (o.c.mode==="map"||o.c.mode==="mapincr")?true:false;
    let useIncr = (o.c.mode==="incr"||o.c.mode==="mapincr")?true:false;

    const Y_MAX = g.getHeight()-1; // TODO: Should this take users screen calibration into account?

    o.v.ebLast = 0;
    o.v.dy = 0;

    o.f.wasOnDragRect = (exFirst, eyFirst)=>{
      "ram";
      return exFirst>o.c.dragRect.x && exFirst<o.c.dragRect.x2 && eyFirst>o.c.dragRect.y && eyFirst<o.c.dragRect.y2;
    };

    o.f.wasOnIndicator = (exFirst)=>{
      "ram";
      if (!o.c.horizontal) return exFirst>o.c._xStart-o.c.oversizeL*o.c._width && exFirst<o.c._xStart+o.c._width+o.c.oversizeR*o.c._width;
      if (o.c.horizontal) return exFirst>o.c._yStart-o.c.oversizeL*o.c._height && exFirst<o.c._yStart+o.c._height+o.c.oversizeR*o.c._height;
    };

    // Function to pass to `Bangle.on('drag', )`
    o.f.dragSlider = e=>{
      "ram";
      if (o.v.ebLast==0) {
        o.v.exFirst = o.c.horizontal?e.y:e.x;
        o.v.eyFirst = o.c.horizontal?e.x:e.y;
      }

      // Only react if on allowed area.
      if (o.f.wasOnDragRect(o.v.exFirst, o.v.eyFirst)) {
        o.v.dragActive = true;
        if (!o.c.propagateDrag) E.stopEventPropagation&&E.stopEventPropagation();

        if (o.v.timeoutID) {clearTimeout(o.v.timeoutID); o.v.timeoutID = undefined;}
        if (e.b==0 && !o.v.timeoutID && (o.c.timeout || o.c.timeout===0)) o.v.timeoutID = setTimeout(o.f.remove, 1000*o.c.timeout);

        let cbObj;
        if (useMap && o.f.wasOnIndicator(o.v.exFirst)) { // If draging starts on the indicator, adjust one-to-one.

          let input = !o.c.horizontal?
            Math.min((Y_MAX-e.y)-o.c.yStart-3*o.c.rounded/4, o.c.height):
            Math.min(e.x-o.c.xStart-3*o.c.rounded/4, o.c.width);
          input = Math.round(input/o.c.STEP_SIZE);

          o.v.level = Math.min(Math.max(input,0),o.c.steps);

          cbObj = {mode:"map", value:o.v.level};

        } else if (useIncr) { // Heavily inspired by "updown" mode of setUI.

          o.v.dy += o.c.horizontal?-e.dx:e.dy;
          //if (!e.b) o.v.dy=0;

          while (Math.abs(o.v.dy)>32) {
            let incr;
            if (o.v.dy>0) { o.v.dy-=32; incr = 1;}
            else { o.v.dy+=32; incr = -1;}
            Bangle.buzz(20);

            o.v.level = Math.min(Math.max(o.v.level-incr,0),o.c.steps);

            cbObj = {mode:"incr", value:incr};
          }
        }
        if (cbObj && (o.v.level!==o.v.prevLevel||o.v.level===0||o.v.level===o.c.steps||e.b===0)) {
          cb(cbObj.mode, cbObj.value, e);
          o.f.draw&&o.f.draw(o.v.level);
        }
        o.v.prevLevel = o.v.level;
        o.v.ebLast = e.b;
        if (e.b==0) o.v.dragActive = false;
      }
    };

    // Cleanup.
    o.f.remove = ()=> {
      Bangle.removeListener('drag', o.f.dragSlider);
      o.v.dragActive = false;
      o.v.timeoutID = undefined;
      cb("remove", o.v.level);
    };
  }

  // Add standard slider graphics only if wanted.
  if (o.c.drawableSlider) {

    // Function for getting the indication bars size.
    o.f.updateBar = (levelHeight)=>{
      "ram";
      if (!o.c.horizontal) return {x:o.c._xStart,y:o.c._yStart+o.c._height-levelHeight,w:o.c._width,y2:o.c._yStart+o.c._height,r:o.c.rounded};
      if (o.c.horizontal) return {x:o.c._xStart,y:o.c._yStart,w:levelHeight,h:o.c._height,r:o.c.rounded};
    };

    o.c.borderRect = {x:o.c._xStart-totalBorderSize,y:o.c._yStart-totalBorderSize,w:o.c._width+2*totalBorderSize,h:o.c._height+2*totalBorderSize,r:o.c.rounded};

    o.c.hollowRect = {x:o.c._xStart-o.c.innerBorderSize,y:o.c._yStart-o.c.innerBorderSize,w:o.c._width+2*o.c.innerBorderSize,h:o.c._height+2*o.c.innerBorderSize,r:o.c.rounded};

    // Standard slider drawing method.
    o.f.draw = (level)=>{
      "ram";

      g.setColor(o.c.colorFG).fillRect(o.c.borderRect). // To get outer border...
        setColor(o.c.colorBG).fillRect(o.c.hollowRect). // ... and here it's made hollow.
        setColor(0==level?o.c.colorBG:o.c.colorFG).fillRect(o.f.updateBar((!o.c.rounded?0:(2*o.c._rounded))+level*o.c.STEP_SIZE)); // Here the bar is drawn.
      if (o.c.rounded && level===0) { // Hollow circle indicates level zero when slider is rounded.
        g.setColor(o.c.colorFG).fillCircle(o.c._xStart+o.c._rounded, o.c._yStart+o.c._height-o.c._rounded, o.c._rounded).
          setColor(o.c.colorBG).fillCircle(o.c._xStart+o.c._rounded, o.c._yStart+o.c._height-o.c._rounded, o.c._rounded-o.c.outerBorderSize);
      }
    };
  }

  // Add logic for auto progressing the slider only if wanted.
  if (o.c.autoProgress) {
    o.f.autoUpdate = ()=>{
      o.v.level = o.v.autoInitLevel + Math.round((Date.now()-o.v.autoInitTime)/1000);
      if (o.v.level>o.c.steps) o.v.level=o.c.steps;
      cb("auto", o.v.level);
      o.f.draw&&o.f.draw(o.v.level);
      if (o.v.level==o.c.steps) {o.f.stopAutoUpdate();}
    };
    o.f.initAutoValues = ()=>{
      o.v.autoInitTime=Date.now();
      o.v.autoInitLevel=o.v.level;
    };
    o.f.startAutoUpdate = (intervalSeconds)=>{
      if (!intervalSeconds) intervalSeconds = 1;
      o.f.stopAutoUpdate();
      o.f.initAutoValues();
      o.f.draw&&o.f.draw(o.v.level);
      o.v.autoIntervalID = setInterval(o.f.autoUpdate,1000*intervalSeconds);
    };
    o.f.stopAutoUpdate = ()=>{
      if (o.v.autoIntervalID) {
        clearInterval(o.v.autoIntervalID);
        o.v.autoIntervalID = undefined;
      }
      o.v.autoInitLevel = undefined;
      o.v.autoInitTime = undefined;
    };
  }

  return o;
};
