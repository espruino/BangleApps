/* Copyright (c) 2022 Bangle.js contibutors. See the file LICENSE for copying permission. */
/*

Take a look at README.md for hints on developing with this library.

Usage:

```
var Layout = require("Layout");
var layout = new Layout( layoutObject, options )
layout.render(optionalObject);
```

For example:

```
var Layout = require("Layout");
var layout = new Layout( {
  type:"v", c: [
    {type:"txt", font:"20%", label:"12:00" },
    {type:"txt", font:"6x8", label:"The Date" }
  ]
});
g.clear();
layout.render();
```


layoutObject has:

* A `type` field of:
  * `undefined` - blank, can be used for padding
  * `"txt"` - a text label, with value `label` and `r` for text rotation. 'font' is required
  * `"btn"` - a button, with value `label` and callback `cb`
       optional `src` specifies an image (like img) in which case label is ignored
  * `"img"` - an image where `src` is an image, or a function which is called to return an image to draw.
       optional `scale` specifies if image should be scaled up or not
  * `"custom"` - a custom block where `render(layoutObj)` is called to render
  * `"h"` - Horizontal layout, `c` is an array of more `layoutObject`
  * `"v"` - Vertical layout, `c` is an array of more `layoutObject`
* A `id` field. If specified the object is added with this name to the
  returned `layout` object, so can be referenced as `layout.foo`
* A `font` field, eg `6x8` or `30%` to use a percentage of screen height
* A `wrap` field to enable line wrapping. Requires some combination of `width`/`height`
  and `fillx`/`filly` to be set. Not compatible with text rotation.
* A `col` field, eg `#f00` for red
* A `bgCol` field for background color (will automatically fill on render)
* A `halign` field to set horizontal alignment WITHIN a `v` container. `-1`=left, `1`=right, `0`=center
* A `valign` field to set vertical alignment WITHIN a `h` container. `-1`=top, `1`=bottom, `0`=center
* A `pad` integer field to set pixels padding
* A `fillx` int to choose if the object should fill available space in x. 0=no, 1=yes, 2=2x more space
* A `filly` int to choose if the object should fill available space in y. 0=no, 1=yes, 2=2x more space
* `width` and `height` fields to optionally specify minimum size

options is an object containing:

* `lazy` - a boolean specifying whether to enable automatic lazy rendering
* `btns` - array of objects containing:
  * `label` - the text on the button
  * `cb` - a callback function
  * `cbl` - a callback function for long presses

If automatic lazy rendering is enabled, calls to `layout.render()` will attempt to automatically
determine what objects have changed or moved, clear their previous locations, and re-render just those objects.

Once `layout.update()` is called, the following fields are added
to each object:

* `x` and `y` for the top left position
* `w` and `h` for the width and height
* `_w` and `_h` for the **minimum** width and height


Other functions:

* `layout.update()` - update positions of everything if contents have changed
* `layout.debug(obj)` - draw outlines for objects on screen
* `layout.clear(obj)` - clear the given object (you can also just specify `bgCol` to clear before each render)
* `layout.forgetLazyState()` - if lazy rendering is enabled, makes the next call to `render()` perform a full re-render

*/


function Layout(layout, options) {
  this._l = this.l = layout;
  // Do we have >1 physical buttons?
  this.physBtns = (process.env.HWVERSION==2) ? 1 : 3;

  options = options || {};
  this.lazy = options.lazy || false;

  var btnList;
  Bangle.setUI(); // remove all existing input handlers
  if (process.env.HWVERSION!=2) {
    // no touchscreen, find any buttons in 'layout'
    btnList = [];
    function btnRecurser(l) {
      if (l.type=="btn") btnList.push(l);
      if (l.c) l.c.forEach(btnRecurser);
    }
    btnRecurser(layout);
    if (btnList.length) { // there are buttons in 'layout'
      // disable physical buttons - use them for back/next/select
      this.physBtns = 0;
      this.buttons = btnList;
      this.selectedButton = -1;
      Bangle.setUI("updown", dir=>{
        var s = this.selectedButton, l=this.buttons.length;
        if (dir===undefined && this.buttons[s])
          return this.buttons[s].cb();
        if (this.buttons[s]) {
          delete this.buttons[s].selected;
          this.render(this.buttons[s]);
        }
        s = (s+l+dir) % l;
        if (this.buttons[s]) {
          this.buttons[s].selected = 1;
          this.render(this.buttons[s]);
        }
        this.selectedButton = s;
      });
    }
  }

  if (options.btns) {
    var buttons = options.btns;
    this.b = buttons;
    if (this.physBtns >= buttons.length) {
      // Handler for button watch events
      function pressHandler(btn,e) {
        if (e.time-e.lastTime > 0.75 && this.b[btn].cbl)
          this.b[btn].cbl(e);
        else
          if (this.b[btn].cb) this.b[btn].cb(e);
      }
      // enough physical buttons
      let btnHeight = Math.floor(Bangle.appRect.h / this.physBtns);
      if (Bangle.btnWatch) Bangle.btnWatch.forEach(clearWatch);
      Bangle.btnWatch = [];
      if (this.physBtns > 2 && buttons.length==1)
        buttons.unshift({label:""}); // pad so if we have a button in the middle
      while (this.physBtns > buttons.length)
        buttons.push({label:""});
      if (buttons[0]) Bangle.btnWatch.push(setWatch(pressHandler.bind(this,0), BTN1, {repeat:true,edge:-1}));
      if (buttons[1]) Bangle.btnWatch.push(setWatch(pressHandler.bind(this,1), BTN2, {repeat:true,edge:-1}));
      if (buttons[2]) Bangle.btnWatch.push(setWatch(pressHandler.bind(this,2), BTN3, {repeat:true,edge:-1}));
      this._l.width = g.getWidth()-8; // text width
      this._l = {type:"h", filly:1, c: [
        this._l,
        {type:"v", pad:1, filly:1, c: buttons.map(b=>(b.type="txt",b.font="6x8",b.height=btnHeight,b.r=1,b))}
      ]};
    } else {
      // add 'soft' buttons
      this._l.width = g.getWidth()-32; // button width
      this._l = {type:"h", c: [
        this._l,
        {type:"v", c: buttons.map(b=>(b.type="btn",b.filly=1,b.width=32,b.r=1,b))}
      ]};
      // if we're selecting with physical buttons, add these to the list
      if (btnList) btnList.push.apply(btnList, this._l.c[1].c);
    }
  }
  if (process.env.HWVERSION==2) {

    // Handler for touch events
    function touchHandler(l,e) {
      if (l.cb && e.x>=l.x && e.y>=l.y && e.x<=l.x+l.w && e.y<=l.y+l.h) {
        if (e.type==2 && l.cbl) l.cbl(e); else if (l.cb) l.cb(e);
      }
      if (l.c) l.c.forEach(n => touchHandler(n,e));
    }
    Bangle.touchHandler = (_,e)=>touchHandler(this._l,e);
    Bangle.on('touch',Bangle.touchHandler);
  }

  // recurse over layout doing some fixing up if needed
  var ll = this;
  function recurser(l) {
    // add IDs
    if (l.id) ll[l.id] = l;
    // fix type up
    if (!l.type) l.type="";
    // FIXME ':'/fsz not needed in new firmwares - Font:12 is handled internally
    // fix fonts for pre-2v11 firmware
    if (l.font && l.font.includes(":")) {
      var f = l.font.split(":");
      l.font = f[0];
      l.fsz = f[1];
    }
    if (l.c) l.c.forEach(recurser);
  }
  recurser(this._l);
  this.updateNeeded = true;
}

Layout.prototype.remove = function (l) {
  if (Bangle.btnWatch) {
    Bangle.btnWatch.forEach(clearWatch);
    delete Bangle.btnWatch;
  }
  if (Bangle.touchHandler) {
    Bangle.removeListener("touch",Bangle.touchHandler);
    delete Bangle.touchHandler;
  }
};

function prepareLazyRender(l, rectsToClear, drawList, rects, parentBg) {
  var bgCol = l.bgCol == null ? parentBg : g.toColor(l.bgCol);
  if (bgCol != parentBg || l.type == "txt" || l.type == "btn" || l.type == "img" || l.type == "custom") {
    // Hash the layoutObject without including its children
    var c = l.c;
    delete l.c;
    var hash = "H"+E.CRC32(E.toJS(l)); // String keys maintain insertion order
    if (c) l.c = c;

    if (!delete rectsToClear[hash]) {
      var r = rects[hash] = [l.x,l.y,l.x+l.w-1,l.y+l.h-1];
      r.bg = parentBg == null ? g.theme.bg : parentBg;
      if (drawList) {
        drawList.push(l);
        drawList = null; // Prevent children from being redundantly added to the drawList
      }
    }
  }

  if (l.c) for (var ch of l.c) prepareLazyRender(ch, rectsToClear, drawList, rects, bgCol);
}

Layout.prototype.render = function (l) {
  if (!l) l = this._l;
  if (this.updateNeeded) this.update();

  function render(l) {"ram"
    g.reset();
    if (l.col) g.setColor(l.col);
    if (l.bgCol!==undefined) g.setBgColor(l.bgCol).clearRect(l.x,l.y,l.x+l.w-1,l.y+l.h-1);
    cb[l.type](l);
  }

  var cb = {
    "":function(){},
    "txt":function(l){
      if (l.wrap) {
        g.setFont(l.font,l.fsz).setFontAlign(0,-1);
        var lines = g.wrapString(l.label, l.w);
        var y = l.y+((l.h-g.getFontHeight()*lines.length)>>1);
        //  TODO: on 2v11 we can just render in a single drawString call
        lines.forEach((line, i) => g.drawString(line, l.x+(l.w>>1), y+g.getFontHeight()*i));
      } else {
        g.setFont(l.font,l.fsz).setFontAlign(0,0,l.r).drawString(l.label, l.x+(l.w>>1), l.y+(l.h>>1));
      }
    }, "btn":function(l){
      var x = l.x+(0|l.pad), y = l.y+(0|l.pad),
          w = l.w-(l.pad<<1), h = l.h-(l.pad<<1);
      var poly = [
        x,y+4,
        x+4,y,
        x+w-5,y,
        x+w-1,y+4,
        x+w-1,y+h-5,
        x+w-5,y+h-1,
        x+4,y+h-1,
        x,y+h-5,
        x,y+4
      ], bg = l.selected?g.theme.bgH:g.theme.bg2;
    g.setColor(bg).fillPoly(poly).setColor(l.selected ? g.theme.fgH : g.theme.fg2).drawPoly(poly);
    if (l.col) g.setColor(l.col);
    if (l.src) g.setBgColor(bg).drawImage("function"==typeof l.src?l.src():l.src, l.x + 10 + (0|l.pad), l.y + 8 + (0|l.pad));
    else g.setFont("6x8",2).setFontAlign(0,0,l.r).drawString(l.label,l.x+l.w/2,l.y+l.h/2);
  }, "img":function(l){
    g.drawImage("function"==typeof l.src?l.src():l.src, l.x + (0|l.pad), l.y + (0|l.pad), l.scale?{scale:l.scale}:undefined);
  }, "custom":function(l){
    l.render(l);
  },"h":function(l) { l.c.forEach(render); },
    "v":function(l) { l.c.forEach(render); }
  };

  if (this.lazy) {
    // we have to use 'var' here not 'let', otherwise the minifier
    // renames vars to the same name, which causes problems as Espruino
    // doesn't yet honour the scoping of 'let'
    if (!this.rects) this.rects = {};
    var rectsToClear = this.rects.clone();
    var drawList = [];
    prepareLazyRender(l, rectsToClear, drawList, this.rects, null);
    for (var h in rectsToClear) delete this.rects[h];
    var clearList = Object.keys(rectsToClear).map(k=>rectsToClear[k]).reverse(); // Rects are cleared in reverse order so that the original bg color is restored
    for (var r of clearList) g.setBgColor(r.bg).clearRect.apply(g, r);
    drawList.forEach(render);
  } else { // non-lazy
    render(l);
  }
};

Layout.prototype.forgetLazyState = function () {
  this.rects = {};
}

Layout.prototype.layout = function (l) {
  // l = current layout element
  // exw,exh = extra width/height available
  switch (l.type) {
    case "h": {
      var acc_w = l.x + (0|l.pad);
      var accfillx = 0;
      var fillx = l.c && l.c.reduce((a,l)=>a+(0|l.fillx),0);
      if (!fillx) { acc_w += (l.w-l._w)>>1; fillx=1; }
      var x = acc_w;
      l.c.forEach(c => {
        c.x = 0|x;
        acc_w += c._w;
        accfillx += 0|c.fillx;
        x = acc_w + Math.floor(accfillx*(l.w-l._w)/fillx);
        c.w = 0|(x - c.x);
        c.h = 0|(c.filly ? l.h - (l.pad<<1) : c._h);
        c.y = 0|(l.y + (0|l.pad) + ((1+(0|c.valign))*(l.h-(l.pad<<1)-c.h)>>1));
        if (c.c) this.layout(c);
      });
      break;
    }
    case "v": {
      var acc_h = l.y + (0|l.pad);
      var accfilly = 0;
      var filly = l.c && l.c.reduce((a,l)=>a+(0|l.filly),0);
      if (!filly) { acc_h += (l.h-l._h)>>1; filly=1; }
      var y = acc_h;
      l.c.forEach(c => {
        c.y = 0|y;
        acc_h += c._h;
        accfilly += 0|c.filly;
        y = acc_h + Math.floor(accfilly*(l.h-l._h)/filly);
        c.h = 0|(y - c.y);
        c.w = 0|(c.fillx ? l.w - (l.pad<<1) : c._w);
        c.x = 0|(l.x + (0|l.pad) + ((1+(0|c.halign))*(l.w-(l.pad<<1)-c.w)>>1));
        if (c.c) this.layout(c);
      });
      break;
    }
  }
};
Layout.prototype.debug = function(l,c) {
  if (!l) l = this._l;
  c=c||1;
  g.setColor(c&1,c&2,c&4).drawRect(l.x+c-1, l.y+c-1, l.x+l.w-c, l.y+l.h-c);
  if (l.pad)
    g.drawRect(l.x+l.pad-1, l.y+l.pad-1, l.x+l.w-l.pad, l.y+l.h-l.pad);
  c++;
  if (l.c) l.c.forEach(n => this.debug(n,c));
};
Layout.prototype.update = function() {
  delete this.updateNeeded;
  // update sizes
  function updateMin(l) {"ram"
    cb[l.type](l);
    if (l.r&1) { // rotation
      var t = l._w;l._w=l._h;l._h=t;
    }
    l._w = 0|Math.max(l._w + (l.pad<<1), 0|l.width);
    l._h = 0|Math.max(l._h + (l.pad<<1), 0|l.height);
  }
  var cb = {
    "txt" : function(l) {
      if (l.font.endsWith("%"))
        l.font = "Vector"+Math.round(g.getHeight()*l.font.slice(0,-1)/100);
      if (l.wrap) {
        l._h = l._w = 0;
      } else {
        var m = g.setFont(l.font,l.fsz).stringMetrics(l.label);
        l._w = m.width; l._h = m.height;
      }
    }, "btn": function(l) {
      var m = l.src?g.imageMetrics("function"==typeof l.src?l.src():l.src):g.setFont("6x8",2).stringMetrics(l.label);
      l._h = 16 + m.height;
      l._w = 20 + m.width;
    }, "img": function(l) {
      var m = g.imageMetrics("function"==typeof l.src?l.src():l.src), s=l.scale||1; // get width and height out of image
      l._w = m.width*s;
      l._h = m.height*s;
    }, "": function(l) {
      // size should already be set up in width/height
      l._w = 0;
      l._h = 0;
    }, "custom": function(l) {
      // size should already be set up in width/height
      l._w = 0;
      l._h = 0;
    }, "h": function(l) {
      l.c.forEach(updateMin);
      l._h = l.c.reduce((a,b)=>Math.max(a,b._h),0);
      l._w = l.c.reduce((a,b)=>a+b._w,0);
      if (l.fillx == null && l.c.some(c=>c.fillx)) l.fillx = 1;
      if (l.filly == null && l.c.some(c=>c.filly)) l.filly = 1;
    }, "v": function(l) {
      l.c.forEach(updateMin);
      l._h = l.c.reduce((a,b)=>a+b._h,0);
      l._w = l.c.reduce((a,b)=>Math.max(a,b._w),0);
      if (l.fillx == null && l.c.some(c=>c.fillx)) l.fillx = 1;
      if (l.filly == null && l.c.some(c=>c.filly)) l.filly = 1;
    }
  };

  var l = this._l;
  updateMin(l);
  if (l.fillx || l.filly) { // fill all
    l.w = Bangle.appRect.w;
    l.h = Bangle.appRect.h;
    l.x = Bangle.appRect.x;
    l.y = Bangle.appRect.y;
  } else { // or center
    l.w = l._w;
    l.h = l._h;
    l.x = (Bangle.appRect.w-l.w)>>1;
    l.y = Bangle.appRect.y+((Bangle.appRect.h-l.h)>>1);
  }
  // layout children
  this.layout(l);
};

Layout.prototype.clear = function(l) {
  if (!l) l = this._l;
  g.reset();
  if (l.bgCol!==undefined) g.setBgColor(l.bgCol);
  g.clearRect(l.x,l.y,l.x+l.w-1,l.y+l.h-1);
};

exports = Layout;
