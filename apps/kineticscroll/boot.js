(function() {
  E.showScroller = function(options) {
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

    const SPEED=100;
    const LAST_DRAG_WAIT=150;
    const MIN_VELOCITY=0.1;

    let scheduledDraw;

    let velocity = 0;
    let accDy = 0;
    let direction = 0;

    let lastTouchedDrag = 0;
    let lastDragStart = 0;

    let R = Bangle.appRect;
    let menuScrollMin = 0|options.scrollMin;
    let menuScrollMax = options.h*options.c - R.h;
    if (menuScrollMax<menuScrollMin) menuScrollMax=menuScrollMin;

    const touchHandler = (_,e)=>{
      if (e.y<R.y-4) return;
      velocity = 0;
      accDy = 0;
      let i = YtoIdx(e.y);
      if ((menuScrollMin<0 || i>=0) && i<options.c){
        let yAbs = (e.y + rScroll - R.y);
        let yInElement = yAbs - i*options.h;
        options.select(i, {x:e.x, y:yInElement});
      }
    };

    const uiDraw = () => {
      g.reset().clearRect(R).setClipRect(R.x,R.y,R.x2,R.y2);
      var a = YtoIdx(R.y);
      var b = Math.min(YtoIdx(R.y2),options.c-1);
      for (var i=a;i<=b;i++)
        options.draw(i, {x:R.x,y:idxToY(i),w:R.w,h:options.h});
      g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
    };

    const draw = () => {
      if (velocity > MIN_VELOCITY){
        velocity *= 1-((Date.now() - lastTouchedDrag) / 8000);
        if (velocity <= MIN_VELOCITY){
          velocity = 0;
        }
        s.scroll -= velocity * direction;
      }

      if (s.scroll > menuScrollMax){
        s.scroll = menuScrollMax;
        velocity = 0;
      }
      if (s.scroll < menuScrollMin){
        s.scroll = menuScrollMin;
        velocity = 0;
      }

      let oldScroll = rScroll;
      rScroll = s.scroll &~1;
      let d = oldScroll-rScroll;

      if (velocity > MIN_VELOCITY)
        scheduledDraw = setTimeout(draw, 0);
      else
        scheduledDraw = undefined;

      if (!d) {
        return;
      }
      g.reset().setClipRect(R.x,R.y,R.x2,R.y2).scroll(0,d);
      if (d < 0) {
        let y = Math.max(R.y2-(1-d), R.y);
        g.setClipRect(R.x,y,R.x2,R.y2);
        let i = YtoIdx(y);

        for (y = idxToY(i);y < R.y2;y+=options.h) {
          options.draw(i, {x:R.x,y:y,w:R.w,h:options.h});
          i++;
        }
      } else { // d>0
        let y = Math.min(R.y+d, R.y2);
        g.setClipRect(R.x,R.y,R.x2,y);
        let i = YtoIdx(y);
        y = idxToY(i);

        for (y = idxToY(i);y > R.y-options.h;y-=options.h) {
          options.draw(i, {x:R.x,y:y,w:R.w,h:options.h});
          i--;
        }
      }
      g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
    };

    const dragHandler = e=>{
      direction = e.dy > 0 ? 1 : -1;
      s.scroll -= e.dy;
      if (e.b > 0){
        // Finger touches the display
        lastTouchedDrag = Date.now();
        if (!lastDragStart){
          lastDragStart = lastTouchedDrag;
          velocity = 0;
          accDy = 0;
        }

        if (accDy * direction < 0 && e.dy * direction > 0){
          // Direction has been reversed, reset accumulated y-values and time of first touch
          lastDragStart = Date.now();
          velocity = 0;
          accDy = 0;
        }

        accDy += e.dy;
      } else {
        // Finger has left the display, only start scrolling kinetically when the last drag event is close enough
        if (Date.now() - lastTouchedDrag < LAST_DRAG_WAIT){
          velocity = direction * accDy / (Date.now() - lastDragStart) * SPEED;
        }
      }

      if (!scheduledDraw){
        scheduledDraw = setTimeout(draw, 0);
      }
    };

    let uiOpts = {
      mode : "custom",
      back : options.back,
      drag : dragHandler,
      touch : touchHandler,
      redraw : uiDraw
    };

    if (options.remove) uiOpts.remove = () => {
      if (scheduledDraw)
        clearTimeout(scheduledDraw);
      options.remove();
    };

    Bangle.setUI(uiOpts);

    function idxToY(i) {
      return i*options.h + R.y - rScroll;
    }

    function YtoIdx(y) {
      return Math.floor((y + rScroll - R.y)/options.h);
    }

    let s = {
      scroll : E.clip(0|options.scroll,menuScrollMin,menuScrollMax),
      draw : () => {
        g.reset().clearRect(R).setClipRect(R.x,R.y,R.x2,R.y2);
        let a = YtoIdx(R.y);
        let b = Math.min(YtoIdx(R.y2),options.c-1);
        for (let i=a;i<=b;i++)
          options.draw(i, {x:R.x,y:idxToY(i),w:R.w,h:options.h});
        g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
      },
      drawItem : i => {
        let y = idxToY(i);
        g.reset().setClipRect(R.x,Math.max(y,R.y),R.x2,Math.min(y+options.h,R.y2));
        options.draw(i, {x:R.x,y:y,w:R.w,h:options.h});
        g.setClipRect(0,0,g.getWidth()-1,g.getHeight()-1);
      },
      isActive : () => Bangle.uiRedraw == uiDraw
    };

    let rScroll = s.scroll&~1; // rendered menu scroll (we only shift by 2 because of dither)
    s.draw(); // draw the full scroller
    g.flip(); // force an update now to make this snappier
    return s;
  };
})();
