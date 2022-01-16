/* Desktop launcher
 *
 */

require("FontLECO1976Regular.js").add20(Graphics);
require("FontLECO1976Regular.js").add12(Graphics);

var settings = Object.assign(
  {
    showClocks: true,
    showLaunchers: true,
    direct: false,
  },
  require("Storage").readJSON("sphlauncher.json", true) || {}
);

var s = require("Storage");
var launcher_count = 3;
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
        // launcher: a.name.charCodeAt(0) % launcher_count,
        launcher: Math.round(Math.random() * (launcher_count - 1)),
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

function drawBolt(x, y, color, shadowColor) {
  g.setColor(color || "#FFF");
  g.setPixel(x, y);
  g.setPixel(x - 1, y);
  g.setPixel(x, y + 1);
  g.setPixel(x + 1, y);
  g.setPixel(x, y - 1);
  g.setColor(shadowColor || "#000");
  g.setPixel(x, y + 2);
  g.setPixel(x + 1, y + 1);
  g.setPixel(x + 2, y);
}

function draw_launcher(p, n, selected) {
  var launchers = [
    square_with_ribbon,
    circle_banner_down,
    circle_banner_middle,
  ];
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

  launchers[app.launcher](app, name, x, y, selected);
  // circle_banner_middle(app, name, x, y, selected);
}

function draw_icon(app, name, cx, cy, small) {
  if (small) {
    options = { scale: 0.66 };
    x = cx - 8;
    y = cy - 8;
  } else {
    options = {};
    x = cx - 12;
    y = cy - 12;
  }

  if (name == "Weather") {
    g.drawImage(
      require("heatshrink").decompress(
        atob("jEYwMB/4AOwACBgF//0An/8gEfAQvigEn4EAgYCL8EAg41PAAIA=")
      ),
      x,
      y,
      options
    );
  } else if (name == "Settings") {
    g.drawImage(
      require("heatshrink").decompress(
        atob(
          "jEYwMB/4AI4f//vD3/44cf+EAh/4gEf/kAn/8jE/8E8g/gvwCEBAIOCCgQaCEAYmBFgQyCABAA=="
        )
      ),
      x,
      y,
      options
    );
  } else if (name == "About") {
    g.drawImage(
      require("heatshrink").decompress(
        atob(
          "jEYwMB/4AIwP//0Av/8gE//EYj/wjEP+EAh/ggEH8E8AQMYARIXDhkP/EAj4mCFgQyCABAA="
        )
      ),
      x,
      y,
      options
    );
  } else if (name == "Alarms") {
    g.drawImage(
      require("heatshrink").decompress(
        atob(
          "jEYwMB/4AE/1+v/4nkf+H/h/j//H8+B8/unl3/n/n/5/+f+f/5/3/3v8/98/v3v39+bAQPLAQPn+/ggEHAQQ4FABAA=="
        )
      ),
      x,
      y,
      options
    );
  } else if (name == "Health") {
    g.drawImage(
      require("heatshrink").decompress(
        atob(
          "jEYwMB/4AK/08v/8jE//EAj/wgEPAQoLC/kAn4CC/0Av//gAhBwICE4YCB843LAAYA=="
        )
      ),
      x,
      y,
      options
    );
  } else if (name == "2FA") {
    g.drawImage(
      require("heatshrink").decompress(
        atob("jEYwMB/4AO4YCBgH//08v/+vwCHgACEhACBjACBiACECIoCBG5Y=")
      ),
      x,
      y,
      options
    );
  } else if (name == "Pattern") {
    g.drawImage(
      require("heatshrink").decompress(
        atob("jEYwMB/4AQ+f/5/h1WH8NVw4ICBoN///+3///oFB/QKB5oCBw4CECwQAQA==")
      ),
      x,
      y,
      options
    );
  } else if (name == "Calendar") {
    g.drawImage(
      require("heatshrink").decompress(
        atob("jEYwMB/4AH8EAg4CI9//+4CDwICE/ICB+YCB84CNEAgpCHxA")
      ),
      x,
      y,
      options
    );
  } else if (name == "Clock") {
    g.drawImage(
      require("heatshrink").decompress(
        atob("jEYwMB/4AJ74CBz4CB34CBn/+v1//08A4MZAQOBAQPDAQnnFBQAT")
      ),
      x,
      y,
      options
    );
  } else {
    if (small) g.setFontLECO1976Regular12();
    else g.setFontLECO1976Regular20();
    g.setFontAlign(0, 0);
    g.drawString(name.substring(0, 1), cx, cy + 3);
  }
}

function back(x, y, selected) {
  g.setFontLECO1976Regular20();
  g.setFontAlign(0, 0);
  g.drawString("<<", x + 28, y + 27);
}

function circle_banner_down(app, name, x, y, selected) {
  var w = 55;
  var h = 53;
  g.setColor("#000");
  g.fillCircle(x + w / 2, y + h / 2 - 2, h / 2 - 5);

  g.setColor("#FFF");
  g.fillCircle(x + w / 2, y + h / 2 - 2, h / 2 - 8);

  if (selected) {
    g.setColor("#F00");
    g.fillCircle(x + w / 2, y + h / 2 - 2, h / 2 - 9);
  }

  g.setColor("#F00");
  g.drawCircle(x + w / 2, y + h / 2 - 2, h / 2 - 9);

  if (selected) {
    g.setColor("#FFF");
    g.setBgColor("#FFF");
  } else {
    g.setColor("#000");
    g.setBgColor("#000");
  }
  draw_icon(app, name, x + w / 2, y + h / 2 - 2);

  g.setColor("#FFF");
  g.fillRect(x + 2, y + h - 16, x + w - 3, y + h - 4);

  g.setColor("#F00");
  px = x + 2;
  py = y + h - 15;
  banner_points = [
    px,
    py,
    px + 3,
    py + 5,
    px,
    py + 10,
    x + w - 3,
    py + 10,
    x + w - 6,
    py + 5,
    x + w - 3,
    py,
  ];
  g.fillPoly(banner_points, true);
  g.setColor("#000");
  g.drawPoly(banner_points, true);
  g.setFontAlign(0, -1, 0).setFont("4x6", 1);
  g.setColor("#000");
  g.drawString(name, x + w / 2 - 1, y + h - 12 + 0);
  g.drawString(name, x + w / 2 + 0, y + h - 12 + 1);
  g.drawString(name, x + w / 2 + 1, y + h - 12 + 0);
  g.drawString(name, x + w / 2 + 0, y + h - 12 - 1);
  g.setColor("#FFF");
  g.drawString(name, x + w / 2, y + h - 12);
}

function circle_banner_middle(app, name, x, y, selected) {
  var w = 55;
  var h = 53;
  g.setColor("#000");
  g.fillCircle(x + w / 2, y + h / 2 - 2, h / 2 - 5);

  g.setColor("#FFF");
  g.fillCircle(x + w / 2, y + h / 2 - 2, h / 2 - 8);

  if (selected) {
    g.setColor("#F00");
    g.fillCircle(x + w / 2, y + h / 2 - 2, h / 2 - 9);
  }

  g.setColor("#F00");
  g.drawCircle(x + w / 2, y + h / 2 - 2, h / 2 - 9);

  if (selected) {
    g.setColor("#FFF");
    g.setBgColor("#FFF");
  } else {
    g.setColor("#000");
    g.setBgColor("#000");
  }
  draw_icon(app, name, x + w / 2, y + h / 2 - 10, true);

  for (i = -4; i <= 4; i += 4)
    drawBolt(x + w / 2 + i, y + h / 2 + 11, selected? "#FFF":"#000", selected? "#F00":"#FFF");

  g.setColor("#FFF");
  g.fillRect(x + 2, y + h / 2 - 4, x + w - 3, y + h / 2 + 8);

  g.setColor("#F00");
  px = x + 2;
  py = y + h / 2 - 4;
  banner_points = [
    px,
    py,
    px + 3,
    py + 5,
    px,
    py + 10,
    x + w - 3,
    py + 10,
    x + w - 6,
    py + 5,
    x + w - 3,
    py,
  ];
  g.fillPoly(banner_points, true);
  g.setColor("#000");
  g.drawPoly(banner_points, true);
  g.setFontAlign(0, 0, 0).setFont("4x6", 1);
  g.setColor("#000");
  g.drawString(name, x + w / 2 - 1, y + h / 2 + 3 + 0);
  g.drawString(name, x + w / 2 + 0, y + h / 2 + 3 + 1);
  g.drawString(name, x + w / 2 + 1, y + h / 2 + 3 + 0);
  g.drawString(name, x + w / 2 + 0, y + h / 2 + 3 - 1);
  g.setColor("#FFF");
  g.drawString(name, x + w / 2, y + h / 2 + 3);
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

  g.setColor("#FFF");
  g.setBgColor("#FFF");
  draw_icon(app, name, x + w / 2, y + h / 2 - 7);

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
  g.setBgColor("#FFF");
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
