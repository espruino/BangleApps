  let Layout = require('Layout');

  let Caret = require("heatshrink").decompress(atob("hEUgMAsFgmEwjEYhkMg0GAYIHBBYIPBgAA=="));

  let ScreenWidth  = g.getWidth(),  CenterX;
  let ScreenHeight = g.getHeight(), CenterY, outerRadius;

  Bangle.setUI('clock');
  Bangle.loadWidgets();

/**** updateClockFaceSize ****/

  function updateClockFaceSize () {
    CenterX = ScreenWidth/2;
    CenterY = ScreenHeight/2;

    outerRadius = Math.min(CenterX,CenterY);

    if (global.WIDGETS == null) { return; }

    let WidgetLayouts = {
      tl:{ x:0,             y:0,               Direction:0 },
      tr:{ x:ScreenWidth-1, y:0,               Direction:1 },
      bl:{ x:0,             y:ScreenHeight-24, Direction:0 },
      br:{ x:ScreenWidth-1, y:ScreenHeight-24, Direction:1 }
    };

    for (let Widget of WIDGETS) {
      let WidgetLayout = WidgetLayouts[Widget.area];     // reference, not copy!
      if (WidgetLayout == null) { continue; }

      Widget.x = WidgetLayout.x - WidgetLayout.Direction * Widget.width;
      Widget.y = WidgetLayout.y;

      WidgetLayout.x += Widget.width * (1-2*WidgetLayout.Direction);
    }

    let x,y, dx,dy;
    let cx = CenterX, cy = CenterY, r = outerRadius, r2 = r*r;

    x = WidgetLayouts.tl.x; y = WidgetLayouts.tl.y+24; dx = x - cx; dy = y - cy;
    if (dx*dx + dy*dy < r2) {
      cy = CenterY + 12; dy = y - cy; r2 = dx*dx + dy*dy; r = Math.min(Math.sqrt(r2),cy-24);
    }

    x = WidgetLayouts.tr.x; y = WidgetLayouts.tr.y+24; dx = x - cx; dy = y - cy;
    if (dx*dx + dy*dy < r2) {
      cy = CenterY + 12; dy = y - cy; r2 = dx*dx + dy*dy; r = Math.min(Math.sqrt(r2),cy-24);
    }

    x = WidgetLayouts.bl.x; y = WidgetLayouts.bl.y; dx = x - cx; dy = y - cy;
    if (dx*dx + dy*dy < r2) {
      cy = CenterY - 12; dy = y - cy; r2 = dx*dx + dy*dy; r = Math.min(Math.sqrt(r2),cy);
    }

    x = WidgetLayouts.br.x; y = WidgetLayouts.br.y; dx = x - cx; dy = y - cy;
    if (dx*dx + dy*dy < r2) {
      cy = CenterY - 12; dy = y - cy; r2 = dx*dx + dy*dy; r = Math.min(Math.sqrt(r2),cy);
    }

    CenterX = cx; CenterY = cy; outerRadius = r - 4;
  }

  updateClockFaceSize();

/**** custom version of Bangle.drawWidgets (does not clear the widget areas) ****/

  Bangle.drawWidgets = function () {
    var w = g.getWidth(), h = g.getHeight();

    var pos = {
      tl:{x:0,   y:0,    r:0, c:0}, // if r==1, we're right->left
      tr:{x:w-1, y:0,    r:1, c:0},
      bl:{x:0,   y:h-24, r:0, c:0},
      br:{x:w-1, y:h-24, r:1, c:0}
    };

    if (global.WIDGETS) {
      for (var wd of WIDGETS) {
        var p = pos[wd.area];
        if (!p) continue;

        wd.x = p.x - p.r*wd.width;
        wd.y = p.y;

        p.x += wd.width*(1-2*p.r);
        p.c++;
      }

      g.reset();                                 // also loads the current theme

      if (pos.tl.c || pos.tr.c) {
        g.setClipRect(0,h-24,w-1,h-1);
        g.reset();                           // also (re)loads the current theme
      }

      if (pos.bl.c || pos.br.c) {
        g.setClipRect(0,h-24,w-1,h-1);
        g.reset();                           // also (re)loads the current theme
      }

      try {
        for (wd of WIDGETS) {
          g.clearRect(wd.x,wd.y, wd.x+wd.width-1,23);
          wd.draw(wd);
        }
      } catch (e) { print(e); }
    }
  };

/**** EventConsumerAtPoint ****/

  let activeLayout;

  function EventConsumerAtPoint (HandlerName, x,y) {
    let Layout = (activeLayout || {}).l;
    if (Layout == null) { return; }

    function ConsumerIn (Control) {
      if (
        (x < Control.x) || (x >= Control.x + Control.w) ||
        (y < Control.y) || (y >= Control.y + Control.h)
      ) { return undefined; }

      if (typeof Control[HandlerName] === 'function') { return Control; }

      if (Control.c != null) {
        let ControlList = Control.c;
        for (let i = 0, l = ControlList.length; i < l; i++) {
          let Consumer = ConsumerIn(ControlList[i]);
          if (Consumer != null) { return Consumer; }
        }
      }

      return undefined;
    }

    return ConsumerIn(Layout);
  }

/**** dispatchTouchEvent ****/

  function dispatchTouchEvent (DefaultHandler) {
    function handleTouchEvent (Button, xy) {
      if (activeLayout == null) {
        if (typeof DefaultHandler === 'function') {
          DefaultHandler();
        }
      } else {
        let Control = EventConsumerAtPoint('onTouch', xy.x,xy.y);
        if (Control != null) {
          Control.onTouch(Control, Button, xy);
        }
      }
    }
    Bangle.on('touch',handleTouchEvent);
  }
  dispatchTouchEvent();

/**** dispatchStrokeEvent ****/

  function dispatchStrokeEvent (DefaultHandler) {
    function handleStrokeEvent (Coordinates) {
      if (activeLayout == null) {
        if (typeof DefaultHandler === 'function') {
          DefaultHandler();
        }
      } else {
        let Control = EventConsumerAtPoint('onStroke', Coordinates.xy[0],Coordinates.xy[1]);
        if (Control != null) {
          Control.onStroke(Control, Coordinates);
        }
      }
    }
    Bangle.on('stroke',handleStrokeEvent);
  }
  dispatchStrokeEvent();
/**** Label ****/

  function Label (Text, Options) {
    function renderLabel (Details) {
      let x = Details.x, xAlignment = Details.halign || 0;
      let y = Details.y, yAlignment = Details.valign || 0;

      let Width  = Details.w, halfWidth  = Width/2;
      let Height = Details.h, halfHeight = Height/2;

      let Border  = Details.border || 0, BorderColor = Details.BorderColor;
      let Padding = Details.pad    || 0;
      let Hilite  = Details.hilite || false;
      let bold    = Details.bold ? 1 : 0;

      if (Hilite || (Details.bgCol != null)) {
        g.setBgColor(Hilite ? g.theme.bgH : Details.bgCol);
        g.clearRect(x,y, x + Width-1,y + Height-1);
      }

      if ((Border > 0) && (BorderColor !== null)) {// draw border of layout cell
        g.setColor(BorderColor || Details.col || g.theme.fg);

        switch (Border) {
          case 1:  g.drawRect(x,y,     x+Width-1,y+Height-1); break;
          case 2:  g.drawRect(x,y,     x+Width-1,y+Height-1);
                   g.drawRect(x+1,y+1, x+Width-2,y+Height-2); break;
          default: g.fillPoly([
            x,y, x+Width,y, x+Width,y+Height, x,y+Height, x,y,
            x+Border,y+Border, x+Border,y+Height-Border,
              x+Width-Border,y+Height-Border, x+Width-Border,y+Border,
              x+Border,y+Border
          ]);
        }
      }

      g.setClipRect(
        x+Border+Padding,y+Border+Padding,
        x + Width-Border-Padding-1,y + Height-Border-Padding-1
      );

      x += halfWidth  + xAlignment*(halfWidth  - Border - Padding);
      y += halfHeight + yAlignment*(halfHeight - Border - Padding);

      g.setColor  (Hilite ? g.theme.fgH : Details.col   || g.theme.fg);
      g.setBgColor(Hilite ? g.theme.bgH : Details.bgCol || g.theme.bg);

      if (Details.font != null) { g.setFont(Details.font); }
      g.setFontAlign(xAlignment,yAlignment);

      g.drawString(Details.label, x,y);
      if (bold !== 0) {
        g.drawString(Details.label, x+1,y);
        g.drawString(Details.label, x,y+1);
        g.drawString(Details.label, x+1,y+1);
      }
    }

    let Result = Object.assign((
      Options == null ? {} : Object.assign({}, Options.common || {}, Options)
    ), {
      type:'custom', render:renderLabel, label:Text || ''
    });
      let Border  = Result.border || 0;
      let Padding = Result.pad    || 0;

      let TextMetrics;
      if (! Result.width || ! Result.height) {
        if (Result.font == null) {
          Result.font = g.getFont();
        } else {
          g.setFont(Result.font);
        }
        TextMetrics = g.stringMetrics(Result.label);
      }

      if (Result.col   == null) { Result.col   = g.getColor(); }
      if (Result.bgCol == null) { Result.bgCol = g.getBgColor(); }

      Result.width  = Result.width  || TextMetrics.width  + 2*Border + 2*Padding;
      Result.height = Result.height || TextMetrics.height + 2*Border + 2*Padding;
    return Result;
  }

/**** Image ****/

  function Image (Image, Options) {
    function renderImage (Details) {
      let x = Details.x, xAlignment = Details.halign || 0;
      let y = Details.y, yAlignment = Details.valign || 0;

      let Width  = Details.w, halfWidth  = Width/2  - Details.ImageWidth/2;
      let Height = Details.h, halfHeight = Height/2 - Details.ImageHeight/2;

      let Border  = Details.border || 0, BorderColor = Details.BorderColor;
      let Padding = Details.pad    || 0;
      let Hilite  = Details.hilite || false;

      if (Hilite || (Details.bgCol != null)) {
        g.setBgColor(Hilite ? g.theme.bgH : Details.bgCol);
        g.clearRect(x,y, x + Width-1,y + Height-1);
      }

      if ((Border > 0) && (BorderColor !== null)) {// draw border of layout cell
        g.setColor(BorderColor || Details.col || g.theme.fg);

        switch (Border) {
          case 1:  g.drawRect(x,y,     x+Width-1,y+Height-1); break;
          case 2:  g.drawRect(x,y,     x+Width-1,y+Height-1);
                   g.drawRect(x+1,y+1, x+Width-2,y+Height-2); break;
          default: g.fillPoly([
            x,y, x+Width,y, x+Width,y+Height, x,y+Height, x,y,
            x+Border,y+Border, x+Border,y+Height-Border,
              x+Width-Border,y+Height-Border, x+Width-Border,y+Border,
              x+Border,y+Border
          ]);
        }
      }

      g.setClipRect(
        x+Border+Padding,y+Border+Padding,
        x + Width-Border-Padding-1,y + Height-Border-Padding-1
      );

      x += halfWidth  + xAlignment*(halfWidth  - Border - Padding);
      y += halfHeight + yAlignment*(halfHeight - Border - Padding);

      if ('rotate' in Details) {               // "rotate" centers image at x,y!
        x += Details.ImageWidth/2;
        y += Details.ImageHeight/2;
      }

      g.setColor  (Hilite ? g.theme.fgH : Details.col   || g.theme.fg);
      g.setBgColor(Hilite ? g.theme.bgH : Details.bgCol || g.theme.bg);

      g.drawImage(Image, x,y, Details.ImageOptions);
    }

    let Result = Object.assign((
      Options == null ? {} : Object.assign({}, Options.common || {}, Options)
    ), {
      type:'custom', render:renderImage, Image:Image
    });
      let ImageMetrics = g.imageMetrics(Image);
      let Scale        = Result.scale  || 1;
      let Border       = Result.border || 0;
      let Padding      = Result.pad    || 0;

      Result.ImageWidth  = Scale * ImageMetrics.width;
      Result.ImageHeight = Scale * ImageMetrics.height;

      if (('rotate' in Result) || ('scale' in Result) || ('frame' in Result)) {
        Result.ImageOptions = {};
        if ('rotate' in Result) { Result.ImageOptions.rotate = Result.rotate; }
        if ('scale'  in Result) { Result.ImageOptions.scale  = Result.scale; }
        if ('frame'  in Result) { Result.ImageOptions.frame  = Result.frame; }
      }

      Result.width  = Result.width  || Result.ImageWidth  + 2*Border + 2*Padding;
      Result.height = Result.height || Result.ImageHeight + 2*Border + 2*Padding;
    return Result;
  }

/**** Drawable ****/

  function Drawable (Callback, Options) {
    function renderDrawable (Details) {
      let x = Details.x, xAlignment = Details.halign || 0;
      let y = Details.y, yAlignment = Details.valign || 0;

      let Width  = Details.w, DrawableWidth  = Details.DrawableWidth  || Width;
      let Height = Details.h, DrawableHeight = Details.DrawableHeight || Height;

      let halfWidth  = Width/2  - DrawableWidth/2;
      let halfHeight = Height/2 - DrawableHeight/2;

      let Border  = Details.border || 0, BorderColor = Details.BorderColor;
      let Padding = Details.pad    || 0;
      let Hilite  = Details.hilite || false;

      if (Hilite || (Details.bgCol != null)) {
        g.setBgColor(Hilite ? g.theme.bgH : Details.bgCol);
        g.clearRect(x,y, x + Width-1,y + Height-1);
      }

      if ((Border > 0) && (BorderColor !== null)) {// draw border of layout cell
        g.setColor(BorderColor || Details.col || g.theme.fg);

        switch (Border) {
          case 1:  g.drawRect(x,y,     x+Width-1,y+Height-1); break;
          case 2:  g.drawRect(x,y,     x+Width-1,y+Height-1);
                   g.drawRect(x+1,y+1, x+Width-2,y+Height-2); break;
          default: g.fillPoly([
            x,y, x+Width,y, x+Width,y+Height, x,y+Height, x,y,
            x+Border,y+Border, x+Border,y+Height-Border,
              x+Width-Border,y+Height-Border, x+Width-Border,y+Border,
              x+Border,y+Border
          ]);
        }
      }

      let DrawableX = x + halfWidth  + xAlignment*(halfWidth  - Border - Padding);
      let DrawableY = y + halfHeight + yAlignment*(halfHeight - Border - Padding);

      g.setClipRect(
        Math.max(x+Border+Padding,DrawableX),
        Math.max(y+Border+Padding,DrawableY),
        Math.min(x+Width -Border-Padding,DrawableX+DrawableWidth)-1,
        Math.min(y+Height-Border-Padding,DrawableY+DrawableHeight)-1
      );

      g.setColor  (Hilite ? g.theme.fgH : Details.col   || g.theme.fg);
      g.setBgColor(Hilite ? g.theme.bgH : Details.bgCol || g.theme.bg);

      Callback(DrawableX,DrawableY, DrawableWidth,DrawableHeight, Details);
    }

    let Result = Object.assign((
      Options == null ? {} : Object.assign({}, Options.common || {}, Options)
    ), {
      type:'custom', render:renderDrawable, cb:Callback
    });
      let DrawableWidth  = Result.DrawableWidth  || 10;
      let DrawableHeight = Result.DrawableHeight || 10;

      let Border  = Result.border || 0;
      let Padding = Result.pad    || 0;

      Result.width  = Result.width  || DrawableWidth  + 2*Border + 2*Padding;
      Result.height = Result.height || DrawableHeight + 2*Border + 2*Padding;
    return Result;
  }

  if (g.drawRoundedRect == null) {
    g.drawRoundedRect = function drawRoundedRect (x1,y1, x2,y2, r) {
      let x,y;
      if (x1 > x2) { x = x1; x1 = x2; x2 = x; }
      if (y1 > y2) { y = y1; y1 = y2; y2 = y; }

      r = Math.min(r || 0, (x2-x1)/2, (y2-y1)/2);

      let cx1 = x1+r, cx2 = x2-r;
      let cy1 = y1+r, cy2 = y2-r;

      this.drawLine(cx1,y1, cx2,y1);
      this.drawLine(cx1,y2, cx2,y2);
      this.drawLine(x1,cy1, x1,cy2);
      this.drawLine(x2,cy1, x2,cy2);

      x = r; y = 0;

      let dx,dy, Error = 0;
      while (y <= x) {
        dy = 1 + 2*y; y++; Error -= dy;
        if (Error < 0) {
          dx = 1 - 2*x; x--; Error -= dx;
        }

        this.setPixel(cx1 - x, cy1 - y);  this.setPixel(cx1 - y, cy1 - x);
        this.setPixel(cx2 + x, cy1 - y);  this.setPixel(cx2 + y, cy1 - x);
        this.setPixel(cx2 + x, cy2 + y);  this.setPixel(cx2 + y, cy2 + x);
        this.setPixel(cx1 - x, cy2 + y);  this.setPixel(cx1 - y, cy2 + x);
      }
    };
  }

  if (g.fillRoundedRect == null) {
    g.fillRoundedRect = function fillRoundedRect (x1,y1, x2,y2, r) {
      let x,y;
      if (x1 > x2) { x = x1; x1 = x2; x2 = x; }
      if (y1 > y2) { y = y1; y1 = y2; y2 = y; }

      r = Math.min(r || 0, (x2-x1)/2, (y2-y1)/2);

      let cx1 = x1+r, cx2 = x2-r;
      let cy1 = y1+r, cy2 = y2-r;

      this.fillRect(x1,cy1, x2,cy2);

      x = r; y = 0;

      let dx,dy, Error = 0;
      while (y <= x) {
        dy = 1 + 2*y; y++; Error -= dy;
        if (Error < 0) {
          dx = 1 - 2*x; x--; Error -= dx;
        }

        this.drawLine(cx1 - x, cy1 - y,  cx2 + x, cy1 - y);
        this.drawLine(cx1 - y, cy1 - x,  cx2 + y, cy1 - x);
        this.drawLine(cx1 - x, cy2 + y,  cx2 + x, cy2 + y);
        this.drawLine(cx1 - y, cy2 + x,  cx2 + y, cy2 + x);
      }
    };
  }


/**** Button ****/

  function Button (Text, Options) {
    function renderButton (Details) {
      let x = Details.x, Width  = Details.w, halfWidth  = Width/2;
      let y = Details.y, Height = Details.h, halfHeight = Height/2;

      let Padding = Details.pad || 0;
      let Hilite  = Details.hilite || false;

      if (Details.bgCol != null) {
        g.setBgColor(Details.bgCol);
        g.clearRect(x,y, x + Width-1,y + Height-1);
      }

      if (Hilite) {
        g.setColor(g.theme.bgH);                                     // no typo!
        g.fillRoundedRect(x+Padding,y+Padding, x+Width-Padding-1,y+Height-Padding-1,8);
      }

      g.setColor  (Hilite ? g.theme.fgH : Details.col   || g.theme.fg);
      g.setBgColor(Hilite ? g.theme.bgH : Details.bgCol || g.theme.bg);

      if (Details.font != null) { g.setFont(Details.font); }
      g.setFontAlign(0,0);

      g.drawRoundedRect(x+Padding,y+Padding, x+Width-Padding-1,y+Height-Padding-1,8);

      g.setClipRect(x+Padding,y+Padding, x+Width-Padding-1,y+Height-Padding-1);

      g.drawString(Details.label, x+halfWidth,y+halfHeight);
      g.drawString(Details.label, x+halfWidth+1,y+halfHeight);
      g.drawString(Details.label, x+halfWidth,y+halfHeight+1);
      g.drawString(Details.label, x+halfWidth+1,y+halfHeight+1);
    }

    let Result = Object.assign((
      Options == null ? {} : Object.assign({}, Options.common || {}, Options)
    ), {
      type:'custom', render:renderButton, label:Text || 'Tap'
    });
      let Padding = Result.pad || 0;

      let TextMetrics;
      if (! Result.width || ! Result.height) {
        if (Result.font == null) {
          Result.font = g.getFont();
        } else {
          g.setFont(Result.font);
        }
        TextMetrics = g.stringMetrics(Result.label);
      }

      Result.width  = Result.width  || TextMetrics.width + 2*10 + 2*Padding;
      Result.height = Result.height || TextMetrics.height + 2*5 + 2*Padding;
    return Result;
  }

  const Checkbox_checked   = require("heatshrink").decompress(atob("ikUgMf/+GgEGoEAlEAgOAgEYsFhw8OjE54OB/EYh4OB+EYj+BwecjFw8OGg0YDocUgECsEAsP//A"));
  const Checkbox_unchecked = require("heatshrink").decompress(atob("ikUgMf/+GgEGoEAlEAgOAgEYAjkUgECsEAsP//A="));

/**** Checkbox ****/

  function Checkbox (Options) {
    function renderCheckbox (Details) {
      let x = Details.x, xAlignment = Details.halign || 0;
      let y = Details.y, yAlignment = Details.valign || 0;

      let Width  = Details.w, halfWidth  = Width/2  - 10;
      let Height = Details.h, halfHeight = Height/2 - 10;

      let Padding = Details.pad || 0;

      if (Details.bgCol != null) {
        g.setBgColor(Details.bgCol);
        g.clearRect(x,y, x + Width-1,y + Height-1);
      }

      x += halfWidth  + xAlignment*(halfWidth  - Padding);
      y += halfHeight + yAlignment*(halfHeight - Padding);

      g.setColor  (Details.col   || g.theme.fg);
      g.setBgColor(Details.bgCol || g.theme.bg);

      g.drawImage(
        Details.checked ? Checkbox_checked : Checkbox_unchecked, x,y
      );
    }

    let Result = Object.assign((
      Options == null ? {} : Object.assign({}, Options.common || {}, Options)
    ), {
      type:'custom', render:renderCheckbox, onTouch:toggleCheckbox
    });
      let Padding = Result.pad || 0;

      Result.width  = Result.width  || 20 + 2*Padding;
      Result.height = Result.height || 20 + 2*Padding;

      if (Result.checked == null) { Result.checked = false; }
    return Result;
  }

  /* private */ function toggleCheckbox (Control) {
    g.reset();

    Control.checked = ! Control.checked;
    Control.render(Control);

    if (typeof Control.onChange === 'function') {
      Control.onChange(Control);
    }
  }

/**** toggleInnerCheckbox ****/

  /* export */ function toggleInnerCheckbox (Control) {
    if (Control.c == null) {
      if (('checked' in Control) && ! ('GroupName' in Control)) {
        toggleCheckbox(Control);
        return true;
      }
    } else {
      let ControlList = Control.c;
      for (let i = 0, l = ControlList.length; i < l; i++) {
        let done = toggleInnerCheckbox(ControlList[i]);
        if (done) { return true; }
      }
    }
  }

  const Radiobutton_checked   = require("heatshrink").decompress(atob("ikUgMB/EAsFgjEBwUAgkggFEgECoEAlEPgOB/EYj+BAgmA+EUCYciDodBwEYg0GgEfwA"));
  const Radiobutton_unchecked = require("heatshrink").decompress(atob("ikUgMB/EAsFgjEBwUAgkggFEgECoEAlEAgOAgEYAhEUCYciDodBwEYg0GgEfwAA="));

/**** Radiobutton ****/

  function Radiobutton (Options) {
    function renderRadiobutton (Details) {
      let x = Details.x, xAlignment = Details.halign || 0;
      let y = Details.y, yAlignment = Details.valign || 0;

      let Width  = Details.w, halfWidth  = Width/2  - 10;
      let Height = Details.h, halfHeight = Height/2 - 10;

      let Padding = Details.pad || 0;

      if (Details.bgCol != null) {
        g.setBgColor(Details.bgCol);
        g.clearRect(x,y, x + Width-1,y + Height-1);
      }

      x += halfWidth  + xAlignment*(halfWidth  - Padding);
      y += halfHeight + yAlignment*(halfHeight - Padding);

      g.setColor  (Details.col   || g.theme.fg);
      g.setBgColor(Details.bgCol || g.theme.bg);

      g.drawImage(
        Details.checked ? Radiobutton_checked : Radiobutton_unchecked, x,y
      );
    }

    let Result = Object.assign((
      Options == null ? {} : Object.assign({}, Options.common || {}, Options)
    ), {
      type:'custom', render:renderRadiobutton, onTouch:checkRadiobutton
    });
      let Padding = Result.pad || 0;

      Result.width  = Result.width  || 20 + 2*Padding;
      Result.height = Result.height || 20 + 2*Padding;

      if (Result.checked == null) { Result.checked = false; }
    return Result;
  }

  /* private */ function checkRadiobutton (Control) {
    if (! Control.checked) {
      uncheckRadiobuttonsIn((activeLayout || {}).l,Control.GroupName);
      toggleRadiobutton(Control);

      if (typeof Control.onChange === 'function') {
        Control.onChange(Control);
      }
    }
  }

  /* private */ function toggleRadiobutton (Control) {
    g.reset();

    Control.checked = ! Control.checked;
    Control.render(Control);
  }

  /* private */ function uncheckRadiobuttonsIn (Control,GroupName) {
    if ((Control == null) || (GroupName == null)) { return; }

    if (Control.c == null) {
      if (('checked' in Control) && (Control.GroupName === GroupName)) {
        if (Control.checked) { toggleRadiobutton(Control); }
      }
    } else {
      let ControlList = Control.c;
      for (let i = 0, l = ControlList.length; i < l; i++) {
        uncheckRadiobuttonsIn(ControlList[i],GroupName);
      }
    }
  }

/**** checkInnerRadiobutton ****/

  /* export */ function checkInnerRadiobutton (Control) {
    if (Control.c == null) {
      if (('checked' in Control) && ('GroupName' in Control)) {
        checkRadiobutton(Control);
        return true;
      }
    } else {
      let ControlList = Control.c;
      for (let i = 0, l = ControlList.length; i < l; i++) {
        let done = checkInnerRadiobutton(ControlList[i]);
        if (done) { return true; }
      }
    }
  }


  let Theme = g.theme;
  g.clear(true);

/**** Settings ****/

  let Settings;

  function readSettings () {
    Settings = Object.assign({},
      {
        Face:'1-12', colored:true,
        Hands:'rounded', withSeconds:true,
        Foreground:'Theme', Background:'Theme', Seconds:'#FF0000'
      },
      require('Storage').readJSON('configurable_clock.json', true) || {}
    );

    prepareTransformedPolygon();
  }

  function saveSettings () {
    require('Storage').writeJSON('configurable_clock.json', Settings);
    prepareTransformedPolygon();
  }

  function prepareTransformedPolygon () {
    switch (Settings.Hands) {
      case 'simple':  transformedPolygon = new Array(simpleHourHandPolygon.length); break;
      case 'rounded': transformedPolygon = new Array(roundedHandPolygon.length);    break;
      case 'hollow':  transformedPolygon = new Array(hollowHandPolygon.length);
    }
  }

//readSettings();                                                     // not yet


/**** Hands ****/

  let HourHandLength = outerRadius * 0.5;
  let HourHandWidth  = 2*3, halfHourHandWidth = HourHandWidth/2;

  let MinuteHandLength = outerRadius * 0.8;
  let MinuteHandWidth  = 2*2, halfMinuteHandWidth = MinuteHandWidth/2;

  let SecondHandLength = outerRadius * 0.9;
  let SecondHandOffset = 10;

  let twoPi  = 2*Math.PI, deg2rad = Math.PI/180;
  let Pi     = Math.PI;

  let sin = Math.sin, cos = Math.cos;

/**** simple Hands ****/

  let simpleHourHandPolygon = [
    -halfHourHandWidth,halfHourHandWidth,
    -halfHourHandWidth,halfHourHandWidth-HourHandLength,
     halfHourHandWidth,halfHourHandWidth-HourHandLength,
     halfHourHandWidth,halfHourHandWidth,
  ];

  let simpleMinuteHandPolygon = [
    -halfMinuteHandWidth,halfMinuteHandWidth,
    -halfMinuteHandWidth,halfMinuteHandWidth-MinuteHandLength,
     halfMinuteHandWidth,halfMinuteHandWidth-MinuteHandLength,
     halfMinuteHandWidth,halfMinuteHandWidth,
  ];


/**** rounded Hands ****/

  let outerBoltRadius   = halfHourHandWidth + 2;
  let innerBoltRadius   = outerBoltRadius - 4;
  let roundedHandOffset = outerBoltRadius + 4;

  let sine = [0, sin(30*deg2rad), sin(60*deg2rad), 1];

  let roundedHandPolygon = [
    -sine[3],-sine[0], -sine[2],-sine[1], -sine[1],-sine[2], -sine[0],-sine[3],
     sine[0],-sine[3],  sine[1],-sine[2],  sine[2],-sine[1],  sine[3],-sine[0],
     sine[3], sine[0],  sine[2], sine[1],  sine[1], sine[2],  sine[0], sine[3],
    -sine[0], sine[3], -sine[1], sine[2], -sine[2], sine[1], -sine[3], sine[0],
  ];

  let roundedHourHandPolygon = new Array(roundedHandPolygon.length);
    for (let i = 0, l = roundedHandPolygon.length; i < l; i+=2) {
      roundedHourHandPolygon[i]   = halfHourHandWidth*roundedHandPolygon[i];
      roundedHourHandPolygon[i+1] = halfHourHandWidth*roundedHandPolygon[i+1];
      if (i < l/2) { roundedHourHandPolygon[i+1] -= HourHandLength; }
      if (i > l/2) { roundedHourHandPolygon[i+1] += roundedHandOffset; }
    }
  let roundedMinuteHandPolygon = new Array(roundedHandPolygon.length);
    for (let i = 0, l = roundedHandPolygon.length; i < l; i+=2) {
      roundedMinuteHandPolygon[i]   = halfMinuteHandWidth*roundedHandPolygon[i];
      roundedMinuteHandPolygon[i+1] = halfMinuteHandWidth*roundedHandPolygon[i+1];
      if (i < l/2) { roundedMinuteHandPolygon[i+1] -= MinuteHandLength; }
      if (i > l/2) { roundedMinuteHandPolygon[i+1] += roundedHandOffset; }
    }


/**** hollow Hands ****/

  let BoltRadius       = 3;
  let hollowHandOffset = BoltRadius + 15;

  let hollowHandPolygon = [
    -sine[3],-sine[0], -sine[2],-sine[1], -sine[1],-sine[2], -sine[0],-sine[3],
     sine[0],-sine[3],  sine[1],-sine[2],  sine[2],-sine[1],  sine[3],-sine[0],
     sine[3], sine[0],  sine[2], sine[1],  sine[1], sine[2],  sine[0], sine[3],
     0,0,
    -sine[0], sine[3], -sine[1], sine[2], -sine[2], sine[1], -sine[3], sine[0]
  ];

  let hollowHourHandPolygon = new Array(hollowHandPolygon.length);
    for (let i = 0, l = hollowHandPolygon.length; i < l; i+=2) {
      hollowHourHandPolygon[i]   = halfHourHandWidth*hollowHandPolygon[i];
      hollowHourHandPolygon[i+1] = halfHourHandWidth*hollowHandPolygon[i+1];
      if (i < l/2) { hollowHourHandPolygon[i+1] -= HourHandLength; }
      if (i > l/2) { hollowHourHandPolygon[i+1] -= hollowHandOffset; }
    }
  hollowHourHandPolygon[25] = -BoltRadius;

  let hollowMinuteHandPolygon = new Array(hollowHandPolygon.length);
    for (let i = 0, l = hollowHandPolygon.length; i < l; i+=2) {
      hollowMinuteHandPolygon[i]   = halfMinuteHandWidth*hollowHandPolygon[i];
      hollowMinuteHandPolygon[i+1] = halfMinuteHandWidth*hollowHandPolygon[i+1];
      if (i < l/2) { hollowMinuteHandPolygon[i+1] -= MinuteHandLength; }
      if (i > l/2) { hollowMinuteHandPolygon[i+1] -= hollowHandOffset; }
    }
  hollowMinuteHandPolygon[25] = -BoltRadius;



/**** transform polygon ****/

  let transformedPolygon;

  function transformPolygon (originalPolygon, OriginX,OriginY, Phi) {
    let sPhi = sin(Phi), cPhi = cos(Phi), x,y;

    for (let i = 0, l = originalPolygon.length; i < l; i+=2) {
      x = originalPolygon[i];
      y = originalPolygon[i+1];

      transformedPolygon[i]   = OriginX + x*cPhi + y*sPhi;
      transformedPolygon[i+1] = OriginY + x*sPhi - y*cPhi;
    }
  }

/**** refreshClock ****/

  let Timer;
  function refreshClock () {
    activeLayout = null;

    g.setTheme({
      fg:(Settings.Foreground === 'Theme' ? Theme.fg : Settings.Foreground || '#000000'),
      bg:(Settings.Background === 'Theme' ? Theme.bg : Settings.Background || '#FFFFFF')
    });
    g.clear(true);                            // also installs the current theme

    Bangle.drawWidgets();
    renderClock();

    let Period = (Settings.withSeconds ? 1000 : 60000);

    let Pause = Period - (Date.now() % Period);
    Timer = setTimeout(refreshClock,Pause);
  }

/**** renderClock ****/

  function renderClock () {
    g.setColor  (Settings.Foreground === 'Theme' ? Theme.fg : Settings.Foreground || '#000000');
    g.setBgColor(Settings.Background === 'Theme' ? Theme.bg : Settings.Background || '#FFFFFF');

    switch (Settings.Face) {
      case 'none':
        break;
      case '3,6,9,12':
        g.setFont('Vector', 22);

        g.setFontAlign(0,-1);
        g.drawString('12', CenterX,CenterY-outerRadius);

        g.setFontAlign(1,0);
        g.drawString('3', CenterX+outerRadius,CenterY);

        g.setFontAlign(0,1);
        g.drawString('6', CenterX,CenterY+outerRadius);

        g.setFontAlign(-1,0);
        g.drawString('9', CenterX-outerRadius,CenterY);
        break;
      case '1-12': {
        let innerRadius = outerRadius * 0.9 - 10;

        let dark = g.theme.dark;

        let Saturations  = [0.8,1.0,1.0,1.0,1.0,1.0,1.0,0.9,0.7,0.7,0.9,0.9];
        let Brightnesses = [1.0,0.9,0.6,0.6,0.8,0.8,0.7,1.0,1.0,1.0,1.0,1.0,];

        for (let i = 0; i < 60; i++) {
          let Phi = i * twoPi/60;

          let x = CenterX + outerRadius * sin(Phi);
          let y = CenterY - outerRadius * cos(Phi);

          if (Settings.colored) {
            let j = Math.floor(i / 5);
            let Saturation = (dark ? Saturations[j] : 1.0);
            let Brightness = (dark ? 1.0 : Brightnesses[j]);

            let Color = E.HSBtoRGB(i/60,Saturation,Brightness, true);
            g.setColor(Color[0]/255,Color[1]/255,Color[2]/255);
          }

          g.fillCircle(x,y, 1);
        }

        g.setFont('Vector', 20);
        g.setFontAlign(0,0);

        for (let i = 0; i < 12; i++) {
          let Phi = i * twoPi/12;

          let Radius = innerRadius;
          if (i >= 10) { Radius -= 4; }

          let x = CenterX + Radius * sin(Phi);
          let y = CenterY - Radius * cos(Phi);

          if (Settings.colored) {
            let Saturation = (dark ? Saturations[i] : 1.0);
            let Brightness = (dark ? 1.0 : Brightnesses[i]);

            let Color = E.HSBtoRGB(i/12,Saturation,Brightness, true);
            g.setColor(Color[0]/255,Color[1]/255,Color[2]/255);
          }

          g.drawString(i == 0 ? '12' : '' + i, x,y);
        }
      }
    }

    let now = new Date();

    let Hours   = now.getHours() % 12;
    let Minutes = now.getMinutes();

    let HoursAngle   = (Hours+(Minutes/60))/12 * twoPi - Pi;
    let MinutesAngle = (Minutes/60)            * twoPi - Pi;

    g.setColor(Settings.Foreground === 'Theme' ? Theme.fg : Settings.Foreground || '#000000');

    switch (Settings.Hands) {
      case 'simple':
        transformPolygon(simpleHourHandPolygon, CenterX,CenterY, HoursAngle);
        g.fillPoly(transformedPolygon);

        transformPolygon(simpleMinuteHandPolygon, CenterX,CenterY, MinutesAngle);
        g.fillPoly(transformedPolygon);
        break;
      case 'rounded':
        transformPolygon(roundedHourHandPolygon, CenterX,CenterY, HoursAngle);
        g.fillPoly(transformedPolygon);

        transformPolygon(roundedMinuteHandPolygon, CenterX,CenterY, MinutesAngle);
        g.fillPoly(transformedPolygon);

//      g.setColor(Settings.Foreground === 'Theme' ? Theme.fg || '#000000');
        g.fillCircle(CenterX,CenterY, outerBoltRadius);

        g.setColor(Settings.Background === 'Theme' ? Theme.bg : Settings.Background || '#FFFFFF');
        g.drawCircle(CenterX,CenterY, outerBoltRadius);
        g.fillCircle(CenterX,CenterY, innerBoltRadius);
        break;
      case 'hollow':
        transformPolygon(hollowHourHandPolygon, CenterX,CenterY, HoursAngle);
        g.drawPoly(transformedPolygon,true);

        transformPolygon(hollowMinuteHandPolygon, CenterX,CenterY, MinutesAngle);
        g.drawPoly(transformedPolygon,true);

        g.drawCircle(CenterX,CenterY, BoltRadius);
    }

    if (Settings.withSeconds) {
      g.setColor(Settings.Seconds === 'Theme' ? Theme.fgH : Settings.Seconds || '#FF0000');

      let Seconds      = now.getSeconds();
      let SecondsAngle = (Seconds/60) * twoPi - Pi;

      let sPhi = Math.sin(SecondsAngle), cPhi = Math.cos(SecondsAngle);

      g.drawLine(
        CenterX + SecondHandOffset*sPhi,
        CenterY - SecondHandOffset*cPhi,
        CenterX - SecondHandLength*sPhi,
        CenterY + SecondHandLength*cPhi
      );
    }
  }


/**** MainScreen Logic ****/

  let Changes = {}, KeysToChange;

  let fullScreen = {
    x:0,y:0, w:ScreenWidth,h:ScreenHeight, x2:ScreenWidth-1,y2:ScreenHeight-1
  };
  let AppRect;

  function openMainScreen () {
    if (Timer   != null) { clearTimeout(Timer); Timer = undefined; }
    if (AppRect == null) { AppRect = Bangle.appRect; Bangle.appRect = fullScreen; }

    Bangle.buzz();

    KeysToChange = 'Face colored Hands withSeconds Foreground Background Seconds';

    g.setTheme({ fg:'#000000', bg:'#FFFFFF' });
    g.clear(true);                            // also installs the current theme

    (activeLayout = MainScreen).render();
  }

  function applySettings ()    { Bangle.buzz(); saveSettings(); Bangle.appRect = AppRect; refreshClock(); }
  function withdrawSettings () { Bangle.buzz(); readSettings(); Bangle.appRect = AppRect; refreshClock(); }

/**** FacesScreen Logic ****/

  function openFacesScreen () {
    Bangle.buzz();

    KeysToChange   = 'Face colored';
    Bangle.appRect = fullScreen;
    refreshFacesScreen();
  }

  function refreshFacesScreen () {
    activeLayout = FacesScreen;
      activeLayout['none'].checked     = ((Changes.Face || Settings.Face) === 'none');
      activeLayout['3,6,9,12'].checked = ((Changes.Face || Settings.Face) === '3,6,9,12');
      activeLayout['1-12'].checked     = ((Changes.Face || Settings.Face) === '1-12');
      activeLayout['colored'].checked  = (Changes.colored == null ? Settings.colored : Changes.colored);
    activeLayout.render();
  }

  function chooseFace (Control) { Bangle.buzz(); Changes.Face    = Control.id;        refreshFacesScreen(); }
  function toggleColored ()     { Bangle.buzz(); Changes.colored = ! Changes.colored; refreshFacesScreen(); }

/**** HandsScreen Logic ****/

  function openHandsScreen () {
    Bangle.buzz();

    KeysToChange   = 'Hands withSeconds';
    Bangle.appRect = fullScreen;
    refreshHandsScreen();
  }

  function refreshHandsScreen () {
    activeLayout = HandsScreen;
      activeLayout['simple'].checked      = ((Changes.Hands || Settings.Hands) === 'simple');
      activeLayout['rounded'].checked     = ((Changes.Hands || Settings.Hands) === 'rounded');
      activeLayout['hollow'].checked      = ((Changes.Hands || Settings.Hands) === 'hollow');
      activeLayout['withSeconds'].checked = (Changes.withSeconds == null ? Settings.withSeconds : Changes.withSeconds);
    activeLayout.render();
  }

  function chooseHand (Control) { Bangle.buzz(); Changes.Hands = Control.id;                  refreshHandsScreen(); }
  function toggleSeconds ()     { Bangle.buzz(); Changes.withSeconds = ! Changes.withSeconds; refreshHandsScreen(); }

/**** ColorsScreen Logic ****/

  function openColorsScreen () {
    Bangle.buzz();

    KeysToChange   = 'Foreground Background Seconds';
    Bangle.appRect = fullScreen;
    refreshColorsScreen();
  }

  function refreshColorsScreen () {
    let Foreground = (Changes.Foreground == null ? Settings.Foreground : Changes.Foreground);
    let Background = (Changes.Background == null ? Settings.Background : Changes.Background);
    let Seconds    = (Changes.Seconds    == null ? Settings.Seconds    : Changes.Seconds);

    activeLayout = ColorsScreen;
      activeLayout['Foreground'].bgCol = (Foreground === 'Theme' ? Theme.fg  : Foreground);
      activeLayout['Background'].bgCol = (Background === 'Theme' ? Theme.bg  : Background);
      activeLayout['Seconds'].bgCol    = (Seconds    === 'Theme' ? Theme.fgH : Seconds);
    activeLayout.render();
  }

  function selectForegroundColor () { ColorToChange = 'Foreground'; openColorChoiceScreen(); }
  function selectBackgroundColor () { ColorToChange = 'Background'; openColorChoiceScreen(); }
  function selectSecondsColor ()    { ColorToChange = 'Seconds';    openColorChoiceScreen(); }

/**** ColorChoiceScreen Logic ****/

  let ColorToChange, chosenColor;

  function openColorChoiceScreen () {
    Bangle.buzz();

    chosenColor = (
      Changes[ColorToChange] == null ? Settings[ColorToChange] : Changes[ColorToChange]
    );
    Bangle.appRect = fullScreen;
    refreshColorChoiceScreen();
  }

  function refreshColorChoiceScreen () {
    activeLayout = ColorChoiceScreen;
      activeLayout['#000000'].selected = (chosenColor === '#000000');
      activeLayout['#FF0000'].selected = (chosenColor === '#FF0000');
      activeLayout['#00FF00'].selected = (chosenColor === '#00FF00');
      activeLayout['#0000FF'].selected = (chosenColor === '#0000FF');
      activeLayout['#FFFF00'].selected = (chosenColor === '#FFFF00');
      activeLayout['#FF00FF'].selected = (chosenColor === '#FF00FF');
      activeLayout['#00FFFF'].selected = (chosenColor === '#00FFFF');
      activeLayout['#FFFFFF'].selected = (chosenColor === '#FFFFFF');
      activeLayout['Theme'].selected   = (chosenColor === 'Theme');
    activeLayout.render();
  }

  function chooseColor (Control) { Bangle.buzz(); chosenColor = Control.id; refreshColorChoiceScreen(); }
  function chooseThemeColor ()   { Bangle.buzz(); chosenColor = 'Theme';    refreshColorChoiceScreen(); }

  function applyColor () {
    Changes[ColorToChange] = chosenColor;
    openColorsScreen();
  }

  function withdrawColor () {
    openColorsScreen();
  }

/**** common logic for multiple screens ****/

  function applyChanges () {
    Settings = Object.assign(Settings,Changes);
    Changes  = {};
    openMainScreen();
  }

  function withdrawChanges () {
    Changes  = {};
    openMainScreen();
  }


  g.setFont12x20();                  // does not seem to be respected in layout!

  let OkCancelWidth = Math.max(
    g.stringWidth('Ok'), g.stringWidth('Cancel')
  ) + 2*10;

  let StdFont     = { font:'12x20' };
  let legible     = Object.assign({ col:'#000000', bgCol:'#FFFFFF' }, StdFont);
  let leftAligned = Object.assign({ halign:-1, valign:0 }, legible);
  let ColorView   = Object.assign({ width:30, border:1, BorderColor:'#000000' }, StdFont);
  let ColorChoice = Object.assign({ DrawableWidth:30, DrawableHeight:30, onTouch:chooseColor }, StdFont);

/**** MainScreen ****/

  let MainScreen = new Layout({
    type:'v', c:[
      Label('Settings', { common:legible, bold:true, filly:1 }),
      { height:4 },
      { type:'h', c:[
        { width:4 },
        Label('Faces', { common:leftAligned, fillx:1 }),
        Image(Caret,   { common:leftAligned }),
        { width:4 },
      ], filly:1, onTouch:openFacesScreen },
      { type:'h', c:[
        { width:4 },
        Label('Hands', { common:leftAligned, fillx:1 }),
        Image(Caret,   { common:leftAligned }),
        { width:4 },
      ], filly:1, onTouch:openHandsScreen },
      { type:'h', c:[
        { width:4 },
        Label('Colors', { common:leftAligned, fillx:1 }),
        Image(Caret,    { common:leftAligned }),
        { width:4 },
      ], filly:1, onTouch:openColorsScreen },
      { height:4 },
      { type:'h', c:[
        Button('Ok',     { common:legible, width:OkCancelWidth, onTouch:applySettings }),
        { width:4 },
        Button('Cancel', { common:legible, width:OkCancelWidth, onTouch:withdrawSettings }),
      ], filly:1 },
    ], bgCol:'#FFFFFF'
  });


/**** FacesScreen ****/

  let FacesScreen = new Layout({
    type:'v', c:[
      Label('Clock Faces', { common:legible, bold:true, filly:1 }),
      { height:4 },
      { type:'h', c:[
        { width:4 },
        Radiobutton({ id:'none', GroupName:'Faces', common:legible, onChange:chooseFace }),
        Label(' no Face', { common:leftAligned, pad:4, fillx:1 }),
      ], filly:1, onTouch:checkInnerRadiobutton },
      { type:'h', c:[
        { width:4 },
        Radiobutton({ id:'3,6,9,12', GroupName:'Faces', common:legible, onChange:chooseFace }),
        Label(' 3, 6, 9 and 12', { common:leftAligned, pad:4, fillx:1 }),
      ], filly:1, onTouch:checkInnerRadiobutton },
      { type:'h', c:[
        { width:4 },
        Radiobutton({ id:'1-12', GroupName:'Faces', common:legible, onChange:chooseFace }),
        Label(' numbers 1...12', { common:leftAligned, pad:4, fillx:1 }),
      ], filly:1, onTouch:checkInnerRadiobutton },
      { type:'h', c:[
        { width:30 },
        Checkbox({ id:'colored', common:legible, onChange:toggleColored }),
        Label(' colorful', { common:leftAligned, pad:4, fillx:1 }),
      ], filly:1, onTouch:toggleInnerCheckbox },
      { height:4 },
      { type:'h', c:[
        Button('Ok',     { common:legible, width:OkCancelWidth, onTouch:applyChanges }),
        { width:4 },
        Button('Cancel', { common:legible, width:OkCancelWidth, onTouch:withdrawChanges }),
      ], filly:1 },
    ], bgCol:'#FFFFFF'
  });


/**** HandsScreen ****/

  let HandsScreen = new Layout({
    type:'v', c:[
      Label('Clock Hands', { common:legible, bold:true, filly:1 }),
      { height:4 },
      { type:'h', c:[
        { width:4 },
        Radiobutton({ id:'simple', GroupName:'Faces', common:legible, onChange:chooseHand }),
        Label(' simple', { common:leftAligned, pad:4, fillx:1 }),
      ], filly:1, onTouch:checkInnerRadiobutton },
      { type:'h', c:[
        { width:4 },
        Radiobutton({ id:'rounded', GroupName:'Faces', common:legible, onChange:chooseHand }),
        Label(' rounded + Bolt', { common:leftAligned, pad:4, fillx:1 }),
      ], filly:1, onTouch:checkInnerRadiobutton },
      { type:'h', c:[
        { width:4 },
        Radiobutton({ id:'hollow', GroupName:'Faces', common:legible, onChange:chooseHand }),
        Label(' hollow + Bolt', { common:leftAligned, pad:4, fillx:1 }),
      ], filly:1, onTouch:checkInnerRadiobutton },
      { type:'h', c:[
        { width:4 },
        Checkbox({ id:'withSeconds', common:legible, onChange:toggleSeconds }),
        Label(' show Seconds', { common:leftAligned, pad:4, fillx:1 }),
      ], filly:1, onTouch:toggleInnerCheckbox },
      { height:4 },
      { type:'h', c:[
        Button('Ok',     { common:legible, width:OkCancelWidth, onTouch:applyChanges }),
        { width:4 },
        Button('Cancel', { common:legible, width:OkCancelWidth, onTouch:withdrawChanges }),
      ], filly:1 },
    ], bgCol:'#FFFFFF'
  });


/**** ColorsScreen ****/

  let ColorsScreen = new Layout({
    type:'v', c:[
      Label('Clock Colors', { common:legible, bold:true, filly:1 }),
      { height:4 },
      { type:'h', c:[
        { width:4 },
        Label('Foreground', { common:leftAligned, pad:4, fillx:1 }),
        Label('', { id:'Foreground', common:ColorView, bgCol:Theme.fg }),
        { width:4 },
      ], filly:1, onTouch:selectForegroundColor },
      { type:'h', c:[
        { width:4 },
        Label('Background', { common:leftAligned, pad:4, fillx:1 }),
        Label('', { id:'Background', common:ColorView, bgCol:Theme.bg }),
        { width:4 },
      ], filly:1, onTouch:selectBackgroundColor },
      { type:'h', c:[
        { width:4 },
        Label('Seconds',    { common:leftAligned, pad:4, fillx:1 }),
        Label('', { id:'Seconds', common:ColorView, bgCol:Theme.fgH }),
        { width:4 },
      ], filly:1, onTouch:selectSecondsColor },
      { height:4 },
      { type:'h', c:[
        Button('Ok',     { common:legible, width:OkCancelWidth, onTouch:applyChanges }),
        { width:4 },
        Button('Cancel', { common:legible, width:OkCancelWidth, onTouch:withdrawChanges }),
      ], filly:1 },
    ], bgCol:'#FFFFFF'
  });


/**** ColorChoiceScreen ****/

  function drawColorChoice (x,y, Width,Height, Details) {
    let selected = Details.selected;
    if (selected) {
      g.setColor('#FF0000');
      g.fillPoly([
        x,y, x+Width-1,y, x+Width-1,y+Height-1, x,y+Height-1, x,y,
        x+3,y+3, x+3,y+Height-4, x+Width-4,y+Height-4, x+Width-4,y+3, x+3,y+3
      ]);
    } else {
      g.setColor('#000000');
      g.drawRect(x+3,y+3, x+Width-4,y+Height-4);
    }

    g.setColor(Details.col);
    g.fillRect(x+4,y+4, x+Width-5,y+Height-5);
  }

  let ColorChoiceScreen = new Layout({
    type:'v', c:[
      Label('Choose Color', { common:legible, bold:true, filly:1 }),
      { height:4 },
      { type:'h', c:[
        Drawable(drawColorChoice, { id:'#000000', common:ColorChoice, col:'#000000' }),
        { width:8 },
        Drawable(drawColorChoice, { id:'#FF0000', common:ColorChoice, col:'#FF0000' }),
        { width:8 },
        Drawable(drawColorChoice, { id:'#00FF00', common:ColorChoice, col:'#00FF00' }),
        { width:8 },
        Drawable(drawColorChoice, { id:'#0000FF', common:ColorChoice, col:'#0000FF' }),
      ], filly:1 },
      { type:'h', c:[
        Drawable(drawColorChoice, { id:'#FFFFFF', common:ColorChoice, col:'#FFFFFF' }),
        { width:8 },
        Drawable(drawColorChoice, { id:'#FFFF00', common:ColorChoice, col:'#FFFF00' }),
        { width:8 },
        Drawable(drawColorChoice, { id:'#FF00FF', common:ColorChoice, col:'#FF00FF' }),
        { width:8 },
        Drawable(drawColorChoice, { id:'#00FFFF', common:ColorChoice, col:'#00FFFF' }),
      ], filly:1 },
      { type:'h', c:[
        Label('use Theme:', { id:'Theme', common:leftAligned, pad:4 }),
        { width:10 },
        Drawable(drawColorChoice, { id:'Theme', common:ColorChoice, col:Theme.fg }),
      ], filly:1, onTouch:chooseThemeColor },
      { height:4 },
      { type:'h', c:[
        Button('Ok',     { common:legible, width:OkCancelWidth, onTouch:applyColor }),
        { width:4 },
        Button('Cancel', { common:legible, width:OkCancelWidth, onTouch:withdrawColor }),
      ], filly:1 },
    ], bgCol:'#FFFFFF'
  });



  readSettings();

  Bangle.on('swipe', (Direction) => {
    if (Direction === 0) { openMainScreen(); }
  });

  setTimeout(refreshClock, 500);                   // enqueue first draw request

  Bangle.on('lcdPower', (on) => {
    if (on) {
      if (Timer != null) { clearTimeout(Timer); Timer = undefined; }
      refreshClock();
    }
  });

