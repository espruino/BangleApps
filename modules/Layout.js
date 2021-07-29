if (!g.theme) {
  g.theme = {
    fg:-1,bg:0,fgH:-1,bgH:"#008"
  };
}

function Layout(layout, buttons) {
  this._l = this.l = layout;
  this.b = buttons;
  // Do we have physical buttons?
  this.physBtn = process.env.HWVERSION!=2;
  this.yOffset = Object.keys(global.WIDGETS).length ? 24 : 0;

  if (buttons) {
    var btnHeight = Math.floor((g.getHeight()-this.yOffset) / buttons.length);
    if (this.physBtn) {
      if (Bangle.btnWatch) Bangle.btnWatch.forEach(clearWatch);
      Bangle.btnWatch = [];
      if (buttons[0]) Bangle.btnWatch.push(setWatch(pressHandler.bind(this,0), BTN1, {repeat:true,edge:-1}));
      if (buttons[1]) Bangle.btnWatch.push(setWatch(pressHandler.bind(this,1), BTN2, {repeat:true,edge:-1}));
      if (buttons[2]) Bangle.btnWatch.push(setWatch(pressHandler.bind(this,2), BTN3, {repeat:true,edge:-1}));
      this._l.width = g.getWidth()-8; // text width
      this._l = {type:"h", content: [
        this._l,
        {type:"v", content: buttons.map(b=>(b.type="txt",b.font="6x8",b.height=btnHeight,b.r=1,b))}
      ]};
    } else { // no physical buttons, use touchscreen
      this._l.width = g.getWidth()-20; // button width
      this._l = {type:"h", content: [
        this._l,
        {type:"v", content: buttons.map(b=>(b.type="btn",b.height=btnHeight,b.width=32,b.r=1,b))}
      ]};
      Bangle.touchHandler = (_,e) => touchHandler(this._l,e);
      Bangle.on('touch',Bangle.touchHandler);
    }
  }
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
  if (l.content) l.content.forEach(n => touchHandler(n,e));
}


function updateMin(l) {
  switch (l.type) {
    case "txt": {
      if (l.font.endsWith("%"))
        l.font = "Vector"+Math.round(g.getHeight()*l.font.slice(0,-1)/100);
      g.setFont(l.font);
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
    case "custom": {
      // size should already be set up in width/height
      l._w = 0;
      l._h = 0;
      break;
    }
    case "h": {
      l.content.forEach(updateMin);
      l._h = l.content.reduce((a,b)=>Math.max(a,b._h+(b.pad<<1)),0);
      l._w = l.content.reduce((a,b)=>a+b._w+(b.pad<<1),0);
      l.fill |= l.content.some(c=>c.fill);
      break;
    }
    case "v": {
      l.content.forEach(updateMin);
      l._h = l.content.reduce((a,b)=>a+b._h+(b.pad<<1),0);
      l._w = l.content.reduce((a,b)=>Math.max(a,b._w+(b.pad<<1)),0);
      l.fill |= l.content.some(c=>c.fill);
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
  switch (l.type) {
    case "txt":
      g.setFont(l.font).setFontAlign(0,0,l.r).drawString(l.label, l.x+(l.w>>1), l.y+(l.h>>1));
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
  if (l.content) l.content.forEach(render);
}

Layout.prototype.render = function (l) {
  if (!l) l = this._l;
  render(l);
};

Layout.prototype.layout = function (l) {
  // l = current layout element
  // exw,exh = extra width/height available
  var fill = l.content.reduce((a,l)=>a+(0|l.fill),0);
  switch (l.type) {
    case "h": {
      let x = l.x + (l.w-l._w)/2;
      if (fill) { x = l.x; }
      l.content.forEach(c => {
        c.w = c._w + (c.fill?(l.w-l._w)/fill:0);
        c.h = c.fill ? l.h : c._h;
        c.x = x;
        c.y = l.y + (1+(0|c.valign))*(l.h-c.h)/2;
        x += c.w;
        if (c.pad) {
          x += c.pad*2;
          c.x += c.pad;
          c.y += c.pad;
        }
        if (c.content) {
          this.layout(c);
        }
      });
      break;
    }
    case "v": {
      let y = l.y + (l.h-l._h)/2;
      if (fill) { y = l.y; }
      l.content.forEach(c => {
        c.w = c.fill ? l.w : c._w;
        c.h = c._h + (c.fill?(l.h-l._h)/fill:0);
        c.x = l.x + (1+(0|c.halign))*(l.w-c.w)/2;
        c.y = y;
        y += c.h;
        if (c.pad) {
          y += c.pad*2;
          c.x += c.pad;
          c.y += c.pad;
        }
        if (c.content) this.layout(c);
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
  if (l.content) l.content.forEach(n => this.debug(n,c));
};
Layout.prototype.update = function() {
  var l = this._l;
  var w = g.getWidth();
  var y = this.yOffset;
  var h = g.getHeight()-y;
  // update sizes
  updateMin(l);
  // center
  if (l.fill) {
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
  g.reset().clearRect(l.x,l.y,l.x+l.w-1,l.y+l.h-1);
};

exports = Layout;
