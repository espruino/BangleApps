const SETTINGS_FILE = "torch.json";
let settings;

function loadSettings() {
  settings = require("Storage").readJSON(SETTINGS_FILE,1)|| {'bg': '#FFFFFF', 'color': 'White'};
}

loadSettings();

Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
g.reset();
g.setColor(settings.bg);
g.fillRect(0,0,g.getWidth(),g.getHeight());
// Any button turns off
setWatch(()=>load(), BTN1);
if (global.BTN2) setWatch(()=>load(), BTN2);
if (global.BTN3) setWatch(()=>load(), BTN3);

