(function () {
  let pen = 'circle';
  let discard = null;
  const kule = [0, 255, 255]; // R, G, B
  let oldLock = false;

Bangle.on("lock", function() {
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
});
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
    drawUtil();

    discard = setTimeout(function () { oldX = -1; oldY = -1; console.log('timeout'); discard = null; }, 500);
  }

  var oldX = -1;
  var oldY = -1;

  function drawBrushIcon () {
    const w = g.getWidth();
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
        g.drawLine(w - 10, 5, w - 10, 15);
        g.drawLine(w - 14, 6, w - 10, 12);
        g.drawLine(w - 6, 6, w - 10, 12);
        break;
    }
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
    drawBrushIcon();
  }

  let tapTimer = null;
  let dragTimer = null;
  Bangle.on('drag', function (tap) {
    let from = { x: tap.x, y: tap.y };
    const to = { x: tap.x + tap.dx, y: tap.y + tap.dy };
    if (oldX != -1) {
      from = { x: oldX, y: oldY };
    }
    if (tap.b === 0) {
      if (tapTimer !== null) {
        clearTimeout(tapTimer);
        tapTimer = null;
      }
    }
    if (dragTimer != null) {
      clearTimeout(dragTimer);
      dragTimer = null;
    }
    dragTimer = setTimeout(function () {
      oldX = -1;
      oldY = -1;
    }, 100);

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
            oldX = -1; oldY = -1;

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
    oldX = to.x;
    oldY = to.y;
    g.setColor(kule[0], kule[1], kule[2]);

    switch (pen) {
      case 'pixel':
        g.drawLine(from.x, from.y, to.x, to.y);
        break;
      case 'crayon':
        g.drawLine(from.x, from.y, to.x, to.y);
        g.drawLine(from.x + 1, from.y + 2, to.x, to.y - 2);
        g.drawLine(from.x + 2, from.y + 2, to.x, to.y + 2);
        break;
      case 'circle':
        var XS = (to.x - from.x) / 32;
        var YS = (to.y - from.y) / 32;
        for (let i = 0; i < 32; i++) {
          g.fillCircle(from.x + (i * XS), from.y + (i * YS), 4, 4);
        }
        break;
      case 'square':
        var XS = (to.x - from.x) / 32;
        var YS = (to.y - from.y) / 32;
        for (let i = 0; i < 32; i++) {
          const posX = from.x + (i * XS);
          const posY = from.y + (i * YS);
          g.fillRect(posX - 10, posY - 10, posX + 10, posY + 10);
        }
        break;
    }
    drawUtil();
  });

  g.clear();
  drawUtil();
})();

