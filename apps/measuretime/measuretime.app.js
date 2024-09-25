{
  require("Font7x11Numeric7Seg").add(Graphics);

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
    var polyLeftTop = [0, 0];
    var polyLeftBottom = [0, g.getHeight()];
    var polyRightTop = [g.getWidth() - 1, 0];
    var polyRightBottom = [g.getWidth() - 1, g.getHeight()];
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

  let hourStringXOffset = function (hour) {
    if (hour == 1) {
      return lineEndFull - 5;
    }
    if (hour < 10 || hour >= 20) {
      return lineEndFull + 5;
    }
    return lineEndFull - 5;
  };

  let drawHourString = function(hour, yLines) {
    var hourForDrawing = 0;
    if (hour < 0) {
      // a negative hour => (+ and - = -)
      hourForDrawing = 24 + hour;
    } else if (hour >= 24) {
      hourForDrawing = hour - 24;
    } else {
      hourForDrawing = hour;
    }
    g.drawString(hourForDrawing, hourStringXOffset(hourForDrawing), yLines, true);
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
    g.setFontAlign(-1, 0);

    // gone
    do {
      switch (yTopLines - 88 + mins) {
        case -60:
          lineEnd = lineEndFull;
          drawHourString(d.getHours() - 1, yTopLines);
          break;
        case 0:
        case 60:
          lineEnd = lineEndFull;
          drawHourString(d.getHours(), yTopLines);
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
          drawHourString(d.getHours() + 1, yBottomLines);
          break;
        case 120:
          lineEnd = lineEndFull;
          drawHourString(d.getHours() + 2, yBottomLines);
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
