// Icon bits, thanks to tinydraw
/* eslint-disable no-unused-vars */
/* We have functions we expect user to call from command line, so they
 * appear "unused" to lint */

  // font, draw, icon
  let mode;
  let pen = 'pixel';
  let discard = null;
  let kule = [0, 0, 0]; // R, G, B
  var font_height = 22, font_width = 8;
  var zoom_x = 64, zoom_y = 24, zoom_f = 6;
  let oldLock = false;
  let sg = null;
  
  function clear(m) {
    sg.setColor(1,1,1).fillRect(0,0, font_width, font_height);
  }

  function setup(m) {
    mode = m;
    switch (m) {
      case 'font':
        font_height = 22;
        font_width = 8;
        zoom_x = 64;
        zoom_y = 24;
        zoom_f = 6;
        break;
      case 'draw':
        return;
      case 'icon':
        font_height = 48;
        font_width = 48;
        zoom_x = 56;
        zoom_y = 24;
        zoom_f = 2;
        break;
    }
    sg = Graphics.createArrayBuffer(font_width, font_height, 8, {});
    clear();
  }

  function updateLock() {
      if (oldLock) {
        return;
      }
      g.setColor('#fff');
      g.fillRect(0, 0, g.getWidth(), 20);
      g.setFont('6x8', 2);
      g.setColor('#000');
      g.drawString('PLEASE UNLOCK', 10, 2);
      oldLock = true;
  }
Bangle.on("lock", function() {
    if (Bangle.isLocked()) {
      updateLock();
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
  function selectColor (x) {
    let c;
    if (x < g.getWidth()/2) {
      c = 0;
    } else {
      c = 255;
    }
    kule[0] = c;
    kule[1] = c;
    kule[2] = c;
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
  
  function drawArea () {
    g.clear();
    if (mode == "draw")
      return;
    g.setColor(0, 0, 0.5);
    g.fillRect(0, 0, g.getWidth(), g.getHeight());
    g.setColor(1, 1, 1);
    g.fillRect(zoom_x, zoom_y, zoom_x+8*zoom_f, zoom_y+font_height*zoom_f);
    g.setColor(1, 1, 0.75);
    for (let y=0; y<font_height; y++)
      g.drawLine(zoom_x, zoom_y+y*zoom_f, zoom_x+font_width*zoom_f, zoom_y+y*zoom_f);
    for (let x=0; x<font_width; x++)
      g.drawLine(zoom_x+x*zoom_f, zoom_y, zoom_x+x*zoom_f, zoom_y+font_height*zoom_f);
    update();
  }

  function drawUtil () {
    if (Bangle.isLocked()) {
      updateLock();
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
  
  function transform (p) {
    if (p.x < zoom_x || p.y < zoom_y)
      return p;
    p.x = ((p.x - zoom_x) / zoom_f);
    if (false)
      p.x = font_width - p.x;
    p.y = ((p.y - zoom_y) / zoom_f);
    return p;
  }
  
  function __draw (g, from, to) {
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

  }
  
  function update() {
    g.drawImage(sg, 0, 64, {});
    g.drawImage(sg, zoom_x, zoom_y, { scale: zoom_f });
  }
    
  function do_draw(from, to) {
    from = transform(from);
    to = transform(to);
    if (from && to) {
      __draw(sg, from, to);
    }
    update();
  }

  let tapTimer = null;
  let dragTimer = null;
  function on_drag (tap) {
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
            clear();
            drawArea();
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
      if (mode == "draw")
        nextColor();
      else
        selectColor(tap.x);
      drawUtil();
      return;
    }
    oldX = to.x;
    oldY = to.y;
    sg.setColor(kule[0], kule[1], kule[2]);
    g.setColor(kule[0], kule[1], kule[2]);

    do_draw(from, to);
    drawUtil();
  }
  function on_btn(n) {
    function f(i) {
      return "\\x" + i.toString(16).padStart(2, '0');
    }
    print("on_btn", n);
    print(g.getPixel(0, 0));
    let s = f(0) + f(font_width) + f(font_height) + f(1);
    // 0..black, 65535..white
    for (let y = 0; y < font_height; y++) {
      let v = 0;
      for (let x = 0; x < font_width; x++) {
        let p = sg.getPixel(x, y);
        v = v << 1 | (p==0);
      }
      s += f(v);
    }
    print("Manual bitmap\n");
    print('ft("' + s + '");');
    if (1) {
      s = "";
      var im = sg.asImage("string");
      for (var v of im) {
        //print("val", v, typeof v);
        s += f(v);
      }
      //print("wh", im, typeof im, im[0], typeof im[0]);
      //print("Image:", im.length, s);
      print('fi("'+btoa(im)+'");');
    }


  }

  setup("icon");
  drawArea();
  Bangle.setUI({
      "mode": "custom",
      "drag": on_drag,
      "btn": on_btn,
  });
  drawUtil();


function ft(icon) {
  g.reset().clear();
  g.setFont("Vector", 26).drawString("Hellord" + icon, 0, 0);
}

function fi(icon) {
  g.reset().clear();
  g.drawImage(atob(icon), 40, 40);
}

//ft(icon_10 + "23.1" + icon_hpa);
