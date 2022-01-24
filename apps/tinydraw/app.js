(function () {
  var pen = 'circle';
  var discard = null;
  var kule = [0, 255, 255];  // R, G, B
  var oldLock = false;

  setInterval(() => {
    if (Bangle.isLocked()) {
      if (oldLock) {
        return;
      }
      g.setColor('#fff');
      g.fillRect(0, 0, g.getWidth(), 20);
      g.setFont('6x8', 2);
      g.setColor('#000');
      g.drawString('PLEASE UNLOCK', 10, 2);
      oldLock = true;
    } else {
      oldLock = false;
      drawUtil();
    }
  }, 1000);

  function nextColor () {
    kule[0] = Math.random();
    kule[1] = Math.random();
    kule[2] = Math.random();
  }

  function nextPen () {
    switch (pen) {
      case 'circle': pen = 'pixel'; break;
      case 'pixel': pen = 'crayon'; break;
      case 'crayon': pen = 'square'; break;
      case 'square': pen = 'circle'; break;
      default: pen = 'pixel'; break;
    }
    console.log('set time');
    drawUtil();

    discard = setTimeout(function () { console.log('timeout'); discard = null; }, 500);
  }

  function drawUtil () {
    if (Bangle.isLocked()) {
    // do something to tell the user to unlock the screen
    }
    // titlebar
    g.setColor(kule[0], kule[1], kule[2]);
    g.fillRect(0, 0, g.getWidth(), 20);
    // clear button
    g.setColor('#000'); // black
    g.fillCircle(10, 10, 8, 8);
    g.setColor('#fff');
    g.drawLine(8, 8, 13, 13);
    g.drawLine(13, 8, 8, 13);
    // tool button
    g.setColor('#fff');
    g.fillCircle(g.getWidth() - 10, 10, 8);
    g.setColor('#000');

    var w = g.getWidth();
    switch (pen) {
      case 'circle':
        g.fillCircle(w - 10, 10, 5);
        break;
      case 'square':
        g.fillRect(w - 5, 5, w - 15, 15);
        break;
      case 'pixel':
        g.setPixel(10, 10);
        g.fillCircle(w - 10, 10, 2);
        break;
      case 'crayon':
        var tap = { x: 10, y: 15, dy: -5, dx: 5 };
        g.drawLine(w - tap.x, tap.y, w - tap.x + tap.dx, tap.y + tap.dy);
        g.drawLine(w - tap.x + 1, tap.y + 2, w - tap.x + tap.dx, tap.y + tap.dy - 2);
        g.drawLine(w - tap.x + 2, tap.y + 2, w - tap.x + tap.dx, tap.y + tap.dy + 2);
        break;
    }
  }
  var tapTimer = null;
  Bangle.on('drag', function (tap) {
    if (tap.b === 0) {
      if (tapTimer !== null) {
        clearTimeout(tapTimer);
        tapTimer = null;
      }
    }
    // tap and hold the clear button
    if (tap.x < 32 && tap.y < 32) {
      if (tap.b === 1) {
        if (tapTimer === null) {
          tapTimer = setTimeout(function () {
            g.clear();
            drawUtil();
            tapTimer = null;
          }, 800);
        }
        if (discard) {
          clearTimeout(discard); discard = null;
          return;
        }
      }
      return;
    }
    if (tap.x > g.getWidth() - 32 && tap.y < 32) {
      if (tap.b === 1) {
        if (tapTimer === null) {
          tapTimer = setTimeout(function () {
            g.clear();
            drawUtil();
            tapTimer = null;
          }, 800);
        }
        if (discard) {
          clearTimeout(discard);
          discard = null;
          return;
        }
        nextPen();
      }
      drawUtil();
      return;
    } else if (tap.y < 32) {
      nextColor();
      drawUtil();
      return;
    }

    g.setColor(kule[0], kule[1], kule[2]);

    switch (pen) {
      case 'pixel':
        g.setPixel(tap.x, tap.y);
        g.drawLine(tap.x, tap.y, tap.x + tap.dx, tap.y + tap.dy);
        break;
      case 'crayon':
        g.drawLine(tap.x, tap.y, tap.x + tap.dx, tap.y + tap.dy);
        g.drawLine(tap.x + 1, tap.y + 2, tap.x + tap.dx, tap.y + tap.dy - 2);
        g.drawLine(tap.x + 2, tap.y + 2, tap.x + tap.dx, tap.y + tap.dy + 2);
        break;
      case 'circle':
        var XS = tap.dx / 10;
        var YS = tap.dy / 10;
        for (i = 0; i < 10; i++) {
          g.fillCircle(tap.x + (i * XS), tap.y + (i * YS), 4, 4);
        }
        break;
      case 'square':
        g.fillRect(tap.x - 10, tap.y - 10, tap.x + 10, tap.y + 10);
        break;
    }
    drawUtil();
  });

  g.clear();
  drawUtil();
})();
