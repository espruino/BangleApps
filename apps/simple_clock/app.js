  let ScreenWidth  = g.getWidth(),  CenterX = ScreenWidth/2;
  let ScreenHeight = g.getHeight(), CenterY = ScreenHeight/2;

  let outerRadius = Math.min(CenterX,CenterY) * 0.9;

  Bangle.setUI('clock');

  Bangle.loadWidgets();

/**** updateClockFaceSize ****/

  function updateClockFaceSize () {
    CenterX = ScreenWidth/2;
    CenterY = ScreenHeight/2;

    outerRadius = Math.min(CenterX,CenterY) * 0.9;

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
      cy = CenterY + 12; dy = y - cy; r2 = dx*dx + dy*dy; r = Math.sqrt(r2);
    }

    x = WidgetLayouts.tr.x; y = WidgetLayouts.tr.y+24; dx = x - cx; dy = y - cy;
    if (dx*dx + dy*dy < r2) {
      cy = CenterY + 12; dy = y - cy; r2 = dx*dx + dy*dy; r = Math.sqrt(r2);
    }

    x = WidgetLayouts.bl.x; y = WidgetLayouts.bl.y; dx = x - cx; dy = y - cy;
    if (dx*dx + dy*dy < r2) {
      cy = CenterY - 12; dy = y - cy; r2 = dx*dx + dy*dy; r = Math.sqrt(r2);
    }

    x = WidgetLayouts.br.x; y = WidgetLayouts.br.y; dx = x - cx; dy = y - cy;
    if (dx*dx + dy*dy < r2) {
      cy = CenterY - 12; dy = y - cy; r2 = dx*dx + dy*dy; r = Math.sqrt(r2);
    }

    CenterX = cx; CenterY = cy; outerRadius = r * 0.9;
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

  let HourHandLength = outerRadius * 0.5;
  let HourHandWidth  = 2*3, halfHourHandWidth = HourHandWidth/2;

  let MinuteHandLength = outerRadius * 0.7;
  let MinuteHandWidth  = 2*2, halfMinuteHandWidth = MinuteHandWidth/2;

  let SecondHandLength = outerRadius * 0.9;
  let SecondHandOffset = 6;

  let twoPi  = 2*Math.PI;
  let Pi     = Math.PI;

  let sin = Math.sin, cos = Math.cos;

  let HourHandPolygon = [
    -halfHourHandWidth,halfHourHandWidth,
    -halfHourHandWidth,halfHourHandWidth-HourHandLength,
     halfHourHandWidth,halfHourHandWidth-HourHandLength,
     halfHourHandWidth,halfHourHandWidth,
  ];

  let MinuteHandPolygon = [
    -halfMinuteHandWidth,halfMinuteHandWidth,
    -halfMinuteHandWidth,halfMinuteHandWidth-MinuteHandLength,
     halfMinuteHandWidth,halfMinuteHandWidth-MinuteHandLength,
     halfMinuteHandWidth,halfMinuteHandWidth,
  ];

/**** drawClockFace ****/

  function drawClockFace () {
    g.setColor(g.theme.fg);
    g.setFont('Vector', 22);

    g.setFontAlign(0,-1);
    g.drawString('12', CenterX,CenterY-outerRadius);

    g.setFontAlign(1,0);
    g.drawString('3', CenterX+outerRadius,CenterY);

    g.setFontAlign(0,1);
    g.drawString('6', CenterX,CenterY+outerRadius);

    g.setFontAlign(-1,0);
    g.drawString('9', CenterX-outerRadius,CenterY);
  }

/**** transforme polygon ****/

  let transformedPolygon = new Array(HourHandPolygon.length);

  function transformPolygon (originalPolygon, OriginX,OriginY, Phi) {
    let sPhi = sin(Phi), cPhi = cos(Phi), x,y;

    for (let i = 0, l = originalPolygon.length; i < l; i+=2) {
      x = originalPolygon[i];
      y = originalPolygon[i+1];

      transformedPolygon[i]   = OriginX + x*cPhi + y*sPhi;
      transformedPolygon[i+1] = OriginY + x*sPhi - y*cPhi;
    }
  }

/**** draw clock hands ****/

  function drawClockHands () {
    let now = new Date();

    let Hours   = now.getHours() % 12;
    let Minutes = now.getMinutes();
    let Seconds = now.getSeconds();

    let HoursAngle   = (Hours+(Minutes/60))/12 * twoPi - Pi;
    let MinutesAngle = (Minutes/60)            * twoPi - Pi;
    let SecondsAngle = (Seconds/60)            * twoPi - Pi;

    g.setColor(g.theme.fg);

    transformPolygon(HourHandPolygon, CenterX,CenterY, HoursAngle);
    g.fillPoly(transformedPolygon);

    transformPolygon(MinuteHandPolygon, CenterX,CenterY, MinutesAngle);
    g.fillPoly(transformedPolygon);

    let sPhi = Math.sin(SecondsAngle), cPhi = Math.cos(SecondsAngle);

    g.setColor(g.theme.fg2);
    g.drawLine(
      CenterX + SecondHandOffset*sPhi,
      CenterY - SecondHandOffset*cPhi,
      CenterX - SecondHandLength*sPhi,
      CenterY + SecondHandLength*cPhi
    );
  }

/**** refreshDisplay ****/

  let Timer;
  function refreshDisplay () {
    g.clear(true);                                   // also loads current theme

    Bangle.drawWidgets();

    drawClockFace();
    drawClockHands();

    let Pause = 1000 - (Date.now() % 1000);
    Timer = setTimeout(refreshDisplay,Pause);
  }

  setTimeout(refreshDisplay, 500);                 // enqueue first draw request

  Bangle.on('lcdPower', (on) => {
    if (on) {
      if (Timer != null) { clearTimeout(Timer); Timer = undefined; }
      refreshDisplay();
    }
  });

