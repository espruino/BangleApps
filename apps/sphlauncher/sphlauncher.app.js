/* Desktop launcher
 *
 */

require("FontLECO1976Regular.js").add20(Graphics);

var settings = Object.assign(
  {
    showClocks: true,
    showLaunchers: true,
    direct: false,
  },
  require("Storage").readJSON("sphlauncher.json", true) || {}
);

var s = require("Storage");
var apps = s
  .list(/\.info$/)
  .map((app) => {
    var a = s.readJSON(app, 1);
    return (
      a && {
        name: a.name,
        type: a.type,
        icon: a.icon,
        sortorder: a.sortorder,
        src: a.src,
      }
    );
  })
  .filter(
    (app) =>
      app &&
      (app.type == "app" ||
        (app.type == "clock" && settings.showClocks) ||
        (app.type == "launch" && settings.showLaunchers) ||
        !app.type)
  );

apps.sort((a, b) => {
  var n = (0 | a.sortorder) - (0 | b.sortorder);
  if (n) return n; // do sortorder first
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
});
// apps.forEach((app) => {
//   if (app.icon) app.icon = s.read(app.icon); // should just be a link to a memory area
// });
// apps.splice(0, 0, { name: "Back" });

var Napps = apps.length;
var Npages = Math.ceil(Napps / 9);
var maxPage = Npages - 1;
var selected = -1;
var oldselected = -1;
var page = 0;
const XOFF = 4;
const YOFF = 0;

function octo(x, y, x2, y2, corner) {
  var w = x2 - x;
  var h = y2 - y;
  return [
    x,
    (y += corner),
    x,
    (y += h - 2 * corner),
    (x += corner),
    (y += corner),
    (x += w - 2 * corner),
    y,
    (x += corner),
    (y -= corner),
    x,
    (y -= h - 2 * corner),
    (x -= corner),
    (y -= corner),
    (x -= w - 2 * corner),
    y,
    (x -= corner),
    (y += corner),
  ];
}

function drawBolt(x, y) {
  g.setColor("#FFF");
  g.drawPoly([x - 1, y, x, y, x, y + 1, x + 1, y, x, y - 1]);
  g.setColor("#000");
  g.drawLine(x, y + 2, x + 2, y);
}

function draw_launcher(p, n, selected) {
  var launchers = [square_with_ribbon];
  var app = apps[p * 9 + n];
  var x = (n % 3) * 56 + XOFF;
  var y = Math.floor(n / 3) * 56 + YOFF;

  if (!app.src) return back(x, y, selected);

  var name = app.name
    .replace("SPH", "")
    .trim()
    .split(" ")[0]
    .trim()
    .substring(0, 9);

  launcher = launchers[name.charCodeAt(0) % launchers.length];
  launcher(app, name, x, y, selected);
}

function draw_icon(app, name, x, y) {
  g.setFontLECO1976Regular20();
  g.setFontAlign(0, 0);
  g.setColor("#FFF");
  g.drawString(name.substring(0, 1), x, y);
}

function back(x, y, selected) {
  g.setFontLECO1976Regular20();
  g.setFontAlign(0, 0);
  if (selected) g.setColor("#F00");
  else g.setColor("#000");
  g.drawString("<<", x + 28, y + 27);
}

function square_with_ribbon(app, name, x, y, selected) {
  var w = 55;
  var h = 53;
  var placHeight = 42;
  var placWidth = 42;

  g.setColor("#000");
  px = x + Math.floor((w - placWidth) / 2);
  py = y + 5;
  g.drawPoly(octo(px, py, px + placWidth, py + placHeight, 3));

  if (selected) g.setColor("#F00");
  else g.setColor("#000");

  g.fillPoly(octo(px + 2, py + 2, px + placWidth - 2, py + placHeight - 2, 2));
  g.drawPoly(octo(px + 2, py + 2, px + placWidth - 2, py + placHeight - 2, 2));

  var distBolt = 6;
  drawBolt(px + distBolt, py + distBolt);
  drawBolt(px + placWidth - distBolt, py + distBolt);
  drawBolt(px + distBolt, py + placHeight - distBolt);
  drawBolt(px + placWidth - distBolt, py + placHeight - distBolt);

  draw_icon(app, name, x + w / 2, y + h / 2);

  g.setColor("#F00");
  g.fillRect(x + 2, y + placHeight - 14, x + w - 3, y + placHeight - 2);
  g.setColor("#000");
  g.drawRect(x + 2, y + placHeight - 14, x + w - 3, y + placHeight - 2);
  g.setColor("#000");
  g.fillPoly(
    [
      x + 2,
      y + placHeight - 14,
      x + 6,
      y + placHeight - 18,
      x + 6,
      y + placHeight - 14,
    ],
    true
  );

  g.fillPoly(
    [
      x + w - 2,
      y + placHeight - 14,
      x + w - 6,
      y + placHeight - 18,
      x + w - 6,
      y + placHeight - 14,
    ],
    true
  );

  g.setFontAlign(0, -1, 0).setFont("4x6", 1);
  g.setColor("#000");
  g.drawString(name, x + w / 2 - 1, y + placHeight - 10 + 0);
  g.drawString(name, x + w / 2 + 0, y + placHeight - 10 + 1);
  g.drawString(name, x + w / 2 + 1, y + placHeight - 10 + 0);
  g.drawString(name, x + w / 2 + 0, y + placHeight - 10 - 1);
  g.setColor("#FFF");
  g.drawString(name, x + w / 2, y + placHeight - 10);
}

function drawPage(p) {
  g.clear();

  var barSize = 174 / Npages;
  g.setColor("#000");
  g.fillRect(p * barSize + 1, 170, (p + 1) * barSize, 174);

  for (var i = 0; i < 9; i++) {
    if (!apps[p * 9 + i]) return i;
    draw_launcher(p, i, selected == i && !settings.direct);
    g.flip();
  }
  g.flip();
}

Bangle.on("swipe", (dir) => {
  selected = 0;
  oldselected = -1;
  if (dir < 0) {
    ++page;
    if (page > maxPage) page = 0;
    drawPage(page);
  } else if (dir > 0) {
    --page;
    if (page < 0) load();
    else drawPage(page);
  }
});

function isTouched(p, n) {
  var range_x = 191;
  var range_y = 189;

  tam_x = Math.ceil(range_x / 3);
  tam_y = Math.ceil(range_y / 3);

  if (n < 0 || n > 8) return false;
  var x1 = (n % 3) * tam_x;
  var y1 = Math.floor(n / 3) * tam_y;
  var x2 = x1 + tam_x;
  var y2 = y1 + tam_y;

  return p.x >= x1 && p.y >= y1 && p.x <= x2 && p.y <= y2;
}

Bangle.on("touch", (_, p) => {
  var i;
  for (i = 0; i < 9; i++) {
    if (page * 9 + i < Napps) {
      if (isTouched(p, i)) {
        draw_launcher(page, i, true && !settings.direct);
        if (selected >= 0 || settings.direct) {
          if (selected != i && !settings.direct) {
            draw_launcher(page, selected, false);
          } else {
            load(apps[page * 9 + i].src);
          }
        }
        selected = i;
        break;
      }
    }
  }
  if ((i == 9 || page * 9 + i > Napps) && selected >= 0) {
    draw_launcher(page, selected, false);
    selected = -1;
  }
});

drawPage(0);
