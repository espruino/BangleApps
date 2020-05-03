let index = 0;
const db = require("Storage").readJSON("gbnotify.json", true) || [];

function draw() {

  let entry = db[index];

  g.clear();

  let src = entry.src ? entry.src : "";
  let title = entry.title ? entry.title : "";
  let body = entry.body ? entry.body : "";

  const maxChars = 35;
  let row = 1;
  let words = body.trim().replace("\n", " ").split(" ");
  body = "";
  for (var i = 0; i < words.length; i++) {
    if (body.length + words[i].length + 1 > row * maxChars) {
      body = body + "\n " + words[i];
      row++;
    } else {
      body = body + " " + words[i];
    }
  }

  g.setColor(0x39C7).fillRect(5, 0, 234, 30);
  g.setColor(-1).setFontAlign(1, -1, 0).setFont("6x8", 1);
  g.drawString(src.trim().substring(0, 10), 225, 8);

  g.setFontAlign(-1, -1, 0).setFont("6x8", 2);
  g.drawString(title.trim().substring(0, 13), 15, 9);

  g.setFont("6x8", 1);
  g.drawString(body, 0, 37);

  g.setFontAlign(1, 0, 0);
  g.drawString((index + 1) + "/" + db.length, 240 / 2, 227);
}

Bangle.on("swipe", (dir) => {
  if (dir === 1) {
    if ((index - 1) >= 0) {
      index = index - 1;
      draw();
    }
  } else {
    if ((index + 1) < db.length) {
      index = index + 1;
      draw();
    }
  }
});

if (db.length > 0) {
  draw();
} else {
  g.clear();
  g.setColor(-1).setFont("6x8", 1);
  g.setFontAlign(0, 1, 0);
  g.drawString("Nothing to show", 240 / 2, 240 / 2);
}