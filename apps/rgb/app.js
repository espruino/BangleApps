const rgb = [0, 0, 0];
const hex = '0123456789ABCDEF';
const w = g.getWidth();
const h = g.getHeight();
function drawToggle (value, x, y, options) {
  if (!options) options = {};
  if (!options.scale) options.scale = 1;
  const h = (options.scale * 16);
  const h2 = h / 2;
  const w = (options.scale) * 32;

  g.setColor(0.3, 0, 0.3);
  g.fillCircle(x + h2, y + h2, h2 - 1);
  g.fillCircle(x + w - h2, y + h2, h2 - 1);
  g.fillRect(x + h2, y, x + w - h2, y + h);

  y += 4;
  g.setColor(0.6, 0.6, 0.6);
  g.fillCircle(x + h2, y + h2 + 2, h2 - 1);
  g.fillCircle(x + w - h2, y + h2 + 2, h2 - 1);
  g.fillRect(x + h2, y + 2, x + w - h2, y + h + 1);

  if (value) {
    x += w - h;
  }
  g.setColor(0, 0.5, 0);
  g.fillCircle(x + h2, y + h2 + 2, h2 - 1);
  y -= 4;
  if (colorMode) {
    g.setColor(0, 1, 0);
  } else {
    g.setColor(0.5, 0.5, 0.5);
  }
  g.fillCircle(x + h2, y + h2 + 2, h2 - 1);

  g.setColor(0, 0.8, 0);
  g.fillCircle(x + h2 - 2, y + h2, h2 - 8);
  if (colorMode) {
    g.setColor(0, 1, 0);
  } else {
    g.setColor(0.5, 0.5, 0.5);
  } g.fillCircle(x + h2 + 4, y + h2 + 4, h2 - 9);
}

function refresh () {
  g.setBgColor(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
  g.clear();
  g.setColor(1, 1, 1);
  g.setFont12x20(1);
  g.setColor(0, 0, 0);
  let s = '#' + hex[(rgb[0] >> 4) & 0xf] + hex[rgb[0] & 0xf];
  s += hex[(rgb[1] >> 4) & 0xf] + hex[rgb[1] & 0xf];
  s += hex[(rgb[2] >> 4) & 0xf] + hex[rgb[2] & 0xf];
  g.setColor(1, 0, 1);
  g.fillRect(0, 0, w, 32);
  g.setColor(0.2, 0, 1);
  g.fillRect(0, 32, w, 33);
  g.setColor(1, 1, 1);
  g.drawString(s, 8, 8);
  // drawToggle (colorMode, w - 8 - 32*(rgb[0]/50), 8 + 255- rgb[2], {scale:1 * rgb[0] / 50});
  drawToggle(colorMode, w - 40, 4, { scale: 1.2 });

  if (colorMode) {
    g.setColor(1, 0, 0);
    g.fillRect(0, h, w / 3, h - 32);
    g.setColor(0, 1, 0);
    g.fillRect(w / 3, h, w - (w / 3), h - 32);
    g.setColor(0, 0, 1);
    g.fillRect(w - (w / 3), h, w, h - 32);

    g.setColor(0.5, 0, 0);
    g.fillRect(0, h - 33, w / 3, h - 34);
    g.setColor(0, 0.5, 0);
    g.fillRect(w / 3, h - 33, w - (w / 3), h - 34);
    g.setColor(0, 0, 0.5);
    g.fillRect(w - (w / 3), h - 33, w, h - 34);
  } else {
    g.setColor(0.5, 0.5, 0.5);
    g.fillRect(0, h, w, h - 32);
    g.setColor(0.2, 0.2, 0.2);
    g.fillRect(0, h - 33, w, h - 34);
  }
  // column lines
  function f (x) {
    const s = '' + (rgb[x] / 255);
    return s.substring(0, 4);
  }
  g.setColor(1, 1, 1);
  g.drawLine(w / 3, h, w / 3, h / 2);
  g.drawLine(w - (w / 3), h, w - (w / 3), h / 2);
  g.setFont6x15(2);
  g.drawString(f(0), 8, h - 28);
  g.drawString(f(1), 8 + (w / 3), h - 28);
  g.drawString(f(2), 8 + (2 * w / 3), h - 28);
}
let k = -1;
var colorMode = true;
Bangle.on('touch', function (wat, tap) {
  if (tap.x > w / 2 && tap.y < 32) {
    colorMode = !colorMode;
    refresh();
  }
});

function deltaComponent (k, dy) {
  rgb[k] -= dy;
  if (rgb[k] > 255) {
    rgb[k] = 255;
  } else if (rgb[k] < 0) {
    rgb[k] = 0;
  }
}
Bangle.on("button", function() {
  rgb[0] = rgb[1] = rgb[2] = 127;
});
Bangle.on('drag', function (tap, top) {
  if (colorMode) {
    if (tap.x < w / 3) {
      k = 0;
    } else if (tap.x > (w - (w / 3))) {
      k = 2;
    } else {
      k = 1;
    }
    deltaComponent(k, tap.dy);
  } else {
    deltaComponent(0, tap.dy);
    deltaComponent(1, tap.dy);
    deltaComponent(2, tap.dy);
  }
  refresh();
});
refresh();

