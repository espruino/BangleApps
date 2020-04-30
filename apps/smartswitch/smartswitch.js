
// Learn more!
// https://www.espruino.com/Reference#l_NRF_setAdvertising
// https://www.espruino.com/Bangle.js#buttons

// Initial graphics setup
g.clear();
g.setFontAlign(0, 0); // center font
// g.setFont("6x8", 8); // bitmap font, 8x magnified
g.setFont("Vector", 40); // vector font, 80px

// Let the app begin!
const storage = require("Storage");

let currentPage = 0;
let pages = [
  {
    name: "Downstairs",
    icon: "light",
    state: false
  },
  {
    name: "Upstairs",
    icon: "switch",
    state: false
  }];

function loadPage(page) {
  const icon = page.state ? page.icon + "-on" : page.icon + "-off";
  Bangle.beep();
  g.clear();
  g.setFont("Vector", 10);
  g.drawString("prev", g.getWidth() - 25, 20);
  g.drawString("next", g.getWidth() - 25, 220);
  g.setFont("Vector", 15);
  g.drawString(page.name, g.getWidth() / 2, 200);
  g.setFont("Vector", 40);
  g.drawString(page.state ? "On" : "Off", g.getWidth() / 2, g.getHeight() / 2);
  g.drawImage(storage.read(`${icon}.img`), g.getWidth() / 2 - 24, g.getHeight() / 2 - 24 - 50);
}

function prevPage() {
  if (currentPage > 0) {
    currentPage--;
    loadPage(pages[currentPage]);
  }
}

function nextPage() {
  if (currentPage < pages.length - 1) {
    currentPage++;
    loadPage(pages[currentPage]);
  }
}

function swipe(dir) {

  const page = pages[currentPage];

  page.state = dir == 1;

  NRF.setAdvertising({
    0xFFFF: [currentPage, page.state]
  });

  loadPage(page);

  // optional - this keeps the watch LCD lit up
  g.flip();

  Bangle.buzz();
}

Bangle.on('swipe', swipe);

setWatch(prevPage, BTN, {edge: "rising", debounce: 50, repeat: true});
setWatch(nextPage, BTN3, {edge: "rising", debounce: 50, repeat: true});

loadPage(pages[currentPage]);