Bangle.loadWidgets();

var s = Object.assign({
  counter0:10,
  counter1:20,
  max0:15,
  max1:25,
  buzz: true,
  colortext: true,
}, require('Storage').readJSON("counter2.json", true) || {});

const f1 = (s.colortext) ? "#f00" : "#fff";
const f2 = (s.colortext) ? "#00f" : "#fff";
const b1 = (s.colortext) ? g.theme.bg : "#f00";
const b2 = (s.colortext) ? g.theme.bg : "#00f";

var drag;

const screenwidth = g.getWidth();
const screenheight = g.getHeight();
const halfwidth = screenwidth / 2;
const halfheight = screenheight / 2;

counter = [];
counter[0] = s.counter0;
counter[1] = s.counter1;
const defaults = [];
defaults[0] = s.max0;
defaults[1] = s.max1;

function saveSettings() {
  s.counter0 = counter[0];
  s.counter1 = counter[1];
  s.max0 = defaults[0];
  s.max1 = defaults[1];
  require('Storage').writeJSON("counter2.json", s);
}

let ignoreonce = false;
var dragtimeout;

function updateScreen() {
  g.setBgColor(b1);
  g.clearRect(0, 0, halfwidth, screenheight);
  g.setBgColor(b2);
  g.clearRect(halfwidth, 0, screenwidth, screenheight);
  g.setFont("Vector", 60).setFontAlign(0, 0);
  g.setColor(f1);
  g.drawString(Math.floor(counter[0]), halfwidth * 0.5, halfheight);
  g.setColor(f2);
  g.drawString(Math.floor(counter[1]), halfwidth * 1.5, halfheight);
  saveSettings();
  if (s.buzz)  Bangle.buzz(50,.5);
  Bangle.drawWidgets();
}

Bangle.on("drag", e => {
  const c = (e.x < halfwidth) ? 0 : 1;
  if (!drag) {
    if (ignoreonce) {
      ignoreonce = false;
      return;
    }
    drag = { x: e.x, y: e.y };
    dragtimeout = setTimeout(function () { resetcounter(c); }, 600); //if dragging for 500ms, reset counter
  }
  else if (drag && !e.b) { // released
      let adjust = 0;
      const dx = e.x - drag.x, dy = e.y - drag.y;
      if (Math.abs(dy) > Math.abs(dx) + 30) {
        adjust = (dy > 0) ? -1 : 1;
      } else {
        adjust = (e.y > halfwidth) ? -1 : 1;
      }
      counter[c] += adjust;
      updateScreen();
      drag = undefined;
      clearTimeout(dragtimeout);
    }
});

function resetcounter(which) {
  counter[which] = defaults[which];
  console.log("resetting counter ", which);
  updateScreen();
  drag = undefined;
  ignoreonce = true;
}


updateScreen();

setWatch(function() {
  load();
}, BTN1, {repeat:true, edge:"falling"});
