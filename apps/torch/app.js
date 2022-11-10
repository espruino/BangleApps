const SETTINGS_FILE = "torch.json";
let settings;

function loadSettings() {
  settings = require("Storage").readJSON(SETTINGS_FILE,1)|| {'bg': '#FFFFFF', 'color': 'White'};
}

loadSettings();

Bangle.setLCDBrightness(1);
Bangle.setLCDPower(1);
Bangle.setLCDTimeout(0);
g.reset();
g.setTheme({bg:settings.bg,fg:"#000"});
g.setColor(settings.bg);
g.fillRect(0,0,g.getWidth(),g.getHeight());
Bangle.setUI({
  mode : 'custom',
  back : load, // B2: SW back button to exit
  btn : ()=>{load();}, // B1&2: HW button to exit. // A simple 'load' as on the line above did not work for btn???
});
