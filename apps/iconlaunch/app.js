const s = require("Storage");
const settings = s.readJSON("launch.json", true) || { showClocks: true, fullscreen: false,direct:false,oneClickExit:false };

if( settings.oneClickExit)
  setWatch(_=> load(), BTN1);

if (!settings.fullscreen) {
  Bangle.loadWidgets();
  Bangle.drawWidgets();
}

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
      !app.type)
  );
apps.sort((a, b) => {
  var n = (0 | a.sortorder) - (0 | b.sortorder);
  if (n) return n; // do sortorder first
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;
  return 0;
});
apps.forEach((app) => {
  if (app.icon) app.icon = s.read(app.icon); // should just be a link to a memory area
});

let scroll = 0;
let selectedItem = -1;
const R = Bangle.appRect;

const iconSize = 48;

const appsN = Math.floor(R.w / iconSize);
const whitespace = (R.w - appsN * iconSize) / (appsN + 1);

const itemSize = iconSize + whitespace;

function drawItem(itemI, r) {
  g.clearRect(r.x, r.y, r.x + r.w - 1, r.y + r.h - 1);
  let x = 0;
  for (let i = itemI * appsN; i < appsN * (itemI + 1); i++) {
    if (!apps[i]) break;
    x += whitespace;
    if (!apps[i].icon) {
      g.setFontAlign(0,0,0).setFont("12x20:2").drawString("?", x + r.x+iconSize/2, r.y + iconSize/2);
    } else {
      g.drawImage(apps[i].icon, x + r.x, r.y);
    }
    if (selectedItem == i) {
      g.drawRect(
        x + r.x - 1,
        r.y - 1,
        x + r.x + iconSize + 1,
        r.y + iconSize + 1
      );
    }
    x += iconSize;
  }
  drawText(itemI);
}

function drawItemAuto(i) {
  var y = idxToY(i);
  g.reset().setClipRect(R.x, y, R.x2, y + itemSize);
  drawItem(i, {
    x: R.x,
    y: y,
    w: R.w,
    h: itemSize
  });
  g.setClipRect(0, 0, g.getWidth() - 1, g.getHeight() - 1);
}

let lastIsDown = false;

function drawText(i) {
  const selectedApp = apps[selectedItem];
  const idy = (selectedItem - (selectedItem % 3)) / 3;
  if (!selectedApp || i != idy) return;
  const appY = idxToY(idy) + iconSize / 2;
  g.setFontAlign(0, 0, 0);
  g.setFont("12x20");
  const rect = g.stringMetrics(selectedApp.name);
  g.clearRect(
    R.w / 2 - rect.width / 2,
    appY - rect.height / 2,
    R.w / 2 + rect.width / 2,
    appY + rect.height / 2
  );
  g.drawString(selectedApp.name, R.w / 2, appY);
}

function selectItem(id, e) {
  const iconN = E.clip(Math.floor((e.x - R.x) / itemSize), 0, appsN - 1);
  const appId = id * appsN + iconN;
  if( settings.direct && apps[appId])
  {
    load(apps[appId].src);
    return;
  }
  if (appId == selectedItem && apps[appId]) {
    const app = apps[appId];
    if (!app.src || s.read(app.src) === undefined) {
      E.showMessage( /*LANG*/ "App Source\nNot found");
    } else {
      load(app.src);
    }
  }
  selectedItem = appId;
  drawItems();
}

function idxToY(i) {
  return i * itemSize + R.y - (scroll & ~1);
}

function YtoIdx(y) {
  return Math.floor((y + (scroll & ~1) - R.y) / itemSize);
}

function drawItems() {
  g.reset().clearRect(R.x, R.y, R.x2, R.y2);
  g.setClipRect(R.x, R.y, R.x2, R.y2);
  var a = YtoIdx(R.y);
  var b = Math.min(YtoIdx(R.y2), 99);
  for (var i = a; i <= b; i++)
    drawItem(i, {
      x: R.x,
      y: idxToY(i),
      w: R.w,
      h: itemSize,
    });
  g.setClipRect(0, 0, g.getWidth() - 1, g.getHeight() - 1);
}

drawItems();
g.flip();

const itemsN = Math.ceil(apps.length / appsN);

Bangle.setUI({
  mode: "custom",
  drag: (e) => {
    g.setColor(g.theme.fg);
    g.setBgColor(g.theme.bg);
    let dy = e.dy;
    if (scroll + R.h - dy > itemsN * itemSize) {
      dy = scroll + R.h - itemsN * itemSize;
    }
    if (scroll - dy < 0) {
      dy = scroll;
    }
    scroll -= dy;
    scroll = E.clip(scroll, 0, itemSize * (itemsN - 1));
    g.setClipRect(R.x, R.y, R.x2, R.y2);
    g.scroll(0, dy);
    if (dy < 0) {
      g.setClipRect(R.x, R.y2 - (1 - dy), R.x2, R.y2);
      let i = YtoIdx(R.y2 - (1 - dy));
      let y = idxToY(i);
      while (y < R.y2) {
        drawItem(i, {
          x: R.x,
          y: y,
          w: R.w,
          h: itemSize,
        });
        i++;
        y += itemSize;
      }
    } else {
      // d>0
      g.setClipRect(R.x, R.y, R.x2, R.y + dy);
      let i = YtoIdx(R.y + dy);
      let y = idxToY(i);
      while (y > R.y - itemSize) {
        drawItem(i, {
          x: R.x,
          y: y,
          w: R.w,
          h: itemSize,
        });
        y -= itemSize;
        i--;
      }
    }
    g.setClipRect(0, 0, g.getWidth() - 1, g.getHeight() - 1);
  },
  touch: (_, e) => {
    if (e.y < R.y - 4) return;
    var i = YtoIdx(e.y);
    selectItem(i, e);
  },
});
