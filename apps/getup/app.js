//init settings
const storage = require("Storage");
const SETTINGS_FILE = 'getup.settings.json';

function setting(key) {
  const DEFAULTS = {
    'sitTime' : 20,
    'moveTime' : 1
  }
  if (!settings) {
    loadSettings();
  }
  return (key in settings) ? settings[key] : DEFAULTS[key];
}

let settings;

function loadSettings() {
  settings = storage.readJSON(SETTINGS_FILE, 1) || {};
}

//vibrate, draw move message and start timer for sitting message
function remind() {
  Bangle.buzz(1000,1);
  g.clear();
  g.setFont("8x12",4);
  g.setColor(0x03E0);
  g.drawString("MOVE!", g.getWidth()/2, g.getHeight()/2);
  setTimeout(print_message,setting("moveTime") * 60000);
}
//draw sitting message and start timer for reminder
function print_message(){
  g.clear();
  g.setFont("8x12",2);
  g.setColor(0xF800);
  g.drawString("sitting is dangerous!", g.getWidth()/2, g.getHeight()/2);
  setTimeout(remind,setting("sitTime") * 60000);
}

//init graphics
require("Font8x12").add(Graphics);
g.setFontAlign(0,0);
g.flip();

print_message();
