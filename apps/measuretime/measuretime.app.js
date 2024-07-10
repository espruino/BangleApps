{
  require("Font7x11Numeric7Seg").add(Graphics);
  g.setFont("7x11Numeric7Seg");
  g.setFontAlign(0, 0);

  const centerY = g.getHeight() / 2; //88
  const lineStart = 25;
  const lineEndFull = 110;
  const lineEndHalf = 90;
  const lineEndQuarter = 70;
  const lineEndDefault = 50;

  let drawTimeout;

  let queueDrawTime = function () {
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = setTimeout(function () {
      drawTimeout = undefined;
      drawTime();
    }, 60000 - (Date.now() % 60000));
  };

  let drawCenterLine = function () {
    // center line
    g.drawLineAA(0, centerY, g.getWidth(), centerY);
    // left decoration
    var steps = [0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    var stepsReversed = steps.slice();
    stepsReversed.reverse();
    var polyLeftTop = [];
    var polyLeftBottom = [];
    var polyRightTop = [];
    var polyRightBottom = [];
    let xL = 0;
    let xR = g.getWidth() - 1;
    let yT = centerY - 13;
    let yB = centerY + 13;

    for (let i = 0; i < steps.length; i++) {
      xL += steps[i];
      xR -= steps[i];
      yT += stepsReversed[i];
      yB -= stepsReversed[i];

      // Left Top
      polyLeftTop.push(xL);
      polyLeftTop.push(yT);

      // Left Bottom
      polyLeftBottom.push(xL);
      polyLeftBottom.push(yB);

      // Right Top
      polyRightTop.push(xR);
      polyRightTop.push(yT);

      // Right Bottom
      polyRightBottom.push(xR);
      polyRightBottom.push(yB);
    }

    polyLeftTop.push(0, 88);
    polyLeftBottom.push(0, 88);
    polyRightTop.push(g.getWidth(), 88);
    polyRightBottom.push(g.getWidth(), 88);

    g.fillPolyAA(polyLeftTop, true);
    g.fillPolyAA(polyLeftBottom, true);
    g.fillPolyAA(polyRightTop, true);
    g.fillPolyAA(polyRightBottom, true);
  };

  let drawTime = function () {
    g.clear();
    var d = new Date();
    var mins = d.getMinutes();

    var offset = mins % 5;
    var yTopLines = centerY - offset;
    var topReached = false;

    var yBottomLines = centerY - offset + 5;
    var bottomReached = false;

    drawCenterLine();

    var lineEnd = lineEndDefault;
    g.setFont("7x11Numeric7Seg", 2);
    g.setFontAlign(0, 0);

    // gone
    do {
      switch (yTopLines - 88 + mins) {
        case -60:
          lineEnd = lineEndFull;
          g.drawString(d.getHours() - 1, lineEnd + 10, yTopLines, true);
          break;
        case 0:
        case 60:
          lineEnd = lineEndFull;
          g.drawString(d.getHours(), lineEnd + 10, yTopLines, true);
          break;
        case 45:
        case -45:
        case 15:
        case -15:
        case -75:
          lineEnd = lineEndQuarter;
          break;
        case 30:
        case -30:
          lineEnd = lineEndHalf;
          break;
        default:
          lineEnd = lineEndDefault;
      }
      g.drawLineAA(lineStart, yTopLines, lineEnd, yTopLines);

      yTopLines -= 5;
      if (yTopLines < -4) {
        topReached = true;
      }
    } while (!topReached);

    // upcoming
    do {
      switch (yBottomLines - 88 + mins) {
        case 0:
        case 60:
          lineEnd = lineEndFull;
          g.drawString(d.getHours() + 1, lineEnd + 10, yBottomLines, true);
          break;
        case 120:
          lineEnd = lineEndFull;
          g.drawString(d.getHours() + 2, lineEnd + 10, yBottomLines, true);
          break;
        case 15:
        case 75:
        case 135:
        case 45:
        case 105:
        case 165:
          lineEnd = lineEndQuarter;
          break;
        case 30:
        case 90:
        case 150:
          lineEnd = lineEndHalf;
          break;
        default:
          lineEnd = lineEndDefault;
      }
      g.drawLineAA(lineStart, yBottomLines, lineEnd, yBottomLines);

      yBottomLines += 5;
      if (yBottomLines > 176) {
        bottomReached = true;
      }
    } while (!bottomReached);

    queueDrawTime();
  };


  g.clear();
  drawTime();

  Bangle.setUI(
    {
      mode: "clock",
      remove: function () {
        if (drawTimeout) clearTimeout(drawTimeout);
        require("widget_utils").show();
      }
    }
  );

  Bangle.loadWidgets();
  require("widget_utils").swipeOn();
}
