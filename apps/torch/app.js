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
  back : load, // B2: SW back button
  btn : (n)=>{ // B1&2: Any HW button turns off
    if (n==1 || n==2 || n==3) load(); // n==4, n==5 is triggered by left/right press of touch screen on B1 and should not exit clock
  }
});
