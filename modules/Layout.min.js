
/*

Usage:

```
var Layout = require("Layout");
var layout = new Layout( layoutObject, btns )
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
  * `"img"` - an image where the function `src` is called to return an image to draw
  * `"custom"` - a custom block where `render(layoutObj)` is called to render
  * `"h"` - Horizontal layout, `c` is an array of more `layoutObject`
  * `"v"` - Veritical layout, `c` is an array of more `layoutObject`
* A `id` field. If specified the object is added with this name to the
  returned `layout` object, so can be referenced as `layout.foo`
* A `font` field, eg `6x8` or `30%` to use a percentage of screen height
* A `col` field, eg `#f00` for red
* A `bgCol` field for background color (will automatically fill on render)
* A `halign` field to set horizontal alignment. `-1`=left, `1`=right, `0`=center
* A `valign` field to set vertical alignment. `-1`=top, `1`=bottom, `0`=center
* A `pad` integer field to set pixels padding
* A `fillx` boolean to choose if the object should fill available space in x
* A `filly` boolean to choose if the object should fill available space in y
* `width` and `height` fields to optionally specify minimum size

btns is an array of objects containing:

* `label` - the text on the button
* `cb` - a callback function
* `cbl` - a callback function for long presses

Once `layout.update()` is called, the following fields are added
to each object:

* `x` and `y` for the top left position
* `w` and `h` for the width and height
* `_w` and `_h` for the **minimum** width and height


Other functions:

* `layout.update()` - update positions of everything if contents have changed
* `layout.debug(obj)` - draw outlines for objects on screen
* `layout.clear(obj)` - clear the given object (you can also just specify `bgCol` to clear before each render)

*/


function Layout(layout, buttons) {
  this._l = this.l = layout;
  this.b = buttons;
  // Do we have >1 physical buttons?
  this.physBtns = (process.env.HWVERSION==2) ? 1 : 3;
  this.yOffset = Object.keys(global.WIDGETS).length ? 24 : 0;

  if (buttons) {    
    if (this.physBtns >= buttons.length) {
      // enough physical buttons
      var btnHeight = Math.floor((g.getHeight()-this.yOffset) / this.physBtns);
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
      var btnHeight = Math.floor((g.getHeight()-this.yOffset) / buttons.length);
      this._l.width = g.getWidth()-20; // button width
      this._l = {type:"h", c: [
        this._l,
        {type:"v", c: buttons.map(b=>(b.type="btn",b.h=btnHeight,b.w=32,b.r=1,b))}
      ]};
    }
  }
  if (process.env.HWVERSION==2) {
    Bangle.touchHandler = (_,e) => touchHandler(layout,e);
    Bangle.on('touch',Bangle.touchHandler);    
  }
  
  // add IDs
  var ll = this;
  function idRecurser(l) {
    if (l.id) ll[l.id] = l;
    if (l.c) l.c.forEach(idRecurser);
  }
  idRecurser(layout);
  this.update();
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

// Handler for button watch events
function pressHandler(btn,e) {
  if (e.time-e.lastTime > 0.75 && this.b[btn].cbl)
    this.b[btn].cbl(e);
  else
    if (this.b[btn].cb) this.b[btn].cb(e);
}

// Handler for touch events
function touchHandler(l,e) {
  if (l.type=="btn" && l.cb && e.x>=l.x && e.y>=l.y && e.x<=l.x+l.w && e.y<=l.y+l.h)
    l.cb(e);
  if (l.c) l.c.forEach(n => touchHandler(n,e));
}


function updateMin(l) {
  switch (l.type) {
    case "txt": {
      if (l.font.endsWith("%"))
        l.font = "Vector"+Math.round(g.getHeight()*l.font.slice(0,-1)/100);
      // FIXME ':'/fsz not needed in new firmwares - it's handled internally
      if (l.font.includes(":")) {
        var f = l.font.split(":");
        l.font = f[0];
        l.fsz = f[1];
      }
      g.setFont(l.font,l.fsz);
      l._h = g.getFontHeight();
      l._w = g.stringWidth(l.label);
      break;
    }
    case "btn": {
      l._h = 24;
      l._w = 14 + l.label.length*8;
      break;
    }
    case "img": {
      var im = E.toString(l.src());
      l._h = im.charCodeAt(0);
      l._w = im.charCodeAt(1);
      break;
    }
    case undefined:
    case "custom": {
      // size should already be set up in width/height
      l._w = 0;
      l._h = 0;
      break;
    }
    case "h": {
      l.c.forEach(updateMin);
      l._h = l.c.reduce((a,b)=>Math.max(a,b._h+(b.pad<<1)),0);
      l._w = l.c.reduce((a,b)=>a+b._w+(b.pad<<1),0);
      l.fillx |= l.c.some(c=>c.fillx);
      break;
    }
    case "v": {
      l.c.forEach(updateMin);
      l._h = l.c.reduce((a,b)=>a+b._h+(b.pad<<1),0);
      l._w = l.c.reduce((a,b)=>Math.max(a,b._w+(b.pad<<1)),0);
      l.filly |= l.c.some(c=>c.filly);
      break;
    }
    default: throw "Unknown item type "+l.type;
  }
  if (l.r&1) { // rotation
    var t = l._w;l._w=l._h;l._h=t;
  }
  l._w = Math.max(l._w, 0|l.width);
  l._h = Math.max(l._h, 0|l.height);
}
function render(l) {
  if (!l) l = this.l;
  g.reset();
  if (l.col) g.setColor(l.col);
  if (l.bgCol!==undefined) g.setBgColor(l.bgCol).clearRect(l.x,l.y,l.x+l.w,l.y+l.h);
  switch (l.type) {
    case "txt":
      g.setFont(l.font,l.fsz).setFontAlign(0,0,l.r).drawString(l.label, l.x+(l.w>>1), l.y+(l.h>>1), true/*solid bg*/);
      break;
    case "btn":
      var poly = [
        l.x,l.y+4,
        l.x+4,l.y,
        l.x+l.w-5,l.y,
        l.x+l.w-1,l.y+4,
        l.x+l.w-1,l.y+l.h-5,
        l.x+l.w-5,l.y+l.h-1,
        l.x+4,l.y+l.h-1,
        l.x,l.y+l.h-5,
        l.x,l.y+4
      ];
    g.setColor(g.theme.bgH).fillPoly(poly).setColor(l.selected ? g.theme.fgH : g.theme.fg).drawPoly(poly).setFont("4x6",2).setFontAlign(0,0,l.r).drawString(l.label,l.x+l.w/2,l.y+l.h/2);
      break;
  case "img":
    g.drawImage(l.src(), l.x, l.y);
    break;
  case "custom":
    l.render(l);
    break;
  }
  if (l.c) l.c.forEach(render);
}

Layout.prototype.render = function (l) {
  if (!l) l = this._l;
  render(l);
};

Layout.prototype.layout = function (l) {
  // l = current layout element
  // exw,exh = extra width/height available
  var fillx = l.c && l.c.reduce((a,l)=>a+(0|l.fillx),0);
  var filly = l.c && l.c.reduce((a,l)=>a+(0|l.filly),0);
  switch (l.type) {
    case "h": {
      let x = l.x + (l.w-l._w)/2;
      if (fillx) { x = l.x; }
      l.c.forEach(c => {
        c.w = c._w + (c.fillx?(l.w-l._w)/fillx:0);
        c.h = c.filly ? l.h : c._h;
        c.x = x;
        c.y = l.y + (1+(0|c.valign))*(l.h-c.h)/2;
        x += c.w;
        if (c.pad) {
          x += c.pad*2;
          c.w += c.pad*2;
          c.h += c.pad*2;
        }
        if (c.c) {
          this.layout(c);
        }
      });
      break;
    }
    case "v": {
      let y = l.y + (l.h-l._h)/2;
      if (filly) { y = l.y; }
      l.c.forEach(c => {
        c.w = c.fillx ? l.w : c._w;
        c.h = c._h + (c.filly?(l.h-l._h)/filly:0);
        c.x = l.x + (1+(0|c.halign))*(l.w-c.w)/2;
        c.y = y;
        y += c.h;
        if (c.pad) {
          y += c.pad*2;
          c.w += c.pad*2;
          c.h += c.pad*2;
        }
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
  c++;
  if (l.c) l.c.forEach(n => this.debug(n,c));
};
Layout.prototype.update = function() {
  var l = this._l;
  var w = g.getWidth();
  var y = this.yOffset;
  var h = g.getHeight()-y;
  // update sizes
  updateMin(l);
  // center
  if (l.fillx || l.filly) {
    l.w = w;
    l.h = h;
    l.x = 0;
    l.y = y;
  } else {
    l.w = l._w;
    l.h = l._h;
    l.x = (w-l.w)/2;
    l.y = y+(h-l.h)/2;
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
