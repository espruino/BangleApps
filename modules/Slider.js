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
      dragRect:R,
    },conf);

    if (o.c.horizontal) {
      let mediator = o.c.xStart;
      o.c.xStart = o.c.yStart;
      o.c.yStart = mediator;
      mediator = o.c.width;
      o.c.width = o.c.height;
      o.c.height = mediator;
      delete mediator;
    }

    let totalBorderSize = o.c.outerBorderSize + o.c.innerBorderSize;
    o.c._xStart = o.c.xStart + totalBorderSize;
    o.c._width = o.c.width - 2*totalBorderSize;
    o.c._yStart = o.c.yStart + totalBorderSize;
    o.c._height = o.c.height - 2*totalBorderSize;
    o.c.rounded = o.c.rounded?20:0;

    o.c.STEP_SIZE = ((!o.c.horizontal?o.c._height:o.c._width)-(!o.c.rounded?0:(2*o.c.rounded-7)))/o.c.steps;

    o.c.r = {x:o.c.xStart, y:o.c.yStart, x2:o.c.xStart+o.c.width, y2:o.c.yStart+o.c.height, w:o.c.width, h:o.c.height};

    // Initialize the level
    o.v.level = (o.c.currLevel||o.c.currLevel===0)?o.c.currLevel:o.c.steps/2;

    o.v.firstRun = true;
    o.v.ebLast = 0;
    o.v.dy = 0;

    if (o.c.dragableSlider) { 
      o.f.wasOnDragRect = (exFirst, eyFirst)=>{
        "ram";
        return exFirst>o.c.dragRect.x && exFirst<o.c.dragRect.x2 && eyFirst>o.c.dragRect.y && eyFirst<o.c.dragRect.y2;
      };

      o.f.wasOnIndicator = (exFirst)=>{
        "ram";
        if (!o.c.horizontal) return exFirst>o.c._xStart-o.c.oversizeL*o.c._width && exFirst<o.c._xStart+o.c._width+o.c.oversizeR*o.c._width;
        if (o.c.horizontal) return exFirst>o.c._yStart-o.c.oversizeL*o.c._height && exFirst<o.c._yStart+o.c._height+o.c.oversizeR*o.c._height;
      };

      o.f.dragSlider = e=>{
        "ram";
        if (o.v.ebLast==0) {
          exFirst = o.c.horizontal?e.y:e.x;
          eyFirst = o.c.horizontal?e.x:e.y;
        }

        if (o.f.wasOnDragRect(exFirst, eyFirst)) {
          o.v.dragActive = true;
          if (!o.c.propagateDrag) E.stopEventPropagation&&E.stopEventPropagation();

          if (o.v.timeoutID) {clearTimeout(o.v.timeoutID); o.v.timeoutID = undefined;}
          if (e.b==0 && !o.v.timeoutID && (o.c.timeout || o.c.timeout===0)) o.v.timeoutID = setTimeout(o.f.remove, 1000*o.c.timeout);

          if (o.c.useMap && o.f.wasOnIndicator(exFirst)) { // If draging starts on the indicator, adjust one-to-one.

            let input = !o.c.horizontal?
              Math.min((175-e.y)-o.c.yStart-3*o.c.rounded/4, o.c.height):
              Math.min(e.x-o.c.xStart-3*o.c.rounded/4, o.c.width);
            input = Math.round(input/o.c.STEP_SIZE);

            o.v.level = Math.min(Math.max(input,0),o.c.steps);

            if (o.v.level != o.v.prevLevel) {
              cb("map",o.v.level);
              o.f.draw&&o.f.draw(o.v.level);
            }
            o.v.prevLevel = o.v.level;
          } else if (o.c.useIncr) { // Heavily inspired by "updown" mode of setUI.

            o.v.dy += o.c.horizontal?-e.dx:e.dy;
            //if (!e.b) o.v.dy=0;

            while (Math.abs(o.v.dy)>32) {
              let incr;
              if (o.v.dy>0) { o.v.dy-=32; incr = 1;}
              else { o.v.dy+=32; incr = -1;}
              Bangle.buzz(20);

              o.v.level = Math.min(Math.max(o.v.level-incr,0),o.c.steps);
              cb("incr",incr);
              o.f.draw&&o.f.draw(o.v.level);
              o.v.prevLevel = o.v.level;
            }
          }
          o.v.ebLast = e.b;
        }
      };

      o.f.remove = ()=> {
        Bangle.removeListener('drag', o.f.dragSlider);
        o.v.dragActive = false;
        o.v.timeoutID = undefined;
        cb("remove", o.v.level);
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

        g.setColor(o.c.colorFG).fillRect(o.c.borderRect). // To get outer border...
          setColor(o.c.colorBG).fillRect(o.c.hollowRect). // ... and here it's made hollow.
          setColor(0==level?o.c.colorBG:o.c.colorFG).fillRect(o.f.updateBar((!o.c.rounded?0:(2*o.c.rounded-7))+level*o.c.STEP_SIZE)); // Here the bar is drawn.
        if (o.c.rounded && level===0) { // Hollow circle indicates level zero when slider is rounded.
          g.setColor(o.c.colorFG).fillCircle(o.c._xStart+(!o.c.horizontal?o.c._width/2:o.c.rounded-2), o.c._yStart+o.c._height-o.c.rounded+2, o.c.rounded-o.c.innerBorderSize).
            setColor(o.c.colorBG).fillCircle(o.c._xStart+(!o.c.horizontal?o.c._width/2:o.c.rounded-2), o.c._yStart+o.c._height-o.c.rounded+2, o.c.rounded-o.c.innerBorderSize-2);
        }

        //print(level);
        //print(process.memory().usage);
      };
    }

    if (o.c.autoProgress) {
      o.f.autoUpdate = ()=>{
        //if (o.v.level===undefined) o.v.level = -1;
        o.v.level = o.c.currLevel + Math.round((Date.now()-o.v.initTime)/1000)
        if (o.v.level>o.c.steps) o.v.level=o.c.steps;
        o.f.draw&&o.f.draw(o.v.level);
        cb("auto");
        if (o.v.level==o.c.steps) {o.f.stopAutoUpdate();}
      };
      o.f.updateInitTime = ()=>{
        o.v.initTime=Date.now();
      }
      o.f.startAutoUpdate = ()=>{
        o.f.stopAutoUpdate();
        !o.v.initTime&&o.f.updateInitTime();
        o.f.draw&&o.f.draw(o.v.level);
        o.v.autoIntervalID = setInterval(o.f.autoUpdate,1000);
      };
      o.f.stopAutoUpdate = ()=>{if (o.v.autoIntervalID) {clearInterval(o.v.autoIntervalID); o.v.autoIntervalID = undefined;}};
    }

    //o.f.printThis = ()=>(print(this));

    return o;
  };

} catch (e) {
  print(e);
  let appName = "spotrem";
  eval(require("Storage").read(appName+".app.js"));
}
