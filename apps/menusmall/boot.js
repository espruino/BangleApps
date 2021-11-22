"";//not entirely sure why we need this - related to how bootupdate adds these to .boot0
E.showMenu = function(items) {
  g.clearRect(Bangle.appRect); // clear screen if no menu supplied
  if (!items) {
    Bangle.setUI();
    return;
  }

  var menuItems = Object.keys(items);
  var options = items[""];
  if (options) menuItems.splice(menuItems.indexOf(""),1);
  if (!(options instanceof Object)) options = {};
  options.fontHeight = options.fontHeight|14;
  if (options.selected === undefined)
    options.selected = 0;
  var ar = Bangle.appRect;
  var x = ar.x;
  var x2 = ar.x2;
  var y = ar.y;
  var y2 = ar.y2 - 11; // padding at end for arrow
  if (options.title)
    y += 15;
  var loc = require("locale");
  var l = {
    lastIdx : 0,
    draw : function(rowmin,rowmax) {
      var rows = 0|Math.min((y2-y) / options.fontHeight,menuItems.length);
      var idx = E.clip(options.selected-(rows>>1),0,menuItems.length-rows);
      if (idx!=l.lastIdx) rowmin=undefined; // redraw all if we scrolled
      l.lastIdx = idx;
      var iy = y;
      g.reset().setFontAlign(0,-1,0);
      g.setFontCustom(atob("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"), 32, atob("AwIGCAgICAMFBQYIAwYDBwcFBgYHBgYGBgYDAwYHBgcHBgYGBgYGBgYEBgYGBgYGBgYGBgYGBggGBgYEBwQGBwQGBgYGBgYHBgYGBgYGBgYGBgYGBgYGBgYGBgQCBAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABwAHCAYGBgAGBgYGAAYGBQYABgMGBgQABgYHBgAGBgYGBgYGBgYGBgYGBgYEBAYGBgYGBgYGAAYGBgYGBgYHBgYGBgYGBgYGBgYGBgYGBwcGBgYGBgYABgYGBgYGBg=="), 15);

      if (rowmin===undefined && options.title)
        g.drawString(options.title,(x+x2)/2,y-14).drawLine(x,y-2,x2,y-2).
          setColor(g.theme.fg).setBgColor(g.theme.bg);
      iy += 12;
      g.setColor((idx>0)?g.theme.fg:g.theme.bg).fillPoly([72,iy,104,iy,88,iy-12]);
      if (rowmin!==undefined) {
        if (idx<rowmin) {
          iy += options.fontHeight*(rowmin-idx);
          idx=rowmin;
        }
        if (idx+rows>rowmax) {
          rows = 1+rowmax-rowmin;
        }
      }
      while (rows--) {
        var name = menuItems[idx];
        var item = items[name];
        var hl = (idx==options.selected && !l.selectEdit);
        g.setColor(hl ? g.theme.bgH : g.theme.bg);
        g.fillRect(x,iy,x2,iy+options.fontHeight-1);
        g.setColor(hl ? g.theme.fgH : g.theme.fg);
        g.setFontAlign(-1,-1);
        g.drawString(loc.translate(name),x+1,iy+1);
        if ("object" == typeof item) {
          var xo = x2;
          var v = item.value;
          if (item.format) v=item.format(v);
          v = loc.translate(""+v);
          if (l.selectEdit && idx==options.selected) {
            xo -= 24 + 1;
            g.setColor(g.theme.bgH).fillRect(xo-(g.stringWidth(v)+4),iy,x2,iy+options.fontHeight-1);
            g.setColor(g.theme.fgH).drawImage("\x0c\x05\x81\x00 \x07\x00\xF9\xF0\x0E\x00@",xo,iy+(options.fontHeight-10)/2,{scale:2});
          }
          g.setFontAlign(1,-1);
          g.drawString(v,xo-2,iy+1);
        }
        g.setColor(g.theme.fg);
        iy += options.fontHeight;
        idx++;
      }
      g.setFontAlign(-1,-1);
      g.setColor((idx<menuItems.length)?g.theme.fg:g.theme.bg).fillPoly([72,166,104,166,88,174]);
      g.flip();
    },
    select : function() {
      var item = items[menuItems[options.selected]];
      if ("function" == typeof item) item(l);
      else if ("object" == typeof item) {
        // if a number, go into 'edit mode'
        if ("number" == typeof item.value)
          l.selectEdit = l.selectEdit?undefined:item;
        else { // else just toggle bools
          if ("boolean" == typeof item.value) item.value=!item.value;
          if (item.onchange) item.onchange(item.value);
        }
        l.draw();
      }
    },
    move : function(dir) {
      if (l.selectEdit) {
        var item = l.selectEdit;
        item.value -= (dir||1)*(item.step||1);
        if (item.min!==undefined && item.value<item.min) item.value = item.wrap ? item.max : item.min;
        if (item.max!==undefined && item.value>item.max) item.value = item.wrap ? item.min : item.max;
        if (item.onchange) item.onchange(item.value);
        l.draw(options.selected,options.selected);
      } else {
        var a=options.selected;
        options.selected = (dir+options.selected+menuItems.length)%menuItems.length;
        l.draw(Math.min(a,options.selected), Math.max(a,options.selected));
      }
    }
  };
  l.draw();
  Bangle.setUI("updown",dir => {
    if (dir) l.move(dir);
    else l.select();
  });
  return l;
};
