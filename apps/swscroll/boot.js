E.showScroller = (function(options) {
  /* options = {
    h = height
    c = # of items
    scroll = initial scroll position
    scrollMin = minimum scroll amount (can be negative)
    draw = function(idx, rect)
    remove = function()
    select = function(idx, touch)
  }

  returns {
    scroll: int                // current scroll amount
    draw: function()           // draw all
    drawItem : function(idx)   // draw specific item
    isActive : function()      // is this scroller still active?
  }

  */
if (!options) return Bangle.setUI(); // remove existing handlers

var draw = () => {
  g.reset().clearRect(R).setClipRect(R.x,R.y,R.x2,R.y2);
  var a = YtoIdx(R.y);
  var b = Math.min(YtoIdx(R.y2),options.c-1);
  for (var i=a;i<=b;i++)
    options.draw(i, {x:R.x,y:idxToY(i),w:R.w,h:options.h});
  g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
};

Bangle.setUI({
  mode : "custom",
  back : options.back,
  remove : options.remove,
  redraw : draw,
  swipe : (_,UD)=>{
    const pixels = 120;
    var dy = UD*pixels;
    if (s.scroll - dy > menuScrollMax)
      dy = s.scroll - menuScrollMax-8; // Makes it so the last 'page' has the same position as previous pages. This should be done dynamically (change the static 8 to be a variable) so the offset is correct even when no widget field or title field is present.
    if (s.scroll - dy < menuScrollMin)
      dy = s.scroll - menuScrollMin;
    s.scroll -= dy;
    var oldScroll = rScroll;
    rScroll = s.scroll &~1;
    dy = oldScroll-rScroll;
    if (!dy || options.c<=3) return; //options.c<=3 should maybe be dynamic, so 3 would be replaced by a variable dependent on R=Bangle.appRect. It's here so we don't try to scroll if all entries fit in the app rectangle.
    g.reset().setClipRect(R.x,R.y,R.x2,R.y2).scroll(0,dy);
    var d = UD*pixels;
    if (d < 0) {
      let y = Math.max(R.y2-(1-d), R.y);
      g.setClipRect(R.x,y,R.x2,R.y2);
      let i = YtoIdx(y);
      y = idxToY(i);
      //print(i, options.c, options.c-i); //debugging info
      while (y < R.y2 - (options.h*((options.c-i)<=0)) ) { //- (options.h*((options.c-i)<=0)) makes sure we don't go beyond the menu entries in the menu object "options". This has to do with "dy = s.scroll - menuScrollMax-8" above.
        options.draw(i, {x:R.x,y:y,w:R.w,h:options.h});
        i++;
        y += options.h;
      }
    } else { // d>0
      let y = Math.min(R.y+d, R.y2);
      g.setClipRect(R.x,R.y,R.x2,y);
      let i = YtoIdx(y);
      y = idxToY(i);
      while (y > R.y-options.h) {
        options.draw(i, {x:R.x,y:y,w:R.w,h:options.h});
        y -= options.h;
        i--;
      }
    }
    g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
  }, touch : (_,e)=>{
    if (e.y<R.y-4) return;
    var i = YtoIdx(e.y);
    if ((menuScrollMin<0 || i>=0) && i<options.c){
      let yAbs = (e.y + rScroll - R.y);
      let yInElement = yAbs - i*options.h;
      options.select(i, {x:e.x, y:yInElement, type:e.type});
    }
  }
});

var R = Bangle.appRect;
//var Y = R.y;
//var n = Math.ceil(R.h/options.h);
var menuScrollMin = 0|options.scrollMin;
var menuScrollMax = options.h*options.c - R.h;
if (menuScrollMax<menuScrollMin) menuScrollMax=menuScrollMin;

function idxToY(i) {
  return i*options.h + R.y - rScroll;
}
function YtoIdx(y) {
  return Math.floor((y + rScroll - R.y)/options.h);
}

var s = {
  scroll : E.clip(0|options.scroll,menuScrollMin,menuScrollMax),
  draw : draw, drawItem : i => {
    var y = idxToY(i);
    g.reset().setClipRect(R.x,Math.max(y,R.y),R.x2,Math.min(y+options.h,R.y2));
    options.draw(i, {x:R.x,y:y,w:R.w,h:options.h});
    g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
  }, isActive : () => Bangle.uiRedraw == draw
};
var rScroll = s.scroll&~1; // rendered menu scroll (we only shift by 2 because of dither)
s.draw(); // draw the full scroller
g.flip(); // force an update now to make this snappier
return s;
})
