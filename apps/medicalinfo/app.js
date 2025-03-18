const medicalinfo = require('medicalinfo').load();
const myprofile = require("Storage").readJSON("myprofile.json",1)||{};
// const medicalinfo = {
//   bloodType: "O+",
// };

function hasAlert(info) {
  return (Array.isArray(info.medicalAlert)) && (info.medicalAlert[0]);
}

// No space for widgets!
// TODO: no padlock widget visible so prevent screen locking?

g.reset().clear();
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
if (myprofile.height) { // Prefer height from myprofile if set
  lines = lines.concat(g.wrapString("Height: " + require("locale").distance(myprofile.height, 2), g.getWidth() - 10));
} else if (medicalinfo.height) { // read height from own settings if previously stored here
  lines = lines.concat(g.wrapString("Height: " + medicalinfo.height, g.getWidth() - 10));
}
if (myprofile.weight) { // Prefer weight from myprofile if set
  lines = lines.concat(g.wrapString("Weight: " + myprofile.weight + "kg", g.getWidth() - 10));
} else if (medicalinfo.weight) { // read weight from own settings if previously stored here
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
