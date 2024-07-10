exports.offset = 0;
exports.hide = function() {
  exports.cleanup();
  if (!global.WIDGETS) return;
  g.reset(); // reset colors
  for (var w of global.WIDGETS) {
    if (w._draw) return; // already hidden
    w._draw = w.draw;
    w.draw = () => {};
    w._area = w.area;
    w.area = "";
    if (w.x!=undefined) g.clearRect(w.x,w.y,w.x+w.width-1,w.y+23);
  }
};

/// Show any hidden widgets
exports.show = function() {
  exports.cleanup();
  if (!global.WIDGETS) return;
  for (var w of global.WIDGETS) {
    if (!w._draw) return; // not hidden
    w.draw = w._draw;
    w.area = w._area;
    delete w._draw;
    delete w._area;
    w.draw(w);
  }
};

/// Remove anything not needed if the overlay was removed
exports.cleanupOverlay = function() {
  exports.offset = -24;
  Bangle.setLCDOverlay(undefined, {id: "widget_utils"});
  delete exports.autohide;
  delete Bangle.appRect;
  if (exports.animInterval) {
    clearInterval(exports.animInterval);
    delete exports.animInterval;
  }
  if (exports.hideTimeout) {
    clearTimeout(exports.hideTimeout);
    delete exports.hideTimeout;
  }
};

/// Remove any intervals/handlers/etc that we might have added. Does NOT re-show widgets that were hidden
exports.cleanup = function() {
  exports.cleanupOverlay();
  delete exports.offset;
  if (exports.swipeHandler) {
    Bangle.removeListener("swipe", exports.swipeHandler);
    delete exports.swipeHandler;
  }
  if (exports.origDraw) {
    Bangle.drawWidgets = exports.origDraw;
    delete exports.origDraw;
  }
};

/** Put widgets offscreen, and allow them to be swiped
back onscreen with a downwards swipe. Use .show to undo.
First parameter controls automatic hiding time, 0 equals not hiding at all.
Default value is 2000ms until hiding.
Bangle.js 2 only at the moment. On Bangle.js 1 widgets will be hidden permanently.

Note: On Bangle.js 1 is is possible to draw widgets in an offscreen area of the LCD
and use Bangle.setLCDOffset. However we can't detect a downward swipe so how to
actually make this work needs some thought.
*/
exports.swipeOn = function(autohide) {
  if (process.env.HWVERSION!==2) return exports.hide();
  exports.cleanup();
  if (!global.WIDGETS) return;
  exports.autohide=autohide===undefined?2000:autohide;
  /* TODO: maybe when widgets are offscreen we don't even
  store them in an offscreen buffer? */

  // force app rect to be fullscreen
  Bangle.appRect = { x: 0, y: 0, w: g.getWidth(), h: g.getHeight(), x2: g.getWidth()-1, y2: g.getHeight()-1 };
  // setup offscreen graphics for widgets
  let og = Graphics.createArrayBuffer(g.getWidth(),26,16,{msb:true});
  og.theme = g.theme;
  og._reset = og.reset;
  og.reset = function() {
    return this._reset().setColor(g.theme.fg).setBgColor(g.theme.bg);
  };
  og.reset().clearRect(0,0,og.getWidth(),23).fillRect(0,24,og.getWidth(),25);
  let _g = g;
  exports.offset = -24; // where on the screen are we? -24=hidden, 0=full visible

  function queueDraw() {
    const o = exports.offset;
    if (o>-24) {
      Bangle.appRect.y = o+24;
      Bangle.appRect.h = 1 + Bangle.appRect.y2 - Bangle.appRect.y;
      if (o>-24) {
        Bangle.setLCDOverlay(og, 0, o, {
          id:"widget_utils",
          remove:()=>{
            require("widget_utils").cleanupOverlay();
          }
        });
      } else {
        Bangle.setLCDOverlay(undefined, {id: "widget_utils"});
      }
    }
  }

  for (var w of global.WIDGETS) if (!w._draw) { // already hidden
    w._draw = w.draw;
    w.draw = function() {
      g=og;
      this._draw(this);
      g=_g;
      if (exports.offset>-24) queueDraw();
    };
    w._area = w.area;
    if (w.area.startsWith("b"))
      w.area = "t"+w.area.substr(1);
  }

  exports.origDraw = Bangle.drawWidgets;
  Bangle.drawWidgets = ()=>{
    g=og;
    exports.origDraw();
    g=_g;
  };

  function anim(dir, callback) {
    if (exports.animInterval) clearInterval(exports.animInterval);
    exports.animInterval = setInterval(function() {
      exports.offset += dir;
      let stop = false;
      if (dir>0 && exports.offset>=0) { // fully down
        stop = true;
        exports.offset = 0;
      } else if (dir<0 && exports.offset<-23) { // fully up
        stop = true;
        exports.offset = -24;
      }
      if (stop) {
        clearInterval(exports.animInterval);
        delete exports.animInterval;
        if (callback) callback();
      }
      queueDraw();
    }, 50);
  }
  // On swipe down, animate to show widgets
  exports.swipeHandler = function(lr,ud) {
    if (exports.hideTimeout) {
      clearTimeout(exports.hideTimeout);
      delete exports.hideTimeout;
    }
    let cb;
    if (exports.autohide > 0) cb = function() {
      exports.hideTimeout = setTimeout(function() {
        anim(-4);
      }, exports.autohide);
    };
    if (ud>0 && exports.offset<0) anim(4, cb);
    if (ud<0 && exports.offset>-24) anim(-4);
  };
  Bangle.on("swipe", exports.swipeHandler);
  Bangle.drawWidgets();
};