E.showMenu = function(items) {
  g.clearRect(Bangle.appRect); // clear screen if no menu supplied
  if (!items) {
    Bangle.setUI();
    return;
  }

  var B2 = process.env.HWVERSION===2,
    loc = require("locale"),
    menuItems = Object.keys(items),
    options = items[""];
  if (options) menuItems.splice(menuItems.indexOf(""),1);
  if (!(options instanceof Object)) options = {};

  // show "< Back" item (or similar) as button instead (i.e. remove from the menu)
  var back,backLbl;
  for (var b of ['Back', 'Exit', 'Cancel']) {
    if (!items[b] && items['< '+b]) b = '< '+b;
    back = items[b];
    if (typeof back === "function") {
      backLbl = loc.translate(b);
      menuItems.splice(menuItems.indexOf(b),1);
      break;
    }
    else back = undefined;
  }
  // font sizes
  var small = B2?15:22,
      large = B2?30:45;
  if (options.selected === undefined) options.selected = 0;
  var ar = Bangle.appRect,
    x = ar.x,
    x2 = ar.x2,
    w = ar.w,
    y = ar.y,
    y2 = ar.y2;
  if (options.title) y += 22;
  var wrap = menuItems.length>3; // don't wrap if all items are always in view anyway

  var vc=Math.round((y+y2)/2),   // vertical center
   hc = Math.round((x+x2)/2), // horizontal center
   ih = large+small*2; // active item height

  var getItem = idx => {
    // we wrap out-of-range indexes
    while (idx<0) idx+=menuItems.length;
    idx = idx%menuItems.length;
    var name = menuItems[idx];
    var item = items[name];
    var v;
    if ("object"== typeof item) {
      v = item.value;
      if (item.format) v = item.format(v);
      v = loc.translate(""+v);
    }
    return {lbl: loc.translate(name), v: v};
  };
  var l = {
    lastIdx : null, // we want a complete redraw on first run
    draw : function() {
      var idx = options.selected,
         edit = l.selectEdit;
      g.reset();

      // don't highlight whole item when editing
      g.setColor(edit?g.theme.fg:g.theme.fgH)
       .setBgColor(edit?g.theme.bg:g.theme.bgH)
       .setFont('Vector', large);
      var item = getItem(idx),
       lw = g.stringWidth(item.lbl)+2;
      if (lw+2 >= w) { // label width doesn't fit at large size: scale it down
        g.setFont('Vector', Math.floor(large*ar.w/lw));
      }
      g.clearRect(x,vc-ih/2,x2,vc+ih/2)
       .setFontAlign(0,0,0).drawString(item.lbl,hc,vc);

      if (item.v !== undefined) {
        g.setColor(g.theme.fgH).setBgColor(g.theme.bgH) // always highlighted: either as part of item, or while editing
         .setFontAlign(0,1,0)
         .setFont('Vector', small)
         .clearRect(x,vc+ih/2-small-2,x2,vc+ih/2)
         .drawString(item.v,hc,vc+ih/2-1);
        if (edit) {
          g.drawImage("\x0c\x05\x81\x00 \x07\x00\xF9\xF0\x0E\x00@",x2-23,vc+ih/2-small+(B2?1:5),{scale:2});
        }
      }
      if (l.lastIdx !== idx) {
        // we scrolled: redraw all
        l.lastIdx=idx;
        g.reset();

        if (options.title) {
          if (B2) g.setFont('12x20');
          else g.setFont('6x8',2);
          g.drawLine(x, y-2, x2, y-2)
            .setFontAlign(0,1,0)
            .drawString(options.title, (x+x2)/2, y-2);
        }

        // clear prev/next items area
        g.clearRect(x,y,x2,vc-ih/2-1)
         .clearRect(x,vc+ih/2+1,x2,y2);

        // get display label by index
        var lbl = idx => {
          var item = getItem(idx);
          if (item.v !== undefined) item.lbl+=': '+item.v;
          return item.lbl;
        }
        // previous two items
        g.setFontAlign(0, 1)
        if (wrap||idx>0) g.setFont('Vector', small).drawString(lbl(idx-1), hc, vc-ih/2-5);
        if (wrap||idx>1) g.setFont('Vector', small/2).drawString(lbl(idx-2), hc, vc-ih/2-small-10);
        // next two items
        g.setFontAlign(0, -1);
        if (wrap||idx<menuItems.length-1) g.setFont('Vector', small).drawString(lbl(idx+1), hc, vc+ih/2+5);
        if (wrap||idx<menuItems.length-2) g.setFont('Vector', small/2).drawString(lbl(idx+2), hc, vc+ih/2+small+10);

        if (wrap) {
          // draw divider between first/last items
          var div = y => g.drawLine(x, y, x2, y);
          if (idx===0) div(vc-ih/2-1);
          if (idx===1) div(vc-ih/2-small-8);
          // if (s === 2) div(vc-ih/2-small*1.5-13);
          if (idx===menuItems.length-1) div(vc+ih/2+1);
          if (idx===menuItems.length-2) div(vc+ih/2+small+6);
          // if (s === 2) div(vc+ih/2+small*1.5+13);
        }

        if (back) {
          g.setBgColor(g.theme.bg2)
            .setFont('Vector', small);
          var bw=g.stringWidth(backLbl);
          g.clearRect(x,y, x+bw+2, y+small+2);
          var bx1=x, by1=y, bx2=x+bw+2, by2=y+small+2;
          // g.drawRect(x,y, x+bw+2, y+small+2);
          var poly = [ // button outline
            bx1+2,by1,
            bx2-2,by1,
            bx2,  by1+2,
            bx2,  by2-2,
            bx2-2,by2,
            bx1+2,by2,
            bx1,  by2-2,
            bx1,  by1+2,
          ]
          g.setColor(g.theme.bg2).fillPoly(poly, true)
           .setColor(g.theme.fg2).drawPoly(poly, true)
           .setFontAlign(-1,-1,0).drawString(backLbl, x+2,y+2);
        }
      }
      g.flip();
    },
    select : function() { // same as default menu
      var item = items[menuItems[options.selected]];
      if ("function" == typeof item) {l.lastIdx=null; item(l);} // force a redraw after callback
      else if ("object" == typeof item) {
        // if a number, go into 'edit mode'
        if ("number" == typeof item.value)
          l.selectEdit = l.selectEdit?undefined:item;
        else { // else just toggle bools
          if ("boolean" == typeof item.value) item.value=!item.value;
          if (item.onchange) {l.lastIdx=null; item.onchange(item.value);} // force a redraw after callback
        }
        l.draw();
      }
    },
    move : function(dir) {
      if (l.selectEdit) { // same as default menu
        var item = l.selectEdit;
        item.value -= (dir||1)*(item.step||1);
        if (item.min!==undefined && item.value<item.min) item.value = item.wrap ? item.max : item.min;
        if (item.max!==undefined && item.value>item.max) item.value = item.wrap ? item.min : item.max;
        if (item.onchange) {l.lastIdx=null; item.onchange(item.value);} // force a redraw after callback
      } else {
        if (B2) dir=-dir; // swipe vs button scrolling
        if (!wrap && (options.selected+dir<0 || options.selected+dir>=menuItems.length)) {
          return;
        }
        options.selected = (options.selected+dir+menuItems.length)%menuItems.length;
      }
      l.draw();
    }
  };
  l.draw();
  Bangle.setUI("updown",dir => {
    if (dir) l.move(dir);
    else l.select();
  });
  if (back) {
    // we have a back button: check touches before passing them to setUI's touchHandler
    if (B2) {
      Bangle.removeListener('touch', Bangle.touchHandler);
      Bangle.backHandler = (b, xy) => {
        // anywhere top-left (but above the active item) = back button
        if (xy.x<hc && xy.y<vc-ih/2) back();
        else Bangle.touchHandler(b, xy);
      }
    } else {
      // Bangle.js 1 has no touchHandler
      Bangle.backHandler = (b) => {
        // left side = back button
        if (b===1) back();
      }
    }
    Bangle.on('touch', Bangle.backHandler);
  }
  return l;
};
// setUI now also needs to clear up our back button touch handler
Bangle.setUI = (old => function() {
  if (Bangle.backHandler) Bangle.removeListener("touch", Bangle.backHandler);
  delete Bangle.backHandler;
  return old.apply(this, arguments);
})(Bangle.setUI);