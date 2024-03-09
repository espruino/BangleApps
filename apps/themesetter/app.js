  let Layout = require('Layout');

  let ScreenWidth  = g.getWidth(),  halfWidth = ScreenWidth/2;
  //let ScreenHeight = g.getHeight();

  let normalizedColorSet = {
    black:g.toColor(0,0,0), white:  g.toColor(1,1,1),
    red:  g.toColor(1,0,0), yellow: g.toColor(1,1,0),
    green:g.toColor(0,1,0), magenta:g.toColor(1,0,1),
    blue: g.toColor(0,0,1), cyan:   g.toColor(0,1,1)
  };

  let activeTheme  = g.theme;                          // currently active theme
  let pendingTheme = Object.assign({},activeTheme);
  let chosenDetail = null;           // one of 'fg','bg','fg2','bg2','fgH','bgH'

/**** Label ****/

  function Label (Text, Options) {
    function renderLabel (Details) {
      let halfWidth  = Details.w/2, xAlignment = Details.halign || 0;
      let halfHeight = Details.h/2, yAlignment = Details.valign || 0;
      let Padding = Details.pad || 0;

      g.setColor(Details.col || g.theme.fg || '#000000');

      if (Details.font != null) { g.setFont(Details.font); }
      g.setFontAlign(xAlignment,yAlignment);

      let x = Details.x + halfWidth  + xAlignment*(halfWidth+Padding);
      let y = Details.y + halfHeight + yAlignment*(halfHeight+Padding);

      g.drawString(Details.label, x,y);
      if (Details.bold) {
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
      let TextMetrics;
      if (! Result.width || ! Result.height) {
        if (Result.font != null) { g.setFont(Result.font); }
        TextMetrics = g.stringMetrics(Result.label);
      }

      Result.width  = Result.width  || TextMetrics.width  + 2*(Result.pad || 0);
      Result.height = Result.height || TextMetrics.height + 2*(Result.pad || 0);
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


/**** Button ****/

  function Button (Text, Options) {
    function renderButton (Details) {
      let x = Details.x, Width  = Details.w, halfWidth  = Width/2;
      let y = Details.y, Height = Details.h, halfHeight = Height/2;
      let Padding = Details.pad || 0;

      g.setColor(Details.col || g.theme.fg || '#000000');

      if (Details.font != null) { g.setFont(Details.font); }
      g.setFontAlign(0,0);

      g.drawRoundedRect(x+Padding,y+Padding, x+Width-Padding-1,y+Height-Padding-1,8);
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
      let TextMetrics;
      if (! Result.width || ! Result.height) {
        if (Options.font != null) { g.setFont(Options.font); }
        TextMetrics = g.stringMetrics(Result.label);
      }

      Result.width  = Result.width  || TextMetrics.width + 2*10 + 2*(Result.pad || 0);
      Result.height = Result.height || TextMetrics.height + 2*5 + 2*(Result.pad || 0);
    return Result;
  }

/**** ColorDemo ****/

  function ColorDemo (Text, Options) {
    function renderDemo (Details) {
      let x = Details.x, Width  = Details.w, halfWidth  = Width/2;
      let y = Details.y, Height = Details.h, halfHeight = Height/2;
      let Padding = Details.pad || 0;

      if (Details.font != null) { g.setFont(Details.font); }
      g.setFontAlign(0,0);

      g.setColor(Details.bg); // do not use "bgCol"!
      g.fillRect(x+Padding, y+Padding, x+Width-Padding, y+Height-Padding);

      g.setColor(Details.fg);
      g.drawString(Details.label, x+halfWidth,y+halfHeight);
    }

    let Result = Object.assign((
      Options == null ? {} : Object.assign({}, Options.common || {}, Options)
    ), {
      type:'custom', render:renderDemo, label:Text || 'Test'
    });
      let TextMetrics;
      if (! Result.width || ! Result.height) {
        if (Result.font != null) { g.setFont(Result.font); }
        TextMetrics = g.stringMetrics(Result.label);
      }

      Result.width  = Result.width  || TextMetrics.width  + 2*2 + 2*(Result.pad || 0);
      Result.height = Result.height || TextMetrics.height + 2*2 + 2*(Result.pad || 0);
    return Result;
  }


/**** ColorView ****/

  function ColorView (Color, Options) {
    function renderColorView (Details) {
      let x = Details.x, Width  = Details.w;
      let y = Details.y, Height = Details.h;
      let Padding = Details.pad || 0;

      g.setColor('#000000');
      g.drawRect(x+Padding,y+Padding, x+Width-Padding-1,y+Height-Padding-1);

      g.setColor(Details.col);
      g.fillRect(x+Padding+2, y+Padding+2, x+Width-Padding-3, y+Height-Padding-3);
    }

    let Result = Object.assign((
      Options == null ? {} : Object.assign({}, Options.common || {}, Options)
    ), {
      type:'custom', render:renderColorView, col:Color
    });
      Result.width  = Math.max(10, Result.width  || 10) + 2*(Result.pad || 0);
      Result.height = Math.max(10, Result.height || 10) + 2*(Result.pad || 0);
    return Result;
  }


/**** ColorSelectionView ****/

  function ColorSelectionView (Color, Options) {
    function renderColorView (Details) {
      let x = Details.x, Width  = Details.w;
      let y = Details.y, Height = Details.h;
      let Padding = Details.pad || 0;

      if (Details.selected) {
        g.setColor(Details.selected ? '#FF0000' : '#000000');
        g.fillRect(x+Padding,y+Padding, x+Width-Padding-1,y+Height-Padding-1);

        g.setColor('#FFFFFF');
        g.drawRect(x+Padding+4,y+Padding+4, x+Width-Padding-5,y+Height-Padding-5);
      } else {
        g.setColor('#000000');
        g.drawRect(x+Padding+3,y+Padding+3, x+Width-Padding-4,y+Height-Padding-4);
      }

      g.setColor(Details.col);
      g.fillRect(x+Padding+5, y+Padding+5, x+Width-Padding-6, y+Height-Padding-6);
    }

    let Result = Object.assign((
      Options == null ? {} : Object.assign({}, Options.common || {}, Options)
    ), {
      type:'custom', render:renderColorView, col:Color
    });
      Result.width  = Math.max(10, Result.width  || 10) + 2*(Result.pad || 0);
      Result.height = Math.max(10, Result.height || 10) + 2*(Result.pad || 0);
    return Result;
  }


/**** EventConsumerAtPoint ****/

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

  function dispatchTouchEvent () {
    function handleTouchEvent (Button, xy) {
      let Control = EventConsumerAtPoint('onTouch', xy.x,xy.y);
      if (Control != null) {
        Control.onTouch(Control, Button, xy);
      }
    }
    Bangle.on('touch',handleTouchEvent);
  }
  dispatchTouchEvent();

/**** dispatchStrokeEvent ****/

  function dispatchStrokeEvent () {
    function handleStrokeEvent (Coordinates) {
      let Control = EventConsumerAtPoint('onStroke', Coordinates.xy[0],Coordinates.xy[1]);
      if (Control != null) {
        Control.onStroke(Control, Coordinates);
      }
    }
    Bangle.on('stroke',handleStrokeEvent);
  }
  dispatchStrokeEvent();

  let ScreenSet = {};

  g.setFont12x20();                  // does not seem to be respected in layout!
  let leftColumnWidth = Math.max(
    g.stringWidth('Normal '), g.stringWidth('Accented '), g.stringWidth('Hilighted ')
  );

  let StdFont         = { font:'12x20' };
  let legible         = Object.assign({ col:'#000000', bgCol:'#FFFFFF' }, StdFont);
  let leftAligned     = Object.assign({ halign:-1, valign:0 }, legible);
  let MainLabel       = Object.assign({ pad:4, width:leftColumnWidth }, leftAligned);
  let halfWidthButton = Object.assign({ pad:4, width:halfWidth }, legible);

  ScreenSet['MainScreen'] = new Layout({
    type:'v', c:[
      Label('Current Theme', { common:legible, pad:8, bold:true, filly:1 }),
      { type:'h', c:[
        Label('Normal',    { common:MainLabel }),
        ColorDemo(' Demo ',{ common:StdFont, pad:2, id:'NormalDemo' }),
      ] },
      { type:'h', c:[
        Label('Accented',  { common:MainLabel }),
        ColorDemo(' Demo ',{ common:StdFont, pad:2, id:'AccentedDemo' }),
      ] },
      { type:'h', c:[
        Label('Hilighted', { common:MainLabel }),
        ColorDemo(' Demo ',{ common:StdFont, pad:2, id:'HilitedDemo' }),
      ] },
      { height:4 },
      { type:'h', c:[
        Button('Exit',   { common:halfWidthButton, onTouch:() => load() }),
        Button('Config', { common:halfWidthButton, onTouch:() => gotoScreen('DetailSelectionScreen') })
      ], filly:1 }
    ]
  });

  let LabelWidth = Math.max(
    g.stringWidth('Fg '), g.stringWidth('Fg2 '), g.stringWidth('FgH '),
    g.stringWidth('Bg '), g.stringWidth('Bg2 '), g.stringWidth('BgH ')
  );
  let LabelHeight = g.stringMetrics('FgH').height;

  let DetailLabel  = Object.assign({ pad:4, width:LabelWidth }, leftAligned);
  let DetailView   = { width:30, height:LabelHeight, pad:2 };

  ScreenSet['DetailSelectionScreen'] = new Layout({
    type:'v', c:[
      Label('Configure Detail', { font:'12x20', pad:8, col:'#000000', bgCol:'#FFFFFF', bold:true, filly:1 }),
      { type:'h', c:[
        Label('fg',  { common:DetailLabel, onTouch:() => configureDetail('fg') }),
        ColorView(0, { common:DetailView,  onTouch:() => configureDetail('fg'), id:'fgView' }),
        { width:20 },
        Label('bg',  { common:DetailLabel, onTouch:() => configureDetail('bg') }),
        ColorView(0, { common:DetailView,  onTouch:() => configureDetail('bg'), id:'bgView' }),
      ] },
      { type:'h', c:[
        Label('fg2', { common:DetailLabel, onTouch:() => configureDetail('fg2') }),
        ColorView(0, { common:DetailView,  onTouch:() => configureDetail('fg2'), id:'fg2View' }),
        { width:20 },
        Label('bg2', { common:DetailLabel, onTouch:() => configureDetail('bg2') }),
        ColorView(0, { common:DetailView,  onTouch:() => configureDetail('bg2'), id:'bg2View' }),
      ] },
      { type:'h', c:[
        Label('fgH', { common:DetailLabel, onTouch:() => configureDetail('fgH') }),
        ColorView(0, { common:DetailView,  onTouch:() => configureDetail('fgH'), id:'fgHView' }),
        { width:20 },
        Label('bgH', { common:DetailLabel, onTouch:() => configureDetail('bgH') }),
        ColorView(0, { common:DetailView,  onTouch:() => configureDetail('bgH'), id:'bgHView' }),
      ] },
      { type:'h', c:[
        Button('Save',   { common:halfWidthButton, onTouch:() => { applyChanges(); gotoScreen('MainScreen'); } }),
        Button('Cancel', { common:halfWidthButton, onTouch:() => gotoScreen('MainScreen') })
      ], filly:1 },
    ]
  });

  let StdSelectionView = { width:40, height:40, pad:2 };

  ScreenSet['ColorSelectionScreen'] = new Layout({
    type:'v', c:[
      Label('Choose Color', { font:'12x20', pad:8, col:'#000000', bgCol:'#FFFFFF', bold:true, filly:1 }),
      { type:'h', c:[
        ColorSelectionView('#000000',{ common:StdSelectionView, id:'black',
          onTouch:() => selectColor(0,0,0) }),
        ColorSelectionView('#FF0000',{ common:StdSelectionView, id:'red',
          onTouch:() => selectColor(1,0,0) }),
        ColorSelectionView('#00FF00',{ common:StdSelectionView, id:'green',
          onTouch:() => selectColor(0,1,0) }),
        ColorSelectionView('#0000FF',{ common:StdSelectionView, id:'blue',
          onTouch:() => selectColor(0,0,1) }),
      ] },
      { type:'h', c:[
        ColorSelectionView('#FFFFFF',{ common:StdSelectionView, id:'white',
          onTouch:() => selectColor(1,1,1) }),
        ColorSelectionView('#FFFF00',{ common:StdSelectionView, id:'yellow',
          onTouch:() => selectColor(1,1,0) }),
        ColorSelectionView('#FF00FF',{ common:StdSelectionView, id:'magenta',
          onTouch:() => selectColor(1,0,1) }),
        ColorSelectionView('#00FFFF',{ common:StdSelectionView, id:'cyan',
          onTouch:() => selectColor(0,1,1) }),
      ] },
      { height:4 },
      { type:'h', c:[
        Button('Back',    { common:halfWidthButton, onTouch:() => gotoScreen('DetailSelectionScreen') }),
        Button('Preview', { common:halfWidthButton, onTouch:() => gotoScreen('ThemePreviewScreen') })
      ], filly:1 },
    ]
  });

  ScreenSet['ThemePreviewScreen'] = new Layout({
    type:'v', c:[
      Label('Theme Preview', { common:legible, bold:true, filly:1 }),
      { type:'h', c:[
        Label('Normal',    { common:MainLabel }),
        ColorDemo(' Test ',{ common:StdFont, pad:2, id:'NormalTest' }),
      ] },
      { type:'h', c:[
        Label('Accented',  { common:MainLabel }),
        ColorDemo(' Test ',{ common:StdFont, pad:2, id:'AccentedTest' }),
      ] },
      { type:'h', c:[
        Label('Hilighted', { common:MainLabel }),
        ColorDemo(' Test ',{ common:StdFont, pad:2, id:'HilitedTest' }),
      ] },
      { height:4 },
      { type:'h', c:[
        Button('Back', { common:legible, pad:4, onTouch:() => gotoScreen('ColorSelectionScreen') })
      ], filly:1 }
    ]
  });


/**** applyChanges ****/

  function applyChanges () {
    let pendingBg = pendingTheme.bg;
      let R = ((pendingBg >> 11) & 0b11111)  / 0b11111;
      let G = ((pendingBg >>  5) & 0b111111) / 0b111111;
      let B =  (pendingBg        & 0b11111)  / 0b11111;
    pendingTheme.dark = (0.2126*R + 0.7152*G + 0.0722*B < 0.5);

    activeTheme = Object.assign(activeTheme,pendingTheme);

    let globalSettings = Object.assign(
      require('Storage').readJSON('setting.json', true) || {},
      { theme:activeTheme }
    );
    require('Storage').writeJSON('setting.json', globalSettings);
  }

/**** configureDetail ****/

  function configureDetail (Detail) {
    chosenDetail = Detail;
    gotoScreen('ColorSelectionScreen');
  }

/**** updateColorSelection ****/

  function updateColorSelection () {
    let selectedColor = pendingTheme[chosenDetail];

    for (let Key in normalizedColorSet) {
      if (normalizedColorSet.hasOwnProperty(Key)) {
        activeLayout[Key].selected = (selectedColor === normalizedColorSet[Key]);
      }
    }
  }

/**** selectColor ****/

  function selectColor (R,G,B) {
    let selectedColor = g.toColor(R,G,B);
    pendingTheme[chosenDetail] = selectedColor;

    updateColorSelection();
    g.clear();
    activeLayout.render();
  }

/**** gotoScreen ****/

  let activeLayout;

  function gotoScreen (ScreenName) {
    activeLayout = ScreenSet[ScreenName];

    switch (ScreenName) {
      case 'MainScreen':
        activeLayout['NormalDemo'].fg   = activeTheme.fg;
        activeLayout['NormalDemo'].bg   = activeTheme.bg;
        activeLayout['AccentedDemo'].fg = activeTheme.fg2;
        activeLayout['AccentedDemo'].bg = activeTheme.bg2;
        activeLayout['HilitedDemo'].fg  = activeTheme.fgH;
        activeLayout['HilitedDemo'].bg  = activeTheme.bgH;
        break;
      case 'DetailSelectionScreen':
        activeLayout['fgView'].col  = pendingTheme.fg;
        activeLayout['bgView'].col  = pendingTheme.bg;
        activeLayout['fg2View'].col = pendingTheme.fg2;
        activeLayout['bg2View'].col = pendingTheme.bg2;
        activeLayout['fgHView'].col = pendingTheme.fgH;
        activeLayout['bgHView'].col = pendingTheme.bgH;
        break;
      case 'ColorSelectionScreen':
        updateColorSelection();
        break;
      case 'ThemePreviewScreen':
        activeLayout['NormalTest'].fg   = pendingTheme.fg;
        activeLayout['NormalTest'].bg   = pendingTheme.bg;
        activeLayout['AccentedTest'].fg = pendingTheme.fg2;
        activeLayout['AccentedTest'].bg = pendingTheme.bg2;
        activeLayout['HilitedTest'].fg  = pendingTheme.fgH;
        activeLayout['HilitedTest'].bg  = pendingTheme.bgH;
    }

    g.setColor('#000000'); g.setBgColor('#FFFFFF');         // assert legibility
    g.clear();

    activeLayout.render();
  }
  gotoScreen('MainScreen');

