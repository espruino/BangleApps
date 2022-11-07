const medicalinfo = require('medicalinfo').load();
// const medicalinfo = {
//   bloodType: "O+",
//   height: "166cm",
//   weight: "73kg"
// };

function hasAlert(info) {
  return (Array.isArray(info.medicalAlert)) && (info.medicalAlert[0]);
}

// No space for widgets!
// TODO: no padlock widget visible so prevent screen locking?

g.clear();
const bodyFont = g.getFonts().includes("12x20") ? "12x20" : "6x8:2";
g.setFont(bodyFont);

const title = hasAlert(medicalinfo) ? "MEDICAL ALERT" : "Medical Information";
var lines = [];

lines = g.wrapString(title, g.getWidth() - 10);
var titleCnt = lines.length;
if (titleCnt) lines.push(""); // add blank line after title

if (hasAlert(medicalinfo)) {
  medicalinfo.medicalAlert.forEach(function (details) {
    lines = lines.concat(g.wrapString(details, g.getWidth() - 10));
  });
  lines.push(""); // add blank line after medical alert
}

if (medicalinfo.bloodType) {
  lines = lines.concat(g.wrapString("Blood group: " + medicalinfo.bloodType, g.getWidth() - 10));
}
if (medicalinfo.height) {
  lines = lines.concat(g.wrapString("Height: " + medicalinfo.height, g.getWidth() - 10));
}
if (medicalinfo.weight) {
  lines = lines.concat(g.wrapString("Weight: " + medicalinfo.weight, g.getWidth() - 10));
}

lines.push("");

// TODO: display instructions for updating medical info if there is none!

E.showScroller({
  h: g.getFontHeight(), // height of each menu item in pixels
  c: lines.length, // number of menu items
  // a function to draw a menu item
  draw: function (idx, r) {
    // FIXME: in 2v13 onwards, clearRect(r) will work fine. There's a bug in 2v12
    g.setBgColor(idx < titleCnt ? g.theme.bg2 : g.theme.bg).
      setColor(idx < titleCnt ? g.theme.fg2 : g.theme.fg).
      clearRect(r.x, r.y, r.x + r.w, r.y + r.h);
    g.setFont(bodyFont).drawString(lines[idx], r.x, r.y);
  }
});

// Show launcher when button pressed
setWatch(() => load(), process.env.HWVERSION === 2 ? BTN : BTN3, { repeat: false, edge: "falling" });
