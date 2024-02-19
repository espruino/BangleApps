//----------------------------------------------------------------------------//
//--          ColorWheel - draws a "wheel" of good looking colors           --//
//----------------------------------------------------------------------------//

  let ColorList = [
    '#0000FF', '#8000FF', '#FF00FF', '#FF0080', '#FF0000', '#FF8000',
    '#FFFF00', '#80FF00', '#00FF00', '#00FF80', '#00FFFF', '#0080FF'
  ];

  let ScreenWidth  = g.getWidth(),  CenterX = ScreenWidth/2;
  let ScreenHeight = g.getHeight(), CenterY = ScreenHeight/2;

  let outerRadius = Math.min(CenterX,CenterY) * 0.9;
  let innerRadius = outerRadius*0.5;

  let sin = Math.sin, cos = Math.cos;
  let twoPi = 2*Math.PI, halfPi = Math.PI/2;

  let DeltaPhi = twoPi/72;
  let Epsilon  = 0.001;

  g.clear();

  g.setColor(0,0,0);
  g.fillRect(0,0, ScreenWidth,ScreenHeight);

  for (let i = 0; i < 12; i++) {
    let Phi0 = i * twoPi/12, Phi1 = (i+1) * twoPi/12;

    let Polygon = [];
      for (let Phi = Phi0; Phi <= Phi1+Epsilon; Phi += DeltaPhi) {
        Polygon.push(CenterX + outerRadius * sin(Phi));
        Polygon.push(CenterY - outerRadius * cos(Phi));
      }

      for (let Phi = Phi1; Phi >= Phi0-Epsilon; Phi -= DeltaPhi) {
        Polygon.push(CenterX + innerRadius * sin(Phi));
        Polygon.push(CenterY - innerRadius * cos(Phi));
      }
    g.setColor(ColorList[i]);
    g.fillPoly(Polygon);
  }

  g.setColor(1,1,1);
  g.fillCircle(CenterX,CenterY, innerRadius);

  g.setFont12x20();
  g.setFontAlign(0,0);
  g.setColor(0,0,0);

  g.drawString('Tap',   CenterX,CenterY-20);
  g.drawString('on a',  CenterX,CenterY);
  g.drawString('Color', CenterX,CenterY+20);

  Bangle.on('touch', function (Button,Position) {
    Bangle.buzz();

    let dx = Position.x - CenterX;
    let dy = Position.y - CenterY;

    let Radius = Math.sqrt(dx*dx + dy*dy);

    let Color;
      switch (true) {
        case (Radius > outerRadius): Color = '#000000'; break;
        case (Radius < innerRadius): Color = '#FFFFFF'; break;
        default: {
          let Phi = Math.atan2(dy,dx) + halfPi;
          if (Phi < 0)     { Phi += twoPi; }
          if (Phi > twoPi) { Phi -= twoPi; }

          let Index = Math.floor(12*Phi/twoPi);
          Color = ColorList[Index];
        }
      }
    g.setColor(1,1,1);
    g.fillCircle(CenterX,CenterY, innerRadius);

    g.setColor(0,0,0);
    g.drawString(Color, CenterX,CenterY);
  });
