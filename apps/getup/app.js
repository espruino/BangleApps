const storage = require("Storage");
const SETTINGS_FILE = 'getup.settings.json';

function setting(key) {
const DEFAULTS = {
    'sitTime' : 20,
    'moveTime' : 1
};
if (!settings) { loadSettings(); }
return (key in settings) ? settings[key] : DEFAULTS[key];
}
let settings;
function loadSettings() {
settings = storage.readJSON(SETTINGS_FILE, 1) || {};
}

function remind() {
    Bangle.buzz(1000,1);
    g.clear();
    g.setColor(0x03E0);
    g.drawString("MOVE!", g.getWidth()/2, g.getHeight()/2);
    setTimeout(print_message,moveTime * 60000);
}

function print_message(){
	g.clear();
	g.setColor(0xF800);
	g.drawString("sitting is dangerous!", g.getWidth()/2, g.getHeight()/2);
        setTimeout(remind,settings.sitTime * 60000);
}
//init graphics
require("Font8x12").add(Graphics);
g.setFont("8x12",2);
g.setFontAlign(0,0);
g.flip();

print_message();

